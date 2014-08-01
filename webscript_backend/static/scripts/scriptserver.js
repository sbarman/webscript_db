/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/* This is probably horribly broken */
var ScriptServer = (function ScriptServerClosure() {
  var scriptLog = getLog('script');

  function ScriptServer(server) {
    this.server = server;
    this.queue = [];
    this.processing = false;
    this.timeout = 50;
  }

  ScriptServer.prototype = {
    process: function _process() {
      if (this.processing)
        return;


      var queue = this.queue;
      if (queue.length > 0) {
        var item = queue.shift();
        var retries = item.retries;
        if (retries && retries > 3) {
          scriptLog.error('Cannot reach server');
          throw "Cannot reach server";
        }

        var scriptServer = this;
        var type = item.type;

        var finish = function _finish() {
          scriptServer.processing = false;
          scriptServer.process();
        }
      
        this.processing = true;

        switch (type) {
          case "event":
            setTimeout(function() {
              scriptServer.processEvent(item, finish);
            }, this.timeout);
            break;
          case "script":
            setTimeout(function() {
              scriptServer.processScript(item, finish);
            }, this.timeout);
            break;
        }
      }
    },
    retry: function _retry(item) {
      if ('retries' in item) {
        item.retries++;
      } else {
        item.retries = 1;
      }

      this.timeout *= 2;

      this.queue.splice(0, 0, item);
    },
    saveScript: function _saveScript(name, events, parentId, notes) {
      this.queue.push({
        type: 'script',
        name: name,
        events: events,
        parentId: parentId,
        notes: notes
      });
      this.process();
    },
    saveEvents: function _saveEvents(scriptId, events) {
      for (var i = 0, ii = events.length; i < ii; ++i) {
        this.queue.push({
          type: 'event',
          event: events[i],
          index: i,
          scriptId: scriptId
        });
      }
    },
    processScript: function _processScript(item, callback) {
      var name = item.name;
      var events = item.events;
      var parentId = item.parentId;
      var notes = item.notes;

      if (events.length == 0)
        return;

      // make a copy of the array
      events = events.slice(0);

      var scriptServer = this;
      var server = this.server;
      var postMsg = {};
      postMsg['name'] = name;
      postMsg['user'] = {username: window.params.server.user};
      postMsg['events'] = [];

      if (typeof parentId == 'number') {
        postMsg['parent_id'] = parentId;
      }

      if (typeof notes == 'string') {
        postMsg['notes'] = notes;
      }

      scriptLog.log('saving script:', postMsg);

      var scriptServer = this;
      var req = $.ajax({
        error: function(jqXHR, textStatus, errorThrown) {
          scriptLog.log('error saving script', jqXHR, textStatus, errorThrown);
          scriptServer.retry(item);
        },
        success: function(data, textStatus, jqXHR) {
          scriptLog.log(data, jqXHR, textStatus);

          var scriptId = data.id;
          scriptServer.saveEvents(scriptId, events);
        },
        complete: function(jqXHR, textSataus) {
          callback();
        },
        contentType: 'application/json',
        data: JSON.stringify(postMsg),
        dataType: 'json',
        processData: false,
        type: 'POST',
        timeout: 15000,
        url: this.server + 'script/'
      });
      scriptLog.log(req);
    },
    processEvent: function _saveEvent(item, callback) {
      this.processing = true;

      var e = item.event;
      var i = item.index;
      var scriptId = item.scriptId;

      // need to create new scope to variables don't get clobbered
      var postMsg = {};
      var evtMsg = {};

      evtMsg['event_type'] = e.type;
      evtMsg['execution_order'] = i;

      var parameters = [];

      for (var prop in e) {
        var propMsg = {};
        var val = e[prop];
        propMsg['name'] = prop;
        propMsg['value'] = JSON.stringify(val);
        propMsg['data_type'] = typeof val;
        parameters.push(propMsg);
      }
      evtMsg['parameters'] = parameters;

      postMsg['script_id'] = scriptId;
      postMsg['events'] = [evtMsg];

      scriptLog.log('saving event:', postMsg);
      var scriptServer = this;
      $.ajax({
        error: function(jqXHR, textStatus, errorThrown) {
          scriptLog.log('error saving event', jqXHR, textStatus, errorThrown);
          scriptServer.retry(item);
        },
        success: function(data, textStatus, jqXHR) {
          scriptLog.log(data, jqXHR, textStatus);
        },
        complete: function(jqXHR, textSataus) {
          callback();
        },
        contentType: 'application/json',
        data: JSON.stringify(postMsg),
        dataType: 'json',
        processData: false,
        type: 'POST',
        timeout: 15000,
        url: this.server + 'event/'
      });
    },
//    processCapture: function _saveCapture(capture, scriptId) {
//      var scriptServer = this;
//      var server = this.server;
//
//      var postMsg = {};
//      postMsg['script'] = scriptId;
//      postMsg['innerHtml'] = capture.innerHtml;
//      postMsg['innerText'] = capture.innerText;
//      postMsg['nodeName'] = capture.nodeName;
//
//      $.ajax({
//        error: function(jqXHR, textStatus, errorThrown) {
//          scriptLog.log(jqXHR, textStatus, errorThrown);
//        },
//        success: function(data, textStatus, jqXHR) {
//          scriptLog.log(data, textStatus, jqXHR);
//        },
//        contentType: 'application/json',
//        data: JSON.stringify(postMsg),
//        dataType: 'json',
//        processData: false,
//        type: 'POST',
//        url: server + 'capture/'
//      });
//      return null;
//    },
//    saveParams: function _saveParams(scriptId, params) {
//      var server = this.server;
//
//      function convertParams(param, prefix) {
//        prefix = prefix || '';
//        var list = [];
//
//        for (var p in param) {
//          var v = param[p];
//          if (typeof v == 'object')
//            list = list.concat(convertParams(v, prefix + p + '.'));
//          else
//            list.push({name: prefix + p, value: v});
//        }
//        return list;
//      }
//
//      var listParams = convertParams(params);
//
//      var postMsg = {};
//
//      postMsg['params'] = listParams;
//      postMsg['script_id'] = scriptId;
//
//      scriptLog.log('saving params:', postMsg);
//      $.ajax({
//        error: function(jqXHR, textStatus, errorThrown) {
//          scriptLog.log('error params', jqXHR, textStatus, errorThrown);
//        },
//        success: function(data, textStatus, jqXHR) {
//          scriptLog.log(data, jqXHR, textStatus);
//        },
//        contentType: 'application/json',
//        data: JSON.stringify(postMsg),
//        dataType: 'json',
//        processData: false,
//        type: 'POST',
//        url: server + 'script_param/'
//      });
//    },
    getScript: function _getScript(name, cont) {
      var scriptServer = this;
      var server = this.server;

      $.ajax({
        error: function(jqXHR, textStatus, errorThrown) {
          scriptLog.log(jqXHR, textStatus, errorThrown);
          cont(null);
        },
        success: function(data, textStatus, jqXHR) {
          scriptLog.log(data, textStatus, jqXHR);
          var scripts = data;
          if (scripts.length != 0) {
            // find the lastest script saved with this name
            var script = scripts[0];
            for (var i = 0, ii = scripts.length; i < ii; ++i) {
              var s = scripts[i];
              if (parseInt(script.id) < parseInt(s.id)) {
                script = s;
              }
            }

            scriptServer.getEvents(script.events, function(scriptEvents) {
              var serverEvents = scriptEvents.sort(function(a, b) {
                return a.execution_order - b.execution_order;
              });

              var events = [];
              for (var i = 0, ii = serverEvents.length; i < ii; ++i) {
                var serverEvent = serverEvents[i];
                var serverParams = serverEvent.parameters;
                var e = {};

                for (var j = 0, jj = serverParams.length; j < jj; ++j) {
                  var p = serverParams[j];
                  e[p.name] = JSON.parse(p.value);
                }
                events.push(e);
              }
              cont({
                name: script.name,
                id: script.id,
                events: events,
                parentId: script.parentId,
                notes: script.notes
              });
            });
          }
        },
        url: server + 'script/' + name + '/?format=json',
        type: 'GET',
        processData: false,
        accepts: 'application/json',
        dataType: 'json'
      });
      return null;
    },
    getEvents: function _getEvents(eventIds, cont) {
      var events = null;
      var server = this.server;

      function getEvent(i, retrievedEvents, retries) {
        if (i >= eventIds.length) {
          scriptLog.log('Done getting');
          cont(retrievedEvents);
          return;
        }

        if (retries > 3) {
          cont(null);
          return;
        }

        $.ajax({
          error: function(jqXHR, textStatus, errorThrown) {
            scriptLog.error(jqXHR, textStatus, errorThrown);
            getEvent(i, rerievedEvents, retries + 1);
          },
          success: function(data, textStatus, jqXHR) {
            scriptLog.log(data, textStatus, jqXHR);
            retrievedEvents.push(data);
            getEvent(i + 1, retrievedEvents);
          },
          url: server + 'event/' + eventIds[i].id + '/?format=json',
          type: 'GET',
          processData: false,
          accepts: 'application/json',
          dataType: 'json'
        });
      }

      getEvent(0, [], 0);
      return null;
    },
//    getBenchmarks: function _getBenchmarks(cont) {
//      var scriptServer = this;
//      var server = this.server;
//
//      $.ajax({
//        error: function(jqXHR, textStatus, errorThrown) {
//          scriptLog.log(jqXHR, textStatus, errorThrown);
//        },
//        success: function(data, textStatus, jqXHR) {
//          scriptLog.log(data, textStatus, jqXHR);
//          var benchmarks = data;
//          cont(benchmarks);
//        },
//        url: server + 'benchmark/?format=json',
//        type: 'GET',
//        processData: false,
//        accepts: 'application/json',
//        dataType: 'json'
//      });
//      return null;
//    },
//    saveBenchmarkRun: function _saveBenchmarkRun(benchmarkRun) {
//      var scriptServer = this;
//      var server = this.server;
//
//      var postMsg = {};
//      postMsg['benchmark'] = benchmarkRun.benchmark.id;
//      postMsg['successful'] = benchmarkRun.successful;
//      postMsg['events_executed'] = benchmarkRun.events_executed;
//      postMsg['events_total'] = benchmarkRun.events_total;
//
//      if (benchmarkRun.errors)
//        postMsg['errors'] = benchmarkRun.errors;
//
//      if (benchmarkRun.notes)
//        postMsg['notes'] = benchmarkRun.notes;
//
//      if (benchmarkRun.log)
//        postMsg['log'] = benchmarkRun.log;
//
//      $.ajax({
//        error: function(jqXHR, textStatus, errorThrown) {
//          scriptLog.log(jqXHR, textStatus, errorThrown);
//        },
//        success: function(data, textStatus, jqXHR) {
//          scriptLog.log(data, textStatus, jqXHR);
//        },
//        contentType: 'application/json',
//        data: JSON.stringify(postMsg),
//        dataType: 'json',
//        processData: false,
//        type: 'POST',
//        url: server + 'benchmark_run/'
//      });
//      return null;
//    },
//    getCapture: function _getCapture(scriptId, cont) {
//      var scriptServer = this;
//      var server = this.server;
//
//      $.ajax({
//        error: function(jqXHR, textStatus, errorThrown) {
//          scriptLog.log(jqXHR, textStatus, errorThrown);
//        },
//        success: function(data, textStatus, jqXHR) {
//          scriptLog.log(data, textStatus, jqXHR);
//          var capture = data;
//          cont(capture);
//        },
//        url: server + 'capture/' + scriptId + '/?format=json',
//        type: 'GET',
//        processData: false,
//        accepts: 'application/json',
//        dataType: 'json'
//      });
//      return null;
//    }
  };

  return ScriptServer;
})();


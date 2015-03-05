'use strict';

var serverUrl = "api/";

var server = new ScriptServer(serverUrl);

var form = $('<form><input id="scriptId" type="text"></form>');
form.submit(function(e) {
  var scriptId = $('#scriptId').attr('value');
  if (!isNaN(scriptId)) {
    console.log(scriptId);
    addScript(parseInt(scriptId));
  }
  return false;
});

$('#top').append(form);
$('#top').width($(window).width() - 400);
$(window).resize(function() {
  $('#top').width($(window).width() - 400);
});

var w = 960;
var h = 100;

var canvas = d3.select('#top').append('div').append('svg:svg')
    .attr('width', w)
    .attr('height', h)
    .attr('id', 'graphSvg');

$('#top').append('<div id="eventDiv"/>');

var scripts = [];
var nodes = [];
var eventLinks = [];
var causalLinks = [];

var d3ScriptIds = canvas.selectAll('.scriptId').data(scripts);
var d3Nodes = canvas.selectAll('.node').data(nodes);
// var d3EventLinks = canvas.selectAll('.eventlink').data(eventLinks);
var d3CausalLinks = canvas.selectAll('.causallink').data(causalLinks);

var getScriptIndex = function _scriptIndex(scriptId) {
  var scriptIndex = -1;
  for (var i = 0, ii = scripts.length; i < ii; ++i) {
    if (scripts[i].id == scriptId || scripts[i].name == scriptId) {
      return i;
    }
  }
  return null;
}

function addScript(scriptId) {
  if (typeof getScriptIndex(scriptId) == 'number')
    return;

  scripts.push({id: scriptId});

  server.getScript(scriptId, function(item) {
    var scriptIndex = getScriptIndex(scriptId);

    if (item == null) {
      scripts.splice(scriptIndex, 1);
      return;
    }

    scripts[scriptIndex] = item;
    var id = item.id;
    var events = item.events;

    var newNodes = [];
    var idToNode = {};

    for (var i = 0, ii = events.length; i < ii; ++i) {
      var e = events[i];
      var o = {
        scriptIndex: scriptIndex,
        eventIndex: i,
        maxIndex: ii,
        event: e,
        selected: false,
        relatedEvents: [],
        x: 0,
        y: 0,
        highlighted: false
      }
      idToNode[e.meta.id] = o;
      newNodes.push(o);
      
      var waitEvent = e.timing.waitEvent;
      if (waitEvent) {
        causalLinks.push({
          source: o,
          target: idToNode[waitEvent]
        });
      }
      var triggerCondition = e.timing.triggerCondition;
      if (triggerCondition) {
        for (var j = 0, jj = triggerCondition.length; j < jj; ++j) {
          var triggerEvent = triggerCondition[j].eventId;
          causalLinks.push({
            source: o,
            target: idToNode[triggerEvent]
          });
        }
      }
    }

    for (var i = 0, ii = nodes.length; i < ii; ++i) {
      for (var j = 0, jj = newNodes.length; j < jj; ++j) {
        var oldNode = nodes[i];
        var newNode = newNodes[j];
        if (oldNode.event.type == newNode.event.type) {
          var type = oldNode.event.type;
          if (eventEquality[type](oldNode.event, newNode.event)) {
            oldNode.relatedEvents.push(newNode);
            newNode.relatedEvents.push(oldNode);
          }
        }
      }
    }
    nodes = nodes.concat(newNodes);
    updateD3();
  });
}

function updateD3() {

  if (h / (scripts.length + 1) < 60) {
    h = (scripts.length + 1) * 60;
    canvas.attr('height', h);
  }

  var maxIndices = nodes.map(function(n) { return n.maxIndex; });
  var maxIndex = Math.max.apply(null, maxIndices);
  if (w / maxIndex < 8) {
    w = maxIndex * 8;
    canvas.attr('width', w);
  }

  d3ScriptIds = canvas.selectAll('.scriptId').data(scripts);

  d3ScriptIds.exit().transition().remove();
  
  d3ScriptIds.transition()
    .attr('transform', function(d, i) { 
      return 'translate(0, ' + 
        Math.round((i + 1) * (h / (scripts.length + 1))) + ')'; 
    });

  d3ScriptIds.select('text')
    .text(function(d) { 
      return '(' + d.id + ')' + d.name; })
    .select(function() { 
      return this.nextSibling; })
    .text(function(d) { 
      return d.notes; });


  d3ScriptIds.enter().append('g').attr('class', 'scriptId')
    .attr('transform', function(d, i) { 
      return 'translate(0, ' + 
        Math.round((i + 1) * (h / (scripts.length + 1))) + ')'; 
    })
    .attr('font-family', 'Arial')
    .attr('font-size', '.7em')
    .append('text')
    .text(function(d) { return '(' + d.id + ')' + d.name; })
    .attr('dy', '-2.2em')
    .select(function() { return this.parentElement; })
    .append('text')
    .text(function(d) { return d.notes; })
    .attr('dy', '-1.1em');

  var numScripts = scripts.length;
  for (var i = 0, ii = nodes.length; i < ii; ++i) {
    var n = nodes[i];
    n.x = Math.round((n.eventIndex + 1) * (w / (n.maxIndex + 1)));
    n.y = Math.round((n.scriptIndex + 1) * (h / (numScripts + 1)));
  }

  d3Nodes = canvas.selectAll('.node').data(nodes);

  d3Nodes.exit().transition().remove();
  
  d3Nodes.select('circle').transition()
    .attr('cx', function(d) { return d.x; })
    .attr('cy', function(d) { return d.y; });

  var node = d3Nodes.enter().append('g').attr('class', 'node');
  node.append('svg:circle')
    .attr('cx', function(d) { return d.x; })
    .attr('cy', function(d) { return d.y; })
    .attr('r', function(d) { return d.highlighted ? 6 : 3; })
    .attr('fill', function(d) {
      var type = d.event.type;
      if (type in typeColor)
        return typeColor[type];
      return typeColor.default;
    })
    .on('mouseover', function(d) {
      d3.select(this).transition()
          .attr('r', 6);
      showEvent(d.event);
    })
    .on('mouseout', function(d) {
      d3.select(this).transition()
          .attr('r', d.highlighted ? 6 : 3);
    })
    .on('click', function(d) {
      toggleSelected(d);
    })
    .filter(function(d) { return d.event.timing.waitTime === 0; })
    .attr('stroke', 'grey')
    .attr('stroke-width', '2');

  d3CausalLinks = canvas.selectAll('.causalLinks').data(causalLinks);

  d3CausalLinks.exit().transition().remove();

  d3CausalLinks.enter().append('path').attr('class', 'causalLinks')
    .attr('d', function(d) {
      var sourceX = d.source.x;
      var sourceY = d.source.y;
      var targetX = d.target.x;
      var targetY = d.target.y;

      var cX = (sourceX * .9 + targetX * .1);
      var cY = (sourceY * .9 + targetY * .1);

      var dX = (sourceX * .1 + targetX * .9);
      var dY = (sourceY * .1 + targetY * .9);
      
      cY -= 30;
      dY -= 30;

      var path = ['M', d.source.x, d.source.y, 'C', sourceX, cY, targetX, dY, targetX, targetY].join(' ');
      return path;
    })
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'none');

  d3CausalLinks.transition()
    .attr('d', function(d) {
      var sourceX = d.source.x;
      var sourceY = d.source.y;
      var targetX = d.target.x;
      var targetY = d.target.y;

      var cX = (sourceX * .9 + targetX * .1);
      var cY = (sourceY * .9 + targetY * .1);

      var dX = (sourceX * .1 + targetX * .9);
      var dY = (sourceY * .1 + targetY * .9);
      
      cY -= 30;
      dY -= 30;

      var path = ['M', d.source.x, d.source.y, 'C', sourceX, cY, targetX, dY, targetX, targetY].join(' ');
      return path;
    });

//  d3EventLinks = canvas.selectAll('.eventLinks').data(eventLinks);
//
//  d3EventLinks.exit().transition().remove();
//
//  d3EventLinks.enter().append('line').attr('class', 'eventLinks')
//    .attr('x1', function(d) { return d.node1.x; })
//    .attr('y1', function(d) { return d.node1.y; })
//    .attr('x2', function(d) { return d.node2.x; })
//    .attr('y2', function(d) { return d.node2.y; })
//    .attr('stroke', 'rgba(0,0,0,64)')
//    .attr('stroke-width', 1)
//    .attr('fill', 'none')
//    .attr('opacity', '.5');
//
//  d3EventLinks
//    .attr('x1', function(d) { return d.node1.x; })
//    .attr('y1', function(d) { return d.node1.y; })
//    .attr('x2', function(d) { return d.node2.x; })
//    .attr('y2', function(d) { return d.node2.y; })
}

function toggleSelected(d) {
  d.selected = !d.selected;

  var c = 'eventLinks-' + d.scriptIndex + '-' + d.eventIndex;
  var links = canvas.selectAll('.' + c).data(d.relatedEvents);

  if (d.selected) {
    links.enter().append('line').attr('class', c)
      .attr('x1', function(d2) { return d.x; })
      .attr('y1', function(d2) { return d.y; })
      .attr('x2', function(d2) { return d2.x; })
      .attr('y2', function(d2) { return d2.y; })
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('fill', 'none')
      .attr('opacity', '.5');
  } else {
    links.remove();
  }
}

function showEvent(orig) {
   function flatten(data, prefix, level) {
    if (level == 0 || typeof data != 'object')
      return [{name: prefix, value: JSON.stringify(data)}];

    var collect = [];
    for (var key in data) {
      collect = collect.concat(flatten(data[key], prefix + '.' + key, level - 1));
    }
    return collect;
  }
  
  var e = flatten(orig, 'e', 2);

  var newDiv = $("<div class='wordwrap node'></div>");
  newDiv.append("<b>type:" + "</b>" + orig.type + "<br/>");
  e = e.sort(function(a,b) {
    a = a.name.toLowerCase();
    b = b.name.toLowerCase();
    if (a < b)
      return -1;
    else if (a > b)
      return 1;
    else
      return 0;
  });

  for (var i = 0, ii = e.length; i < ii; ++i) {
    var param = e[i];
    var name = param.name;
    var value = param.value;

    var newSpan = $("<span><b>" + name + ":" + "</b></span>");
    newSpan.addClass(name);

    var cleansedValue = $('<span/>').text(value);

    if (cleansedValue.html().length > 500) {
      cleansedValue.css('display', 'none');

      (function() {
        newSpan.click(function(eventObject) {
          cleansedValue.toggle();
        });
      })();
    }

    newSpan.append(cleansedValue);
    newSpan.append('<br/>');

    newDiv.append(newSpan);
  }
  $('#eventDiv').empty().append(newDiv);
}

var eventEquality = {
  dom: function domEqual(e1, e2) {
    return e1.target.xpath == e2.target.xpath &&
      e1.frame.URL == e2.frame.URL &&
      e1.data.type == e2.data.type;
  },
  load: function loadEqual(e1, e2) {
    return e1.frame.URL == e2.frame.URL;
  },
  start: function startEqual(e1, e2) {
    return e1.data.method == e2.data.method &&
      e1.data.url == e2.data.url &&
      e1.data.type == e2.data.type;
  },
  completed: function completedEqual(e1, e2) {
    return e1.data.method == e2.data.method &&
      e1.data.url == e2.data.url &&
      e1.data.type == e2.data.type;
  },
  responseStarted: function completedEqual(e1, e2) {
    return e1.data.method == e2.data.method &&
      e1.data.url == e2.data.url &&
      e1.data.type == e2.data.type;
  },
  capture: function captureEqual(e1, e2) {
    return e1.target.xpath == e2.target.xpath &&
      e1.frame.URL == e2.frame.URL;
  }
};

var typeColor = {
  'dom': 'blue',
  'start': 'orange',
  'completed': 'brown',
  'load': 'brown',
  'responseStarted': 'red',
  'default': 'black'
};

function clearSelected() {
  d3Nodes.filter(function(d) { return d.selected; })
    .each(function(d) { toggleSelected(d); });
}

function highlightNode(eventIds) {
  updateD3();

  d3Nodes.filter(function(d) {
    return d.scriptIndex == 0 && eventIds.indexOf(d.event.meta.id) >= 0;
  }).each(function(d) {
    console.log(d);
    console.log(this);
    // d.highlighted = true;
    d3.select(this.childNodes[0]).attr('r', 6);
    var related = d.relatedEvents;
    d3Nodes.filter(function(d1) { 
      return related.indexOf(d1) >=0;
    }).each(function(d1) {
      d3.select(this.childNodes[0]).attr('r', 6);
    });
  });
  updateD3();
}

function clearHighlight() {


}

function addScriptGroup(id) {
  var req = $.ajax({
    error: function(jqXHR, textStatus, errorThrown) {
    },
    success: function(data, textStatus, jqXHR) {
      data = data.filter(function(script) {
        return script.name.indexOf(id) == 0;
      });
      for (var i = 0, ii = data.length; i < ii; ++i) {
        addScript(data[i].id);
      }
    },
    complete: function(jqXHR, textSataus) {
    },
    contentType: 'application/json',
    dataType: 'json',
    processData: false,
    type: 'GET',
    timeout: 15000,
    url: serverUrl + 'script/'
  });
}

// var scripts = [1, 31];
// scripts.forEach(function(id) {
//   addScript(id);
// });

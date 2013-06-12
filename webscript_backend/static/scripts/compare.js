var curScript = null;
var curScript2 = null;

var server = new ScriptServer("api/")

$('#script').change(function(event) {
  var val = event.target.value;
  console.log("getting script:", val);

  server.getScript(val, false, function(id, data) {
    console.log(data);
    setScript(val, data);
  });
});

$('#script2').change(function(event) {
  var val = event.target.value;
  console.log("getting script:", val);

  server.getScript(val, false, function(id, data) {
    console.log(data);
    setScript2(val, data);
  });
});

function setScript(id, script) {
  curScript = script;
  createReplayOption(mapping[id]);
  display();
}

function setScript2(id, script) {
  curScript2 = script;
  display();
}

function createReplayOption(replays) {
  $('#replays').empty();
  if (!replays || replays.length == 0)
    return;

  var replaySelect = '<select id="replaySelect">';
  replaySelect += '<option value=null></option>';
  for (var i = 0, ii = replays.length; i < ii; ++i) {
    var r = replays[i];
    replaySelect += '<option value=' + r + '>' + r + '</option>';
  }  
  replaySelect += '</select>';

  $('#replays').append(replaySelect);
  $('#replaySelect').change(function(event) {
    var val = event.target.value;
    server.getScript(val, false, function(id, data) {
      console.log(data);
      setScript2(data);
    });
  });
}

function display() {
  if (curScript && curScript2)
    match(curScript, curScript2);
}

function match(script, replay) {
  var scriptSeq = script;//.events.concat(script.comments);
  scriptSeq.sort(function(a, b) {
    return a.execution_order - b.execution_order
  });
  var replaySeq = replay;//.events.concat(replay.comments);
  replaySeq.sort(function(a, b) {
    return a.execution_order - b.execution_order
  });
  console.log('scripts:', scriptSeq, replaySeq);
  var matching = lcs(scriptSeq, 0, replaySeq, 0, {}).matches;
  console.log('matching:', matching);
  
  $('#diagram').empty();
  var table = $('<table></table>')
  for (var i = 0, ii = matching.length; i < ii; ++i) {
    var m = matching[i];
    var row = $('<tr></tr>');

    var cell = $('<td></td>');
    if ('seq1' in m) {
      cell.append(getNode(m.seq1, m.seq2));
    }
    row.append(cell);

    cell = $('<td></td>');
    if ('seq2' in m) {
      cell.append(getNode(m.seq2, m.seq1));
    }
    row.append(cell);
    table.append(row);
  }
  $('#diagram').append(table);
}

function getParam(parameters, name) {
  for (var i = 0, ii = parameters.length; i < ii; ++i) {
    var param = parameters[i];
    if (param.name == name)
      return param.value;
  }
  return null;
}

function getNode(eventOrComment, other) {
  if (eventOrComment == null)
    return "";

  if ('event_type' in eventOrComment) {
    var e = eventOrComment
    var newDiv = $("<div class='boxed wordwrap'></div>");

    var extGen = false;

    newDiv.append("<b>[" + e.id + "]type:" + "</b>" + e.event_type + "<br/>");
    var parameters = e.parameters;
    parameters = parameters.sort(function(a,b) {
      a = a.name.toLowerCase();
      b = b.name.toLowerCase();
      if (a < b)
        return -1;
      else if (a > b)
        return 1;
      else
        return 0;
    });
    for (var i = 0, ii = parameters.length; i < ii; ++i) {
      var param = parameters[i];

      var newSpan = $("<span><b>" + param.name + ":" + "</b></span>");
      if (other && getParam(other.parameters, param.name) != param.value)
        newSpan.addClass("diff");

      var value;
      if (param.name == "deltas") {
        var valueObj = eval(param.value);
        value = '';
        for (var j = 0, jj = valueObj.length; j < jj; ++j) {
          var delta = valueObj[j];
          value += delta.type + '\n';
          if (delta.divergingProp) {
            var prop = delta.divergingProp;
            value += prop + ":" +  delta.orig.prop[prop] + " -> " + 
                     delta.changed.prop[prop] + '\n';
          }
        }
        if (value == '')
          value = '-';

      } else if (param.name == 'extensionGenerated') {
        extGen = true;
      } else {
        value = param.value;
      }

      var cleansedValue = $('<span/>').text(value);
      if (cleansedValue.html().length > 500) {
        var id = uid();
        cleansedValue.attr('id', id);
        cleansedValue.css('display', 'none');

        (function() {
          var captureId = id;
          newSpan.click(function(eventObject) {
            $('#' + captureId).toggle();
          });
        })();
      }
      newSpan.append(cleansedValue);
      newSpan.append('<br/>');

      newDiv.append(newSpan);
    }
    
    if (extGen) {
      newDiv.addClass('extGen');
    } else {
      newDiv.addClass('native');
    }
    return newDiv;
  } else {
    var c = eventOrComment
    var newDiv = $("<div class='boxed wordwrap'></div>");
    var newSpan = $("<span><b>" + c.name + ":" + "</b>" + c.value +
                    "<br/></span>");
    if (other && c.value != other.value)
      newSpan.addClass("diff");

    newDiv.append(newSpan);
    return newDiv;
  }
}

function lcs(seq1, idx1, seq2, idx2, hash) {
  if (idx1 >= seq1.length || idx2 >= seq2.length)
    return {length: 0, matches: []};

  var cur1 = seq1[idx1];
  var cur2 = seq2[idx2];

  // found a match
  if (('event_type' in cur1 && 'event_type' in cur2 &&
      cur1['event_type'] == cur2['event_type']) ||
      ('name' in cur1 && 'name' in cur2 && cur1['name'] == cur2['name'])) {
    var match = {type:'match', seq1: cur1, seq2: cur2};
    var rest = lcs(seq1, idx1 + 1, seq2, idx2 + 1, hash);
    return {length: rest.length + 1, matches: [match].concat(rest.matches)}
  } else {
    var k = "" + idx1 + ":" + (idx2 + 1);
    if (k in hash) {
      var t1 = hash[k];
    } else {
      var t1 = lcs(seq1, idx1, seq2, idx2 + 1, hash);
      hash[k] = t1;
    }

    var k = "" + (idx1 + 1) + ":" + idx2;
    if (k in hash) {
      var t2 = hash[k];
    } else {
      var t2 = lcs(seq1, idx1 + 1, seq2, idx2, hash);
      hash[k] = t2;
    }
    if (t1.length > t2.length) {
      var mismatch = {type:'mismatch', seq1: null, seq2: cur2};
      return {length: t1.length, matches: [mismatch].concat(t1.matches)}
    } else {
      var mismatch = {type:'mismatch', seq1: cur1, seq2: null};
      return {length: t2.length, matches: [mismatch].concat(t2.matches)}
    }
  }
}

var id = 0;
function uid() {
  id += 1;
  return "id" + id;
}

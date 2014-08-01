var curScript = null;
var curScript2 = null;

var server = new ScriptServer("api/")

function getScriptCallback(scriptCallback) {
  return (function(e) {
    var val = e.target.value;
    console.log("getting script:", val);

    server.getScript(val, function(item) {
      console.log(item);
      scriptCallback(item.id, item.events);
    });
  });
}

$('#script').change(getScriptCallback(setScript));
$('#script2').change(getScriptCallback(setScript2));

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
  $('#replaySelect').change(getScriptCallback(setScript2));
}

function display() {
  if (curScript && curScript2)
    match(curScript, curScript2);
}

function match(scriptEvents, replayEvents) {
  scriptEvents = normalize(scriptEvents);
  replayEvents = normalize(replayEvents);

  console.log('scripts:', scriptEvents, replayEvents);

  var matching = lcs(scriptEvents, 0, replayEvents, 0, {}).matches;

  console.log('matching:', matching);
  
  $('#diagram').empty();

  var table = $('<table></table>')

  // create filler cells so table doesn't collapse when elements are invisible
  var row = $('<tr></tr>');
  var cell = $('<td></td>');
  cell.width(480);
  row.append(cell).append(cell);
  table.append(row);

  for (var i = 0, ii = matching.length; i < ii; ++i) {
    var m = matching[i];
    row = $('<tr></tr>');

    cell = $('<td></td>');
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

function normalize(events) {
  var normalizedEvents = [];

  function flatten(data, prefix, level) {
    if (level == 0 || typeof data != 'object')
      return [{name: prefix, value: JSON.stringify(data)}];

    var collect = [];
    for (key in data) {
      collect = collect.concat(flatten(data[key], prefix + '.' + key, level - 1));
    }
    return collect;
  }

  for (var i = 0, ii = events.length; i < ii; ++i) {
    var e = events[i];

    if (e.type == 'dom')
      e.type = 'dom:' + e.data.type;

    normalizedEvents.push(flatten(e, 'e', 2));
  }
  return normalizedEvents;
}

function getNode(e, other) {
  if (e == null)
    return "";

  var newDiv = $("<div class='boxed wordwrap node'></div>");

  var extGen = false;

  newDiv.append("<b>type:" + "</b>" + getParam('e.type', e) + "<br/>");
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

    if (other && getParam(name, other) != value)
      newSpan.addClass("diff");
    else
      newSpan.addClass('nodiff');

/*
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

    } else 
*/
    if (name == 'e.data.extensionGenerated') {
      extGen = true;
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
  
}

function getParam(name, parameters) {
  for (var i = 0, ii = parameters.length; i < ii; ++i) {
    var param = parameters[i];
    if (param.name == name)
      return param.value;
  }
  return null;
}

function lcs(seq1, idx1, seq2, idx2, hash) {
  if (idx1 >= seq1.length) {
    var matches = [];
    for (var i = idx2, ii = seq2.length; i < ii; ++i) {
      matches.push({type: 'mismatch', seq1: null, seq2: seq2[i]});
    }
    return {length: 0, matches: matches};
  } else if (idx2 >= seq2.length) {
    var matches = [];
    for (var i = idx1, ii = seq1.length; i < ii; ++i) {
      matches.push({type: 'mismatch', seq1: seq1[i], seq2: null});
    }
    return {length: 0, matches: matches};
  }

  var cur1 = seq1[idx1];
  var cur2 = seq2[idx2];

  // found a match
  var type1 = getParam('e.type', cur1);
  var type2 = getParam('e.type', cur2);
  if (type1 === type2) {
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

function showProps(props) {
  if (props == '*') {
    $('.event > span').show();
  } else {
    var propArray = props.split(' ');
    for (var i = 0, ii = propArray.length; i < ii; ++i)
      $('.event > .' + propArray[i]).show();
  }
}

function hideProps(props) {
  if (props == '*') {
    $('.event > span').hide();
  } else {
    var propArray = props.split(' ');
    for (var i = 0, ii = propArray.length; i < ii; ++i)
      $('.event > .' + propArray[i]).hide();
  }
}

function showEvents(events) {
  if (events == '*') {
    $('.event').show();
  } else {
    var eventArray = events.split(' ');
    for (var i = 0, ii = eventArray.length; i < ii; ++i)
      $('.event.' + eventArray[i]).show();
  }
}

function hideEvents(events) {
  if (events == '*') {
    $('.event').hide();
  } else {
    var eventArray = events.split(' ');
    for (var i = 0, ii = eventArray.length; i < ii; ++i)
      $('.event.' + eventArray[i]).hide();
  }
}

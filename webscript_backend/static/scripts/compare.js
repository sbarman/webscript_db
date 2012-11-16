$('#script').change(function(event) {
  var val = event.target.value;
  console.log(event);

  $.ajax({
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("error getting script", jqXHR, textStatus, errorThrown);
    },
    success: function(data, textStatus, jqXHR) {
      console.log(data, textStatus, jqXHR);
      setScript(val, data);
    },
    contentType: "application/json",
    //data: JSON.stringify(postMsg),
    dataType: "json",
    processData: false,
    type: "GET",
    url: "api/script/" + val,
  });
});

function setScript(id, script) {
  $.ajax({
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("error getting script", jqXHR, textStatus, errorThrown);
    },
    success: function(data, textStatus, jqXHR) {
      console.log(data, textStatus, jqXHR);
      display(script[0], data);
    },
    contentType: "application/json",
    data: {script_id: id},
    dataType: "json",
    processData: true,
    type: "GET",
    url: "api/replay/",
  });
}

var curScript = null;
var curReplays = null;

function display(script, replays) {
  curScript = script;
  curReplays = replays;
  createReplayOption(replays);
  createDiffs();
}

function createReplayOption(replays) {
  $('#replays').empty();
  if (replays.length == 0)
    return;

  var replaySelect = '<select id="replaySelect">';
  for (var i = 0, ii = replays.length; i < ii; ++i) {
    var r = replays[i];
    replaySelect += '<option value=' + i + '>' + r.id + '</option>';
  }  
  replaySelect += '</select>';

  $('#replays').append(replaySelect);
  $('#replaySelect').change(createDiffs);
}

function createDiffs() {
  var script = curScript;
  var replayIndex = $('#replaySelect').prop('value');
  if (replayIndex != null) {
    var replay = curReplays[replayIndex];
    match(script, replay);
  } else {
  }
}

function match(script, replay) {
  var scriptSeq = script.events.concat(script.comments);
  scriptSeq.sort(function(a, b) {
    return a.execution_order - b.execution_order
  });
  var replaySeq = replay.events.concat(replay.comments);
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
    if ('seq1' in m) {
      row.append('<td>' + getNode(m.seq1) + '</td>');
    } else {
      row.append('<td></td>');
    }
    if ('seq2' in m) {
      row.append('<td>' + getNode(m.seq2) + '</td>');
    } else {
      row.append('<td></td>');
    }
    table.append(row);
  }
  $('#diagram').append(table);
}

function getNode(eventOrComment) {
  if (eventOrComment == null)
    return "";

  if ('event_type' in eventOrComment) {
    var e = eventOrComment
    var newDiv = "<div class='boxed wordwrap'>";

    newDiv += "<b>[" + e.id + "]type:" + "</b>" + e.event_type + "<br/>";
    for (var i = 0, ii = e.parameters.length; i < ii; ++i) {
      var param = e.parameters[i];
      newDiv += "<b>" + param.name + ":" + "</b>" + param.value + "<br/>";
    }
    newDiv += "</div>";
    return newDiv;
  } else {
    var c = eventOrComment
    var newDiv = "<div class='boxed wordwrap'>";
    newDiv += "<b>" + c.name + ":" + "</b>" + c.value + "<br/>";
    newDiv += "</div>";
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

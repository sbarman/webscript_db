'use strict';

var serverUrl = "api/";

var server = new ScriptServer(serverUrl);
server.getBenchmarkRuns(function(runs) {
  var groups = _.groupBy(runs, function(run) {
      return run.benchmark.id + ':' + run.version;
  });

  var summaries = [];
  for (var groupId in groups) {
    var runs = groups[groupId];
    var firstRun = runs[0];
    var name = firstRun.benchmark.name;
    var id = firstRun.benchmark.id;
    var version = firstRun.version

    var maxTime = firstRun.time;
    var minTime = firstRun.time;
    var totalTime = 0;
    var totalTriggerTimeouts = 0;
    var totalElementTimeouts = 0;
    var pass = 0;
    var earliestDate =  firstRun.creation_date;
    runs.forEach(function(run) {
      var t = run.time;
      if (t > maxTime)
        maxTime = t;
      if (t < minTime)
        minTime = t;
      totalTime += t;

      totalTriggerTimeouts += run.trigger_timeouts;
      totalElementTimeouts += run.element_timeouts;
      
      if (run.successful)
        pass += 1;

      if (run.creation_date < earliestDate)
        earliestDate = run.creation_date;
    });

    var numRuns = runs.length
    summaries.push({
      name: name,
      id: id,
      version: version,
      avgTime: totalTime / numRuns,
      minTime: minTime,
      maxTime: maxTime,
      avgTriggerTimeouts: totalTriggerTimeouts / numRuns,
      avgElementTimeouts: totalElementTimeouts / numRuns,
      pass: pass,
      numRuns: numRuns,
      passRate: pass / numRuns,
      earliestDate: earliestDate
    });
  }
  console.log(summaries);
  summaries = _.sortBy(summaries, function(s) {return s.earliestDate;}).reverse();
  var table = $('<table id="displayTable"></table>');
  var header = ['id', 'name', 'version', 'earliestDate', 'numRuns', 'pass', 'avgTime', 'minTime', 'maxTime', 'avgTriggerTimeouts', 'avgElementTimeouts', 'passRate'];

  $('#top').append(table);
  var row = $('<tr></tr>');
  header.forEach(function(h) {
    row.append('<td>' + h + '</td>');
  });
  table.append(row);

  summaries.forEach(function(s) {
    var row = $('<tr></tr>');
    header.forEach(function(h) {
      row.append('<td>' + s[h] + '</td>');
    });
    table.append(row);
  });
});

'use strict';

var serverUrl = "api/";

var server = new ScriptServer(serverUrl);
server.getBenchmarkRuns(function(runs) {
  var benchmarks = _.groupBy(runs, function(run) {return run.benchmark.id;});

  var summaries = [];
  for (var b in benchmarks) {
    var runs = benchmarks[b];
    var info = runs[0].benchmark;

    var maxTime = runs[0].time;
    var minTime = runs[0].time;
    var totalTime = 0;
    var pass = 0;
    var earliestDate =  runs[0].creation_date;
    runs.forEach(function(run) {
      var t = run.time;
      if (t > maxTime)
        maxTime = t;
      if (t < minTime)
        minTime = t;
      totalTime += t;
      
      if (run.successful)
        pass += 1;

      if (run.creation_date < earliestDate)
        earliestDate = run.creation_date;
    });

    var numRuns = runs.length
    summaries.push({
      name: info.name,
      avgTime: totalTime / numRuns,
      minTime: minTime,
      maxTime: maxTime,
      pass: pass,
      numRuns: numRuns,
      passRate: pass / numRuns,
      earliestDate: earliestDate
    });
  }
  console.log(summaries);
  summaries = _.sortBy(summaries, function(s) {return earliestDate;}).reverse();
  var table = $('<table></table>');
  var header = ['name', 'numRuns', 'pass', 'avgTime', 'minTime', 'maxTime', 'passRate'];

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

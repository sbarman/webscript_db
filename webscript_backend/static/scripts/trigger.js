'use strict';

var addScript = null;

(function() {

var server = new ScriptServer("api/")

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

var w = 1000;
var h = 400;

var scripts = [];

var canvas = d3.select('#top').append('svg:svg').attr('width', w).attr('height', h);

//var diagonal = d3.svg.diagonal().source(function(d) {
//  return {x: d.source.x, y: d.source.y};
//}).target(function(d) {
//  return {x: d.target.x, y: d.target.y};
//})
//.projection(function(d) {
//  return [d.y, d.x];
//});

//var lineFunction =  d3.svg.line()
//  .x(function(d) { return d.x; }
//  .y(function(d) { return d.y; }
//  .interpolate('

var nodes = [];
var eventLinks = [];
var causalLinks = [];

var d3Nodes = canvas.selectAll('.node').data(nodes);
var d3EventLinks = canvas.selectAll('.eventlink').data(eventLinks);
var d3CausalLinks = canvas.selectAll('.causallink').data(causalLinks);

addScript = function _addScript(scriptId) {
  server.getScript(scriptId, true, function(id, events) {
    scripts.push({id: id, events: events});

    var scriptIndex = scripts.length - 1;
    var newNodes = [];
    var idToNode = {};

    for (var i = 0, ii = events.length; i < ii; ++i) {
      var e = events[i];
      var o = {
        scriptIndex: scriptIndex,
        eventIndex: i,
        maxIndex: ii,
        event: e,
        x: 0,
        y: 0
      }
      nodes.push(o);
      idToNode[e.msg.value.meta.id] = o;
      newNodes.push(o);
      
      var waitEvent = e.msg.value.timing.waitEvent;
      if (waitEvent) {
        causalLinks.push({
          source: o,
          target: idToNode[waitEvent]
        });
      }
    }
    updateD3();
  });

}

function updateD3() {
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
    .attr('r', 3)
    .attr('fill', function(d) {
      if (d.event.msg.value.timing.waitEvent === 0) {
        return 'red';
      }
      return 'grey';
    });

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

}

var eventEquality = {
  dom: ,



};

addScript(2745);

})();



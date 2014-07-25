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

var canvas = d3.select('#top').append('svg:svg').attr('width', 1000).attr('height', 1000);
var nodes = [];
var eventLinks = [];
var causalLinks = [];

var d3Nodes = canvas.selectAll('.node').data(nodes);
var d3EventLinks = canvas.selectAll('.eventlink').data(eventLinks);
var d3CausalLinks = canvas.selectAll('causallink').data(causalLinks);

function addScript(scriptId) {
  server.getScript(scriptId, true, function(id, events) {
    var scriptIndex = nodes.length;
    var newNodes = [];
    var lastNode = null;
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
      newNodes.push(o);
      
      if (lastNode) {
        
      }
      lastNode = o;

    }
    console.log(e);
  });
}

addScript(2745);

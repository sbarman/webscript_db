var tiles = {};
var server = new ScriptServer("api/");

function addTile(scriptId) {
  server.getCapture(scriptId, function(capture) {
    var tilesDiv = $('#tiles');

    var newTile = $('<div></div>');
    newTile.attr('id', '' + scriptId);
    newTile.addClass('red live-tile');

    var front = $('<div>' + capture.script.name + '</div>');

    var back = $('<div></div>');
    var nodeName = capture.nodeName;
    var captureNode = $('<' + nodeName + '></' + nodeName + '>');
    captureNode.html(capture.innerHtml);
    back.append(captureNode);

    newTile.append(front);
    newTile.append(back);
    tilesDiv.append(newTile);

    newTile.liveTile();
  });
}

$(document).ready(function(){
    $('.live-tile').liveTile();
});

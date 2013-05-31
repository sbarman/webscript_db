var tiles = {};
var server = new ScriptServer("api/");

var colorList = ['amber', 'blue', 'brown', 'cobalt', 'crimson', 'cyan', 'emerald', 'green', 'indigo', 'lime', 'magenta', 'mango', 'mauve', 'olive', 'orange', 'pink', 'purple', 'violet', 'red', 'sienna', 'steel', 'teal', 'yellow'];
var colorIndex = 0;

function addTile(scriptId) {
  server.getCapture(scriptId, function(capture) {
    var tilesDiv = $('#tiles');

    var newTile = $('<div></div>');
    newTile.attr('id', '' + scriptId);
    newTile.addClass('live-tile ' + colorList[colorIndex++]);

    var front = $('<div>' + capture.script.name + '</div>');
    front.addClass('');

    var back = $('<div></div>');
    var nodeName = capture.nodeName;
    var captureNode = $('<' + nodeName + '></' + nodeName + '>');
    captureNode.html(capture.innerHtml);
    captureNode.remove(":input");
    back.append(captureNode);

    newTile.append(back);
    newTile.append(front);
    tilesDiv.append(newTile);

    newTile.attr('data-mode', 'flip');
    newTile.liveTile({repeatCount: 0, delay: 0});

    newTile.click(function(e) {
      console.log('click', e);
      var target = $(e.currentTarget);

      target.liveTile('play');

      if (target.hasClass('enlarged')) {
        target.removeClass('enlarged', 0);
      } else {
        target.addClass('enlarged', 0);
      }
    });

  });
}

$(document).ready(function(){
    //$('.live-tile').liveTile();
    var scripts = [52, 57, 66, 68, 70, 73];
    for (var i = 0; i < scripts.length; ++i) {
      addTile(scripts[i]);
    }
});

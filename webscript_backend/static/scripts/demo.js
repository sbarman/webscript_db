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

function addTileUpdating(scriptId) {
  var captureNode;
  var oldText;
  var newTile;
 
  server.getCapture(scriptId, function(capture) {
    var tilesDiv = $('#tiles');

    newTile = $('<div></div>');
    newTile.attr('id', '' + scriptId);
    newTile.addClass('live-tile ' + colorList[colorIndex++]);

    var front = $('<div>' + capture.script.name + '</div>');
    front.addClass('');

    var back = $('<div></div>');
    var nodeName = capture.nodeName;
    captureNode = $('<' + nodeName + '></' + nodeName + '>');
    captureNode.html(capture.innerHtml);
    captureNode.remove(":input");
    back.append(captureNode);

    oldText = capture.innerHtml;

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

  setInterval(function() {
    console.log('autoupdating');
    server.getCapture(scriptId, function(capture) {
      var captureText = capture.innerHtml;
      if (oldText != captureText) {
        oldText = captureText;
        console.log('autoupdating got capture');
        captureNode.html(captureText);
        captureNode.remove(":input");

        newTile.liveTile("play", 0);
        setTimeout(function() {
          newTile.liveTile("play", 0);
        }, 500);
      }
    });
  }, 4000);
}


function addUpdateButton() {
  var tilesDiv = $('#buttons');

  var newTile = $('<div></div>');
  var updateButton = $('<button/>', {
    text: 'Update',
    click: function(e) {
      console.log('updating');
      runUpdate();
    }
  });
  updateButton.addClass('button', 0);

  tilesDiv.append(updateButton);
}

function runUpdate() {
  $.ajax({
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown);
    },
    success: function(data, textStatus, jqXHR) {
      console.log(data, textStatus, jqXHR);
    },
    url: 'demoUpdate',
    type: 'GET',
    processData: false,
    accepts: 'application/json',
    dataType: 'json'
  });
}

$(document).ready(function(){
    //$('.live-tile').liveTile();
    addTileUpdating(100);

    var scripts = [57, 66, 68, 70, 73];
    for (var i = 0; i < scripts.length; ++i) {
      addTile(scripts[i]);
    }

    addUpdateButton();
});

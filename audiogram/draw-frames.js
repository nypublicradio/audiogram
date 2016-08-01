var fs = require("fs"),
    path = require("path"),
    queue = require("d3").queue;

function drawFrames(renderer, options, cb) {

  var frameQueue = queue(10);

  for (var i = 0; i < options.numFrames; i++) {

    frameQueue.defer(drawFrame, i);

  }

  frameQueue.awaitAll(cb);

  function drawFrame(frameNumber, frameCallback) {

    renderer.drawFrame(frameNumber);
    fs.writeFile(path.join(options.frameDir, zeropad(frameNumber + 1, 6) + ".png"), renderer.context.canvas.toBuffer(), function(err) {
      if (err) {
        return frameCallback(err);
      }

      if (options.tick) {
        options.tick();
      }

      return frameCallback(null);

    });

  }

}

function zeropad(str, len) {

  str = str.toString();

  while (str.length < len) {
    str = "0" + str;
  }

  return str;

}

module.exports = drawFrames;

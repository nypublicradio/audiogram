var fs = require("fs"),
    path = require("path"),
    Canvas = require("canvas"),
    queue = require("d3").queue;

function drawFrames(renderer, options, cb) {

  var frameQueue = queue(10),
      canvas = new Canvas(options.width, options.height),
      context = canvas.getContext("2d");

  for (var i = 0; i < options.numFrames; i++) {
    frameQueue.defer(drawFrame, i);
  }

  frameQueue.awaitAll(cb);

  function drawFrame(frameNumber, frameCallback) {

    renderer.drawFrame(context, {
      caption: options.caption,
      waveform: options.waveform[frameNumber],
      frame: frameNumber
    });

    fs.writeFile(path.join(options.frameDir, zeropad(frameNumber + 1, 6) + ".png"), canvas.toBuffer(), function(err) {
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

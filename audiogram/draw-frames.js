var fs = require("fs"),
    path = require("path"),
    Canvas = require("canvas"),
    queue = require("d3").queue;

function drawFrames(renderer, options, cb) {

  var frameQueue = queue(10),
      canvases = [];

  for (var i = 0; i < 10; i++) {
    canvases.push(Canvas.createCanvas(options.width, options.height));
  }

  for (var i = 0; i < options.numFrames; i++) {
    frameQueue.defer(drawFrame, i);
  }

  frameQueue.awaitAll(cb);

  function drawFrame(frameNumber, frameCallback) {

    var canvas = canvases.pop(),
        context = canvas.getContext("2d");

    let ms = (options.trimStart*1000)+((frameNumber/20)*1000);
    let subt = '';

    options.subtitle.forEach(function (sub) {
      if (ms >= sub.start && ms <= sub.end) {
        subt = sub.text;
        return;
      }
    }); 

    renderer.drawFrame(context, {
      caption: options.caption,
      subtitle: subt,
      waveform: options.waveform[frameNumber],
      frame: frameNumber
    });

    canvas.toBuffer(function(err, buf){

      if (err) {
        return cb(err);
      }

      fs.writeFile(path.join(options.frameDir, zeropad(frameNumber + 1, 6) + ".png"), buf, function(writeErr) {

        if (writeErr) {
          return frameCallback(writeErr);
        }

        if (options.tick) {
          options.tick();
        }

        canvases.push(canvas);

        return frameCallback(null);

      });

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

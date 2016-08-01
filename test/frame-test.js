var tape = require("tape"),
    Canvas = require("canvas"),
    d3 = require("d3"),
    path = require("path"),
    fs = require("fs"),
    initializeCanvas = require("../audiogram/initialize-canvas.js"),
    drawFrames = require("../audiogram/draw-frames.js");

require("mkdirp").sync(path.join(__dirname, "tmp", "frames"));

var frameDir = path.join(__dirname, "tmp", "frames");

tape.test("Draw frame", function(test){

  var options = {
    width: 1280,
    height: 720,
    backgroundColor: "#f00",
    foregroundColor: "#fff",
    waveTop: 340,
    waveBottom: 380,
    waveform: [[0, 1, 0], [1, 0.1, 1]]
  };

  initializeCanvas(options, function(err, renderer){

    test.error(err);
    test.assert(renderer.context.canvas instanceof Canvas);
    test.assert(renderer.context.canvas.width === options.width);
    test.assert(renderer.context.canvas.height === options.height);

    drawFrames(renderer, {
      numFrames: 2,
      frameDir: frameDir
    }, function(err){
      test.error(err);
      checkFrame(test, options);
    });

  });

});

tape.test("Default colors", function(test){

  var options = {
    width: 1280,
    height: 720,
    waveTop: 340,
    waveBottom: 380,
    waveform: [[0, 1, 0], [1, 0.1, 1]]
  };

  initializeCanvas(options, function(err, renderer){

    test.error(err);
    test.assert(renderer.context.canvas instanceof Canvas);
    test.assert(renderer.context.canvas.width === options.width);
    test.assert(renderer.context.canvas.height === options.height);

    drawFrames(renderer, {
      numFrames: 2,
      frameDir: frameDir
    }, function(err){
      test.error(err);
      checkFrame(test, options);
    });

  });

});

tape.test("Square frame", function(test){

  var options = {
    width: 720,
    height: 720,
    backgroundColor: "#fc0",
    foregroundColor: "#fff",
    waveTop: 340,
    waveBottom: 380,
    waveform: [[0, 1, 0], [1, 0.1, 1]]
  };

  initializeCanvas(options, function(err, renderer){

    test.error(err);
    test.assert(renderer.context.canvas instanceof Canvas);
    test.assert(renderer.context.canvas.width === options.width);
    test.assert(renderer.context.canvas.height === options.height);

    drawFrames(renderer, {
      numFrames: 2,
      frameDir: frameDir
    }, function(err){
      test.error(err);
      checkFrame(test, options);
    });

  });

});

function checkFrame(test, options) {

  var testCanvas = new Canvas(options.width, options.height),
      context = testCanvas.getContext("2d");

  d3.queue()
    .defer(fs.readFile, path.join(frameDir, "000001.png"))
    .defer(fs.readFile, path.join(frameDir, "000002.png"))
    .await(function(e, f1, f2){

      test.error(e);

      var img = new Canvas.Image;
      img.src = f1;

      var bg = getColor(options.backgroundColor || "#fff"),
          fg = getColor(options.waveColor || options.foregroundColor || "#000");

      context.drawImage(img, 0, 0, options.width, options.height);
      test.deepEqual(getColor(context.getImageData(0, 0, 1, 1)), bg);
      test.deepEqual(getColor(context.getImageData(options.width - 1, options.height - 1, 1, 1)), bg);
      test.deepEqual(getColor(context.getImageData(0, options.height / 2 - 10, 1, 1)), bg);
      test.deepEqual(getColor(context.getImageData(options.width - 1, options.height / 2 + 10, 1, 1)), bg);
      test.deepEqual(getColor(context.getImageData(options.width / 2, options.height / 2, 1, 1)), fg);
      test.deepEqual(getColor(context.getImageData(options.width / 2, options.height / 2 - 10, 1, 1)), fg);
      test.deepEqual(getColor(context.getImageData(options.width / 2, options.height / 2 + 10, 1, 1)), fg);

      img.src = f2;

      context.drawImage(img, 10, 0, options.width, options.height);
      test.deepEqual(getColor(context.getImageData(options.width / 2, options.height / 2, 1, 1)), fg);
      test.deepEqual(getColor(context.getImageData(options.width / 2 - 10, options.height / 2 - 10, 1, 1)), bg);
      test.deepEqual(getColor(context.getImageData(options.width / 2 - 10, options.height / 2 + 10, 1, 1)), bg);


      test.end();

    });

}

function getColor(c) {
  if (typeof c === "string") {
    c = d3.color(c);
    return [c.r, c.g, c.b];
  } else {
    return Array.prototype.slice.call(c.data, 0, 3);
  }
}

// Cleanup
tape.onFinish(function(){
  require("rimraf")(path.join(__dirname, "tmp"), function(err){
    if (err) {
      throw err;
    }
  });
});

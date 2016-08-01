var tape = require("tape"),
    path = require("path"),
    fs = require("fs"),
    queue = require("d3").queue;

require("mkdirp").sync(path.join(__dirname, "tmp"));

var getDuration = require("../audiogram/duration.js"),
    trimAudio = require("../audiogram/trim.js");

tape("MP3 duration", function(test) {

  getDuration(path.join(__dirname, "data/glazed-donut.mp3"), function(err, duration){

    test.error(err);
    test.equal(typeof duration, "number");
    test.assert(Math.abs(duration - 26.67) < 0.1);
    test.end();

  });

});

tape("WAV duration", function(test) {

  getDuration(path.join(__dirname, "data/glazed-donut.wav"), function(err, duration){

    test.error(err);
    test.equal(typeof duration, "number");
    test.assert(Math.abs(duration - 1.83) < 0.1);
    test.end();

  });

});

tape("Duration error", function(test) {

  getDuration(path.join(__dirname, "..", "README.md"), function(err){

    test.ok(err);
    test.end();

  });

});

tape("Trim start", function(test) {

  var options = {
    origin: path.join(__dirname, "data/glazed-donut.mp3"),
    destination: path.join(__dirname, "tmp/trim-start.mp3"),
    startTime: 6.67
  };

  queue(1)
    .defer(trimAudio, options)
    .defer(getDuration, options.destination)
    .await(function(err, _, duration){

      test.error(err);
      test.equal(typeof duration, "number");
      test.assert(Math.abs(duration - 20) < 0.1);
      test.end();

    });

});

tape("Trim end", function(test) {

  var options = {
    origin: path.join(__dirname, "data/glazed-donut.mp3"),
    destination: path.join(__dirname, "tmp/trim-end.mp3"),
    startTime: 6.67
  };

  queue(1)
    .defer(trimAudio, options)
    .defer(getDuration, options.destination)
    .await(function(err, _, duration){

      test.error(err);
      test.equal(typeof duration, "number");
      test.assert(Math.abs(duration - 20) < 0.1);
      test.end();

    });

});

tape("Trim start & end", function(test) {

  var options = {
    origin: path.join(__dirname, "data/glazed-donut.mp3"),
    destination: path.join(__dirname, "tmp/trim-start-end.mp3"),
    startTime: 5,
    endTime: 10
  };

  queue(1)
    .defer(trimAudio, options)
    .defer(getDuration, options.destination)
    .await(function(err, _, duration){

      test.error(err);
      test.equal(typeof duration, "number");
      test.assert(Math.abs(duration - 5) < 0.1);
      test.end();

    });

});


tape("Trim invalid", function(test) {

  var options = {
    origin: path.join(__dirname, "data/glazed-donut.mp3"),
    destination: path.join(__dirname, "tmp/trim-invalid.mp3"),
    startTime: 5,
    endTime: 4
  };

  queue(1)
    .defer(trimAudio, options)
    .defer(getDuration, options.destination)
    .await(function(err, _, duration){

      test.ok(err);
      test.end();

    });

});

// Cleanup
tape.onFinish(function(){
  require("rimraf")(path.join(__dirname, "tmp"), function(err){
    if (err) {
      throw err;
    }
  });
});

// Cleanup
tape.onFinish(function(){
  require("rimraf")(path.join(__dirname, "tmp"), function(err){
    if (err) {
      throw err;
    }
  });
});

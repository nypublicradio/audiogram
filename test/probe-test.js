var tape = require("tape"),
    path = require("path"),
    fs = require("fs"),
    queue = require("d3").queue;

require("mkdirp").sync(path.join(__dirname, "tmp"));

var probe = require("../lib/probe.js"),
    trimAudio = require("../audiogram/trim.js");

tape("MP3 probe", function(test) {

  probe(path.join(__dirname, "data/glazed-donut.mp3"), function(err, data){

    test.error(err);
    test.equal(typeof data.duration, "number");
    test.equal(data.channels, 2);
    test.assert(Math.abs(data.duration - 26.67) < 0.1);
    test.end();

  });

});

tape("Mono probe", function(test) {

  probe(path.join(__dirname, "data/glazed-donut-mono.mp3"), function(err, data){

    test.error(err);
    test.equal(typeof data.duration, "number");
    test.equal(data.channels, 1);
    test.assert(Math.abs(data.duration - 26.67) < 0.1);
    test.end();

  });

});

tape("WAV probe", function(test) {

  probe(path.join(__dirname, "data/glazed-donut.wav"), function(err, data){

    test.error(err);
    test.equal(typeof data.duration, "number");
    test.equal(data.channels, 2);
    test.assert(Math.abs(data.duration - 1.83) < 0.1);
    test.end();

  });

});

tape("Mono probe", function(test) {

  probe(path.join(__dirname, "data/short.wav"), function(err, data){

    test.error(err);
    test.equal(typeof data.duration, "number");
    test.equal(data.channels, 1);
    test.assert(Math.abs(data.duration - 0.01) < 0.01);
    test.end();

  });

});

tape("Probe error", function(test) {

  probe(path.join(__dirname, "..", "README.md"), function(err){

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
    .defer(probe, options.destination)
    .await(function(err, _, data){

      test.error(err);
      test.equal(typeof data.duration, "number");
      test.assert(Math.abs(data.duration - 20) < 0.1);
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
    .defer(probe, options.destination)
    .await(function(err, _, data){

      test.error(err);
      test.equal(typeof data.duration, "number");
      test.assert(Math.abs(data.duration - 20) < 0.1);
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
    .defer(probe, options.destination)
    .await(function(err, _, data){

      test.error(err);
      test.equal(typeof data.duration, "number");
      test.assert(Math.abs(data.duration - 5) < 0.1);
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

  trimAudio(options, function(err){
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

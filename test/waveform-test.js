var tape = require("tape"),
    path = require("path");

var getWaveform = require("../audiogram/waveform.js");

var sample = path.join(__dirname, "data/glazed-donut.mp3");

tape("Waveform", function(test) {

  var options = {
    numFrames: 500,
    samplesPerFrame: 10
  };

  getWaveform(sample, options, function(err, waveform){

    test.error(err);
    test.assert(Array.isArray(waveform) && waveform.length === options.numFrames);

    var firstMax = Math.max.apply(null, waveform[0]);

    test.assert(firstMax <= 1);

    test.assert(waveform.every(function(frame){
      return frame.length === options.samplesPerFrame;
    }));

    test.assert(waveform.every(function(frame){
      return frame.every(function(val){
        return typeof val === "number" && val >= 0 && val <= firstMax;
      });
    }));

    test.end();

  });

});

tape("Waveform missing numFrames", function(test) {

  var options = {
    samplesPerFrame: 10
  };

  getWaveform(sample, options, function(err, waveform){

    test.ok(err);
    test.end();

  });

});

tape("Waveform missing samplesPerFrame", function(test) {

  var options = {
    numFrames: 500,
  };

  getWaveform(sample, options, function(err, waveform){

    test.ok(err);
    test.end();

  });

});

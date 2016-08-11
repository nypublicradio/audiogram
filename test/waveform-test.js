var tape = require("tape"),
    path = require("path");

var getWaveform = require("../audiogram/waveform.js"),
    probe = require("../lib/probe.js");

var sample = path.join(__dirname, "data/glazed-donut.mp3");

tape("Waveform", function(test) {

  var options = {
    framesPerSecond: 20,
    samplesPerFrame: 10
  };

  probe(sample, function(e1, data){

    test.error(e1);

    getWaveform(sample, options, function(e2, waveform){

      test.error(e2);
      test.assert(Array.isArray(waveform) && waveform.length === Math.floor(data.duration * options.framesPerSecond));

      var firstMax = Math.max.apply(null, waveform[0].map(function(d){ return d[1]; }));

      test.assert(firstMax <= 1);

      test.assert(waveform.every(function(frame){
        return frame.length === options.samplesPerFrame && frame.every(function(f){
          return f.length === 2 && typeof f[0] === "number" && typeof f[1] === "number" && f[0] <= 0 && f[0] >= -1 && f[1] >= 0 && f[1] <= firstMax;
        });
      }));

      test.end();

    });

  });

});

tape("Max Duration Error", function(test) {

  var options = {
    framesPerSecond: 20,
    samplesPerFrame: 10,
    maxDuration: 20
  };

  getWaveform(sample, options, function(err, waveform){

    test.assert(err);
    test.end();

  });

});

tape("Max Duration OK", function(test) {

  var options = {
    framesPerSecond: 20,
    samplesPerFrame: 10,
    maxDuration: 30
  };

  getWaveform(sample, options, function(err, waveform){

    test.error(err);
    test.end();

  });

});

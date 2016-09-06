var tape = require("tape"),
    path = require("path");

var Audiogram = require("../audiogram/"),
    getWaveform = require("../audiogram/waveform.js"),
    probe = require("../lib/probe.js");

var sample = path.join(__dirname, "data/glazed-donut.mp3");

tape("Waveform", function(test) {

  var options = {
    framesPerSecond: 20,
    samplesPerFrame: 10
  };

  probe(sample, function(e1, data){

    test.error(e1);

    options.channels = data.channels;
    options.numFrames = Math.floor(data.duration * options.framesPerSecond);

    getWaveform(sample, options, function(e2, waveform){

      test.error(e2);
      test.assert(Array.isArray(waveform) && waveform.length === options.numFrames);

      test.assert(waveform.every(function(frame){
        return frame.length === options.samplesPerFrame && frame.every(function(f){
          return f.length === 2 && f.every(function(d){ return typeof d === "number"; }) && f[0] >= 0 && f[0] <= 1 && f[1] >= -1 && f[1] <= 1;
        });
      }));

      test.end();

    });

  });

});

tape("Max Duration Error", function(test) {

  var audiogram = new Audiogram("xyz");
  audiogram.audioPath = sample;
  audiogram.settings = {
    theme: {
      maxDuration: 20
    }
  };

  audiogram.getWaveform(function(err, waveform){
    test.assert(err);
    test.assert(err.toString().match(/Exceeds max duration/));
    test.end();
  });

});

tape("Max Duration OK", function(test) {

  var audiogram = new Audiogram("xyz");
  audiogram.audioPath = sample;
  audiogram.settings = {
    theme: {
      samplesPerFrame: 10,
      framesPerSecond: 20
    }
  };

  probe(sample, function(err, data){
    test.deepEqual(Math.round(data.duration), 27);
    test.deepEqual(data.channels, 2);

    audiogram.getWaveform(function(waveformErr, waveform){
      test.error(waveformErr);
      test.assert(Array.isArray(waveform));
      test.deepEqual(waveform.length, Math.floor(data.duration * audiogram.settings.theme.framesPerSecond));
      test.end();
    });

  });

});

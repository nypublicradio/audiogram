var probe = require("../lib/probe.js"),
    processWaveform = require("../lib/waveform.js");

function getWaveform(filename, options, cb) {

  probe(filename, function(err, data) {

    if (err) {
      return cb(err);
    }

    if (options.maxDuration && options.maxDuration < data.duration) {
      return cb("Exceeds max duration of " + options.maxDuration + "s");
    }

    processWaveform(filename, {
      numFrames: Math.floor(data.duration * options.samplesPerFrame),
      samplesPerFrame: options.samplesPerFrame,
      channels: data.channels
    }, cb);

  });

}

module.exports = getWaveform;

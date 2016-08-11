var probe = require("../lib/probe.js"),
    d3 = require("d3"),
    pcmStream = require("../lib/pcm.js");

function getWaveform(filename, options, cb) {

  probe(filename, function(err, data) {

    if (err) {
      return cb(err);
    }

    if (options.maxDuration && options.maxDuration < data.duration) {
      return cb("Exceeds max duration of " + options.maxDuration + "s");
    }

    var stream = pcmStream(filename, {
          channels: options.channels
        }),
        samples = [];

    stream.on("data",function(sample, channel){

      // Average multiple channels
      if (channel > 0) {
        samples[samples.length - 1] = ((samples[samples.length - 1] * channel) + sample) / (channel + 1);
      } else {
        samples.push(sample);
      }

    });

    stream.on("error", cb);

    stream.on("end", function(output){
      var processed = processSamples(samples, Math.floor(data.duration * options.framesPerSecond), options.samplesPerFrame);
      return cb(null, processed);
    });

  });

}

function processSamples(samples, numFrames, samplesPerFrame) {

  // TODO spread out slop across frames
  var perFrame = Math.floor(samples.length / numFrames),
      perPoint = Math.floor(perFrame / samplesPerFrame),
      range = d3.range(samplesPerFrame),
      maxFrame,
      min = max = 0;

  var unadjusted = d3.range(numFrames).map(function(frame){

    var frameSamples = samples.slice(frame * perFrame, (frame + 1) * perFrame);

    return range.map(function(point){

      var pointSamples = frameSamples.slice(point * perPoint, (point + 1) * perPoint),
          localMin = localMax = 0;

      for (var i = 0, l = pointSamples.length; i < l; i++) {
        localMin = Math.min(localMin, pointSamples[i]);
        localMax = Math.max(localMax, pointSamples[i]);
      }

      min = Math.min(min, localMin);

      if (localMax > max) {
        max = localMax;
        maxFrame = frame;
      }

      return [localMin, localMax];

    });

  });

  // Scale up to -1 or 1
  var adjustment = 1 / Math.max(Math.abs(min), Math.abs(max));

  var adjusted = unadjusted.map(function(frame){
    return frame.map(function(point){
      return [adjustment * point[0], adjustment * point[1]];
    });
  });

  // Make first and last frame peaky
  adjusted[0] = adjusted[numFrames - 1] = adjusted[maxFrame];

  return adjusted;

}

module.exports = getWaveform;

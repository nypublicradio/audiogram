var probe = require("../lib/probe.js"),
    d3 = require("d3"),
    pcmStream = require("../lib/pcm.js");

function getWaveform(filename, options, cb) {

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
    var processed = processSamples(samples, options.numFrames, options.samplesPerFrame);
    return cb(null, processed);
  });

}

function processSamples(samples, numFrames, samplesPerFrame) {

  // TODO spread out slop across frames
  var perFrame = Math.floor(samples.length / numFrames),
      perPoint = Math.floor(perFrame / samplesPerFrame),
      range = d3.range(samplesPerFrame),
      maxFrame,
      maxMedian = max = 0;

  var unadjusted = d3.range(numFrames).map(function(frame){

    var frameSamples = samples.slice(frame * perFrame, (frame + 1) * perFrame),
        points = range.map(function(point){

          var pointSamples = frameSamples.slice(point * perPoint, (point + 1) * perPoint);

          var rms = Math.sqrt(d3.sum(pointSamples.map(function(d){
            return d * d;
          })) / perPoint);

          if (rms > max) {
            max = rms;
          }

          // Min value, max value, and midpoint value
          return [-rms, rms, pointSamples[Math.floor(pointSamples.length / 2)]];

        }),
        median = d3.median(points.map(function(point){
          return point[1];
        }));

    if (median > maxMedian) {
      maxMedian = median;
      maxFrame = frame;
    }

    return points;

  });

  // Scale up to -1 / 1
  var adjustment = 1 / max;

  var adjusted = unadjusted.map(function(frame){
    return frame.map(function(point){
      return point.map(function(p){ return adjustment * p; });
    });
  });

  // Make first and last frame peaky
  adjusted[0] = adjusted[numFrames - 1] = adjusted[maxFrame];

  return adjusted;

}

module.exports = getWaveform;

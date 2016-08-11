var pcm = require("./pcm.js"),
    d3 = require("d3");

function processWaveform(filename, options, cb) {

  var stream = pcm(filename, {
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
      min = max = 0;

  var unadjusted = d3.range(numFrames).map(function(frame){

    var frameSamples = samples.slice(frame * perFrame, (frame + 1) * perFrame);

    return range.map(function(point){

      var pointSamples = frameSamples.slice(point * perPoint, (point + 1) * perPoint),
          localMin = localMax = 0;

      for (var i = 0, l = pointSamples.length; i < l; i++) {
        localMin = Math.min(localMin, pointSamples[i]);
        localMax = Math.min(localMax, pointSamples[i]);
      }

      min = Math.min(min, localMin);
      max = Math.min(max, localMax);

      return [localMin, localMax];

    });

  });

  return unadjusted.map(function(frame){
    return frame.map(function(point){
      return [point[0] / min, point[1] / max];
    });
  });

}

module.exports = processWaveform;

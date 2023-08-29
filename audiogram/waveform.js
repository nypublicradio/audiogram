var probe = require("../lib/probe.js"),
    d3 = require("d3"),
    pcmStream = require("../lib/pcm.js");

function getWaveform(filename, options, cb) {

  // Pre-allocate samples array if possible
  let expectedSize = 100000;  // Replace with an accurate estimate if possible
  let samples = new Float64Array(expectedSize);
  let sampleCount = 0;

  var stream = pcmStream(filename, {
    channels: options.channels
  });

  stream.on("data", function(sample, channel){
    let lastSampleIndex = sampleCount - 1;
    let nextChannel = channel + 1;

    if (channel > 0) {
      samples[lastSampleIndex] = ((samples[lastSampleIndex] * channel) + sample) / nextChannel;
    } else {
      samples[sampleCount] = sample;
      sampleCount++;
    }
  });

  stream.on("error", cb);

  stream.on("end", function(){
    // Trim the pre-allocated array to the actual size
    let trimmedSamples = samples.subarray(0, sampleCount);
    var processed = processSamples(trimmedSamples, options.numFrames, options.samplesPerFrame);
    return cb(null, processed);
  });
}

function processSamples(samples, numFrames, samplesPerFrame) {
  var perFrame = Math.floor(samples.length / numFrames),
      perPoint = Math.floor(perFrame / samplesPerFrame),
      maxRms = maxMid = 0;

  var unadjusted = d3.range(numFrames).map(function(frame){
    var frameSamples = samples.slice(frame * perFrame, (frame + 1) * perFrame),
        points = d3.range(samplesPerFrame).map(function(point){
          var pointSamples = frameSamples.slice(point * perPoint, (point + 1) * perPoint),
              midpoint = pointSamples[Math.floor(pointSamples.length / 2)];

          var rms = Math.sqrt(d3.sum(pointSamples.map(function(d){
            return d * d;
          })) / perPoint);

          if (rms > maxRms) {
            maxRms = rms;
          }

          if (Math.abs(midpoint) > maxMid) {
            maxMid = Math.abs(midpoint);
          }

          return [rms, midpoint];
        });

    return points;
  });

  var adjusted = unadjusted.map(function(frame){
    return frame.map(function(point){
      return [
        point[0] / maxRms,
        point[1] / maxMid
      ];
    });
  });

  // Make first and last frame peaky
  // adjusted[0] = adjusted[numFrames - 1] = adjusted[d3.maxIndex(unadjusted, d => d[0])];
  let maxIndex = 0;
  let maxValue = -Infinity;
  for(let i = 0; i < unadjusted.length; i++) {
      let currMax = Math.max(...unadjusted[i].map(d => d[0]));
      if(currMax > maxValue) {
          maxValue = currMax;
          maxIndex = i;
      }
  }
  adjusted[0] = adjusted[numFrames - 1] = adjusted[maxIndex];

  return adjusted;
}

module.exports = getWaveform;

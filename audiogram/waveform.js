var waveform = require("waveform"),
    d3 = require("d3");

function getWaveform(filename, options, cb) {

  var numSamples = options.numFrames * options.samplesPerFrame;

  var waveformOptions = {
    "scan": false,
    "waveformjs": "-",
    "wjs-width": numSamples,
    "wjs-precision": 2,
    "wjs-plain": true,
    "encoding": "utf8"
  };

  waveform(filename, waveformOptions, function(err, buf) {

    if (err) {
      return cb(err);
    }

    cb(null, processWaveform(JSON.parse(buf)));

  });

  // Slice one-dimensional waveform data into array of arrays, one array per frame
  function processWaveform(waveformData) {

    var max = -Infinity,
        maxFrame;

    waveformData.forEach(function(d, i){
      if (d > max) {
        max = d;
        maxFrame = Math.floor(i / options.samplesPerFrame);
      }
    });

    // Scale peaks to 1
    var scaled = d3.scaleLinear()
      .domain([0, max])
      .range([0, 1]);

    var waveformFrames = d3.range(options.numFrames).map(function getFrame(frameNumber) {

      return waveformData.slice(options.samplesPerFrame * frameNumber, options.samplesPerFrame * (frameNumber + 1)).map(scaled);

    });

    // Set the first and last frame's waveforms to something peak-y for better thumbnails
    waveformFrames[0] = waveformFrames[waveformFrames.length - 1] = waveformFrames[maxFrame];

    return waveformFrames;

  }

}

module.exports = getWaveform;

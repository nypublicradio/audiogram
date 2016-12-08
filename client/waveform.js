var extractPeaks = require("webaudio-peaks"),
    d3 = require("d3");

var width = 640;

function decoded(cb) {

  return function(decodedData) {

    var duration = decodedData.duration;

    var samplesPerPixel = Math.floor(decodedData.length / width);

    var peaks = extractPeaks(decodedData, samplesPerPixel, true);

    // FF and Chrome support Int8Array.filter, Safari doesn't, that's fun
    var positive = Array.prototype.filter.call(peaks.data[0], function(d,i){
      return i % 2;
    });

    var scale = d3.scaleLinear()
      .domain([0, getMax(positive)])
      .range([0, 1])
      .clamp(true);

    positive = Array.prototype.slice.call(positive).map(scale);

    cb(null,{ duration: duration, peaks: positive });

  };

}

module.exports = function(file, cb) {

  var ctx = new (window.AudioContext || window.webkitAudioContext)();

  var fileReader = new FileReader();

  var close = function(err, data) {
    console.warn(err);
    ctx.close();
    cb(err, data);
  };

  fileReader.onerror = cb;

  fileReader.onload = function(){

    ctx.decodeAudioData(this.result, decoded(close), function(err){ close(err || "Error decoding audio."); });

  };

  fileReader.readAsArrayBuffer(file);

}

// Faster
function getMax(arr) {

  var max = -Infinity;

  for (var i = 0, l = arr.length; i < l; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }

  return max;

}

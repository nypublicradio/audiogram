var probe = require("node-ffprobe");

module.exports = function(filename, cb){

  probe(filename, function(err, probeData) {

    if (err) {
      return cb(err);
    }

    var duration = getProperty(probeData, "duration"),
        channels = getProperty(probeData, "channels");

    if (!duration || duration === "N/A" || !(duration > 0)) {
      return cb("Couldn't probe audio duration.");
    }

    if (typeof channels !== "number" || channels < 1 || channels > 2) {
      return cb("Couldn't detect mono/stereo channels");
    }

    return cb(null, {
      duration: duration,
      channels: channels
    });

  });

};

function getProperty(probeData, property) {

  if (probeData.format && probeData.format[property]) {
    return probeData.format[property];
  }

  if (Array.isArray(probeData.streams) && probeData.streams.length && probeData.streams[0][property]) {
    return probeData.streams[0][property];
  }

  return null;

}

var probe = require("node-ffprobe");

module.exports = function(filename, cb){

  probe(filename, function(err, probeData) {

    if (err) {
      return cb(err);
    }

    var duration = getDuration(probeData);

    if (!duration || duration === "N/A" || !(duration > 0)) {
      return cb("Couldn't probe audio duration.");
    }

    return cb(null, duration);

  });

};

function getDuration(probeData) {

  if (probeData.format && probeData.format.duration) {
    return probeData.format.duration;
  }

  if (Array.isArray(probeData.streams) && probeData.streams.length && probeData.streams[0].duration) {
    return probeData.streams[0].duration;
  }

  return null;

}

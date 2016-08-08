var exec = require("child_process").exec,
    getDuration = require("./duration.js");

function trimAudio(options, cb) {

  if (!options.endTime) {

    return getDuration(options.origin, function(err, duration){
      if (err) {
        return cb(err);
      }

      options.endTime = duration;
      trimAudio(options, cb);

    });

  }

  var cmd = "ffmpeg -i \"" + options.origin + "\" -ss " + (options.startTime || 0) + " -t " + (options.endTime - options.startTime) + " -acodec libmp3lame -b:a 128k \"" + options.destination + "\"";

  exec(cmd, cb);

}

module.exports = trimAudio;

var exec = require("child_process").exec;

function combineFrames(options, cb) {

  // Raw ffmpeg command with standard mp4 setup
  // Some old versions of ffmpeg require -strict for the aac codec
  var cmd = "ffmpeg -r " + options.framesPerSecond + " -i \"" + options.framePath + "\" -i \"" + options.audioPath + "\" -c:v libx264 -c:a aac -strict experimental -shortest -pix_fmt yuv420p \"" + options.videoPath + "\"";

  exec(cmd, cb);

}

module.exports = combineFrames;

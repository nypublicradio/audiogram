var spawn = require("child_process").spawn,
    stream = require("stream");

// Based on https://github.com/jhurliman/node-pcm
// Modified to respect channels, use fewer vars, and return a stream
module.exports = function(filename, options) {
  var sampleStream = new stream.Stream(),
      channels = 2,
      output = "",
      channel = 0,
      oddByte;

  sampleStream.readable = true;

  if (options && options.channels) channels = options.channels;

  var args = ["-i", filename, "-f", "s16le", "-ac", channels, "-acodec", "pcm_s16le"];

  if (options && options.sampleRate) {
    args.push("-ar", options.sampleRate);
  }

  args.push("-y", "pipe:1");

  var spawned = spawn("ffmpeg", args);

  spawned.stdout.on("data", function(data) {

    var len = data.length;

    if (oddByte != null) {
      sampleStream.emit("data", ((data.readInt8(i++, true) << 8) | oddByte) / 32767.0, channel);
      channel = ++channel % channels;
    }

    for (var i = 0; i < len; i += 2) {
      sampleStream.emit("data", data.readInt16LE(i, true) / 32767.0, channel);
      channel = ++channel % channels;
    }

    oddByte = (i < len) ? data.readUInt8(i, true) : null;

  });

  spawned.stderr.on("data", function(data) {
    output += data.toString();
  });

  spawned.stderr.on("end", function() {
    sampleStream.emit(oddByte !== undefined ? "end" : "error", output);
  });

  return sampleStream;

};

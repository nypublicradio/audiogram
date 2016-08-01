var path = require("path"),
    queue = require("d3").queue,
    mkdirp = require("mkdirp"),
    rimraf = require("rimraf"),
    serverSettings = require("../settings/"),
    transports = require("../lib/transports/"),
    logger = require("../lib/logger/"),
    getDuration = require("./duration.js"),
    getWaveform = require("./waveform.js"),
    initializeCanvas = require("./initialize-canvas.js"),
    drawFrames = require("./draw-frames.js"),
    combineFrames = require("./combine-frames.js"),
    trimAudio = require("./trim.js");

function Audiogram(settings) {

  // Unique audiogram ID
  this.id = settings.id;

  this.settings = settings;

  // File locations to use
  this.dir = path.join(serverSettings.workingDirectory, this.id);
  this.audioPath = path.join(this.dir, "audio");
  this.videoPath = path.join(this.dir, "video.mp4");
  this.frameDir = path.join(this.dir, "frames");

  return this;

}

// Probe an audio file for its duration, compute the number of frames required
Audiogram.prototype.getDuration = function(cb) {

  var self = this;

  this.status("duration");

  getDuration(this.audioPath, function(err, duration){

    if (err) {
      return cb(err);
    }

    if (self.settings.maxDuration && self.settings.maxDuration < duration) {
      cb("Exceeds max duration of " + self.settings.maxDuration + "s");
    }

    self.set("numFrames", self.numFrames = Math.floor(duration * self.settings.framesPerSecond));

    cb(null);

  });

};

// Get the waveform data from the audio file, split into frames
Audiogram.prototype.getWaveform = function(cb) {

  var self = this;

  this.status("waveform");

  getWaveform(this.audioPath, {
    numFrames: this.numFrames,
    samplesPerFrame: this.settings.samplesPerFrame
  }, function(err, waveform){

    return cb(err, self.settings.waveform = waveform);

  });

};

// Trim the audio by the start and end time specified
Audiogram.prototype.trimAudio = function(start, end, cb) {

  var self = this;

  this.status("trim");

  // FFmpeg needs an extension to sniff
  var trimmedPath = this.audioPath + "-trimmed.mp3";

  trimAudio({
    origin: this.audioPath,
    destination: trimmedPath,
    startTime: start,
    endTime: end
  }, function(err){
    if (err) {
      return cb(err);
    }

    self.audioPath = trimmedPath;

    return cb(null);
  });

};

// Initialize the canvas and draw all the frames
Audiogram.prototype.drawFrames = function(cb) {

  var self = this;

  this.status("renderer");

  initializeCanvas(this.settings, function(err, renderer){

    if (err) {
      return cb(err);
    }

    self.status("frames");

    drawFrames(renderer, {
      numFrames: self.numFrames,
      frameDir: self.frameDir,
      tick: function() {
        transports.incrementField(self.id, "framesComplete");
      }
    }, cb);

  });

};

// Combine the frames and audio into the final video with FFmpeg
Audiogram.prototype.combineFrames = function(cb) {

  this.status("combine");

  combineFrames({
    framePath: path.join(this.frameDir, "%06d.png"),
    audioPath: this.audioPath,
    videoPath: this.videoPath,
    framesPerSecond: this.settings.framesPerSecond
  }, cb);

};

// Master render function, queue up steps in order
Audiogram.prototype.render = function(cb) {

  var self = this,
      q = queue(1);

  this.status("audio-download");

  // Set up tmp directory
  q.defer(mkdirp, this.frameDir);

  // Download the stored audio file
  q.defer(transports.downloadAudio, "audio/" + this.id, this.audioPath);

  // If the audio needs to be clipped, clip it first and update the path
  if (this.settings.start || this.settings.end) {
    q.defer(this.trimAudio.bind(this), this.settings.start || 0, this.settings.end);
  }

  // Get the audio's duration for computing number of frames
  q.defer(this.getDuration.bind(this));

  // Get the audio waveform data
  q.defer(this.getWaveform.bind(this));

  // Draw all the frames
  q.defer(this.drawFrames.bind(this));

  // Combine audio and frames together with ffmpeg
  q.defer(this.combineFrames.bind(this));

  // Upload video to S3 or move to local storage
  q.defer(transports.uploadVideo, this.videoPath, "video/" + this.id + ".mp4");

  // Delete working directory
  q.defer(rimraf, this.dir);

  // Final callback, results in a URL where the finished video is accessible
  q.await(function(err){

    if (!err) {
      self.set("url", transports.getURL(self.id));
    }

    return cb(err);

  });

  return this;

};

Audiogram.prototype.set = function(field, value) {
  logger.debug(field + "=" + value);
  transports.setField(this.id, field, value);
  return this;
};

// Convenience method for .set("status")
Audiogram.prototype.status = function(value) {
  return this.set("status", value);
};

module.exports = Audiogram;

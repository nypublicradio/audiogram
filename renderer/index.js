var d3 = require("d3"),
    patterns = require("./patterns.js"),
    sample = require("./sample-wave.js"),
    textWrapper = require("./text-wrapper.js");

module.exports = function(context) {

  context.patternQuality = "best";

  var renderer = {};

  renderer.context = context;

  renderer.update = function(options) {

    // TODO cleaner defaults
    options.backgroundColor = options.backgroundColor || "#fff";
    options.waveColor = options.waveColor || options.foregroundColor || "#000";
    options.captionColor = options.captionColor || options.foregroundColor || "#000";

    if (typeof options.waveTop !== "number") options.waveTop = 0;
    if (typeof options.waveBottom !== "number") options.waveBottom = options.height;
    if (typeof options.waveLeft !== "number") options.waveLeft = 0;
    if (typeof options.waveRight !== "number") options.waveRight = options.width;

    this.wrapText = textWrapper(context, options);
    this.options = options;
    this.waveform = options.waveform || [sample.slice(0, options.samplesPerFrame)];
    return this;
  };

  // Get the waveform data for this frame
  renderer.getWaveform = function(frameNumber) {
    return this.waveform[Math.min(this.waveform.length - 1, frameNumber)];
  };

  // Draw the frame
  renderer.drawFrame = function(frameNumber) {

    // Draw the background image and/or background color
    context.clearRect(0, 0, this.options.width, this.options.height);

    context.fillStyle = this.options.backgroundColor;
    context.fillRect(0, 0, this.options.width, this.options.height);

    if (this.backgroundImage) {
      context.drawImage(this.backgroundImage, 0, 0, this.options.width, this.options.height);
    }

    patterns[this.options.pattern || "wave"](context, this.getWaveform(frameNumber), this.options);

    // Write the caption
    if (this.caption) {
      this.wrapText(this.caption);
    }

    return this;

  };

  return renderer;

}

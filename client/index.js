var d3 = require("d3"),
    $ = require("jquery"),
    preview = require("./preview.js"),
    video = require("./video.js"),
    audio = require("./audio.js");

d3.json("/settings/themes.json", function(err, themes){

  if (err) {
    throw err;
  }

  for (var key in themes) {
    themes[key] = $.extend({}, themes.default, themes[key]);
  }

  preloadImages(themes);

});

function submitted() {

  d3.event.preventDefault();

  var theme = preview.theme(),
      caption = preview.caption(),
      selection = preview.selection(),
      file = preview.file();

  if (!file) {
    d3.select("#row-audio").classed("error", true);
    return setClass("error", "No audio file selected.");
  }

  if (theme.maxDuration && selection.duration > theme.maxDuration) {
    return setClass("error", "Your Audiogram must be under " + theme.maxDuration + " seconds.");
  }

  if (!theme || !theme.width || !theme.height) {
    return setClass("error", "No valid theme detected.");
  }

  video.kill();
  audio.pause();

  var formData = new FormData();

  var settings = $.extend({}, theme, {
    caption: caption,
    start: selection.start,
    end: selection.end
  });

  delete settings.backgroundImageFile;

  formData.append("audio", file);
  formData.append("settings", JSON.stringify(settings));

  setClass("loading");
  d3.select("#loading-message").text("Uploading audio...");

	$.ajax({
		url: "/submit/",
		type: "POST",
		data: formData,
		contentType: false,
    dataType: "json",
		cache: false,
		processData: false,
		success: function(data){
      poll(data.id, 0);
		},
    error: error

  });

}

function poll(id) {

  setTimeout(function(){
    $.ajax({
      url: "/status/" + id + "/",
      error: error,
      dataType: "json",
      success: function(result){
        if (result && result.status && result.status === "ready" && result.url) {
          video.update(result.url, preview.theme().name);
          setClass("rendered");
        } else {
          d3.select("#loading-message").text(statusMessage(result));
          poll(id);
        }
      }
    });

  }, 2500);

}

function error(msg) {

  if (msg.responseText) {
    msg = msg.responseText;
  }

  if (typeof msg !== "string") {
    msg = JSON.stringify(msg);
  }

  d3.select("#loading-message").text("Loading...");
  setClass("error", msg);

}

// Once images are downloaded, set up listeners
function initialize(err, themesWithImages) {

  // Populate dropdown menu
  d3.select("#input-theme")
    .on("change", updateTheme)
    .selectAll("option")
    .data(themesWithImages)
    .enter()
    .append("option")
      .text(function(d){
        return d.name;
      });

  // Get initial theme
  d3.select("#input-theme").each(updateTheme);

  // Get initial caption (e.g. back button)
  d3.select("#input-caption").on("change keyup", updateCaption).each(updateCaption);

  // Space bar listener for audio play/pause
  d3.select(document).on("keypress", function(){
    if (!d3.select("body").classed("rendered") && d3.event.key === " " && !d3.matcher("input, textarea, button, select").call(d3.event.target)) {
      audio.toggle();
    }
  });

  // Button listeners
  d3.selectAll("#play, #pause").on("click", function(){
    d3.event.preventDefault();
    audio.toggle();
  });

  d3.select("#restart").on("click", function(){
    d3.event.preventDefault();
    audio.restart();
  });

  // If there's an initial piece of audio (e.g. back button) load it
  d3.select("#input-audio").on("change", updateAudioFile).each(updateAudioFile);

  d3.select("#return").on("click", function(){
    d3.event.preventDefault();
    video.kill();
    setClass(null);
  });

  d3.select("#submit").on("click", submitted);

}

function updateAudioFile() {

  d3.select("#row-audio").classed("error", false);

  audio.pause();
  video.kill();

  // Skip if empty
  if (!this.files || !this.files[0]) {
    d3.select("#minimap").classed("hidden", true);
    preview.file(null);
    setClass(null);
    return true;
  }

  d3.select("#loading-message").text("Analyzing...");

  setClass("loading");

  preview.loadAudio(this.files[0], function(err){

    if (err) {
      d3.select("#row-audio").classed("error", true);
      setClass("error", "Error decoding audio file");
    } else {
      setClass(null);
    }

    d3.selectAll("#minimap, #submit").classed("hidden", !!err);

  });

}

function updateCaption() {
  preview.caption(this.value);
}

function updateTheme() {
  var extended = d3.select(this.options[this.selectedIndex]).datum();
  preview.theme(extended);
}

function preloadImages(themes) {

  // preload images
  var imageQueue = d3.queue();

  d3.entries(themes).forEach(function(theme){

    if (!theme.value.name) {
      theme.value.name = theme.key;
    }

    if (theme.key !== "default") {
      imageQueue.defer(getImage, theme.value);
    }

  });

  imageQueue.awaitAll(initialize);

  function getImage(theme, cb) {

    if (!theme.backgroundImage) {
      return cb(null, theme);
    }

    theme.backgroundImageFile = new Image();
    theme.backgroundImageFile.onload = function(){
      return cb(null, theme);
    };
    theme.backgroundImageFile.onerror = function(e){
      console.warn(e);
      return cb(null, theme);
    };

    theme.backgroundImageFile.src = "/settings/backgrounds/" + theme.backgroundImage;

  }

}

function setClass(cl, msg) {
  d3.select("body").attr("class", cl || null);
  d3.select("#error").text(msg || "");
}

function statusMessage(result) {

  switch (result.status) {
    case "queued":
      return "Waiting for other jobs to finish, #" + (result.position + 1) + " in queue";
    case "audio-download":
      return "Downloading audio for processing";
    case "trim":
      return "Trimming audio";
    case "duration":
      return "Checking duration";
    case "waveform":
      return "Analyzing waveform";
    case "renderer":
      return "Initializing renderer";
    case "frames":
      var msg = "Generating frames";
      if (result.numFrames) {
        msg += ", " + Math.round(100 * (result.framesComplete || 0) / result.numFrames) + "% complete";
      }
      return msg;
    case "combine":
      return "Combining frames with audio";
    case "ready":
      return "Cleaning up";
    default:
      return JSON.stringify(result);
  }

}

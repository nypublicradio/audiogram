var d3 = require("d3");

var video = document.querySelector("video");

function kill() {

  // Pause the video if it's playing
  if (!video.paused && !video.ended && 0 < video.currentTime) {
    video.pause();
  }

  d3.select("body").classed("rendered", false);

}

function update(url, name) {

  var timestamp = d3.timeFormat("%m%d%y_AG_")(new Date).toLowerCase(),
      filename = timestamp + (name || "Audiogram") + ".mp4";

  d3.select("#download")
    .attr("download", filename)
    .attr("href", url);

  d3.select(video).select("source")
    .attr("src", url);

  video.load();
  video.play();

}

module.exports = {
  kill: kill,
  update: update
}

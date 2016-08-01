var minimap = require("./minimap.js"),
    d3 = require("d3");

var audio = document.querySelector("audio"),
    extent = [0, 1];

// timeupdate is too low-res
d3.timer(update);

d3.select(audio).on("play", toggled)
  .on("pause", function(){ toggled(true); });

minimap.onBrushEnd(_extent);

function pause(time) {

  if (arguments.length) {
    audio.currentTime = time;
  }

  if (isPlaying()) {
    audio.pause();
  }

  toggled(true);

}

function play(time) {

  if (arguments.length) {
    audio.currentTime = time;
  }

  audio.play();

  toggled();

}

function restart() {
  play(extent[0] * audio.duration);
}

function update() {

  if (audio.duration) {

    var pos = audio.currentTime / audio.duration;

    // Need some allowance at the beginning because of frame imprecision (esp. FF)
    if (audio.ended || pos >= extent[1] || audio.duration * extent[0] - audio.currentTime > 0.2) {
      pause(extent[0] * audio.duration);
    }

    minimap.time(pos);

  }

}

function toggled(paused) {
  d3.select("#pause").classed("hidden", paused);
  d3.select("#play").classed("hidden", !paused);
}

function toggle() {
  if (isPlaying()) {
    pause();
  } else {
    play();
  }
}

function _extent(_) {

  if (arguments.length) {

    extent = _;

    var pos = audio.currentTime / audio.duration;

    if (pos > extent[1] || audio.duration * extent[0] - audio.currentTime > 0.2 || !isPlaying()) {
      pause(extent[0] * audio.duration);
    }

    minimap.time(pos);

  } else {
    return extent;
  }
}

function src(file, cb) {

  d3.select("audio")
    .on("canplaythrough", cb)
    .on("error", function(){
      cb(d3.event.target.error);
    })
    .select("source")
      .attr("type", file.type)
      .attr("src", URL.createObjectURL(file));

  audio.load();

}

function isPlaying() {
  return audio.duration && !audio.paused && !audio.ended && 0 < audio.currentTime;
}

function _duration() {
  return audio.duration;
}

module.exports = {
  play: play,
  pause: pause,
  toggle: toggle,
  src: src,
  restart: restart,
  duration: _duration
};

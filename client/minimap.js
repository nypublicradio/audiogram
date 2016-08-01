var d3 = require("d3");

var minimap = d3.select("#minimap"),
    svg = minimap.select("svg"),
    onBrush = onBrushEnd = function(){};

var t = d3.scaleLinear()
  .domain([0, 640])
  .range([0,1])
  .clamp(true);

var y = d3.scaleLinear()
  .domain([0, 1])
  .range([40, 0]);

var line = d3.line();

var brush = d3.brushX()
  .on("brush end", brushed)

minimap.select(".brush").call(brush)
  .selectAll("rect")
  .attr("height", 80);

minimap.selectAll(".brush .resize")
  .append("line")
  .attr("x1",0)
  .attr("x2",0)
  .attr("y1",0)
  .attr("y2", 80);

function redraw(data) {

  brush.move(d3.select(".brush"), [0, 0]);

  var top = data.map(function(d,i){
    return [i, y(d)];
  });

  var bottom = top.map(function(d){
    return [d[0], 80 - d[1]];
  }).reverse();

  d3.selectAll("g.waveform path")
    .attr("d",line(top.concat(bottom)));

  time(0);

}

function time(t) {
  d3.select("g.time")
    .attr("transform","translate(" + (t * 640) + ")");
}

function brushed() {

  var start = d3.event.selection ? t(d3.event.selection[0]) : 0,
      end = d3.event.selection ? t(d3.event.selection[1]) : 1;

  if (start === end) {
    start = 0;
    end = 1;
  } else {
    if (start <= 0.01) {
      start = 0;
    }
    if (end >= 0.99) {
      end = 1;
    }
  }

  d3.select("clipPath rect")
      .attr("x", t.invert(start))
      .attr("width", t.invert(end - start));

  onBrush([start, end]);

  if (d3.event.type === "end") {
    onBrushEnd([start, end]);
  }

}

function _onBrush(_) {
  onBrush = _;
}

function _onBrushEnd(_) {
  onBrushEnd = _;
}

module.exports = {
  time: time,
  redraw: redraw,
  onBrush: _onBrush,
  onBrushEnd: _onBrushEnd
};

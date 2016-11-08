var d3 = require("d3");

module.exports = {
  wave: filledPath(d3.curveCardinal.tension(0.1)),
  pixel: filledPath(d3.curveStep),
  roundBars: bars(true),
  bars: bars(),
  bricks: bricks(),
  equalizer: bricks(true),
  line: strokedPath(),
  curve: strokedPath(d3.curveCardinal.tension(0.1))
};

function filledPath(interpolator) {

  return function drawCurve(context, data, options) {

    context.fillStyle = options.waveColor;
    context.strokeStyle = options.waveColor;
    context.lineWidth = 3;

    var line = d3.line()
      .context(context);

    if (interpolator) {
      line.curve(interpolator);
    }

    var waveHeight = options.waveBottom - options.waveTop;

    var baseline = options.waveTop + waveHeight / 2;

    var x = d3.scalePoint()
      .padding(0.1)
      .domain(d3.range(data.length))
      .rangeRound([options.waveLeft, options.waveRight]);

    var height = d3.scaleLinear()
      .domain([0, 1])
      .range([0, waveHeight / 2]);

    var top = data.map(function(d,i){

      return [x(i), baseline - height(d[0])];

    });

    var bottom = data.map(function(d,i){

      return [x(i), baseline + height(d[0])];

    }).reverse();

    top.unshift([options.waveLeft, baseline]);
    top.push([options.waveRight, baseline]);

    // Fill waveform
    context.beginPath();
    line(top.concat(bottom));
    context.fill();

    // Stroke waveform edges / ensure baseline
    [top, bottom].forEach(function(path){

      context.beginPath();
      line(path);
      context.stroke();

    });
  }

}

function bars(round) {

  return function(context, data, options) {

    context.fillStyle = options.waveColor;

    var waveHeight = options.waveBottom - options.waveTop;

    var baseline = options.waveTop + waveHeight / 2;

    var barX = d3.scaleBand()
      .paddingInner(0.5)
      .paddingOuter(0.01)
      .domain(d3.range(data.length))
      .rangeRound([options.waveLeft, options.waveRight]);

    var height = d3.scaleLinear()
      .domain([0, 1])
      .range([0, waveHeight / 2]);

    var barWidth = barX.bandwidth();

    data.forEach(function(val, i){

      var h = height(val[0]) * 2,
          x = barX(i),
          y = baseline - height(val[0]);

      context.fillRect(x, y, barWidth, h);

      if (round) {
        context.beginPath();
        context.arc(x + barWidth / 2, y, barWidth / 2, 0, 2 * Math.PI);
        context.moveTo(x + barWidth / 2, y + h);
        context.arc(x + barWidth / 2, y + h, barWidth / 2, 0, 2 * Math.PI);
        context.fill();
      }

    });
  }

}

function bricks(rainbow) {
  return function(context, data, options) {

    context.fillStyle = options.waveColor;

    var waveHeight = options.waveBottom - options.waveTop;

    var barX = d3.scaleBand()
      .paddingInner(0.1)
      .paddingOuter(0.01)
      .domain(d3.range(data.length))
      .rangeRound([options.waveLeft, options.waveRight]);

    var height = d3.scaleLinear()
      .domain([0, 1])
      .range([0, waveHeight]);

    var barWidth = barX.bandwidth(),
        brickHeight = 10,
        brickGap = 3,
        maxBricks = Math.max(1, Math.floor(waveHeight / (brickHeight + brickGap)));

    data.forEach(function(val, i){

      var bricks = Math.max(1, Math.floor(height(val[0]) / (brickHeight + brickGap))),
          x = barX(i);

      d3.range(bricks).forEach(function(b){
        if (rainbow) {
          context.fillStyle = d3.interpolateWarm(1 - (b + 1) / maxBricks);
        }
        context.fillRect(x, options.waveBottom - (brickHeight * (b+1)) - brickGap * b, barWidth, brickHeight);
      });

    });

  };
}

function strokedPath(interpolator) {
  return function(context, data, options) {

    context.fillStyle = options.waveColor;
    context.strokeStyle = options.waveColor;
    context.lineWidth = 5;

    var line = d3.line()
      .context(context);

    if (interpolator) {
      line.curve(interpolator);
    }

    var x = d3.scalePoint()
      .padding(0.1)
      .domain(d3.range(data.length))
      .range([options.waveLeft, options.waveRight]);

    var y = d3.scaleLinear()
      .domain([-1, 1])
      .range([options.waveBottom, options.waveTop]);

    var points = data.map(function(d, i){
      return [x(i), y(d[1])];
    });

    // Fill waveform
    context.beginPath();
    line(points);
    context.stroke();

  }
}

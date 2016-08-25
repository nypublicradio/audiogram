function Profiler() {
  this._times = {};
  return this;
};

Profiler.prototype.start = function(key) {
  this.end(this._current);
  this._current = key;
  this._times[this._current] = { start: Date.now() };
  return this;
};

Profiler.prototype.size = function(size) {
  if (!arguments.length) return this._size;
  this._size = size;
  return this;
};

Profiler.prototype.end = function(key) {
  if (key in this._times) this._times[key].end = Date.now();
  return this;
};

Profiler.prototype.print = function(size) {
  var rows = [],
      row;

  this.end(this._current);

  for (var key in this._times) {
    row = { key: key, time: this._times[key].end - this._times[key].start };
    if (this._size) row.per = row.time / this._size;
    rows.push(row);
  }

  return rows.map(function(row){
    return row.key + ": " + Math.round(row.time) + "ms total" + (row.per ? ", " + Math.round(row.per) + "ms per" : "");
  }).join("\n");

};

module.exports = Profiler;

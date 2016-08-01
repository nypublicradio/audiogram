var fs = require("fs"),
    mkdirp = require("mkdirp"),
    path = require("path"),
    filename = path.join(__dirname, "..", "..", "..", ".jobs");

// Initialize if doesn't exist
try {
  fs.statSync(filename);
} catch(e) {
  fs.writeFileSync(filename, "{}");
}

function load() {
  return JSON.parse(fs.readFileSync(filename, {encoding: "utf8"}));
}

function write(obj) {
  fs.writeFileSync(filename, JSON.stringify(obj));
}

// Read synchronously, make an update, rewrite
function update(cb) {

  write(cb(load()));

}

module.exports = function() {

  function hset(key, field, value) {

    update(function(current){

      current[key] = current[key] || {};
      current[key][field] = value;

      return current;

    });

  }

  function hgetall(key, cb) {

    var current = load();
    return cb(null, current[key] === undefined ? null : current[key]);

  }

  function hincr(key, field) {

    update(function(current){

      current[key] = current[key] || {};
      current[key][field] = current[key][field] || 0;
      current[key][field]++;

      return current;

    });

  }

  function getJobList(cb) {
    var current = load();
    return cb(null, current.jobs || []);

  }

  function addJob(settings) {

    update(function(current){

      current.jobs = current.jobs || [];
      current.jobs.push(settings);

      return current;

    });

  }

  function getJob(cb) {

    var job = null;

    update(function(current){

      if (current.jobs && current.jobs.length) {
        job = current.jobs.shift();
      }

      return current;

    });

    return cb(null, job);

  }

  function quit() { }

  function clean(cb) {
    fs.unlink(filename, cb);
  }

  // Random delay to minimize collision w/o Redis
  function delay() {
    return Math.random() * 1000;
  }

  return {
    setField: hset,
    getHash: hgetall,
    incrementField: hincr,
    getJobList: getJobList,
    addJob: addJob,
    getJob: getJob,
    quit: quit,
    cleanJobs: clean,
    workerDelay: delay
  };

};

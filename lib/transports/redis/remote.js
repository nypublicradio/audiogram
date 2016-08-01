var redis = require("redis"),
    queue = require("d3").queue;

module.exports = function(host) {

  // Prefix all keys to avoid collisions
  var prefix = "audiogram:";

  var client = redis.createClient({ host: host });

  client.on("error", function(err) {
    throw err;
  });

  function hset(key, field, value) {
    client.hset(prefix + key, field, value);
  }

  function hgetall(key, cb) {
    client.hgetall(prefix + key, cb);
  }

  function hincr(key, field) {
    client.hincrby(prefix + key, field, 1);
  }

  function getJobList(cb) {
    client.lrange(prefix + "jobs", 0, -1, function(err, jobs) {
      if (!err && jobs) {
        jobs = jobs.map(function(job){
          return JSON.parse(job);
        });
      }
      cb(err,jobs);
    });
  }

  function addJob(settings) {
    client.rpush(prefix + "jobs", JSON.stringify(settings));
  }

  function getJob(cb) {
    client.blpop(prefix + "jobs", 5, function(err, job) {
      cb(err, job ? JSON.parse(job[1]) : null);
    });
  }

  function quit() {
    client.quit();
  }

  function clean(cb) {
    client.keys(prefix + "*", function(err, keys){

      if (err || !keys.length) {
        return cb(err);
      }

      client.del(keys, cb);

    });
  }

  return {
    setField: hset,
    getHash: hgetall,
    incrementField: hincr,
    getJobList: getJobList,
    addJob: addJob,
    getJob: getJob,
    quit: quit,
    cleanJobs: clean
  };

};

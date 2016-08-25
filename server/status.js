var queue = require("d3").queue,
    transports = require("../lib/transports");

module.exports = function(req, res) {

  queue(1)
    .defer(transports.getJobList)
    .defer(transports.getHash, req.params.id)
    .await(function(err, jobs, hash) {

      if (err) {
        throw err;
      }

      var position = -1;

      jobs.some(function(job, i) {
        if (job.id === req.params.id) {
          position = i;
          return true;
        }
      });

      if (position >= 0) {
        return res.json({ status: "queued", position: position });
      }

      if (hash === null) {
        hash = { status: "unknown" };
      }

      ["numFrames", "framesComplete"].forEach(function(key) {
        if (key in hash) {
          hash[key] = +hash[key];
        }
      });

      res.json(hash);

    });

};

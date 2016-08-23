var serverSettings = require("../settings/"),
    spawn = require("child_process").spawn,
    path = require("path"),
    _ = require("underscore"),
    logger = require("../lib/logger"),
    transports = require("../lib/transports");

function validate(req, res, next) {

  try {

    req.body.settings = JSON.parse(req.body.settings);

  } catch(e) {

    return res.status(500).send("Unknown settings error.");

  }

  if (!req.file || !req.file.filename) {
    return res.status(500).send("No valid audio received.");
  }

  // Start at the beginning, or specified time
  if (req.body.settings.start) {
    req.body.settings.start = +req.body.settings.start;
  }

  if (req.body.settings.end) {
    req.body.settings.end = +req.body.settings.end;
  }

  return next();

}

function route(req, res) {

  var id = req.file.destination.split(path.sep).pop();

  transports.uploadAudio(path.join(req.file.destination, "audio"), "audio/" + id,function(err) {

    if (err) {
      throw err;
    }

    // Queue up the job with a timestamp
    transports.addJob({
      created: (new Date()).getTime(),
      settings: req.body.settings,
      caption: req.body.caption
    });

    res.json({ id: id });

    // If there's no separate worker, spawn one right away
    if (!serverSettings.worker) {

      logger.debug("Spawning worker");

      // Empty args to avoid child_process Linux error
      spawn("bin/worker", [], {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
        env: _.extend({}, process.env, { SPAWNED: true })
      });

    }

  });

};

module.exports = {
  validate: validate,
  route: route
};

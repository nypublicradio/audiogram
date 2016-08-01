var winston = require("winston"),
    morgan = require("morgan");

winston.setLevels({ error: 0, info: 1, debug: 2, web: 3 });

winston.level = process.env.DEBUG ? "debug" : "info";

function log(msg, level) {

  if (!level) {
    level = "info";
  }

  // TODO Add timestamp

  winston.log(level, msg);

}

function debug(msg) {

  log(msg, "debug");

}

var stream = {
  write: function(msg) {
    log(msg, "web");
  }
};

module.exports = {
  log: log,
  debug: debug,
  morgan: function() {
    return morgan("combined", { "stream": stream });
  }
};

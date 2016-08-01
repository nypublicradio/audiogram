module.exports = function(settings) {

  if (settings.redisHost) {
    return require("./remote")(settings.redisHost);
  } else {
    return require("./fake")();
  }

};

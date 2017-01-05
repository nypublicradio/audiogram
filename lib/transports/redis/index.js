module.exports = function(settings) {
  return require("./redis")(settings.redisHost);
};

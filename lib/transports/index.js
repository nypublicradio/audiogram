var extend = require("underscore").extend,
    serverSettings = require("../settings/"),
    s3 = require("./s3")(serverSettings),
    redis = require("./redis")(serverSettings);

module.exports = extend({}, redis, s3);

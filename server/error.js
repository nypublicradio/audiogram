var serverSettings = require("../lib/settings/");

module.exports = function(err, req, res, next) {

  if (!err) {

    // This should never happen
    return next ? next() : null;

  }

  res.status(500);

  if (err.code === "LIMIT_FILE_SIZE") {
    res.send("Sorry, uploads are limited to " + prettySize(serverSettings.maxUploadSize) + ". Try clipping your file or converting it to an MP3.");
  } else {
    res.send("Unknown error.");
    throw err;
  }

};

function prettySize(size) {

  var mb = size / 1000000,
      rounded = mb >= 1 ? Math.floor(10 * mb) / 10 : Math.floor(100 * mb) / 100;

  return rounded + " MB";

}

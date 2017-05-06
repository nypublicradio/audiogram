var path = require("path"),
    _ = require("underscore"),
    fs = require("fs");

module.exports = function(labels) {

  if (!labels || labels.podcasts.length === 0) {
    return console.warn("No labels found in settings/labels.json.");
  }

  return labels;

};

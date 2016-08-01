var serverSettings = require("../settings/");

module.exports = function(newSettings) {
  for (var key in serverSettings) {
    if (!(key in newSettings)) {
      delete serverSettings[key];
    }
  }

  for (var key in newSettings) {
    serverSettings[key] = newSettings[key];
  }

  return serverSettings;

};

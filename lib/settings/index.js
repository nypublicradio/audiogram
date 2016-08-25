var _ = require("underscore"),
    path = require("path"),
    fs = require("fs");

var settings = tryToLoad("settings/index.js"),
    themes = tryToLoad("settings/themes.json");

// Validate settings
require("./validate-settings.js")(settings);

// Validate themes
require("./validate-themes.js")(themes);

module.exports = settings;

// Try to load modules
function tryToLoad(filename) {

  var loaded;

  try {
    loaded = require(path.join(__dirname, "..", "..", filename));
    if (!loaded) {
      throw new Error("Couldn't load contents of " + filename + ".");
    }
  } catch(e) {
    if (e.code === "MODULE_NOT_FOUND") {
      throw new Error("No " + filename + " file found.");
    } else if (e instanceof SyntaxError) {
      console.warn("Error parsing " + filename);
      throw e;
    } else {
      throw e;
    }
  }

  return loaded;

}

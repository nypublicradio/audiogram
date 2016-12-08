var path = require("path");

// Try to load module
module.exports = function(filename) {

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
      console.warn("Error parsing " + filename + ".");
      throw e;
    } else {
      throw e;
    }
  }

  return loaded;

}

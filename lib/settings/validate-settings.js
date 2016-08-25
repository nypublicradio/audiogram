var fs = require("fs"),
    path = require("path"),
    mkdirp = require("mkdirp"),
    _ = require("underscore");

module.exports = function(settings) {

  // Check paths
  if (typeof settings.workingDirectory !== "string") {
    throw new Error("settings.workingDirectory is required. See https://github.com/nypublicradio/audiogram/blob/master/SERVER.md#all-settings for details.");
  }

  if (typeof settings.storagePath !== "string" && typeof settings.s3Bucket !== "string") {
    throw new Error("settings.storagePath or settings.s3Bucket is required. See https://github.com/nypublicradio/audiogram/blob/master/SERVER.md#all-settings for details.");
  }

  // TODO normalize workingDirectory, s3Bucket, and storagePath
  settings.workingDirectory = normalize(settings.workingDirectory);
  tryToCreate(settings.workingDirectory, "workingDirectory");

  if (typeof settings.s3Bucket === "string") {

    // Remove s3:// and trailing slash, bucket name only
    settings.s3Bucket = settings.s3Bucket.replace(/^(s3[:]\/\/)|\/$/g, "");

    if (typeof settings.storagePath === "string") {

      // No leading slash, one trailing slash
      settings.storagePath = settings.storagePath.replace(/^\/|\/$/g, "");

      if (settings.storagePath) {
        settings.storagePath += "/";
      }

    } else {
      settings.storagePath = "";
    }

  } else {
    settings.storagePath = normalize(settings.storagePath);
    tryToCreate(settings.storagePath, "storagePath");
  }

  // Check maxUploadSize
  if ("maxUploadSize" in settings && typeof settings.maxUploadSize !== "number") {
    throw new TypeError("settings.maxUploadSize must be an integer. See https://github.com/nypublicradio/audiogram/blob/master/SERVER.md#all-settings for details.");
  }

  // Check fonts
  if ("fonts" in settings) {
    if (!Array.isArray(settings.fonts)) {
      throw new TypeError("settings.fonts must be an array of fonts. See https://github.com/nypublicradio/audiogram/blob/master/THEMES.md#a-note-about-fonts for details.")
    }

    settings.fonts.forEach(function(font){

      if (!font || typeof font.family !== "string" || typeof font.file !== "string") {
        return console.warn("Custom font in settings.fonts missing a 'family' or 'file'. See https://github.com/nypublicradio/audiogram/blob/master/THEMES.md#a-note-about-fonts for details.");
      }

      font.file = normalize(font.file);

      try {
        fs.accessSync(font.file);
      } catch(e) {
        return console.warn("Font file " + font.file + " does not exist or is not readable.");
      }

    });
  }

  return settings;

};

function tryToCreate(dir, key) {
  try {
    mkdirp.sync(dir);
    fs.accessSync(dir);
  } catch(e) {
    throw new Error("Could not create/access settings." + key + " at " + dir + "");
  }
}

function normalize(p) {
  if (path.isAbsolute(p)) {
    return p;
  }
  return path.join(__dirname, "..", "..", p);
}

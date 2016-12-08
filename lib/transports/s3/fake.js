var fs = require("fs"),
    path = require("path"),
    rimraf = require("rimraf"),
    mkdirp = require("mkdirp");

module.exports = function(storagePath) {

  function copy(source, destination, cb) {

    if (!path.isAbsolute(source)) {
      source = path.join(storagePath, source);
    }

    if (!path.isAbsolute(destination)) {
      destination = path.join(storagePath, destination);
    }

    mkdirp.sync(path.dirname(destination));

    var readable = fs.createReadStream(source).on("error", cb),
        writeable = fs.createWriteStream(destination).on("error", cb).on("close", cb);

    readable.pipe(writeable);

  }

  function clean(cb) {
    rimraf(storagePath, cb);
  }

  function getURL(id) {
    return "/video/" + id + ".mp4";
  }

  return {
    upload: copy,
    download: copy,
    getURL: getURL,
    clean: clean
  };

};

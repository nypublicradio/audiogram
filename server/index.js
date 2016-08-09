// Dependencies
var express = require("express"),
    compression = require("compression"),
    path = require("path"),
    multer = require("multer"),
    uuid = require("node-uuid"),
    mkdirp = require("mkdirp");

// Routes and middleware
var logger = require("../lib/logger/"),
    render = require("./render.js"),
    status = require("./status.js"),
    errorHandlers = require("./error.js");

// Settings
var serverSettings = require("../settings/");

var app = express();

app.use(compression());
app.use(logger.morgan());

// Options for where to store uploaded audio and max size
var fileOptions = {
  storage: multer.diskStorage({
    destination: function(req, file, cb) {

      var dir = path.join(serverSettings.workingDirectory, uuid.v1());

      mkdirp(dir, function(err) {
        return cb(err, dir);
      });
    },
    filename: function(req, file, cb) {
      cb(null, "audio");
    }
  })
};

if (serverSettings.maxUploadSize) {
  fileOptions.limits = {
    fileSize: +serverSettings.maxUploadSize
  };
}

if (typeof serverSettings.workingDirectory !== "string") {
  throw new TypeError("No workingDirectory set in settings/index.js");
}

// On submission, check upload, validate input, and start generating a video
app.post("/submit/", [multer(fileOptions).single("audio"), render.validate, render.route]);

// If not using S3, serve videos locally
if (!serverSettings.s3Bucket) {
  if (typeof serverSettings.storagePath !== "string") {
    throw new TypeError("No storagePath set in settings/index.js");
  }
  var storagePath =  path.isAbsolute(serverSettings.storagePath) ? serverSettings.storagePath : path.join(__dirname, "..", serverSettings.storagePath);
  app.use("/video/", express.static(path.join(storagePath, "video")));
}

// Check the status of a current video
app.get("/status/:id/", status);


// Serve background images and themes JSON statically
app.use("/settings/", function(req, res, next) {

  // Keep server settings off limits
  if (req.url.match(/\.js$/i)) {
    return res.status(404).send("Cannot GET " + path.join("/settings", req.url));
  }

  next();

}, express.static(path.join(__dirname, "..", "settings")));

// Serve editor files statically
app.use(express.static(path.join(__dirname, "..", "editor")));

app.use(errorHandlers);

module.exports = app;

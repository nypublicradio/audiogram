// Dependencies
var express = require("express"),
    compression = require("compression"),
    path = require("path"),
    multer = require("multer"),
    uuid = require("node-uuid"),
    mkdirp = require("mkdirp"),
    fs = require("fs");

// Routes and middleware
var logger = require("../lib/logger/"),
    render = require("./render.js"),
    status = require("./status.js"),
    fonts = require("./fonts.js"),
    errorHandlers = require("./error.js");

// Settings
var serverSettings = require("../lib/settings/");

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

/**
 * HTTP basic authentication
 */

// List of accounts
users = path.join(__dirname, "..", "settings") + "/users.htpasswd";

// Only run if settings/users.htpasswd isn't empty
try {
  if (fs.readFileSync(users, "utf8")) {
    var auth = require("http-auth");

    var basic = auth.basic({
        file:   users,
        realm:  "Audiogram Administration",
        msg401: "Error: Your account details could not be authenticated."
    });

    app.use(function(req, res, next) {
      if (new RegExp("^\/video\/").test(req.path)) {
        // Allow /video/* links to work without authentication (for sharing)
        next();
      } else {
        // Set up authentication
        (auth.connect(basic))(req, res, next);
      }
    });
  }
} catch(e) { }

// On submission, check upload, validate input, and start generating a video
app.post("/submit/", [multer(fileOptions).single("audio"), render.validate, render.route]);

// If not using S3, serve videos locally
if (!serverSettings.s3Bucket) {
  app.use("/video/", express.static(path.join(serverSettings.storagePath, "video")));
}

// Serve custom fonts
app.get("/fonts/fonts.css", fonts.css);
app.get("/fonts/fonts.js", fonts.js);

if (serverSettings.fonts) {
  app.get("/fonts/:font", fonts.font);
}

// Check the status of a current video
app.get("/status/:id/", status);


// Serve background images and themes JSON statically
app.use("/settings/", function(req, res, next) {

  // Limit to themes.json and bg images
  if (req.url.match(/^\/?themes.json$/i) || req.url.match(/^\/?backgrounds\/[^/]+$/i)) {
    return next();
  }

  return res.status(404).send("Cannot GET " + path.join("/settings", req.url));

}, express.static(path.join(__dirname, "..", "settings")));

// Serve editor files statically
app.use(express.static(path.join(__dirname, "..", "editor")));

app.use(errorHandlers);

module.exports = app;

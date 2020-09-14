// Dependencies
var express = require("express"),
    compression = require("compression"),
    path = require("path"),
    multer = require("multer"),
    uuid = require("uuid"),
    mkdirp = require("mkdirp");

// Routes and middleware
var logger = require("../lib/logger/"),
    render = require("./render.js"),
    status = require("./status.js"),
    fonts = require("./fonts.js"),
    errorHandlers = require("./error.js");

// Settings
var serverSettings = require("../lib/settings/");

var fs = require("fs"),
    bodyParser = require("body-parser");

var app = express();

var jsonParser = bodyParser.json();
// var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(compression());
app.use(logger.morgan());

const uid = uuid.v1();

// Options for where to store uploaded audio and max size
var fileOptions = {
  storage: multer.diskStorage({
    destination: function(req, file, cb) {

      var dir = path.join(serverSettings.workingDirectory, uid);

      mkdirp(dir, function(err) {
        return cb(err, dir);
      });
    },
    filename: function(req, file, cb) {
      cb(null, file.fieldname);
    }
  })
};

var newThemeFileOptions = {
  storage: multer.diskStorage({
    destination: function(req, file, cb) {

      var dir = path.join(serverSettings.themeStoragePath);

      mkdirp(dir, function(err) {
        return cb(err, dir);
      });
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  })
};

if (serverSettings.maxUploadSize) {
  fileOptions.limits = {
    fileSize: +serverSettings.maxUploadSize
  };
  newThemeFileOptions.limits = {
    fileSize: +serverSettings.maxUploadSize
  };
}

// On submission, check upload, validate input, and start generating a video
const mt = multer(fileOptions).fields([{name: 'audio'}, {name: 'subtitle'}]);
app.post("/submit/", [mt, render.validate, render.route]);

// Upload new theme
app.post("/theme/upload/", [multer(newThemeFileOptions).single("newTheme"), function (req, res) {
  var themesFile = path.join(serverSettings.settingsPath, "themes.json");
  fs.readFile(themesFile, "utf8", function readFileCallback(err, data) {
    if (err) {
      console.log('err', err);
      res.send(JSON.stringify({status: 500, error: err}));
    } else {
      var caption = req.body.newCaption;
      var width = req.body.newWidth;
      var height = req.body.newHeight;
      var themes = JSON.parse(data);
      
      themes[caption] = {
        "backgroundImage": req.file.filename,
        "width": parseInt(width),
        "height": parseInt(height)
      };
      
      var subtitleLeft = (req.body.newSubtitleLeft) ? req.body.newSubtitleLeft : 0;
      var subtitleRight = (req.body.newSubtitleRight) ? req.body.newSubtitleRight : 0;
      if (subtitleLeft > 0) {
        themes[caption]["subtitleLeft"] = parseInt(subtitleLeft);
      }
      if (subtitleRight > 0) {
        themes[caption]["subtitleRight"] = parseInt(subtitleRight);
      }
      
      var jt = JSON.stringify(themes);
      fs.writeFile(themesFile, jt, "utf8", function (err) {
        if (err) {
          console.log(err);
          res.send(JSON.stringify({status: 500, error: err}));
        }
        res.send(JSON.stringify({status: 200, success: "success"}));
      });
    }
  });
}]);

// Delete theme
app.post("/theme/delete/", jsonParser, function (req, res) {
  var themesFile = path.join(serverSettings.settingsPath, "themes.json");
  fs.readFile(themesFile, "utf8", function readFileCallback(err, data) {
    if (err) {
      console.log('err', err);
      res.send(JSON.stringify({status: 500, error: err}));
    } else {
      var theme = req.body.theme;
      var themes = JSON.parse(data);
      
      if (themes[theme]) {
        var background = themes[theme]["backgroundImage"];
        if (background) {
          var asset = path.join(serverSettings.themeStoragePath, background);
          try {
            fs.unlink(asset, function(err) {
              if (err) {
                console.log('err', error);
                res.send(JSON.stringify({status: 500, error: err}));
              }
              delete themes[theme];
              var jt = JSON.stringify(themes);
              fs.writeFile(themesFile, jt, "utf8", function (err) {
                if (err) {
                  console.log(err);
                  res.send(JSON.stringify({status: 500, error: err}));
                }
                res.send(JSON.stringify({status: 200, success: "success"}));
              });
            });
          } catch (err) {
            console.log(err);
            res.send(JSON.stringify({status: 500, error: err}));
          }  
        }
      }
    }
  });
});

// Save theme
app.post("/theme/save/", jsonParser, function (req, res) {
  var themesFile = path.join(serverSettings.settingsPath, "themes.json");
  fs.readFile(themesFile, "utf8", function readFileCallback(err, data) {
    if (err) {
      console.log('err', err);
      res.send(JSON.stringify({status: 500, error: err}));
    } else {
      var theme = req.body.theme;
      var themes = JSON.parse(data);
      themes[theme.name] = theme;
      var jt = JSON.stringify(themes);
      fs.writeFile(themesFile, jt, "utf8", function (err) {
        if (err) {
          console.log(err);
          res.send(JSON.stringify({status: 500, error: err}));
        }
        res.send(JSON.stringify({status: 200, success: "success"}));
      });
    }
  });
  
});

// Theme editor
app.use("/theme/", express.static(path.join(__dirname, "..", "editor/theme.html")));

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

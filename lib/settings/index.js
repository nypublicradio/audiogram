var _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    load = require("./load.js");

var settings = load("settings/index.js"),
    themes = load("settings/themes.json"),
    labels = load("settings/labels.json");

// Validate settings
settings = require("./validate-settings.js")(settings);

// Validate themes
themes = require("./validate-themes.js")(themes);

// Validate labels
labels = require("./validate-labels.js")(labels);

module.exports = settings;

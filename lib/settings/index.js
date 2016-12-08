var _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    load = require("./load.js");

var settings = load("settings/index.js"),
    themes = load("settings/themes.json");

// Validate settings
settings = require("./validate-settings.js")(settings);

// Validate themes
themes = require("./validate-themes.js")(themes);

module.exports = settings;

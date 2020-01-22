var fonts = require("./settings/").fonts,
  _ = require("underscore"),
  Canvas = require("../vendor/canvas");

// Register custom fonts one time
if (Array.isArray(fonts)) {
  fonts.forEach(function(font) {
    Canvas.registerFont(font.file, _.pick(font, "family", "weight", "style"));
  });
}

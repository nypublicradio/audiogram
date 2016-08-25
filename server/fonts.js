var fonts = require("../lib/settings/").fonts;

var bySlug = {};

fonts.forEach(function(font, i){

  var extension = "",
      split = font.file.split(".");

  // Use existing extension if there is one
  if (split.length > 1){
    extension = "." + split.pop();
  }

  bySlug[font.slug = "custom-" + i + extension] = font;

});

function sendCSS(req, res) {
  res.set("Content-Type", "text/css")
    .send(fonts.map(declaration).join("\n\n"));
}

function sendFont(req, res) {

  var font = bySlug[req.params.font];

  if (font && font.file) {
    return res.sendFile(font.file);
  }

  res.status(500).send("Cannot GET " + req.baseUrl);

}

function declaration(font, i) {
  return [
    "@font-face {",
    "  font-family: '" + font.family + "';",
    "  src: url('/fonts/" + font.slug + "');",
    font.weight ? "  font-weight: " + font.weight + ";" : "",
    font.style ? "  font-style: " + font.style + ";" : "",
    "}"
  ].filter(function(d){ return d; }).join("\n");
}

module.exports = {
  css: sendCSS,
  font: sendFont
};

var fonts = require("../lib/settings/").fonts || [];

var bySlug = {};

fonts.forEach(function(font, i){

  var extension = "",
      split = font.file.split(".");

  // Use existing file extension if there is one
  if (split.length > 1){
    extension = "." + split.pop();
  }

  bySlug[font.slug = "custom-" + i + extension] = font;

});

// Send a stylesheet with custom fonts
function sendCSS(req, res) {
  res.set("Content-Type", "text/css")
    .send(fonts.map(declaration).join("\n\n"));
}

// Send JS that forces all custom fonts to download upfront
function sendJS(req, res) {
  res.set("Content-Type", "application/javascript")
    .send("(function(){\n\n" + fonts.map(shim).join("\n\n") + "\n\n})();");
}

// Send custom file by its slug
function sendFont(req, res) {

  var font = bySlug[req.params.font];

  if (font && font.file) {
    return res.sendFile(font.file);
  }

  res.status(404).send("Cannot GET " + req.baseUrl);

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

function shim(font, i) {
  return [
    "  var font" + i + " = document.createElement(\"div\");",
    "  font" + i + ".innerHTML = '.';",
    "  font" + i + ".style.fontFamily = \"" + font.family + "\";",
    font.weight ? "  font" + i + ".style.fontWeight = \"" + font.weight + "\";" : "",
    font.style ? "  font" + i + ".style.fontStyle = \"" + font.style + "\";" : "",
    "  document.body.appendChild(font" + i + ");",
    "  setTimeout(function(){ font" + i + ".remove(); }, 0);"
  ].filter(function(d){ return d; }).join("\n");
}

module.exports = {
  css: sendCSS,
  js: sendJS,
  font: sendFont
};

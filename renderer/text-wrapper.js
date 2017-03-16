var smartquotes = require("smartquotes").string;

module.exports = function(context, options) {

  context.font = options.captionFont;
  context.textBaseline = "top";
  context.textAlign = options.captionAlign || "center";

  // Do some typechecking
  var left = ifNumeric(options.captionLeft, 0),
      right = ifNumeric(options.captionRight, options.width),
      bottom = ifNumeric(options.captionBottom, null),
      top = ifNumeric(options.captionTop, null);

  if (bottom === null && top === null) {
    top = 0;
  }

  var captionWidth = right - left;

  return function(caption) {

    if (!caption) {
      return;
    }

    var lines = [[]],
        maxWidth = 0,
        words = smartquotes(caption + "").trim().replace(/\s\s+/g, " \n").split(/ /g);

    // Check whether each word exceeds the width limit
    // Wrap onto next line as needed
    words.forEach(function(word,i){

      var width = context.measureText(lines[lines.length - 1].concat([word]).join(" ")).width;

      if (word[0] === "\n" || (lines[lines.length - 1].length && width > captionWidth)) {

        word = word.trim();
        lines.push([word]);
        width = context.measureText(word).width;

      } else {

        lines[lines.length - 1].push(word);

      }

      maxWidth = Math.max(maxWidth,width);

    });

    var totalHeight = lines.length * options.captionLineHeight + (lines.length - 1) * options.captionLineSpacing;

    // horizontal alignment
    var x = options.captionAlign === "left" ? left : options.captionAlign === "right" ? right : (left + right) / 2;

    // Vertical alignment
    var y;

    if (top !== null && bottom !== null) {
      // Vertical center
      y = (bottom + top - totalHeight) / 2;
    } else if (bottom !== null) {
      // Vertical align bottom
      y = bottom - totalHeight;
    } else {
      // Vertical align top
      y = top;
    }

    context.fillStyle = options.captionColor;
    lines.forEach(function(line, i){
      context.fillText(line.join(" "), x, y + i * (options.captionLineHeight + options.captionLineSpacing));
    });

 };


}

function ifNumeric(val, alt) {
  return (typeof val === "number" && !isNaN(val)) ? val : alt;
}

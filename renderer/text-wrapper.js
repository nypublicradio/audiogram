var smartquotes = require("smartquotes").string;

module.exports = function(theme) {

  return function(context, language, type) {
    // Do some typechecking
    var left = ifNumeric(theme[type + 'Left'], 0),
        right = ifNumeric(theme[type + 'Right'], theme.width),
        bottom = ifNumeric(theme[type + 'Bottom'], null),
        top = ifNumeric(theme[type + 'Top'], null);

    if (!language || language === 'None') {
      return;
    }

    calculate(language, type);

    function calculate (txt, type) {
      var lines = [[]],
          wrap_width = right - left,
          max_width = 0,
          words = smartquotes(txt + "").trim().replace(/\s\s+/g, " \n").split(/ /g),
          indent = 20;

      if (bottom === null && top === null) {
        top = 0;
      }

      context.font = theme[type + 'Font'];
      context.textBaseline = "top";
      context.textAlign = theme[type + 'Align'] || "center";

      // Check whether each word exceeds the width limit
      // Wrap onto next line as needed
      words.forEach(function(word,i){

        var width = context.measureText(lines[lines.length - 1].concat([word]).join(" ")).width;

        if (word[0] === "\n" || (lines[lines.length - 1].length && width > wrap_width)) {

          word = word.trim();
          lines.push([word]);
          width = context.measureText(word).width;

        } else {

          lines[lines.length - 1].push(word);

        }

        max_width = Math.max(max_width, width);

      });

      var totalHeight = lines.length * theme[type + 'LineHeight'] + (lines.length - 1) * theme[type + 'LineSpacing'];

      // save caption height for measuring citation top
      if (type === 'caption') {
        theme.captionTotalHeight = totalHeight;
      }

      // horizontal alignment
      var x = theme[type + 'Align'] === "left" ? left : theme[type + 'Align'] === "right" ? right : (left + right) / 2;

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
        if (type === 'citation' && theme.captionTotalHeight) {
          y = theme.captionTop + theme.captionTotalHeight + theme[type + 'TopMargin'];
        }
        else {
          y = top;
        }
      }

      // draw text
      context.fillStyle = theme[type + 'Color'];
      lines.forEach(function(line, i){

        if (/caption|citation/.test(type)) {
          if (i === 0 && /^“/.test(line[0])) {
            context.fillText(line.join(" "), x, y + i * (theme[type + 'LineHeight'] + theme[type + 'LineSpacing']));
          }
          else {
            context.fillText(line.join(" "), (x + indent), y + i * (theme[type + 'LineHeight'] + theme[type + 'LineSpacing']));
          }
        }
        else { // you're a label
          context.fillText(line.join(" "), x, y + i * (theme[type + 'LineHeight'] + theme[type + 'LineSpacing']));
        }
      });

    }

 };


}

function ifNumeric(val, alt) {
  return (typeof val === "number" && !isNaN(val)) ? val : alt;
}

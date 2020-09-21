var d3 = require("d3"),
    $ = require("jquery"),
    preview = require("./preview.js"),
    fonts = [{name: "Neue Haas Grotesk Text Pro"},
      {name: "Source Sans Pro"}];

function _initialize() {
    d3.select("#btn-new-theme").on("click", uploadTheme);
  	d3.select("#input-new-theme").on("change", updateNewThemeFile).each(updateNewThemeFile);
  	d3.select("#input-new-caption").on("change keyup", updateNewCaption).each(updateNewCaption);
  	d3.select("#btn-delete-theme").on("click", deleteTheme);
    d3.select("#chkNoPattern").on("change", setNoPattern);

    d3.select("#input-font")
    .on("change", updateFont)
    .selectAll("option")
    .data(fonts)
    .enter()
    .append("option")
      .text(function(d){
        return d.name;
      });

}

function setClass(cl, msg) {
  d3.select("body").attr("class", cl || null);
  d3.select("#error").text(msg || "");
}

function uploadTheme() {
  var formData = new FormData();
  var file = preview.newTheme();

  formData.append("newTheme", file);

  var newCaption = preview.newCaption();

  formData.append("newCaption", newCaption);

  var img = new Image();
  img.onload = function() {
    var sizes = {
      width: this.width,
      height: this.height
    };
    URL.revokeObjectURL(this.src);

    var subtitleLeft, subtitleRight;
    if (sizes.width > sizes.height) {
      if (sizes.width > 1280) {
        sizes.width = 1280;
      }
      if (sizes.height > 720) {
        sizes.height = 720;
      }
    } else {
      if (sizes.height > 1280) {
        sizes.height = 1280;
      }
      if (sizes.width > 720) {
        sizes.width = 720;
        subtitleLeft = sizes.width/2;
        subtitleRight = sizes.width-20;
        formData.append("newSubtitleLeft", subtitleLeft);
        formData.append("newSubtitleRight", subtitleRight);
      }
    }
    
    formData.append("newWidth", sizes.width);
    formData.append("newHeight", sizes.height);

    $.ajax({
      url: "/theme/upload",
      type: "POST",
      data: formData,
      dataType: "json",
      contentType: false,
      cache: false,
      processData: false,
      success: function () {
        d3.json("/settings/themes.json", function(err, themes){

          var errorMessage;

          // Themes are missing or invalid
          if (err || !d3.keys(themes).filter(function(d){ return d !== "default"; }).length) {
            if (err instanceof SyntaxError) {
              errorMessage = "Error in settings/themes.json:<br/><code>" + err.toString() + "</code>";
            } else if (err instanceof ProgressEvent) {
              errorMessage = "Error: no settings/themes.json.";
            } else if (err) {
              errorMessage = "Error: couldn't load settings/themes.json.";
            } else {
              errorMessage = "No themes found in settings/themes.json.";
            }
            d3.select("#loading-bars").remove();
            d3.select("#loading-message").html(errorMessage);
            if (err) {
              throw err;
            }
            return;
          }

          location.reload();

        });
      },
      error: function (error) {
        console.log('error', error);
      }
    });

  }
  var objectURL = URL.createObjectURL(file);
  img.src = objectURL;

}

function updateNewThemeFile() {
  if (!this.files || !this.files[0]) {
    preview.newTheme(null);
    setClass(null);
    return true;
  }

  newTheme = this.files[0];

  preview.loadNewTheme(newTheme, function (err) {
    if (err) {
      setClass("error", "Error updating new theme file");
    } else {
      setClass(null);
    }
  });
}

function updateNewCaption() {
  preview.newCaption(this.value);
}

function deleteTheme() {
	if(!confirm($("#btn-delete-theme").data("confirm"))){
      d3.event.stopImmediatePropagation();
      d3.event.preventDefault();
      return;
  }

	var theme = d3.select("#input-theme").property("value");

	$.ajax({
    url: "/theme/delete",
    type: "POST",
    data: JSON.stringify({theme: theme}),
    dataType: "json",
    contentType: "application/json",
    cache: false,
    success: function () {
    	location.reload();
    },
    error: function (error) {
    	console.log('error', error);
  	}
	});

}

function saveTheme() {
  $.ajax({
    url: "/theme/save",
    type: "POST",
    data: JSON.stringify({theme: theme}),
    dataType: "json",
    contentType: "application/json",
    cache: false,
    success: function () {
      preview.theme(theme);
    },
    error: function (error) {
      // console.log('error', error);
    }
  });

}

function setNoPattern() {
  if (!theme) {
    return;
  }
  const checked = d3.select("#chkNoPattern").property("checked");
  if (!theme.noPattern) {
    theme['noPattern'] = checked;
  } else {
    theme.noPattern = checked;
  }
  saveTheme();
}

function updateFont() {
  var font = d3.select("#input-font").property("value");
  if (theme.captionFont) {
    theme.captionFont = "300 52px '" + font + "'";
  } else {
    theme['captionFont'] = "300 52px '" + font + "'";
  }
  if (theme.subtitleFont) {
    theme.subtitleFont = "300 44px '" + font + "'";
  } else {
    theme['subtitleFont'] = "300 44px '" + font + "'";
  }
  saveTheme();
}

module.exports = {
	initialize: _initialize
};

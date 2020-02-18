var d3 = require("d3"),
    $ = require("jquery"),
    preview = require("./preview.js");

function _initialize() {
    d3.select("#btn-new-theme").on("click", uploadTheme);
  	d3.select("#input-new-theme").on("change", updateNewThemeFile).each(updateNewThemeFile);
  	d3.select("#input-new-caption").on("change keyup", updateNewCaption).each(updateNewCaption);
  	d3.select("#btn-delete-theme").on("click", deleteTheme);
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

module.exports = {
	initialize: _initialize
};

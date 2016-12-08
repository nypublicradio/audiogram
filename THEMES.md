## Audiogram themes

Themes are defined as one big JSON dictionary in `settings/themes.json` ([link](settings/themes.json)).

All themes inherit the settings of the `default` theme, and setting an option for another theme will extend/override the same property.

Each theme should be a unique name as the key and then a set of options.  For example:

```
  "My Theme Name": {
    "width": 320,
    "height": 320
  }
```

The best way to get a feel for this is probably to look at the included themes file ([link](settings/themes.json)) and compare it to how the themes look in the editor.

### Required options

The following options are required (they aren't required for every theme as long as they're present in `default`):

* `width` - desired video width in pixels (e.g. `1280`)
* `height` - desired video height in pixels (e.g. `720`)
* `framesPerSecond` - desired video framerate (e.g. `20`)
* `samplesPerFrame` - How many data points to use for the waveform. More points = a more detailed wave. (e.g. `128`)

To see what specs different social media platforms want, see the [Developer notes](DEVELOPERS.md#use-different-dimensions-besides-1280x720).

### Background options

Background options:

* `backgroundImage` - What image to put in the background of every frame, it should be a file in `settings/backgrounds/`
* `backgroundColor` - A CSS color to fill the background of every frame (e.g. `pink` or `#ff00ff`). The default is white.

If a `backgroundImage` is defined, its dimensions should match the theme's width and height and the file should be in `settings/backgrounds/`. So for example, you could add:

```js
  "tmnt": {
    "name": "Teenage Mutant Ninja Turtles",
    "foregroundColor": "green",
    "backgroundImage": "tmnt-bg.png"
  }
```

and save a background image as `settings/backgrounds/tmnt-bg.png`.

You can set both a `backgroundColor` and a `backgroundImage`, in which case the image will be drawn on top of the color.

### Caption options

* `captionColor` - A CSS color, what color the text should be (e.g. `red` or `#ffcc00`). The default is black.
* `captionAlign` - Text alignment of the caption: `left`, `right`, or `center` (default: `center`)
* `captionFont` - A full CSS font definition to use for the caption (see _A note about fonts_ below)
* `captionLineHeight` - How tall each caption line is in pixels. You'll want to adjust this for whatever font and font size you're using.
* `captionLineSpacing` - How many extra pixels to put between caption lines. You'll want to adjust this for whatever font and font size you're using.
* `captionLeft` - How many pixels from the left edge to place the caption
* `captionRight` - How many pixels from the right edge to place the caption
* `captionBottom` or `captionTop` - How many pixels from the bottom or top edge to place the caption. Determines whether the caption text will be top- or bottom-aligned. If both are set, the caption will be roughly vertically centered between them, give or take a few pixels depending on the font.

### Wave options

* `pattern` - What waveform shape to draw. Current options are `wave`, `bars`, `line`, `curve`, `roundBars`, `pixel`, `bricks`, and `equalizer` (default: `wave`)
* `waveTop` - How many pixels from the top edge to start the waveform (default: `0`)
* `waveBottom` - How many pixels from the top edge to end the waveform (default: same as `height`)
* `waveLeft` - How many pixels from the left edge to start the waveform (default: `0`)
* `waveRight` - How many pixels from the right edge to start the waveform (default: same as `width`)
* `waveColor` - A CSS color, what color the wave should be. The default is black.

Note that if you change `waveLeft` or `waveRight` to something other than full-width, you'll probably want to tweak `samplesPerFrame` too or else things will get pretty squished.

### Additional options

* `name` - What name to show in the dropdown menu in the editor (the default is the key)
* `foregroundColor` - A convenience option for setting `waveColor` and `captionColor` to the same thing.
* `maxDuration` - Maximum duration of an audiogram, in seconds (e.g. set this to `30` to enforce a 30-second time limit). The default is `300` (5 minutes).

### A note about fonts

By default, Audiogram will already have access to fonts on your system.  This might be fine for local use, but it will become a problem on a server without the fonts you're used to, or if you want to use a specific font across lots of installations.

The good news is that you can load custom fonts directly with the `fonts` list in `settings/index.js` ([link](settings/index.js#L25-L31)). Each font in the array is an object with `family` (the font family name in `captionFont`) and `file`, the absolute path to the font file.  For example:

```js
fonts: [
  { family: "Gotham", file: "/where/to/find/Gotham.ttf" }
]
```

Now you can specify a caption font like `32px Gotham` and it should work.  You can also specify a `style` and/or `weight` if you want to use multiple variations in the same font family and your caption font definitions include styles and weights (e.g. `bold 32px Gotham`):

```js
fonts: [
  { family: "Gotham", file: "/where/to/find/Gotham-Bold.ttf", weight: "bold" },
  { family: "Gotham", file: "/where/to/find/Gotham-Italic.ttf", style: "italic" }
]
```

The bad news is that the font handling in the library Audiogram relies on has a lot of quirks.  Because of that, Audiogram relies on a [specific patched branch of node-canvas](https://github.com/Automattic/node-canvas/pull/715), so _hopefully_ you won't have any problems. If you do run into problems where the font you're trying to use doesn't show up in the videos, here are a few things you can try:

1. Install the fonts as system fonts on the relevant computers. This at least includes the computers people are using to create Audiograms (i.e. their desktops). If you're hosting Audiogram on a remote server somewhere, install it there too.

2. Ensure that the font name defined in the font file's metadata matches the font name you're using (e.g. if your font definition says "32px Gotham", make sure that when you open your font file in something like Font Forge and look at the metadata, the font name is also "Gotham" and not some variant.

3. Use TrueType fonts (.ttf) rather than other formats.


### A note about layout

When designing your own themes, keep in mind that web browsers and social apps put a variety of overlays on videos when they're paused or playing, like a progress bar at the bottom or a fat play button in the middle. Try to space things out so that important parts of your design aren't obscured.

These diagrams show you what gets covered up in various web players for a 1280x720 video (the in-app players are generally more minimalistic):

![Facebook - embedded, hovering](https://cloud.githubusercontent.com/assets/2120446/17449695/3f1e008a-5b2a-11e6-8a5a-f30b80141f7e.png)

![Facebook - embedded, paused](https://cloud.githubusercontent.com/assets/2120446/17449742/7b547bec-5b2a-11e6-9107-ee79620c7612.png)

![Facebook - in feed, hovering](https://cloud.githubusercontent.com/assets/2120446/17449722/5e841f5e-5b2a-11e6-9cca-e4072b6f3eb7.png)

![Twitter - in feed, hovering](https://cloud.githubusercontent.com/assets/2120446/17449733/70d706b2-5b2a-11e6-9bbf-3659c36a4f41.png)

![Tumblr - hovering](https://cloud.githubusercontent.com/assets/2120446/17449725/6637ff5e-5b2a-11e6-90bc-62743b13860a.png)

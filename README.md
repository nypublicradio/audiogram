# Audiogram

🔊 -> 🎥

Audiogram is a library for generating shareable videos from audio clips.

Here are some examples of the audiograms it creates:

* https://twitter.com/WNYC/status/707576942837374976
* https://www.facebook.com/NoteToSelfPodcast/videos/597741940383645/
* https://twitter.com/WNYC/status/751089421026402304
* https://www.facebook.com/BrianLehrerWNYC/videos/1045228085513942/

## Why does this exist?

Unlike audio, video is a first-class citizen of social media. It's easy to embed, share, autoplay, or play in a feed, and the major services are likely to improve their video experiences further over time.

Our solution to this problem at WNYC was this library.  Given a piece of audio we want to share on social media, we can generate a video with that audio and some basic accompanying visuals: a waveform of the audio, a theme for the show it comes from, and a caption.

For more on the backstory behind audiograms, read [this post](https://medium.com/@WNYC/e648e8a5f2e9).

## Getting started

First, read [What kind of Audiogram setup do I want?](SERVER.md).

Then, install Audiogram using the [full installation instructions](INSTALL.md).

Once you've successfully installed everything, open a Terminal/command prompt, go to the directory you installed Audiogram into, and run the server with:

```sh
> npm start
```

Now you can open the Audiogram editor in a web browser.  If you're running it on your local computer, it should be at `http://localhost:8888/`.

If you want to use a different port number, you can supply it in the command. For example, to use port 9999:

```sh
> npm start -- 9999
```

## The editor

When you first open the editor in your browser, you need to choose an audio file.  This should be a `.mp3` or `.wav` file (some other audio formats will probably work, but no promises).

You'll see a preview of your audiogram at the bottom. You can select a theme from the dropdown menu.

You can also add a caption. A caption will automatically wrap onto multiple lines, but if you want to force a line break you can put in multiple consecutive spaces. Right now you can only assign one caption to a video, but [multiple/more automatic captions are in the works](https://github.com/nypublicradio/audiogram/issues/8).

Below the preview, there is a tiny audio editor.  If you only want to use part of your audio, not the whole thing, you can click and drag to select a portion of the audio.  To hear the portion you've selected, you can use the controls at the bottom or use the space bar to play/pause (except in Safari, for some reason).

When you're ready to get your video, click "Generate." You may have to wait up to a a minute or two for this process to finish, but the page will give you status updates along the way.  When it's done, you can view the video or download it with the "Download" button.

[explanatory GIFs TK]

## Customizing the themes

A theme defines all of the visual details for an audiogram: dimensions, colors, spacing, and more.  This repo includes a few basic demo themes. In all likelihood, you'll want to use your own designs and tweak the colors, spacing, fonts, and so on.  For details on this, [read more about Themes](THEMES.md).

## Advanced: more customization

There are lots of things you might want to modify to better suit your needs.  For details on where you might want to nip and tuck the code for more significant modifications, read the [Developer Notes](DEVELOPER.md).

## Wishlist

This project is a work in progress.  If you have ideas or run into problems, open an issue! [Better captioning](https://github.com/nypublicradio/audiogram/issues/8) is a high priority. Here are some possible future improvements:

* [Support custom image upload backgrounds for individual audiograms](https://github.com/nypublicradio/audiogram/issues/7)
* [Receive an email when your audiogram is ready](https://github.com/nypublicradio/audiogram/issues/5)
* [Direct posting to Twitter, Facebook, etc.](https://github.com/nypublicradio/audiogram/issues/4)
* [Bundle this as an Electron app](https://github.com/nypublicradio/audiogram/issues/6)
* [Get a time estimate while waiting for your video](https://github.com/nypublicradio/audiogram/issues/3)
* [Drag-and-drop uploads](https://github.com/nypublicradio/audiogram/issues/2)
* [Use the WebAudio API for more of the heavy lifting](https://github.com/nypublicradio/audiogram/issues/1)
* [Do rendering through AWS Lambda](https://github.com/nypublicradio/audiogram/issues/17)

## Notes about design

Ultimately we had a few priorities in how we set this up, knowing that we would produce a lot of these under a variety of NYPR brands. We wanted to keep it simple, and we wanted a visual that strongly implies "AUDIO" to encourage people to unmute. As an added enhancement, the first and last frames of the video automatically use the "peakiest" frame from the entire thing so that it's a little more obvious in a thumbnail. If you want something other than the built-in waveform patterns, like dots or dancing emoji, there are some notes about how to go a different direction in the [Developer notes](DEVELOPERS.md).

## Questions/help

Open an issue or contact me on [Twitter](https://twitter.com/veltman).

## Contributors

* Noah Veltman
* Matt Oberle
* Sahar Baharloo
* Delaney Simmons

## License

Copyright (c) 2016 New York Public Radio

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

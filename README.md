# Audiogram

[![Build Status](https://travis-ci.org/nypublicradio/audiogram.svg?branch=alpha)](https://travis-ci.org/nypublicradio/audiogram)

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

![Audiogram Editor](https://cloud.githubusercontent.com/assets/2120446/17450988/7e6c4ea2-5b31-11e6-8f90-b32fec6864c3.gif)

When you first open the editor in your browser, you need to choose an audio file.  This should be a `.mp3` or `.wav` file (some other audio formats will probably work, but no promises).

You'll see a preview of your audiogram at the bottom. You can select a theme from the dropdown menu.

You can also add a caption. A caption will automatically wrap onto multiple lines, but if you want to force a line break you can put in multiple consecutive spaces. Right now you can only assign one caption to a video, but [multiple/more automatic captions are in the works](https://github.com/nypublicradio/audiogram/issues/8).

Below the preview, there is a tiny audio editor.  If you only want to use part of your audio, not the whole thing, you can click and drag to select a portion of the audio.  To hear the portion you've selected, you can use the controls at the bottom or use the space bar to play/pause (except in Safari, for some reason).

When you're ready to get your video, click "Generate." You may have to wait up to a a minute or two for this process to finish, but the page will give you status updates along the way.  When it's done, you can view the video or download it with the "Download" button.

## Customizing Audiogram

Audiogram defines the visual details like dimensions, colors, and spacing using "themes." This repo includes a few basic themes meant to give you a sense of what's possible, but you'll probably want to make your own. This will allow you to use your own colors and logos and fonts, or choose other dimensions (e.g. vertical video). For details, [read more about Audiogram themes](THEMES.md).

If you're comfortable writing a bit of JavaScript, you can also modify Audiogram more substantially to suit your needs.  The [Developer notes](DEVELOPERS.md) have some pointers for changes you might want to make, and what files to focus on.  For example, you could [use some other shape besides the built in patterns](https://github.com/nypublicradio/audiogram/blob/master/DEVELOPERS.md#use-different-animations-besides-the-wavebarsbricks), [use a different video format](https://github.com/nypublicradio/audiogram/blob/master/DEVELOPERS.md#fiddle-with-ffmpeg-options-eg-use-different-encoders), or [get fancy with gradients](https://github.com/nypublicradio/audiogram/blob/master/DEVELOPERS.md#extend-themes).

## Wishlist

This project is a work in progress.  If you have ideas or run into problems, open an issue! [Better captioning](https://github.com/nypublicradio/audiogram/issues/8) is a high priority. Here are some possible future improvements:

* [Support emoji](https://github.com/nypublicradio/audiogram/issues/15)
* [Receive an email when your audiogram is ready](https://github.com/nypublicradio/audiogram/issues/5)
* [Direct posting to Twitter, Facebook, etc.](https://github.com/nypublicradio/audiogram/issues/4)
* [Get a time estimate while waiting for your video](https://github.com/nypublicradio/audiogram/issues/3)
* [Drag-and-drop uploads](https://github.com/nypublicradio/audiogram/issues/2)
* [Use the WebAudio API for more of the heavy lifting](https://github.com/nypublicradio/audiogram/issues/1)
* [Do rendering through AWS Lambda](https://github.com/nypublicradio/audiogram/issues/17)

## Notes about design

Ultimately we had a few priorities in how we set this up, knowing that we would produce a lot of these under a variety of NYPR brands. We wanted to keep it simple, and we wanted a visual that strongly implies "AUDIO" to encourage people to unmute. As an added enhancement, the first and last frames of the video automatically use the "peakiest" frame from the entire thing so that it's a little more obvious in a thumbnail. If you want something other than the built-in waveform patterns, like dots or dancing emoji, there are some notes about how to go a different direction in the [Developer notes](DEVELOPERS.md#use-different-animations-besides-the-wavebars).

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

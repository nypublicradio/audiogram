Audiogram was developed for our particular needs but hopefully it should be reasonably hackable besides the options provided.  Here are some examples of possible customization that involve writing/editing the code and notes on how you could get started.

## Use different animations besides the wave/bars/bricks

The code that handles drawing a waveform involves three pieces:

1. The `audiogram/waveform.js` module, which uses the `waveform` utility to scan the file for its waveform data and then slices it up and scales it appropriately.  This function is called from the `Audiogram.getWaveform()` method in `audiogram/index.js`.
2. The code in `renderer/patterns.js`, which defines functions for how to draw a few common patterns based on data and options.
3. The code in `renderer/index.js`, which takes the waveform data and calls the pattern-drawing function.

To use a different style using the same data, you could add a new pattern in `renderer/patterns.js` using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) and then use that pattern name in `settings/themes.json`.  The built-in patterns make use of [D3](https://d3js.org/) for scaling and other helper functions, but you could use whatever you want.

If you want to modify things more drastically, you could edit the code in `renderer/index.js` to draw anything you want.

Note that if you modify any of the code in `renderer/`, you'll want to run `npm run rebuild` so it rebundles it for the editor.

## Change how captions are rendered/aligned/wrapped

The logic that wraps and aligns caption text is located in `renderer/text-wrapper.js`.  It takes in a raw string, slices it into words, and then fits those words onto the current line until it runs out of room and then starts a new line.  Once it knows the words going on each line, it aligns that entire box based on the `caption(Left|Right|Top|Bottom)` options.  If you want to tinker with this, `renderer/text-wrapper.js` is the place to tinker.

Note that if you modify any of the code in `renderer/`, you'll want to run `npm run rebuild` so it rebundles it for the editor.

## Require users to log in

Audiogram doesn't include any sort of authentication system.  If you want to host a version of it for internal use and protect it from the outside world, you could limit access by IP, or you could add some other login system.  The web server uses the [Express.js](http://expressjs.com/) framework.  If you add authentication middleware at the top of `server/index.js`, it will redirect unauthenticated requests. [Passport.js](http://passportjs.org/) is one resource that offers Express-friendly authentication using OAuth for popular services (e.g. Google or Facebook), but no matter what you'll at least need to administer a list of allowed users somewhere.

## Fiddle with FFmpeg options (e.g. use different encoders)

The FFmpeg command that does the final video rendering is in `audiogram/combine-frames.js`.  You can add or edit flags there.

## Use something else besides Redis or a file to track jobs

If `redisHost` is defined in your settings, Redis will be used to track the status of audiogram jobs.  If it's not enabled, there will instead be a JSON file called `.jobs` in the root Audiogram directory which works OK if you're just using it locally.  If you want to use something else, like some sort of database or SQS, you'll want to edit the files in `lib/transports/redis/`, which define the API for how to interact with Redis or its equivalent.  `lib/transports/redis/index.js` will expose the API for Redis or the file equivalent depending on the server settings.  The easiest way to get started would probably be to copy the file `lib/transports/redis/fake.js` and update it to work with the system you want to use instead.

## Store files somewhere else besides S3 or a folder

If your settings include an `s3Bucket` setting, your files will be stored on S3.  Otherwise, they will be stored in the local folder defined by `storagePath` (this can be an absolute path, or a path relative to the Audiogram root directory). If you want to store files somewhere besides S3 or the local machine, you'll want to edit the files in `lib/transports/s3/`, which define the API for how to interact with S3 or its filesystem equivalent.  `lib/transports/s3/index.js` will expose the API for S3 or the filesystem depending on the server settings.  The easiest way to get started would probably be to copy the file `lib/transports/s3/fake.js` and update it to work with the system you want to use instead.

## Make S3 files private

By default, files are uploaded to S3 as publicly readable files, and can be viewed at the corresponding url, like `https://s3.amazonaws.com/mybucket/video/[long random id].mp4`. The short reason for this is that it avoids the extra load and complexity caused by serving videos through the webserver. Streaming them directly through the webserver from S3 has some quirks, and downloading them to the webserver in their entirety and then serving them as local files needlessly slows things down. All audio and video files uploaded to S3 have 30+ character random UUID filenames, so the odds of someone stumbling on one are... low. But if you want to keep them totally private, and you still want to use S3, you can either:

1. Edit `lib/transports/s3/remote.js` to set a short expiration date on a video upload.

or

1. Edit `lib/transports/s3/remote.js` to remove the `public-read` setting from the upload and edit the `getURL()` function to return a local URL (`/videos/[id].mp4`).
3. Edit `server/index.js` so that it serves videos even when you're using S3. Modify it with a route handler that streams files from S3 to the end user as appropriate.

## Make this faster

As of now the rule of thumb is that the rendering process will take about a second for every 10-12 frames involved.  So if you have a 30 second audio clip and a framerate of 20 frames per second, it will take about 45 seconds in all.  The easiest way to make rendering faster is to reduce the framerate in `settings/themes.json` (e.g. a framerate of 10 instead of 20 will involve half as many frames).  But there's probably lots of room for other performance improvements.

The `node-canvas` step that draws an individual image for each frame accounts for roughly 80% of the rendering time, and is defined in `audiogram/draw-frames.js` and `renderer/index.js`. We've experimented with other approaches (for example, only rendering the foreground of each image and then combining each frame with the background image using ImageMagick), but none made a dent in the overall speed or resource usage.

The FFmpeg step accounts for most of the remaining rendering time, and is defined in `audiogram/combine-frames.js`. If you're an FFmpeg expert and have thoughts on how to more intelligently render the final video, please let us know! You may at least be able to see some improvements by forcing FFmpeg to use several threads with the `-threads` flag on a multicore machine.

## Extend themes

The current renderer (in `renderer/`) looks for certain theme settings defined in `settings/themes.json` when it's drawing the frames for a video.  You could extend a theme with your own option names, and then reference them in the renderer.

As an example, if you wanted to fill the wave with a gradient instead of a solid color, you could add the new option `waveColor2` to a theme and add this bit of extra logic into `renderer/patterns.js`:

```js
// If there's a second wave color, use a gradient instead
if (options.waveColor2) {
  var gradient = context.createLinearGradient(0, 0, options.width, 0);

  gradient.addColorStop(0, options.waveColor);
  gradient.addColorStop(1, options.waveColor2);

  context.fillStyle = gradient;
  context.strokeStyle = gradient;

}
```

## Use different dimensions besides 1280x720

The width and height for a video are defined in `settings/themes.json`.  If you change them there, you will get a video of the appropriate size.  The simplest way to handle multiple sizes would be to define multiple themes:

```js
"my-theme-fb": {
  "width": 1280,
  "height": 720,
  "backgroundImage": "my-theme-fb.png"
},
"my-theme-instagram": {
  "width": 480,
  "height": 480,
  "backgroundImage": "my-theme-instagram.png"
}
```

The current specs for different services are as follows:

**Dimensions**

Twitter: 1280x720  
Facebook: 1280x720  
Instagram: 640x640 (or any square up to 1280 on a side)  
Tumblr: displayed at 500px width, height is variable

**Max File Size**

Twitter: 15MB  
Facebook: 2.3GB  
Instagram: unclear, but large  
Tumblr: cumulative max upload of 100MB per day

**Max Length**

Twitter: 30 seconds  
Facebook: 60 minutes  
Instagram: 15 seconds  
Tumblr: cumulative max length of 5 minutes uploaded per day

**Encoding**

Twitter: H.264-MP4-AAC  
Facebook: H.264-MP4-AAC  
Instagram: H.264-MP4-AAC  
Tumblr: H.264-MP4-AAC

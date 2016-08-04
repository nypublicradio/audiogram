## What kind of Audiogram setup do I want?

When you install Audiogram, how you probably want to install/configure it depends on your situation.

### I'm the only one using it

Follow the [installation instructions](INSTALL.md) for your local computer, and you're good to go. You probably don't need to touch the default configuration.

If you're struggling with the installation, you can try using [Docker](https://github.com/nypublicradio/audiogram/blob/master/INSTALL.md#docker-installation), which will run Audiogram in a container so that you don't have to manually install stuff.

### I'm the only one using it and installing it on Mac/Windows was a real drag

Installing on Mac/Windows might put you in dependency hell. Installing on Linux tends to go more smoothly.

The simplest alternative is to start a remote server running Ubuntu 14.04 or 15.04 and follow the [Ubuntu installation instructions](INSTALL.md#ubuntu-1404-installation) instead to install it there.

You can run the server there with `npm start` or directly run `/where/you/installed/audiogram/bin/server`.

Once it's running, you can access the editor at `http://[my remote server's address]:8888/`

You'll probably want to [run it in the background](http://olegpuzanov.com/2014/04/08/run-any-script-as-a-daemon-process-in-ubuntu-with-upstart/) so you don't have to leave a Terminal window open forever.

If you want to keep other people from accessing it, see _A note about access control_ below.

## A handful of people are going to use it

If you have, say, 10 people who are all going to make Audiograms, you could stick to the above process to share a remote server.  It might be OK.  However, if a bunch of people all try to create an Audiogram at the same time, it may crash.

Audiogram actually consists of two pieces, the "server" and the "worker."  The server is run with `npm start` or `/where/audiogram/is/installed/bin/server`.  The worker is run with `npm worker` or `/where/audiogram/is/installed/bin/worker`.

The server handles the editor and submissions, and the worker does the heavy lifting of rendering a video file.  By default, when a new submission comes in, the server will start a new worker right away.  This is fine for light use, but if ten people all requested a long audiogram at the same time, things might get messy.

The way to break this traffic jam is to make sure you also installed Redis (see [installation instructions](INSTALL.md)) and then add two additional settings in `settings/index.js` ([link](settings/index.js)):

```js
redisHost: "127.0.0.1",
worker: true
```

What this means is that instead of immediately trying to render everything, the server will use Redis to manage a queue of things to render.

Now, you should run both the `server` task and the `worker` task separately.  As long as the `worker` task is running, it will continuously check the queue, waiting for new videos to render.

Make sure that if you set these settings, you run the `bin/worker` task somehow!  Otherwise, new submissions will go into the queue and just there forever and nothing will happen.

## A lot of people are going to use it a lot

If you're expecting a ton of people to share a single Audiogram installation, or you want to render lots of hour-long videos (please don't), you may want to go fully distributed with your setup so people don't have to wait twenty minutes in a long queue.

This means that you have one server running the `bin/server` task and any number of `bin/worker` tasks running elsewhere.  For example, you could have one webserver EC2 instance and a second instance that's running a worker or two.  Or you could have five instances each running one worker.  As long as they can all communicate with the same Redis server somewhere, you can have as many workers as you want.

The first thing you need to do is set up S3, which the server and worker will use to share files.  Create a bucket (or pick one you already have), and add it to your settings:

```js
s3Bucket: "myaudiogrambucket"
```

If you want to use a subfolder of a bucket, you can also specify a `storagePath`:

```js
s3Bucket: "mybucket",
storagePath: "audiogram-files"
```

Then make sure that your AWS credentials are available as environment variables.  You can set these however you want, but for convenience, Audiogram will look for a `.env` file in its root directory, for example:

```
AWS_ACCESS_KEY_ID=ABCDEFG
AWS_SECRET_ACCESS_KEY=1234567
```

Next, make sure you installed Redis somewhere and add its address to the settings:

```
redisHost: "[actual IP address goes here]"
```

Finally, make sure that `worker` is set to true (see above).

A full set of distributed options might be something like:

```js
module.exports = {
  workingDirectory: "/where/to/put/temporary/files/",
  s3Bucket: "myaudiogrambucket",
  redisHost: "1.2.3.4",
  worker: true
};
```

Now make sure all the instances have those settings and your webserver located at `1.2.3.4` runs the `bin/server` task and the rest run the `bin/worker` task.

By default, audio and video files uploaded to S3 are public. They have 32-character random filenames, so the odds of someone stumbling onto one by URL are... low, but if this is a problem, read about it in the [Developer notes](DEVELOPERS.md#make-s3-files-private).

### All settings

`workingDirectory` - a path to a folder where Audiogram can put temporary files (if it doesn't exist, it will be created automatically). This is REQUIRED.

`storagePath` - a path to a folder where Audiogram can store audio and video files. This is REQUIRED unless an `s3Bucket` is specified.

`s3Bucket` - the name of an S3 bucket to store audio and video files on.

`redisHost` - the address where all your instances can access a shared Redis server.

`worker` - if this is truthy, then new submissions will be added to a queue instead of rendered immediately.

`maxUploadSize` - this prevents people from uploading giant files.  For example, a value of `25000000` will limit file uploads to roughly 25 MB.

### Full examples

Local:

```js
module.exports = {
  workingDirectory: "/tmp/",
  storagePath: "/home/me/audiogram-files/"
}
```

Local, but use Redis as a queue:

```js
module.exports = {
  workingDirectory: "/tmp/",
  storagePath: "/home/me/audiogram-files/",
  redisHost: "127.0.0.1",
  worker: true
}
```

Local, but store videos on S3:

```js
module.exports = {
  workingDirectory: "/tmp/",
  storagePath: "files/audiogram/"
  s3Bucket: "mybucket"
}
```

Distributed (Redis is running at the IP 1.2.3.4, and the webserver and worker(s) can all communicate with it)

```js
module.exports = {
  workingDirectory: "/tmp/",
  s3Bucket: "myaudiogrambucket",
  redisHost: "1.2.3.4",
  worker: true
}
```

## A note about access control

If you run Audiogram on a remote server, you need to make sure you can access it.  For example, if you're using Amazon EC2, you need to allow inbound HTTP traffic on port 8888, or whichever port you're using instead.

The flip side is that you probably want to make sure other people CAN'T access it.  Otherwise a random person (or more likely a random robot) can view your Audiogram editor in their browser, and possibly spam it or worse.  The simplest way to do this is to limit access by IP address so that, for example, only computers in your office can access it.  But you can also add whatever authentication middleware you want. For some thoughts on how to do that, check out the [Developer Notes](DEVELOPERS.md#require-users-to-log-in).

If you've set `redisHost` to a specific destination, you also need to make sure that all your instances can connect to it over port 6379.

## Advanced customization

This may not suit you. Maybe you don't want to use S3. Maybe you need to add password protection. Maybe you have other ideas. For some advice on how to modify this for your needs, check out the [Developer Notes](DEVELOPERS.md).

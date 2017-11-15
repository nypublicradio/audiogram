# Audiogram installation

Audiogram has a number of dependencies:

* [Node.js/NPM](https://nodejs.org/) v0.11.2 or greater
* [node-canvas dependencies](https://github.com/Automattic/node-canvas#installation)
* [FFmpeg](https://www.ffmpeg.org/)

If you're using a particularly fancy distributed setup you'll also need to install [Redis](http://redis.io/).

Installation has been tested on Ubuntu 14.04, 15.04, and 16.04. It has also been tested on various Mac OS X environments, with various degrees of Homebrew Hell involved.

This would theoretically work on Windows, but it hasn't been tested.

You can skip almost all of the installation if you use [Docker](#docker-installation).

## Ubuntu 14.04+ installation

Note: if you're using something with < 1GB of RAM, like a Digital Ocean micro droplet, it might cause an installation problem on the last step. See [Linux troubleshooting](INSTALL.md#linux-troubleshooting) below for how to fix it.

An example bootstrap script for installing Audiogram on Ubuntu looks like this:

```sh
# 14.04 only: add PPA for FFmpeg
# Not required for 15.04+
sudo add-apt-repository ppa:mc3man/trusty-media --yes

# Update/upgrade
sudo apt-get update --yes && sudo apt-get upgrade --yes

# Install:
# Node/NPM
# Git
# node-canvas dependencies (Cairo, Pango, libgif, libjpeg)
# FFmpeg
sudo apt-get install git nodejs npm \
libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev libpng-dev build-essential g++ \
ffmpeg \
--yes

# Install Redis if you plan to use it to share rendering among multiple processes/servers
# If you don't need to handle multiple users, you can skip this step
sudo apt-get install redis-server --yes

# Fix nodejs/node legacy binary nonsense
sudo ln -s `which nodejs` /usr/bin/node

# Check the version of Node
node -v

# If the installed Node version is >= v0.11.2, you can skip the next step
# If it's < v0.11.2, upgrade Node to the latest stable version
# If you use this method, you'll probably need to reconnect afterwards
# to see the new Node version reflected
sudo npm install -g n
sudo n stable

# Clone the audiogram repo
git clone https://github.com/nypublicradio/audiogram.git
cd audiogram

# Install local modules from NPM
npm install

# If this worked, you're done
# If you get an error about `make` failing,
# you may need to ensure that node-gyp is up-to-date
# You may even need to run this command twice, because computers
sudo npm install -g node-gyp

# If you had to update node-gyp, try again
npm install
```

## Mac OS X installation

Installing on a Mac can get a little rocky. Essentially, you need to install three things:

1. [Node.js/NPM](https://nodejs.org/)
2. [node-canvas dependencies](https://github.com/Automattic/node-canvas#installation)
4. [FFmpeg](https://www.ffmpeg.org/)

You can install Node.js by [downloading it from the website](https://nodejs.org/).

Installation of node-canvas dependencies and FFmpeg might look like the following with [Homebrew](http://brew.sh/) (you'll want to make sure [XCode](https://developer.apple.com/xcode/) is installed and up-to-date too):

```sh
# Install Git if you haven't already
brew install git

# Install Cairo, Pango, libgif, libjpeg, libpng, and FFmpeg
# You may not need to install zlib
brew install pkg-config cairo pango libpng jpeg giflib ffmpeg

# Go to the directory where you want the audiogram directory
cd /where/to/put/this/

# Clone the repo
git clone https://github.com/nypublicradio/audiogram.git
cd audiogram

# Install from NPM
npm install
```

## Windows installation

Installing these dependencies on Windows is an uphill battle.  If you're running Windows 10, you'll probably have better luck installing [Docker for Windows](https://docs.docker.com/docker-for-windows/) and then following the [Docker instructions](INSTALL.md#docker-installation) below. Otherwise your best bet is probably to [install it on a remote Linux server](SERVER.md#im-the-only-one-using-it-and-installing-it-on-macwindows-was-a-real-drag).

## Docker installation

If you use [Docker](https://www.docker.com/products/docker), you can build an image from the included Dockerfile.

In addition to installing Docker, you'll need to install Git.  You can do this by installing [GitHub Desktop](https://desktop.github.com/).

You can clone the repo and build an image, or build it directly from the repo:

```sh
git clone https://github.com/nypublicradio/audiogram.git
cd audiogram
docker build -t audiogram .
```

or

```sh
docker build -t audiogram https://github.com/nypublicradio/audiogram.git
```

Now you can run Audiogram in a container using that image:

```sh
docker run -p 8888:8888 -t -i audiogram
```

## AWS installation

If you're trying to run Audiogram on AWS services like Lambda or Elastic Beanstalk that rely on the Amazon Linux distribution, you will probably need to follow the [node-canvas Amazon Linux AMI instructions](https://github.com/Automattic/node-canvas/wiki/Installation---Amazon-Linux-AMI-(EC2)) to install the dependencies and/or package up the resulting binaries.

## Mac troubleshooting

If things aren't working on a Mac, there are a few fixes you can try.

### Brew troubleshooting

Follow the [Homebrew troubleshooting guide](https://github.com/Homebrew/brew/blob/master/share/doc/homebrew/Troubleshooting.md#troubleshooting), particularly making sure that XCode is up to date.

### Updating node-gyp

Updating node-gyp to a current version with:

```sh
npm install -g node-gyp
```

may help with `npm install` errors.

### Updating Node.js

If you get an error about `path.isAbsolute` not being a function, you're running a pretty old version of [Node.js/NPM](https://nodejs.org/). Upgrading to anything later than v0.11.2 should help.

### Installing FFmpeg with the compilation guide

If FFmpeg installation is failing, you can try following the [compilation guide](https://trac.ffmpeg.org/wiki/CompilationGuide).

### Installing node-canvas dependencies manually

You can try installing the node-canvas dependencies with their detailed [Installation instructions](https://github.com/Automattic/node-canvas/wiki/_pages).  You don't need to install `node-canvas` itself, just everything up to that point.

## Linux troubleshooting

### Memory issues

If you're installing Audiogram on a machine with very little memory, like a Digital Ocean micro droplet (512 MB), the `npm install` might fail mysteriously, or when you try to run Audiogram, you get an error message about `/node_modules/waveform/build/Release/waveform` missing because the installation didn't finish.

There are three ways to solve this:

1. Upgrade to something with more memory (1 GB should be enough)

2. Remove `canvas` from the dependencies in `package.json`, run `npm install`, and then install `canvas` separately (it's the memory hog):

```sh
sed -i '/canvas/d' package.json
npm install
npm install git+https://github.com/chearon/node-canvas.git#b62dd3a9fa
```

3. Install clang to reduce npm's memory usage, and reinstall:

```sh
sudo apt-get update
sudo apt-get install clang
export CXX=clang++
npm install --clang=1
```

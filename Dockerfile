FROM ubuntu:16.04

# Install dependencies
RUN apt-get update --yes && apt-get upgrade --yes
RUN apt-get install git nodejs npm \
libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev libpng-dev build-essential g++ \
ffmpeg \
redis-server --yes

RUN ln -s `which nodejs` /usr/bin/node

# Non-privileged user
RUN useradd -m audiogram

WORKDIR /home/audiogram

# Install dependencies
ADD package.json ./
ADD client/index.js ./
RUN npm install

ADD . ./
RUN chown -R audiogram /home/audiogram
USER audiogram

# Clone repo
# RUN git clone https://github.com/prx/audiogram.git
WORKDIR /home/audiogram/audiogram

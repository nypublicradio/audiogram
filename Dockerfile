FROM ubuntu:16.04
RUN apt-get update --yes && apt-get install --yes \
    build-essential \
    ffmpeg \
    g++ \
    git \
    npm \
    nodejs \
    libcairo2-dev \
    libgif-dev \
    libjpeg8-dev \
    libpango1.0-dev \
    libpng-dev \
    redis-server

# Ubuntu Has Conflicting 'node' Command
RUN ln -s $(which nodejs) /usr/bin/node

# Non-privileged user
RUN useradd -m node -d /code -s /bin/bash

COPY . /code
RUN chown -R node: /code

# Install Dependencies
WORKDIR /code
USER node
RUN npm install

FROM ubuntu:16.04

# Install dependencies
RUN apt-get update --yes && apt-get upgrade --yes

RUN apt-get install \
  build-essential \
  ffmpeg \
  git \
  g++ \
  libcairo2-dev \
  libgif-dev \
  libjpeg8-dev \
  libpango1.0-dev \
  libpng-dev \
  make \
  nodejs \
  npm \
  redis-server --yes && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN ln -s `which nodejs` /usr/bin/node

# Clone repo
COPY . /app
WORKDIR /app

# Install dependencies
RUN npm install

CMD ["make"]

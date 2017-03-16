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
  nodejs \
  npm \
  redis-server --yes && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN ln -s `which nodejs` /usr/bin/node

# Non-privileged user
RUN groupadd -r audiogram && useradd -m -r -g audiogram audiogram

# Clone repo
COPY . /home/audiogram/audiogram
WORKDIR /home/audiogram/audiogram

RUN chown -R audiogram /home/audiogram/audiogram

USER audiogram

EXPOSE 8000

RUN npm cache clean

# Install dependencies
RUN npm install

CMD ["npm", "run", "all"]

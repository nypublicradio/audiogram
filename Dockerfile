FROM node:7
# FROM ubuntu:16.04

RUN echo "deb [check-valid-until=no] http://cdn-fastly.deb.debian.org/debian jessie main" > /etc/apt/sources.list.d/jessie.list
RUN echo "deb [check-valid-until=no] http://archive.debian.org/debian jessie-backports main" > /etc/apt/sources.list.d/jessie-backports.list
RUN sed -i '/deb http:\/\/deb.debian.org\/debian jessie-updates main/d' /etc/apt/sources.list
RUN apt-get -o Acquire::Check-Valid-Until=false update

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN apt-get -o Acquire::Check-Valid-Until=false update -y && apt-get upgrade -y && \
  apt-get install -y nodejs npm libcairo2-dev libjpeg62-turbo-dev libpango1.0-dev libgif-dev libpng-dev build-essential g++ ffmpeg
COPY package.json* yarn.lock* .npmrc* /usr/src/app/
RUN npm install --production

COPY ./ /usr/src/app/

EXPOSE 8888
CMD [ "npm", "start" ]

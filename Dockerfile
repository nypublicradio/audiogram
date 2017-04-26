FROM node:7
# FROM ubuntu:16.04

RUN echo 'deb http://ftp.debian.org/debian jessie-backports main' >> /etc/apt/sources.list

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN apt-get update -y && apt-get upgrade -y && \
    apt-get install -y nodejs npm libcairo2-dev libjpeg62-turbo-dev libpango1.0-dev libgif-dev libpng-dev build-essential g++ ffmpeg
COPY ./ /usr/src/app/
RUN npm install --production

EXPOSE 8888
CMD [ "npm", "start" ]

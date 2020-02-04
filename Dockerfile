FROM alpine

RUN apk add --no-cache \
	git \
	nodejs \
	npm \
	cairo-dev \
	jpeg-dev \
	pango-dev \
	giflib-dev \
	libpng-dev \
	g++ \
	make \
	autoconf \
	ffmpeg \
	redis

RUN adduser -D --home=/home/audiogram audiogram
USER audiogram
WORKDIR /home/audiogram

# Clone repo
RUN git clone https://github.com/newscorp-ghfb/audiogram.git
WORKDIR /home/audiogram/audiogram

# Install dependencies
RUN npm install

FROM ubuntu:16.04

# Install dependencies
RUN apt-get --yes update && \
    apt-get --yes upgrade
RUN apt-get --yes install git \
                          nodejs \
                          npm \
                          libcairo2-dev \
                          libjpeg8-dev \
                          libpango1.0-dev \
                          libgif-dev \
                          libpng-dev \
                          build-essential \
                          g++ \
                          ffmpeg \
                          redis-server

RUN update-alternatives --install /usr/bin/node node $(which nodejs) 50

# Non-privileged user
ARG UID=1000
RUN useradd --create-home \
            --no-log-init \
            --shell /bin/false \
            --uid $UID \
            audiogram
USER audiogram
WORKDIR /home/audiogram

# Clone repo
RUN : breakcache0
RUN git clone https://github.com/qrkourier/audiogram.git
WORKDIR /home/audiogram/audiogram
#VOLUME /home/audiogram/audiogram

# Install dependencies
RUN npm install
CMD npm start

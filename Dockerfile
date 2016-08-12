FROM ubuntu:14.04 
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get -y install nodejs
ADD . /hyperterm
VOLUME /hyperterm/dist
WORKDIR /hyperterm
RUN npm install
ENTRYPOINT npm run pack

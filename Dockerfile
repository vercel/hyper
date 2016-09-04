FROM ubuntu:14.04 
RUN apt-get update
RUN apt-get install -y curl software-properties-common build-essential git
RUN sudo add-apt-repository ppa:fkrull/deadsnakes && \
    sudo apt-get update && \
    sudo apt-get install -y python2.7 && \
    ln -s /usr/bin/python2.7 /usr/bin/python
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash - && \
    apt-get -y install nodejs
ADD . /hyperterm
VOLUME /hyperterm/dist
WORKDIR /hyperterm
RUN npm install
ENTRYPOINT npm run pack

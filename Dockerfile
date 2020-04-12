FROM land007/ubuntu-node-min:latest

MAINTAINER Yiqiu Jia <yiqiujia@hotmail.com>

RUN rm /node_/node_modules
ADD node/package.json /node_/package.json
RUN cd /node_ && npm install && mkdir static
ADD node/websocket.js /node_/server.js
ADD node/static /node_/static
#ADD node/start.sh /start.sh
#RUN chmod +x /start.sh
ADD node/cert /node_/cert
#RUN echo "/check.sh /node/cert" >> /task.sh

EXPOSE 443

ENV SERVICE_REGION=westus\
	SUBSCRIPTION_KEY=6e83631f53fb4a07b0cde7cf8fab0b26\
	DOMAIN_NAME=voice.qhkly.com

#RUN echo "/check.sh /node" >> /start.sh
#date 需处理
#加一个自增序号
#日志需处理
#任务需处理

#> docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/speech --push .
#docker build -t land007/speech:latest .
#docker run -it --rm --name speech --privileged -v ~/docker/speech:/node -p 443:443 -e "DOMAIN_NAME=voice.qhkly.com" -e "SERVICE_REGION=westus" -e "SUBSCRIPTION_KEY=6e83631f53fb4a07b0cde7cf8fab0b26" land007/speech:latest
#docker run -it --restart always --name speech --privileged -v ~/docker/speech:/node -p 443:443 -e "DOMAIN_NAME=voice.qhkly.com" -e "SERVICE_REGION=westus" -e "SUBSCRIPTION_KEY=6e83631f53fb4a07b0cde7cf8fab0b26" land007/speech:latest
#docker kill watchtower ; docker rm watchtower ; docker run -d --name watchtower -v /var/run/docker.sock:/var/run/docker.sock -v ~/.docker/config.json:/config.json v2tec/watchtower --interval 30 --label-enable
#docker pull land007/speech:latest; rm -rf ~/docker/speech; docker rm -f speech ; docker run -it --restart always --privileged -e "DOMAIN_NAME=voice.qhkly.com" --label=com.centurylinklabs.watchtower.enable=true -v ~/docker/speech:/node -p 1443:443 -e "SERVICE_REGION=westus" -e "SUBSCRIPTION_KEY=6e83631f53fb4a07b0cde7cf8fab0b26" --name speech --log-opt max-size=1m --log-opt max-file=1 land007/speech:latest

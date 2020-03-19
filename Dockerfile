FROM land007/ubuntu-node-min:latest

MAINTAINER Yiqiu Jia <yiqiujia@hotmail.com>

RUN rm /node_/node_modules
ADD node/package.json /node_/package.json
RUN cd /node_ && npm install
ADD node/websocket.js /node_/server.js
#ADD node/start.sh /start.sh
#RUN chmod +x /start.sh

EXPOSE 80

ENV PIPEMAX=20\
	PAGEMAX=8


#RUN echo "/check.sh /node" >> /start.sh
#date 需处理
#加一个自增序号
#日志需处理
#任务需处理

#> docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/speech --push .
#docker build -t land007/speech:latest .
#docker run -it --rm -e "TIMER=10" -e "MAXTIME=1" land007/speech:latest
#docker run -it --restart always --privileged -v ~/docker/node-home-agent:/node -p 80:80  -e "TIMER=30" -e "MAXTIME=40" land007/speech:latest
#docker run -it --restart always --name node-home-agent --privileged -v ~/docker/node-home-agent:/node -e "TIMER=30" -e "MAXTIME=30" land007/speech:latest
#docker kill watchtower ; docker rm watchtower ; docker run -d --name watchtower -v /var/run/docker.sock:/var/run/docker.sock -v ~/.docker/config.json:/config.json v2tec/watchtower --interval 30 --label-enable
#docker pull land007/speech:latest; rm -rf ~/docker/node-home-agent; docker rm -f node-home-agent ; docker run -it --restart always --privileged --label=com.centurylinklabs.watchtower.enable=true -v ~/docker/node-home-agent:/node -p 22280:80 -e "TIMER=30" -e "MAXTIME=30" --name node-home-agent --log-opt max-size=1m --log-opt max-file=1 land007/speech:latest

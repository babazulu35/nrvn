FROM node:9
ENV HOME=/usr/src
WORKDIR ${HOME}
EXPOSE 4200
COPY package.json ${HOME}
RUN npm install && \ 
	npm cache clean --force
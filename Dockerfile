FROM node:10.16.0

ENV HOME=/home/node

WORKDIR $HOME/app

COPY package.json package-lock.json ${HOME}/app/

RUN npm install

COPY . $HOME/app

EXPOSE 8888

CMD ["npm", "start"]

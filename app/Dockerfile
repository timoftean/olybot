FROM node:9

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i -g npm@latest
RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
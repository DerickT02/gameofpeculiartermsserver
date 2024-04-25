FROM node:21-alpine

WORKDIR /app

ADD . .

RUN npm install

CMD ["npm", "start"]

EXPOSE 3001
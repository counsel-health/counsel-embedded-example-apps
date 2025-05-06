FROM node:23

WORKDIR /workdir

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 4003

CMD ["npm", "start"]


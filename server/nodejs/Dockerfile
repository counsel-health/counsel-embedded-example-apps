FROM node:24-alpine

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /workdir

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 4003

CMD ["npm", "start"]


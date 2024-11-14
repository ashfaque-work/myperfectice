# Use Ubuntu as the development image
FROM node:22-bullseye AS development

# Update package list and install necessary packages
RUN apt-get update && \
    apt-get install -y build-essential python3 python3-pip net-tools iputils-ping iproute2 curl

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install mediasoup httpolyglot

COPY nest-cli.json tsconfig.json ./

WORKDIR /usr/src/app/apps/video-streaming

COPY apps/video-streaming/src ./src
COPY apps/video-streaming/test ./test
COPY apps/video-streaming/tsconfig.app.json ./tsconfig.app.json
COPY apps/video-streaming/.env ./.env
COPY apps/video-streaming/ssl ./ssl

WORKDIR /usr/src/app

CMD ["npm", "run", "start:dev", "video-streaming"]


# Use Ubuntu as the production image
FROM node:22-bullseye AS production

# Update package list and install necessary packages
RUN apt-get update && \
    apt-get install -y build-essential python3 python3-pip net-tools iputils-ping iproute2 curl

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install mediasoup httpolyglot

COPY nest-cli.json tsconfig.json ./

WORKDIR /usr/src/app/apps/video-streaming

COPY apps/video-streaming/src ./src
COPY apps/video-streaming/test ./test
COPY apps/video-streaming/tsconfig.app.json ./tsconfig.app.json
COPY apps/video-streaming/.env ./.env
COPY apps/video-streaming/ssl ./ssl

WORKDIR /usr/src/app

CMD ["npm", "run", "start:dev", "video-streaming"]

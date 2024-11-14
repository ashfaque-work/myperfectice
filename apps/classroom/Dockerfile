# Stage 1: Base Dependencies
FROM node:18-alpine AS base

# Create and set the working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json from the root of the project
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy common configuration files
COPY nest-cli.json tsconfig.json ./

# Copy the libs directory from the root of the project to the Docker image
COPY libs ./libs

# Copy the proto directory if necessary
COPY proto ./proto

# Stage 2: Build the application (for production)
FROM node:18-alpine AS build

# Create and set the working directory
WORKDIR /usr/src/app

# Copy the dependencies and configuration from the base stage
COPY --from=base /usr/src/app /usr/src/app

# Set the working directory to the service directory
WORKDIR /usr/src/app/apps/classroom

# Copy the microservice-specific source code
COPY apps/classroom/src ./src
COPY apps/classroom/test ./test
COPY apps/classroom/tsconfig.app.json ./tsconfig.app.json

WORKDIR /usr/src/app

# Build the application
RUN npm run build classroom

# Stage 3: Development Image
FROM node:18-alpine AS development

# Create and set the working directory
WORKDIR /usr/src/app

# Copy the dependencies from the base stage
COPY --from=base /usr/src/app /usr/src/app

# Set the working directory to the service directory
WORKDIR /usr/src/app/apps/classroom

# Copy the microservice-specific source code
COPY apps/classroom/src ./src
COPY apps/classroom/test ./test
COPY apps/classroom/tsconfig.app.json ./tsconfig.app.json
COPY apps/classroom/.env ./.env

# Define the command to run the app in development mode
CMD ["npm", "run", "start:dev", "classroom"]

# Stage 4: Production Image
FROM node:18-alpine AS production

# Create and set the working directory
WORKDIR /usr/src/app

# Copy the dependencies from the base stage
COPY --from=base /usr/src/app/node_modules ./node_modules

# Copy the built application from the build stage
COPY --from=build /usr/src/app/dist/apps/classroom ./dist/apps/classroom

# Copy necessary configuration files
COPY apps/classroom/tsconfig.app.json ./apps/classroom/tsconfig.app.json
COPY apps/classroom/.env ./apps/classroom/.env

# Copy common configuration files
COPY nest-cli.json tsconfig.json ./
COPY libs ./libs
COPY proto ./proto

# Set the working directory to the service directory
WORKDIR /usr/src/app

# Define the command to run the app in production mode
CMD ["node", "dist/apps/classroom/main.js"]

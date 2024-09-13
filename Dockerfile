# Used to build the bun image
FROM oven/bun:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY bun.lockb ./

RUN bun install

# Bundle app source
COPY src ./

# Expose the port
ENV PORT=80
EXPOSE 80

# Start the app
CMD [ "bun", "./index.ts" ]
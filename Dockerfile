FROM oven/bun:alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY bun.lockb ./
COPY package*.json ./
RUN bun install -p

# Bundle app source
COPY . .

# Expose the port
ENV PORT=80
EXPOSE 80

# Start the app
CMD [ "bun", "run", "./src/index.ts" ]

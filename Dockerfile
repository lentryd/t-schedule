FROM node:alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .
RUN npm run build

FROM node:alpine AS relies

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install && npm cache clean --force

# Bundle app source
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port
ENV PORT=80
EXPOSE 80

# Start the app
CMD [ "node", "./dist/index.js" ]

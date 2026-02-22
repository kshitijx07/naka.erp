# Use Node.js 20 Lts Alpine for a small footprint
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Specify character encoding just in case
ENV LANG C.UTF-8

# Start the server
CMD [ "npm", "start" ]

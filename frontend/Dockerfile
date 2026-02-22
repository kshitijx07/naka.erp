# Use Node.js 20 Lts Alpine
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose Vite port
EXPOSE 5173

# Run Vite with --host to allow external access within Docker
CMD ["npm", "run", "dev", "--", "--host"]

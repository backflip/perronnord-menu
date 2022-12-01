FROM node:18-slim

# Set up working directory
WORKDIR /usr/src/app

# Set up environment
ENV HTTP_PORT=8080
ENV HTTP_ADDRESS=0.0.0.0

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application
COPY . .

# Start
CMD [ "node", "bin/serve" ]

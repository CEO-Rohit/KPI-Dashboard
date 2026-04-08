# Use Node.js 20 Lts Alpine for a small footprint
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose the API port
EXPOSE 3001

# Start the application
CMD ["node", "src/server.js"]

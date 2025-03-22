FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY src/ ./src/
COPY public/ ./public/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "src/server.js"]
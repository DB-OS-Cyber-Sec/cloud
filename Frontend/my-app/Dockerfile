# Base image
FROM node:18-alpine

# Install necessary dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json only (for caching node_modules)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all files into the container (in combination with volume mounts)
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the app in development mode
CMD ["npm", "run", "dev"]

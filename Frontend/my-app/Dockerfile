# Use Node.js LTS version
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./


# Set NODE_ENV to development to include dev dependencies
ENV NODE_ENV=development

# Install all dependencies, including dev dependencies
RUN npm install

# Install nodemon, ts-node, and typescript globally for convenience
RUN npm install -g nodemon ts-node typescript next


# Copy the rest of the application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the Fastify server in development mode using nodemon
# CMD ["next", "dev"]
CMD ["npm", "run", "dev"]

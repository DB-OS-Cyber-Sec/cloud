# Use Node.js LTS version
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install 

# Install nodemon, ts-node, and typescript globally for development convenience
RUN npm install -g nodemon ts-node typescript next tailwindcss postcss autoprefixer

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port Fastify/Next.js will be using
EXPOSE 3000

# Use NODE_ENV for better control over environment
ENV NODE_ENV=production

# Start the Fastify or Next.js server
CMD ["npm", "run", "start"]
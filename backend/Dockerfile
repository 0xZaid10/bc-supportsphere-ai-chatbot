# Use an official Node.js runtime as a parent image
# Stage 1: Build the TypeScript code
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies, including devDependencies for building
RUN npm install

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript
# The tsconfig.json specifies the output directory as 'dist'
RUN npx tsc --skipLibCheck --noEmitOnError false || true
RUN npx tsc --skipLibCheck

# Stage 2: Create the production image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the compiled code from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the database schema file needed at runtime
COPY --from=builder /app/src/db/schema.sql ./src/db/schema.sql

# Expose the port the app runs on
EXPOSE 3000

# Set the environment to production
ENV NODE_ENV=production

# Define the command to run the application
CMD ["node", "dist/index.js"]
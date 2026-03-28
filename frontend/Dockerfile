# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock, etc.)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy the built static files from the build stage to the Nginx server
COPY --from=build /app/dist /usr/share/nginx/html

# For Single Page Applications (SPAs), you need to configure Nginx to redirect
# all traffic to index.html to handle client-side routing.
# Create a custom nginx configuration.
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
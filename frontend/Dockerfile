# -----------------------------------
# Stage 1: Build the React Application
# -----------------------------------
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Vite application for production
# Ensure that your production backend URL is configured.
# By default, axios calls will go to http://localhost:5000 based on standard setup
RUN npm run build

# -----------------------------------
# Stage 2: Serve with Nginx
# -----------------------------------
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built React app from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration to handle React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

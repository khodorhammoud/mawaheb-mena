FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY keystone.ts ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start the CMS
CMD ["npm", "start"] 
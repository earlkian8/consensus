FROM node:24-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run Vite with --host to allow external access
CMD ["npm", "run", "dev", "--", "--host"]

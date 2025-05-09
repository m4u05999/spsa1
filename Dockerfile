FROM node:18-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy project files
COPY . .

# Build the app
RUN pnpm run build

# Expose port
EXPOSE 5173

# Start the app
CMD ["pnpm", "run", "dev", "--host"]
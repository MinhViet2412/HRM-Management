FROM node:18-alpine

WORKDIR /app

# Install dumb-init, wget, Python and build tools for native modules
RUN apk add --no-cache dumb-init wget python3 make g++ py3-pip

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm install

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# Create uploads directory
RUN mkdir -p uploads && chown nestjs:nodejs uploads

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/docs || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]

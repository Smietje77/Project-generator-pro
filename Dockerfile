FROM node:20-alpine

# Install bash and git for debugging and GitHub operations
RUN apk add --no-cache bash git

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Accept build-time argument for API key
ARG ANTHROPIC_API_KEY
ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

# Build Astro app with environment variable available
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "./dist/server/entry.mjs"]

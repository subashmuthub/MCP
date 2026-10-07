FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --retries=3 CMD wget -qO- http://localhost:4000/health || exit 1
USER node
CMD ["node", "src/server.js"]
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
CMD ["node", "src/server.js"]
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src

EXPOSE 4000

CMD ["npm", "start"]

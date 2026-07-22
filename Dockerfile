FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build:next

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    MONGODB_URI=mongodb://mongo:27017/open_date \
    MONGODB_DATABASE=open_date \
    AUTH_SECRET=open-date-local-secret-change-in-production \
    SESSION_COOKIE_NAME=open_date_session \
    NEXT_PUBLIC_APP_URL=http://localhost:3000 \
    ADMIN_EMAIL_DOMAIN=ismola.dev \
    MAX_UPLOAD_MB=8
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["npm", "run", "start:next"]

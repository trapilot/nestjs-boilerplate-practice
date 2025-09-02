# Base node image
FROM node:22-alpine AS base
RUN apk add --no-cache openssl \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs
ENV HTTP_HOST=0.0.0.0 \
  APP_PATH=/app/dist \
  ROOT_PATH=/app
WORKDIR /app


# Install node_modules, including dev dependencies
FROM base AS build-deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive


# Install node_modules, excluding dev dependencies
FROM base AS production-deps
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile --non-interactive


# Build the app
FROM base AS build
COPY --from=build-deps /app/node_modules /app/node_modules
COPY . .
RUN yarn build
RUN yarn bundle \
  && cp /app/node_modules/swagger-ui-dist/swagger-ui.css /app/dist \
  && cp /app/node_modules/swagger-ui-dist/swagger-ui-bundle.js /app/dist \
  && cp /app/node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js /app/dist \
  && cp /app/node_modules/swagger-ui-dist/favicon-32x32.png /app/dist \
  && cp /app/node_modules/swagger-ui-dist/favicon-16x16.png /app/dist


# Finally, build the production image with minimal footprint
FROM base
ENV NODE_ENV=production
ARG APP_ENV=production
# COPY --from=production-deps --chown=nestjs:nodejs /app/node_modules /app/node_modules
COPY --from=build --chown=nestjs:nodejs /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build --chown=nestjs:nodejs /app/dist /app/dist
COPY --from=build --chown=nestjs:nodejs /app/prisma /app/prisma
COPY --from=build --chown=nestjs:nodejs /app/package.json /app/package.json
COPY --from=build --chown=nestjs:nodejs /app/start.sh /app/start.sh
USER nestjs
RUN chmod +x /app/*.sh
EXPOSE 3000
ENTRYPOINT [ "./start.sh" ]

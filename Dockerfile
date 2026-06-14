FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app

# Установка зависимостей
FROM base AS install
RUN mkdir -p /temp/dev /temp/prod
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Сборка приложения
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN bun run build

# Финальный образ
FROM base AS release
COPY --from=prerelease /usr/src/app/dist ./dist
ENV PORT=80
EXPOSE 80
CMD ["bun", "dist/index.js"]

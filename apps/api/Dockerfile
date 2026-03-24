FROM node:22-bookworm-slim AS deps
WORKDIR /workspace

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json tsconfig.base.json prisma.config.ts ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY prisma prisma

RUN npm ci

FROM deps AS build
WORKDIR /workspace

COPY generated generated
COPY apps/api apps/api

RUN npm run db:generate
RUN npm run build --workspace @notewebside/api

FROM node:22-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=deps /workspace/node_modules /node_modules
COPY --from=build /workspace/generated /generated
COPY --from=build /workspace/apps/api/dist ./dist
COPY --from=build /workspace/apps/api/package.json ./package.json

EXPOSE 4000

CMD ["node", "dist/main.js"]

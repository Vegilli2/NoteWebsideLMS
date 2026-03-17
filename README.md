# NoteWebside LMS

Monorepo-grunnmur for en moderne LMS-plattform som skal erstatte Moodle for salg og levering av norskkurs.

## Struktur

- `apps/web`: Next.js-app for offentlig nettside og læringsportal
- `apps/api`: NestJS-basert API for commerce, innhold, progresjon og admin
- `prisma/schema.prisma`: første datamodell for LMS-domener
- `docs/lms-platform-spec.md`: løsningsspesifikasjon og faseplan
- `FirebaseAdminSDKKey/`: lokal service account for Firebase Admin SDK, kun for test og skal ikke committes

## Teknologivalg

- `Next.js 16`
- `React 19`
- `NestJS 11`
- `TypeScript 5.9`
- `Prisma 7`
- `PostgreSQL`

## Kom i gang

1. Installer avhengigheter:

```bash
npm install
```

2. Kopier miljøvariabler:

```bash
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

3. Generer Prisma-klient:

```bash
npm run db:generate
```

4. Start web og API:

```bash
npm run dev
```

## Nyttige kommandoer

```bash
npm run build
npm run typecheck
npm run db:validate
npm run db:push
```

## Deploy

Cloud Run-oppsett for staging/prod er dokumentert i [docs/deploy-cloud-run.md](/Users/vegillito/Documents/NoteWebsideLMS/docs/deploy-cloud-run.md).

Repoet inkluderer nå:

- `apps/web/Dockerfile`
- `apps/api/Dockerfile`
- `apps/web/.env.production.example`
- `apps/api/.env.production.example`

## Første leveranse

Dette oppsettet inkluderer:

- offentlig landing page og portal-shell
- modulær API-struktur med `health`, `catalog` og `identity`
- første Prisma-modell for brukere, kurs, pakker, ordre, entitlements og forsøk
- Firebase web client i `apps/web/lib/firebase-client.ts`
- Firebase Admin SDK i `apps/api/src/firebase/firebase-admin.ts`
- miljøoppsett og README for lokal utvikling

## Firebase lokal test

1. Aktiver `Email/Password` i Firebase Authentication.
2. Legg til `localhost` under autoriserte domener i Firebase Authentication.
3. Start appene med:

```bash
npm run dev
```

4. Test webklienten på:

```text
http://localhost:3000/login
```

5. Test at Admin SDK er koblet riktig på:

```text
http://localhost:4000/api/v1/identity/firebase-status
```

6. Etter Firebase-login på `/login`, brukes disse auth-endepunktene:

```text
POST http://localhost:4000/api/v1/auth/session
GET  http://localhost:4000/api/v1/auth/me
POST http://localhost:4000/api/v1/auth/logout
```

## Lokal bruker-sync med Prisma

- Ved `POST /auth/session` forsøker API-et å finne eller opprette en lokal `User` i Prisma.
- Hvis PostgreSQL ikke kjører lokalt ennå, fortsetter Firebase-session å fungere, men responsen markerer lokal bruker-sync som `skipped`.
- Når databasen er oppe, vil samme login-flyt opprette eller oppdatere lokal LMS-bruker automatisk.
- Når du starter lokal PostgreSQL, kjør `npm run db:push` før du tester lokal bruker-sync på nytt.

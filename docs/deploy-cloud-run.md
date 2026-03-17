# Deploy til Cloud Run

Dette repoet er nå klargjort for en todelt deploy:

- `apps/web` til Cloud Run
- `apps/api` til Cloud Run
- `Cloud SQL for PostgreSQL` som delt database
- `Firebase Auth` beholdes som auth-leverandør

## Hvorfor samme domene er viktig

Denne appen bruker en `HttpOnly` session cookie som settes av API-et og leses av webappen. Derfor bør web og API ligge bak samme domene:

- `https://staging.example.no`
- `https://staging.example.no/api/v1/*`

Hvis web og API bare ligger på hver sin `run.app`-URL, vil auth-cookien ikke oppføre seg som ønsket i hele portalen.

Anbefalt produksjonsmodell er derfor:

- Cloud Run service `notev2-web-staging`
- Cloud Run service `notev2-api-staging`
- HTTPS Load Balancer med path routing:
  - `/api/*` -> API
  - alt annet -> web

## Før du deployer

1. Roter databasepassordet du delte i chatten.
2. Legg produksjons- eller staging-domenet inn i Firebase Authentication -> Authorized domains.
3. Sørg for at Cloud SQL-instansen er klar:
   - project id: `notev2-ba7a2`
   - connection name: `notev2-ba7a2:europe-north1:notev2-postgres`
   - database: `notewebside_lms`

## Secrets som bør opprettes

Anbefalte Secret Manager-navn for staging:

- `notev2-api-database-url-staging`
- `notev2-firebase-admin-json-staging`

Offentlige Firebase web-verdier trenger ikke Secret Manager. De kan settes som vanlige miljøvariabler på webtjenesten.

## DATABASE_URL for Cloud Run + Cloud SQL

Cloud Run kobles til Cloud SQL via Unix socket. Da skal `DATABASE_URL` se slik ut:

```env
postgresql://DB_USER:URL_ENCODED_PASSWORD@localhost/notewebside_lms?host=/cloudsql/notev2-ba7a2:europe-north1:notev2-postgres&schema=public
```

Eksempel:

```env
postgresql://Vegillito:Johan%2123@localhost/notewebside_lms?host=/cloudsql/notev2-ba7a2:europe-north1:notev2-postgres&schema=public
```

Bytt passordet først. `!` må URL-encodes som `%21`.

## Artifact Registry

Opprett først en Docker-repo i Artifact Registry:

```bash
gcloud artifacts repositories create notev2-containers \
  --project notev2-ba7a2 \
  --repository-format=docker \
  --location=europe-north1 \
  --description="Container images for NoteV2 staging"
```

## Build API image

```bash
gcloud builds submit \
  --project notev2-ba7a2 \
  --region europe-north1 \
  --config cloudbuild.api.yaml \
  --substitutions _IMAGE=europe-north1-docker.pkg.dev/notev2-ba7a2/notev2-containers/notev2-api-staging:latest \
  .
```

## Deploy API

```bash
gcloud run deploy notev2-api-staging \
  --project notev2-ba7a2 \
  --region europe-north1 \
  --image europe-north1-docker.pkg.dev/notev2-ba7a2/notev2-containers/notev2-api-staging:latest \
  --allow-unauthenticated \
  --port 4000 \
  --add-cloudsql-instances notev2-ba7a2:europe-north1:notev2-postgres \
  --set-env-vars NODE_ENV=production,FIREBASE_PROJECT_ID=notev2-ba7a2,FIREBASE_SESSION_COOKIE_NAME=notewebside_session,FIREBASE_SESSION_MAX_AGE_MS=432000000 \
  --set-secrets DATABASE_URL=notev2-api-database-url-staging:latest,FIREBASE_ADMIN_CREDENTIALS_JSON=notev2-firebase-admin-json-staging:latest
```

## Build web image

```bash
gcloud builds submit \
  --project notev2-ba7a2 \
  --region europe-north1 \
  --config cloudbuild.web.yaml \
  --substitutions _IMAGE=europe-north1-docker.pkg.dev/notev2-ba7a2/notev2-containers/notev2-web-staging:latest \
  .
```

## Deploy web

For staging uten ferdig lastbalansering kan du midlertidig sette `NEXT_PUBLIC_API_BASE_URL` til API-URL-en. Det er nok til enkel funksjonstest, men ikke den endelige cookie-modellen.

Når load balancer og domene er klart, bruk:

```env
NEXT_PUBLIC_API_BASE_URL=https://staging.example.no/api/v1
```

Eksempelkommando:

```bash
gcloud run deploy notev2-web-staging \
  --project notev2-ba7a2 \
  --region europe-north1 \
  --image europe-north1-docker.pkg.dev/notev2-ba7a2/notev2-containers/notev2-web-staging:latest \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars NODE_ENV=production,NEXT_PUBLIC_API_BASE_URL=https://staging.example.no/api/v1,NEXT_PUBLIC_FIREBASE_API_KEY=replace-me,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=notev2-ba7a2.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=notev2-ba7a2,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=notev2-ba7a2.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=203180598613,NEXT_PUBLIC_FIREBASE_APP_ID=1:203180598613:web:babddf9781dc63d5fcfbdc
```

## Database schema i Cloud SQL

Før første produksjonsbruk må schema pushes til Cloud SQL.

Den ryddigste måten er å gjøre dette fra en kontrollert maskin med riktig `DATABASE_URL` satt midlertidig:

```bash
DATABASE_URL="postgresql://DB_USER:URL_ENCODED_PASSWORD@PUBLIC_HOST:5432/notewebside_lms?schema=public" npm run db:push
```

For et mer robust produksjonsløp bør dette senere flyttes til Prisma migrations og en egen deployjobb.

## Etter deploy

1. Verifiser API:

```text
https://API_URL/api/v1/health
https://API_URL/api/v1/identity/firebase-status
```

2. Verifiser web:

```text
https://WEB_URL/login
https://WEB_URL/profile
https://WEB_URL/portal
```

3. Når domene er satt opp:
   - legg domenet inn i Firebase Authorized domains
   - oppdater `NEXT_PUBLIC_API_BASE_URL`
   - bekreft at session-cookie fungerer på tvers av portalrutene

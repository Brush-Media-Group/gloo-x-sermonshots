# Development Setup

1. Install dependencies with `pnpm install`
2. Copy the `.env.sample` file to `.env` and fill in the required environment variables
3. Start containers with `docker-compose up -d`. This will start a Postgres database and a ChromaDB instance.
4. Run database migrations with `pnpm db:migrate`
5. Start the development server with `pnpm start:dev`

## Test transcribing a video fetched from sermonshots API

```bash
./scripts/transcribevideos.sh <accessToken> <page> <limit>
```

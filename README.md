# TakboHub

Running Events Management Platform for the Philippines.

TakboHub lets race organizers create events, collect payments, and manage participants — while giving runners a seamless registration experience with local payment options (GCash, Maya, Card, Bank Transfer, Cash).

## Tech Stack

| Layer        | Technology                                                                        |
| ------------ | --------------------------------------------------------------------------------- |
| Frontend     | React 19, Vite, TanStack Router, TanStack Query, Zustand, Tailwind CSS, shadcn/ui |
| Backend      | NestJS 11, Prisma 6, PostgreSQL 16                                                |
| Cache/Queue  | Redis 7, BullMQ                                                                   |
| File Storage | MinIO (dev) / S3 (prod)                                                           |
| Payments     | PayMongo (GCash, Maya, Cards)                                                     |
| Email        | Resend (prod) / Mailpit (dev)                                                     |

## Project Structure

```
takbohub-ph/
├── apps/
│   ├── web/                 # React frontend
│   │   └── src/
│   │       ├── components/  # UI components
│   │       ├── features/    # Feature modules
│   │       ├── routes/      # TanStack Router pages
│   │       ├── lib/         # Utilities, API client
│   │       └── stores/      # Zustand stores
│   └── api/                 # NestJS backend
│       ├── src/
│       │   ├── modules/     # Feature modules
│       │   └── prisma/      # Prisma service
│       └── prisma/
│           └── schema.prisma
├── packages/
│   └── shared/              # Shared types & Zod schemas
└── docker-compose.yml       # Local dev services
```

## Prerequisites

- Node.js 22+
- pnpm 9+
- Docker & Docker Compose

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd takbohub-ph
pnpm install
```

### 2. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
```

### 3. Start Docker services

```bash
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- MinIO on `localhost:9000` (console: `localhost:9001`)
- Mailpit on `localhost:8025` (SMTP: `localhost:1025`)

### 4. Run database migrations

```bash
pnpm db:migrate:dev --name init
```

### 5. Seed the database (optional)

```bash
pnpm db:seed
```

Test accounts after seeding:

- Admin: `admin@takbohub.ph` / `admin123`
- Organizer: `organizer@takbohub.ph` / `organizer123`
- Runner: `runner@example.com` / `runner123`

### 6. Start development servers

```bash
# Start both frontend and backend
pnpm dev

# Or separately
pnpm dev:web    # Frontend on http://localhost:5173
pnpm dev:api    # Backend on http://localhost:3000
```

## Available Scripts

| Command               | Description               |
| --------------------- | ------------------------- |
| `pnpm dev`            | Start all dev servers     |
| `pnpm dev:web`        | Start frontend only       |
| `pnpm dev:api`        | Start backend only        |
| `pnpm build`          | Build all packages        |
| `pnpm lint`           | Run ESLint                |
| `pnpm typecheck`      | Run TypeScript checks     |
| `pnpm db:migrate:dev` | Create and run migrations |
| `pnpm db:seed`        | Seed database             |
| `pnpm db:studio`      | Open Prisma Studio        |

## API Documentation

When running the API, Swagger docs are available at:

- http://localhost:3000/api/docs

## Services URLs (Development)

| Service       | URL                            |
| ------------- | ------------------------------ |
| Frontend      | http://localhost:5173          |
| API           | http://localhost:3000/api/v1   |
| API Docs      | http://localhost:3000/api/docs |
| Mailpit       | http://localhost:8025          |
| MinIO Console | http://localhost:9001          |
| Prisma Studio | `pnpm db:studio`               |

## License

Private - All rights reserved.

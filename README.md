# InboxIQ

InboxIQ is a full-stack foundation for an **AI-powered social inbox**: a workspace where customer conversations from different channels can eventually be brought together, classified, and assisted with AI.

The repository is structured as a production-style TypeScript monorepo rather than a single Next.js application. It separates the web client, backend API, shared UI/configuration, and project documentation.

## Current architecture

- **Web:** Next.js 15 + React 19 + TypeScript
- **API:** NestJS 11
- **Database layer:** Prisma
- **Authentication / backend services:** Supabase
- **Validation:** Zod, class-validator
- **Styling:** Tailwind CSS + Radix UI
- **Monorepo:** Turborepo + npm workspaces
- **Testing:** Jest / Supertest on the API

## What is currently in the repository

- Authentication flows and protected application routes
- An inbox-oriented web application structure
- NestJS backend structure with authentication and user modules
- Prisma integration for the backend data layer
- Supabase integration
- Shared UI, TypeScript, and ESLint packages
- Separate documentation app
- A project plan describing the planned multi-channel and AI capabilities

## Repository structure

```text
apps/
  web/       Next.js frontend
  api/       NestJS backend
  docs/      Documentation site

packages/
  ui/        Shared UI components
  eslint-config/
  typescript-config/

project-plan.md
turbo.json
```

## Getting started

Install dependencies:

```bash
npm install
```

Run the monorepo in development:

```bash
npm run dev
```

Run the main quality checks:

```bash
npm run lint
npm run check-types
npm run build
```

Environment-specific credentials should be provided through the repository's `.env.example` files.

## Status

InboxIQ is an **active MVP foundation**, not a finished SaaS product. The repository is intentionally documented around what is implemented today while keeping the longer-term multi-channel AI inbox roadmap in `project-plan.md`.

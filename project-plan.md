# 🚀 Technical Implementation Plan — AI-Powered Social Inbox MVP (with Prisma)

---

### 1. Project Setup & Foundational Components (Week 1)

This week focuses on setting up the core project structure, authentication, and database, with Prisma integrated.

#### 1.1 Turborepo Initialization & Configuration

* **Action:** Create a new **Turborepo monorepo**.
* **Command:** `npx create-turbo@latest --template=pnpm` (or `npm`/`yarn` based on your preference).
* **Structure:**
    * `apps/web`: Your **Next.js** frontend application.
    * `apps/api`: Your **NestJS** backend application.
    * `packages/lib-ai`: A shared utility library for AI generation and classification.
    * `packages/lib-api`: A shared library for **DTOs** (Data Transfer Objects) and API clients.
    * `packages/config`: A shared package for **TypeScript**, **ESLint**, and **Prettier** configurations.
    * **New:** Consider adding a `packages/db` for a shared Prisma client and schema, though for MVP, keeping it in `apps/api` is fine.
* **Configuration:**
    * `turbo.json`: Define pipelines for common tasks like `build`, `dev`, `lint`, and `test`.
    * `tsconfig.json` (root and per-package): Configure TypeScript paths and compiler options.
    * `eslint.config.js` (root): Extend shared configs from `packages/config` for consistent linting.

#### 1.2 Supabase & Prisma Setup

Set up Supabase as your database, and integrate Prisma as your ORM.

* **Action:** Create a new **Supabase project** via their dashboard.
* **Initial Database Schema (Prisma Schema):** Instead of direct SQL, you'll define your schema in Prisma.
    * In `apps/api/prisma/schema.prisma` (create this file and folder):
        ```prisma
        // apps/api/prisma/schema.prisma
        generator client {
          provider = "prisma-client-js"
        }

        datasource db {
          provider = "postgresql"
          url      = env("DATABASE_URL")
        }

        model User {
          id          String    @id @default(uuid()) @map("id") @db.Uuid
          email       String    @unique
          password    String    // Hashed password (managed by Supabase Auth, but kept here for conceptual mapping if needed)
          createdAt   DateTime  @default(now()) @map("created_at")

          workspaces  Workspace[] @relation("WorkspaceOwner")
          memberships UserWorkspaceMembership[]
          usageLogs   UsageLog[]

          @@map("users") // Maps Prisma model name to existing table name
        }

        model Workspace {
          id        String    @id @default(uuid()) @map("id") @db.Uuid
          name      String
          ownerId   String    @map("owner_id") @db.Uuid
          createdAt DateTime  @default(now()) @map("created_at")

          owner     User      @relation("WorkspaceOwner", fields: [ownerId], references: [id])
          members   UserWorkspaceMembership[]
          channels  Channel[]
          messages  Message[]
          usageLogs UsageLog[]

          @@map("workspaces")
        }

        model UserWorkspaceMembership {
          id          String    @id @default(uuid()) @map("id") @db.Uuid
          userId      String    @map("user_id") @db.Uuid
          workspaceId String    @map("workspace_id") @db.Uuid
          role        String    @default("member") @db.Text @db.VarChar(50) // Use specific text type or enum if roles are fixed
          createdAt   DateTime  @default(now()) @map("created_at")

          user        User      @relation(fields: [userId], references: [id])
          workspace   Workspace @relation(fields: [workspaceId], references: [id])

          @@unique([userId, workspaceId])
          @@map("user_workspace_membership")
        }

        model Channel {
          id           String    @id @default(uuid()) @map("id") @db.Uuid
          platform     String    @db.Text @db.VarChar(50) // "whatsapp", "instagram", "facebook"
          workspaceId  String    @map("workspace_id") @db.Uuid
          accessToken  String    @map("access_token")
          refreshToken String?   @map("refresh_token")
          expiresAt    DateTime? @map("expires_at")
          connectedAt  DateTime  @default(now()) @map("connected_at")

          workspace    Workspace @relation(fields: [workspaceId], references: [id])
          messages     Message[]

          @@unique([platform, workspaceId])
          @@map("channels")
        }

        model Message {
          id           String    @id @default(uuid()) @map("id") @db.Uuid
          workspaceId  String    @map("workspace_id") @db.Uuid
          channelId    String    @map("channel_id") @db.Uuid
          platform     String    @db.Text @db.VarChar(50) // "whatsapp", "instagram", "facebook"
          senderId     String    @map("sender_id")
          senderName   String?   @map("sender_name")
          messageBody  String    @map("message_body") @db.Text
          direction    String    @db.Text @db.VarChar(50) // "inbound", "outbound"
          timestamp    DateTime  @default(now())
          aiResponse   String?   @map("ai_response") @db.Text
          aiTags       String[]  @map("ai_tags") @db.Text // Stored as an array of strings
          aiConfidence Float?    @map("ai_confidence") @db.Float
          isRead       Boolean   @default(false) @map("is_read")
          isHandled    Boolean   @default(false) @map("is_handled")

          workspace    Workspace @relation(fields: [workspaceId], references: [id])
          channel      Channel   @relation(fields: [channelId], references: [id])

          @@map("messages")
        }

        model UsageLog {
          id          String    @id @default(uuid()) @map("id") @db.Uuid
          workspaceId String    @map("workspace_id") @db.Uuid
          userId      String?   @map("user_id") @db.Uuid
          type        String    @db.Text @db.VarChar(50) // "ai_reply", "ai_classification"
          count       Int       @default(1)
          logDate     DateTime  @default(now()) @db.Date @map("log_date") // Store as Date only
          createdAt   DateTime  @default(now()) @map("created_at")

          workspace   Workspace @relation(fields: [workspaceId], references: [id])
          user        User?     @relation(fields: [userId], references: [id])

          @@map("usage_logs")
        }
        ```
* **Prisma Setup Commands (in `apps/api`):**
    * Install Prisma CLI: `pnpm add -D prisma`
    * Install Prisma Client: `pnpm add @prisma/client`
    * Initialize Prisma: `npx prisma init` (This creates `prisma/` folder and `schema.prisma`).
    * **Crucial:** Connect Prisma to your Supabase Postgres database by setting `DATABASE_URL` in `apps/api/.env`.
        `DATABASE_URL="postgresql://postgres:[YOUR_SUPABASE_PASSWORD]@db.[YOUR_SUPABASE_REF].supabase.co:5432/postgres"`
    * Apply migrations: `npx prisma migrate dev --name init_schema` (This creates and applies the initial schema to Supabase).
    * Generate Prisma Client: `npx prisma generate` (Run this anytime `schema.prisma` changes).
* **Auth Setup:** Enable Email/Password authentication in Supabase.
* **Client Integration:**
    * **Frontend (`apps/web`):** Use the **Supabase JS client** for direct authentication.
    * **Backend (`apps/api`):** Use the **Prisma Client** for all database interactions. Create a `PrismaService` to manage the Prisma Client instance.

#### 1.3 Basic Auth System (Frontend & Backend)

The authentication flow remains largely the same, with Prisma handling user storage.

* **Frontend (`apps/web`):**
    * Create `pages/auth/login.tsx` and `pages/auth/signup.tsx`.
    * Implement Supabase `signInWithPassword` and `signUp` functions.
    * Set up `signOut` functionality and **protect routes** using `useRouter` and Supabase session checks.
* **Backend (`apps/api`):**
    * Create an `AuthModule` and `AuthService`.
    * Implement a **JWT strategy** to verify Supabase-issued JWTs.
    * Create a `JwtAuthGuard` to protect API endpoints.
    * **Prisma Integration:** When users sign up via Supabase, you might want to mirror/update their user record in your `public.users` table via Prisma if additional custom fields are needed later beyond Supabase's default user metadata. For MVP, relying mostly on Supabase's `auth.users` for core authentication and `public.users` for linking to workspaces is a good approach.

#### 1.4 Frontend Layout Shell

Design the basic visual structure of your application.

* **Action:** Set up initial Next.js pages and layouts using **Tailwind CSS** and **ShadCN UI**.
* **Components:**
    * `components/layout/sidebar.tsx` (for primary navigation).
    * `components/layout/header.tsx` (for user info, workspace switcher).
    * `components/ui/*` (import and utilize ShadCN components).
* **Pages:**
    * `pages/index.tsx` (redirects to inbox if authenticated).
    * `pages/inbox.tsx` (the main unified inbox view).
    * `pages/settings/workspace.tsx` (for managing workspace settings).

#### 1.5 NestJS Backend Scaffolding

Set up the foundational structure for your backend services and integrate Prisma.

* **Action:** Initialize your NestJS application within `apps/api`.
* **Command:** `npx @nestjs/cli new api --package-manager pnpm`
* **Prisma Service:**
    * Create a `PrismaService` (`apps/api/src/prisma/prisma.service.ts`) that extends `PrismaClient` and handles `onModuleInit` and `onModuleDestroy` for connecting/disconnecting. This will be injected into other services.
    * Register `PrismaService` as a global module or import it into modules that need database access.
* **Modules:**
    * `AppModule` (root module).
    * `AuthModule`.
    * `UsersModule` (will use `PrismaService` for user-related queries).
    * `WorkspacesModule` (will use `PrismaService` for workspace management).
    * `ChannelsModule` (will use `PrismaService` for channel credentials).
    * `MessagesModule` (will use `PrismaService` for message storage and retrieval).
    * `UsageModule` (will use `PrismaService` for tracking AI usage).
* **Configuration:**
    * `.env` file: Define environment variables such as `DATABASE_URL` (for Prisma), `SUPABASE_KEY`, `SUPABASE_URL`, and `OPENAI_API_KEY`.
    * `main.ts`: Enable **CORS** to allow communication between your frontend and backend.

---

### 2. WhatsApp Integration (Week 2)

This week focuses on enabling WhatsApp messaging and integrating initial AI reply generation, now using Prisma.

#### 2.1 360dialog Setup & Webhook Handler

Integrate WhatsApp messaging through 360dialog.

* **Action:** Obtain a **360dialog sandbox/test number** from their portal.
* **360dialog Configuration:**
    * Generate a `D360_API_KEY` (API Key).
    * Configure the webhook URL in your 360dialog account to point to your backend endpoint: `YOUR_API_URL/api/webhooks/whatsapp`.
* **Backend (`apps/api`):**
    * Create a `WhatsappModule`.
        * `WhatsappController`: Implement a `POST /api/webhooks/whatsapp` endpoint.
        * **Webhook Validation:** Validate incoming messages using the signature provided by 360dialog for security.
        * **Payload Parsing:** Parse the incoming message payload to extract `sender`, `message body`, and `timestamp`.
        * **Workspace Identification:** Identify the `workspace_id` associated with the incoming message.
        * **Message Storage (with Prisma):** Use `this.prisma.message.create()` to store the inbound message.
        * **AI Trigger:** Trigger the `AI Reply + Tagging` logic via an event.

#### 2.2 Store Inbound/Outbound Messages

Ensure all messages are consistently stored in your database using Prisma.

* **Backend (`apps/api` - `MessagesService`):**
    * Inject `PrismaService`.
    * Implement a `createMessage(payload: CreateMessageDto)` method using `this.prisma.message.create(data: payload)` to insert message data into the `messages` table.
    * Handle `direction: 'inbound'` for messages received from webhooks.
    * Handle `direction: 'outbound'` for messages sent via your API.
    * Populate all necessary fields, leveraging Prisma's type safety.

#### 2.3 Generate & Send AI Reply (Initial Pass)

Automate initial message responses using AI.

* **Action:** Integrate the AI logic and set up basic auto-reply functionality.
* **`packages/lib-ai/src/index.ts`:**
    * The `generateReply` function remains the same as previously defined, as it only interacts with the OpenAI API.
* **Backend (`apps/api` - `WhatsappService`/`MessagesService`):**
    * After an inbound message is stored, call `generateReply` from `lib-ai`.
    * **Prisma Update:** Use `this.prisma.message.update()` to store the `ai_response`, `ai_tags`, and `ai_confidence` in the `messages` table.
    * **Initial Auto-Send (MVP):** Configure to *automatically send* the AI reply if `ai_confidence` is above a certain threshold (e.g., > 0.8) and the message is not classified as a `complaint` or `review`. Otherwise, mark it `unhandled`.
    * Use the **360dialog API** (`https://waba.360dialog.io/v3/messages`) to send the generated reply back.

#### 2.4 Show Messages in Inbox UI

Display incoming and outgoing messages in your frontend.

* **Frontend (`apps/web` - `pages/inbox.tsx`):**
    * Fetch messages for the currently active workspace from your `/api/messages` endpoint.
    * **Backend (`apps/api` - `MessagesController`):** Implement endpoints like `GET /api/messages` that use `this.prisma.message.findMany()` to retrieve messages.
    * Display messages chronologically, grouped by sender.
    * Visually differentiate inbound versus outbound messages.
    * Show AI-generated draft replies (initially just the text).

---

### 3. AI Triage + Unified Inbox UI (Week 3)

This week enhances AI capabilities, builds the core inbox UI, and implements usage limits, using Prisma for database interactions.

#### 3.1 Build Tag Classifier

Refine the AI tagging mechanism to improve accuracy.

* **Action:** Integrate AI tagging more deeply and refine its capabilities.
* **`packages/lib-ai/src/index.ts`:** The `generateReply` function's updated prompt (from 2.3) helps ensure tags are provided. Focus on robust parsing of the AI's structured output.

#### 3.2 Inbox Filtering, Tag Badges

Improve the usability of your unified inbox with filtering and visual cues.

* **Frontend (`apps/web` - `pages/inbox.tsx`):**
    * Display `ai_tags` on each message as clear visual badges (using ShadCN's `Badge` component).
    * Implement comprehensive filtering options (by channel, tag, status).
    * **Backend (`apps/api` - `MessagesController`):** Extend `GET /api/messages` to accept query parameters for filtering. Use Prisma's `where` clause (e.g., `this.prisma.message.findMany({ where: { platform: 'whatsapp', aiTags: { has: 'lead' } } })`).
    * Add a **search functionality** on the `message_body` (using Prisma's `contains` or `search` on text fields).

#### 3.3 Accept/Edit AI Response

Provide users control over AI-generated replies.

* **Frontend (`apps/web` - `pages/inbox.tsx`):**
    * For messages with a generated `ai_response` (draft), display an "Accept AI Reply" button and an "Edit & Send" text area.
    * When "Accept AI Reply" is clicked:
        * Make an API call to `POST /api/messages/{id}/send` to send the `ai_response`.
        * **Prisma Update:** Use `this.prisma.message.update()` to set the message's `is_handled` status to `TRUE`.
        * Log the AI usage.
    * When "Edit & Send" is used:
        * Allow the user to modify the text.
        * On send, make an API call to `POST /api/messages/{id}/send` with the user's edited content.
        * **Prisma Update:** Use `this.prisma.message.update()` to set the message's `is_handled` status to `TRUE`.
        * Log AI usage.
    * Implement read/unread toggles (using `this.prisma.message.update()` for `isRead`).

#### 3.4 Limit Usage Per User/Workspace

Manage and enforce AI usage quotas using Prisma.

* **Backend (`apps/api` - `UsageModule`):**
    * **`UsageService`:**
        * Inject `PrismaService`.
        * Implement `logUsage(workspaceId, userId, type)` using `this.prisma.usageLog.create()`.
        * Implement `checkQuota(workspaceId, type)` using `this.prisma.usageLog.aggregate()` or `findMany` with `_sum` to get the daily count for the given `workspaceId` and `type` on the current `logDate`.
    * **Interceptor/Guard:**
        * Create a NestJS interceptor or guard on API endpoints that trigger AI replies.
        * Before invoking the AI service, check `checkQuota`.
        * If the quota is exceeded, return a `403 Forbidden` or `429 Too Many Requests` response.
* **Frontend (`apps/web`):**
    * Display the current AI usage and the daily limit in the UI.
    * Disable the "Generate AI Reply" button or show a warning when the quota is exceeded.

---

### 4. Meta Integration + Launch (Week 4)

This week focuses on adding Facebook & Instagram, unifying the inbox, and preparing for a soft launch, with Prisma handling data.

#### 4.1 Facebook & Instagram DM Connection

Extend your reach to Meta's platforms.

* **Action:** Implement the **OAuth flow** or provide a manual token input option for the Meta Graph API.
* **Backend (`apps/api` - `ChannelsModule`):**
    * **Facebook/Instagram Integration Service:**
        * Inject `PrismaService`.
        * Provide endpoints to initiate OAuth.
        * Handle the OAuth redirect to exchange the code for a short-lived access token, then for a **long-lived access token**.
        * **Prisma Storage:** Use `this.prisma.channel.create()` or `upsert()` to securely store the long-lived `access_token` and its `expires_at` in the `channels` table.
        * Implement the **Meta Webhook verification endpoint** (`GET /api/webhooks/meta`).
        * Implement `POST /api/webhooks/meta` to receive messages from Facebook and Instagram. Parse payloads and **Prisma Create:** use `this.prisma.message.create()` to store them.
        * Implement Meta Graph API client methods for sending messages back.
* **Frontend (`apps/web` - `pages/settings/channels.tsx`):**
    * Create a UI to initiate "Connect Facebook Page" and "Connect Instagram Account".
    * Display connected channels and their status (fetching from `/api/channels` which uses `this.prisma.channel.findMany()`).

#### 4.2 Inbox View Across Platforms

Ensure a truly unified message view.

* **Frontend (`apps/web` - `pages/inbox.tsx`):**
    * The existing `messages` table schema already supports multiple platforms. Ensure your frontend fetches and displays this data correctly.
    * Verify that filtering messages by `platform` works seamlessly.
    * Visually distinguish messages from different platforms (e.g., small icons next to the sender's name).

#### 4.3 Soft Launch Preparations

Get ready to deploy your MVP.

* **Deployment:**
    * **Frontend (Vercel):** Connect your `apps/web` project. Configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`).
    * **Backend (Railway):** Deploy your `apps/api` project. Crucially, ensure the `DATABASE_URL` for Prisma is correctly set.
        * Add `prisma generate` to your Railway build command if it's not run automatically.
        * Configure environment variables: `DATABASE_URL` (from Supabase), `SUPABASE_KEY`, `SUPABASE_URL`, `OPENAI_API_KEY`, `D360_API_KEY`, `META_APP_ID`, `META_APP_SECRET`, etc.
    * Ensure webhooks are configured to point to the deployed Railway API.
* **Monitoring & Logging:** Implement basic logging for errors and exceptions in NestJS.
* **Testing:** Perform comprehensive **manual end-to-end testing** for all core features.
* **Basic Documentation:** Create a simple `README` file with setup and deployment instructions.

#### 4.4 Fix Edge Bugs, Polish UI

Final touches before releasing to early users.

* **Action:** Thoroughly address any identified bugs during testing.
* **UI/UX:**
    * Ensure your application is **fully responsive**.
    * Improve **loading states** and provide clear **error messages**.
    * Add effective **user feedback** (e.g., toast notifications).
    * Refine typography, spacing, and color palette using Tailwind CSS and ShadCN UI.

---

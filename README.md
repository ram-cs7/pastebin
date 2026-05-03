# Pastebin Lite

A minimal Pastebin-like web app built for the take-home assignment. Users can quickly store and share text content by generating a shareable link. Content can optionally expire based on time (TTL) or the number of views.

## Persistence Layer

This project uses **Neon (Serverless Postgres)**. 
Serverless Postgres was chosen over in-memory storage or SQLite because it survives across requests in a serverless environment like Vercel. Neon provides a serverless Postgres driver that uses HTTP under the hood, making it perfectly compatible with Vercel's edge and Node.js runtimes.

## Local Setup

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd pastebin
   npm install
   ```

2. **Database Setup**
   - Create a free database on [Neon.tech](https://neon.tech)
   - Copy `.env.local.example` to `.env.local`
   - Add your Neon connection string as `DATABASE_URL`

3. **Initialize the Database**
   ```bash
   npm run db:init
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Design Decisions

- **nanoid over UUID**: 8-character URL-safe IDs are much shorter and cleaner in shared links (`/p/a1b2c3d4`). The collision probability is mathematically negligible for this scale.
- **View Count Incrementing**: The validity of a paste (is it expired by time or views?) is always checked *before* incrementing the view count. This ensures that a paste that is already expired does not register ghost views.
- **TEST_MODE Support**: Implemented deterministic testing by injecting the `x-test-now-ms` header to override the system time when the `TEST_MODE=1` environment variable is set.

## Required API Routes Implemented

- `GET /api/healthz`
- `POST /api/pastes`
- `GET /api/pastes/:id`
- `GET /p/:id` (HTML viewer)

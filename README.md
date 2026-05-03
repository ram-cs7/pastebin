# PasteShare

A minimal Pastebin-like web app. Paste text, get a shareable link, optionally set expiry by time or view count.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | API routes + React in one repo, Vercel-native |
| Database | Neon (serverless Postgres) | Free tier, works perfectly with Vercel edge functions |
| Styling | Tailwind CSS | Fast, no CSS files to maintain |
| ID generation | nanoid | URL-safe, short, cryptographically random slugs |

## Features

- ✅ Create pastes with optional title
- ✅ Generate a unique shareable link (e.g. `/a1b2c3d4`)
- ✅ Time-based expiry (1h, 1d, 7d, 30d, or never)
- ✅ View-count-based expiry (1, 5, 10, 50, or unlimited)
- ✅ Expired pastes return HTTP 410 Gone
- ✅ Line numbers in paste viewer
- ✅ Copy link / copy content buttons
- ✅ Fully responsive dark UI

## API

### `POST /api/paste`
Create a new paste.

**Body:**
```json
{
  "title": "optional string",
  "content": "required string (max 500KB)",
  "expiresIn": "never | 1h | 1d | 7d | 30d",
  "maxViews": "unlimited | 1 | 5 | 10 | 50"
}
```

**Response 201:**
```json
{ "slug": "a1b2c3d4" }
```

### `GET /api/paste/:slug`
Fetch a paste. Increments view count. Returns 404 if not found, 410 if expired.

**Response 200:**
```json
{
  "slug": "a1b2c3d4",
  "title": "My paste",
  "content": "...",
  "created_at": "2026-05-03T10:00:00Z",
  "expires_at": null,
  "max_views": 5,
  "view_count": 2
}
```

## Local Setup

```bash
git clone <your-repo>
cd pastebin
npm install

# Copy and fill in your Neon DATABASE_URL
cp .env.local.example .env.local

# Create the database table
npm run db:init

# Run locally
npm run dev
```

## Deploy to Vercel (step by step)

1. **Create Neon database**
   - Go to https://neon.tech → New Project
   - Copy the connection string

2. **Push to GitHub**
   ```bash
   git init && git add . && git commit -m "init"
   gh repo create pastebin --public --push
   ```

3. **Deploy on Vercel**
   - Go to https://vercel.com → New Project → Import your repo
   - Add environment variable: `DATABASE_URL` = your Neon connection string
   - Deploy

4. **Initialise the database**
   ```bash
   # Run locally with your production DATABASE_URL set
   DATABASE_URL=<your-neon-url> node scripts/init-db.js
   ```

Done. Your app is live.

## Design Decisions

**Why nanoid over UUID?**
8-char URL-safe IDs are shorter and cleaner in shared links. Collision probability at 1M pastes is ~0.00004% — acceptable for this scale.

**Why increment view count after validity check?**
If the paste is already expired (e.g. max_views hit), we shouldn't count one more view against it. The check runs first, then increment happens only if the paste is still valid.

**Why serverless Postgres (Neon) over SQLite?**
SQLite doesn't work on Vercel's edge runtime. Neon's serverless driver uses HTTP under the hood, making it compatible with both edge and Node.js runtimes.

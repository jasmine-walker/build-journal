# Build Journal

A full-stack LEGO collection tracker. Sign up, log your sets, track their status, and get AI-powered suggestions for what to build next.

Built with a React frontend, a Node/Express API, a Postgres database, and the Anthropic API for the AI feature.

## Features

- Email and password authentication with hashed passwords and JWT sessions
- Personal collection: add, edit, and delete LEGO sets, each scoped to your account
- Search by name, filter by status, and sort by name, piece count, or theme
- Collection stats: total sets, total pieces, and a breakdown by status
- AI suggestions in two modes behind one button: "what to build next" and a creative build challenge
- Public sample collection so first-time visitors see a working app before signing up

## Tech stack

| Layer     | Choice                          |
| --------- | ------------------------------- |
| Frontend  | React (Vite)                    |
| Backend   | Node.js, Express                |
| Database  | Postgres (Supabase)             |
| AI        | Anthropic API (claude-sonnet-5) |
| Auth      | bcrypt password hashing, JWT    |

## Project structure

```
build-journal/
  server/            Node + Express API
    index.js         app entry, route mounting
    db/              schema, connection pool, init script
    middleware/      JWT auth guard
    routes/          auth, sets, sample, ai
    test-*.mjs       test suites (run against in-memory Postgres)
  client/            React frontend (Vite)
    src/
      api.js         API client with token handling
      App.jsx        auth state and view switching
      components/    Header, Collection, Preview, cards, modals, AI panel
      styles.css     styling
```

## Getting started (server)

Requires Node 18+ and a free Supabase project for the database.

1. Install dependencies:
   ```
   cd server
   npm install
   ```

2. Create the database. In your Supabase project, copy the connection string from Project Settings > Database.

3. Configure environment. Copy `.env.example` to `.env` and fill in your values:
   - `DATABASE_URL` from Supabase
   - `JWT_SECRET` (generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `ANTHROPIC_API_KEY` from console.anthropic.com

4. Create the tables:
   ```
   npm run init-db
   ```

5. Start the API:
   ```
   npm run dev
   ```
   It runs on http://localhost:4000. Check http://localhost:4000/api/health to confirm.

## Getting started (client)

In a second terminal:

1. Install and configure:
   ```
   cd client
   npm install
   cp .env.example .env
   ```
   The default `.env` points at http://localhost:4000, which matches the server above.

2. Start the app:
   ```
   npm run dev
   ```
   It runs on http://localhost:5173. Open it, and you'll see the sample collection immediately. Sign up to start your own.

## API endpoints

| Method | Path                | Auth | Purpose                          |
| ------ | ------------------- | ---- | -------------------------------- |
| GET    | /api/health         | no   | Health check                     |
| GET    | /api/sample         | no   | Public sample collection         |
| POST   | /api/auth/register  | no   | Create an account                |
| POST   | /api/auth/login     | no   | Log in, returns a JWT            |
| GET    | /api/auth/me        | yes  | Current user (restores session)  |
| GET    | /api/sets           | yes  | List your sets (search/filter/sort) |
| POST   | /api/sets           | yes  | Add a set                        |
| PUT    | /api/sets/:id       | yes  | Update one of your sets          |
| DELETE | /api/sets/:id       | yes  | Delete one of your sets          |
| POST   | /api/ai/suggest     | yes  | AI suggestion (mode: recommend or challenge) |

## Testing

```
cd server
npm test
```

Tests run against an in-memory Postgres, so they need no database connection. They cover auth, the status constraint, per-user data scoping, CRUD, and input validation.

## Deployment

- Database: Supabase (hosted Postgres).
- API: deploys to Render, Railway, or Fly.io. Set the same environment variables there.
- Frontend: deploys to Vercel, pointed at the API's URL.

## Roadmap (v2 ideas)

- Optional photo per set
- Drag-and-drop status changes
- Auto-fill set details from a set number via the Rebrickable API
- Shareable public collection links

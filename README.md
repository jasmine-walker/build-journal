# LEGO Build Journal

A full-stack web app for tracking a LEGO collection: log your sets, filter and sort them, track build status, and get AI-powered suggestions for what to build next.

**Live demo:** https://lego.jasminejwalker.com

> Want to look around without signing up? Click **Try the demo account** on the login screen, or log in with `demo@buildjournal.app` / `demo1234`.

## Features

- **Accounts and authentication** — email/password sign-up with hashed passwords (bcrypt) and JWT sessions, so each user only ever sees their own collection.
- **Full collection management** — add, edit, and delete sets, each with a name, set number, theme, piece count, status, and notes.
- **Search, filter, and sort** — find sets by name, filter by status (owned / building / wishlist), and sort by name, piece count, or theme.
- **Collection stats** — running totals for sets and pieces, plus a breakdown by status.
- **AI build suggestions** — one button, two modes: "what to build next" recommends a set based on your collection, and "build challenge" invents a creative build using themes you already own (powered by the Anthropic API).
- **Public preview** — logged-out visitors see a sample collection right away, with sign-up nudges only when they try to take an action.

## Tech stack

| Layer     | Technology                                     |
| --------- | ---------------------------------------------- |
| Frontend  | React, Vite                                    |
| Backend   | Node.js, Express                               |
| Database  | PostgreSQL (Supabase)                          |
| AI        | Anthropic API                                  |
| Auth      | bcrypt, JSON Web Tokens                        |
| Hosting   | Vercel (frontend), Render (API), Supabase (DB) |

## How it works

The React frontend talks to an Express REST API, which is the only layer that touches the database. Every data route is scoped to the authenticated user (`WHERE user_id = ...`), so one account can never read or modify another account's sets. The AI feature reads the user's collection on the server, sends a compact summary to the Anthropic API, and returns a suggestion.

## Running locally

Requires Node 18+ and a Postgres database (a free Supabase project works).

**Backend**
```
cd build-journal/server
npm install
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
npm run init-db           # creates the tables
npm run dev               # starts the API on http://localhost:4000
```

**Frontend**
```
cd build-journal/client
npm install
cp .env.example .env      # set VITE_API_URL=http://localhost:4000
npm run dev               # starts the app on http://localhost:5173
```

## Tests

```
cd build-journal/server
npm test
```

Covers authentication, the database status constraint, per-user data scoping, CRUD, and input validation, run against an in-memory Postgres so no database connection is needed.

---

Built by [Jasmine Walker](https://jasminejwalker.com)  ·  [GitHub](https://github.com/jasmine-walker)  ·  [LinkedIn](https://linkedin.com/in/jasminejwalker)

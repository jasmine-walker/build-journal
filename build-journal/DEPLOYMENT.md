# Deploying Build Journal

This walks you from the code on your machine to a live app anyone can use. Total time is roughly 30-45 minutes the first time.

## The pieces and the order

You'll deploy four things, and order matters because some steps need a URL from an earlier step:

1. **GitHub** - the code lives here; Render and Vercel deploy from it.
2. **Supabase** - the Postgres database.
3. **Render** - the backend API (needs the database URL).
4. **Vercel** - the React frontend (needs the API's URL).

At the very end you'll come back and tell the API its frontend URL, to lock down CORS.

---

## 1. Push to GitHub

From the project root:

```
git init
git add .
git commit -m "Build Journal: full-stack LEGO collection tracker"
```

Create a new empty repo at github.com/new (name it `build-journal`, no README since you already have one). Then connect and push:

```
git remote add origin https://github.com/jasmine-walker/build-journal.git
git branch -M main
git push -u origin main
```

Confirm your `.gitignore` did its job: the repo should NOT contain `node_modules/` or any `.env` file. Only `.env.example` should be there.

---

## 2. Database on Supabase

1. Go to supabase.com, sign in, and create a new project. Pick a region close to you, set a strong database password, and save that password somewhere.
2. Wait about two minutes for it to provision.
3. **Create the tables.** The simplest way: open the **SQL Editor** in the left sidebar, click **New query**, paste the entire contents of `server/db/schema.sql`, and click **Run**. You should see success and two new tables (`users`, `sets`) under the Table Editor.
4. **Get your connection string.** Click **Connect** at the top of the dashboard. You'll see several options. Choose the **Session pooler** string. It looks like:
   ```
   postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-[REGION].pooler.supabase.com:5432/postgres
   ```
   Replace `[YOUR-PASSWORD]` with the database password you set. This is your `DATABASE_URL`.

> **Why the Session pooler and not the Direct connection?** The direct connection (`db.[ref].supabase.co`) is IPv6-only on the free tier. Render is an IPv4 network, so a direct connection fails there with a network-unreachable error. The Session pooler (port 5432) is IPv4-compatible and supports all the features this app uses. Use it and you'll avoid the single most common deploy failure. Do NOT use the Transaction pooler (port 6543); it doesn't support the prepared statements the `pg` library uses.

---

## 3. Deploy the server on Render

1. Go to render.com, sign in with GitHub, and click **New > Web Service**.
2. Connect your `build-journal` repo.
3. Fill in the settings:
   - **Root Directory:** `server` (important, since your repo has both `client` and `server`)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Under **Environment Variables**, add:

   | Key                 | Value                                             |
   | ------------------- | ------------------------------------------------- |
   | `DATABASE_URL`      | your Session pooler string from step 2            |
   | `JWT_SECRET`        | a long random string (see below)                  |
   | `ANTHROPIC_API_KEY` | your key from console.anthropic.com               |
   | `CLIENT_ORIGIN`     | `*` for now (you'll tighten this in step 5)        |

   Generate a `JWT_SECRET` locally with:
   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Do NOT set `PORT`; Render provides it automatically and the server already reads it.

5. Click **Create Web Service**. The first deploy takes 2-4 minutes. When it's live, your API is at `https://build-journal-xxxx.onrender.com`. Copy that URL.
6. Confirm it works: visit `https://your-api-url.onrender.com/api/health`. You should see `{"status":"ok"}`.

> **Note on the free tier:** the service sleeps after 15 minutes of inactivity and takes 30-60 seconds to wake on the next request. For a portfolio demo that's usually fine, just know the first visitor after a quiet spell waits a moment.

---

## 4. Deploy the client on Vercel

1. Go to vercel.com, sign in with GitHub, and click **Add New > Project**.
2. Import your `build-journal` repo.
3. Fill in:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite (Vercel usually auto-detects this)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
4. Under **Environment Variables**, add:

   | Key            | Value                                        |
   | -------------- | -------------------------------------------- |
   | `VITE_API_URL` | your Render API URL from step 3 (no trailing slash) |

5. Click **Deploy**. When it finishes, your app is live at `https://build-journal-xxxx.vercel.app`. Copy that URL.

---

## 5. Final wiring and test

1. Go back to Render > your service > Environment, and change `CLIENT_ORIGIN` from `*` to your Vercel URL (e.g. `https://build-journal-xxxx.vercel.app`). Save. Render redeploys automatically. This restricts the API to only accept requests from your real frontend.
2. Open your Vercel URL. You should see the sample collection load immediately.
3. Click **Sign up**, create an account, add a set, and hit **Ask AI**. If the suggestion comes back, everything is wired end to end.

### Optional: a demo account for recruiters

Even though visitors see the sample collection without signing in, you may want a ready-made account with a real, editable collection. Sign up once with something like `demo@buildjournal.app`, add a handful of sets, and put those credentials in your portfolio or repo README so anyone can log in and try the full experience in one click.

### Point your resume at it

Once it's live, this replaces the Oracle "Time to Resolution" entry in your Projects section. You'll want a custom subdomain too (like `bricks.jasminejwalker.com`), which you can add in Vercel's domain settings the same way you did for your other projects.

---

## Troubleshooting

- **Server logs show a network/IPv6 error connecting to the database:** you're using the direct connection string. Switch `DATABASE_URL` to the Session pooler string (step 2).
- **The frontend loads but every action fails with a CORS error:** `CLIENT_ORIGIN` on Render doesn't match your Vercel URL exactly. Check for a trailing slash or http vs https mismatch.
- **"AI is not configured":** `ANTHROPIC_API_KEY` isn't set on Render, or the deploy predates you adding it. Add it and redeploy.
- **First load is very slow:** that's the Render free-tier cold start waking the server. Subsequent requests are fast.
- **Model errors from the AI endpoint:** the model name may have moved on. Set an `ANTHROPIC_MODEL` env var on Render to the current model and redeploy.

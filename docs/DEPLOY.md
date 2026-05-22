# Deploy

This template ships configured for **Netlify** (build + functions) with a **hosted Supabase** project as the database.

This document is the recipe — follow it once per new project, then deploys are automatic on git push.

## Prerequisites

- A GitHub (or GitLab/Bitbucket) repository with the project.
- A Netlify account: <https://app.netlify.com>.
- A Supabase account: <https://supabase.com>.
- A working local setup (see [`../README.md`](../README.md) → _Quick Start_).

## One-time Setup

### 1. Create a hosted Supabase project

1. Go to <https://supabase.com> → **New project**.
2. Choose region close to your users.
3. Set a strong database password (save it in a password manager — Supabase shows it once).
4. Wait ~2 minutes for provisioning.

### 2. Push your schema to the hosted project

From your local repo:

```bash
# Log in (browser opens)
supabase login

# Link this repo to the hosted project — get the ref from the project URL
supabase link --project-ref <project-ref>

# Push all migrations
supabase db push
```

`db push` applies every migration in `supabase/migrations/` to the remote DB. Verify in Supabase Studio that the schema is correct.

### 3. Configure Auth (if the auth module is enabled)

In Supabase Dashboard → Authentication → Providers:

- Enable Email if using email/password or magic link.
- Enable Google (or others) — paste the OAuth client ID/secret you created in Google Cloud.
- Set **Site URL** to your production URL (e.g. `https://your-project.netlify.app`). This is where Supabase sends users back after OAuth.
- Add additional Redirect URLs for branch deploy previews if needed (e.g. `https://deploy-preview-*.netlify.app`).

In Authentication → SMTP Settings, configure outbound email if you use magic links or password reset. Recommended providers: Resend, Postmark.

### 4. Connect Netlify to the repo

1. Netlify → **Add new site** → **Import an existing project**.
2. Authorize GitHub / GitLab / Bitbucket → pick the repo.
3. Build settings: Netlify reads `netlify.toml` from the repo — defaults should be correct:
   - Build command: `pnpm build`
   - Publish directory: `build`
   - Node version: 20 (from `netlify.toml`)
4. Click **Deploy** — it will fail on the first try because env vars aren't set yet. That's expected. Set them next.

### 5. Configure environment variables on Netlify

Netlify → Site configuration → Environment variables. Add:

| Key                         | Value                                                    | Scope                           |
| --------------------------- | -------------------------------------------------------- | ------------------------------- |
| `PUBLIC_SUPABASE_URL`       | Your hosted Supabase project URL                         | All scopes                      |
| `PUBLIC_SUPABASE_ANON_KEY`  | Your hosted anon key                                     | All scopes                      |
| `PUBLIC_APP_URL`            | Your production URL (e.g. `https://yourapp.netlify.app`) | Production only                 |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (if used)                               | Production only, mark as secret |
| `ADMIN_EMAILS`              | Comma-separated emails                                   | Production only                 |
| `PNPM_VERSION`              | `9`                                                      | Builds                          |

Get the Supabase keys from Project Settings → API.

Mark `SUPABASE_SERVICE_ROLE_KEY` and any other secret as **Secret**. Netlify will then redact it from build logs.

### 6. Trigger a redeploy

Netlify → Deploys → **Trigger deploy** → **Deploy site**. The build should succeed.

### 7. Set up the custom domain (optional)

Netlify → Domain management → Add domain. Follow DNS instructions. Netlify provisions HTTPS automatically via Let's Encrypt.

Don't forget to update Supabase **Site URL** and any OAuth redirect URLs to the new domain.

## Ongoing Workflow

### Pushing changes

`git push origin main` triggers a production deploy. `git push` on any other branch triggers a **Deploy Preview** at `https://deploy-preview-N--yourapp.netlify.app`.

### Schema changes

After committing a new migration:

```bash
# Locally — apply and regenerate types
pnpm db:migrate
pnpm db:types

# Push to hosted DB BEFORE deploying the code that depends on it
supabase db push
```

Order matters: deploy a code change that expects a new column before applying the migration → users hit errors. Apply the migration first.

For safer flows in larger projects, write backward-compatible migrations (add column with default, deploy code, then in a later migration tighten constraints).

### Rollbacks

- **Code:** Netlify → Deploys → click an older successful deploy → **Publish deploy**. Instant.
- **Schema:** Supabase doesn't auto-rollback. Write a new migration that reverses the change. Test locally first.

## Deploy Previews

Every branch / PR gets a unique URL. Useful for:

- Sharing in-progress work.
- Running Lighthouse / a11y audits against a real environment.
- Manual QA.

Limitations of preview deploys:

- They use the same Supabase project (because env vars are shared by default). Don't run destructive migrations on production while a preview is testing.
- Auth redirects: add the preview URL pattern to Supabase Redirect URLs.

For a fully isolated preview environment, set up a separate Supabase project and scope its env vars to Deploy Previews in Netlify. More work, but safer for projects with sensitive data.

## Alternatives to Netlify

The Netlify adapter is one line in `svelte.config.js`. To switch:

### Vercel

```bash
pnpm remove @sveltejs/adapter-netlify
pnpm add -D @sveltejs/adapter-vercel
```

```diff
-import adapter from '@sveltejs/adapter-netlify';
+import adapter from '@sveltejs/adapter-vercel';
```

Set env vars in Vercel Project Settings. Delete `netlify.toml`, add `vercel.json` if you need custom headers.

### Cloudflare Pages

```bash
pnpm remove @sveltejs/adapter-netlify
pnpm add -D @sveltejs/adapter-cloudflare
```

Cheaper at scale, but stricter compute limits per request. Verify any heavy server-side work.

### Self-hosted (Node)

```bash
pnpm remove @sveltejs/adapter-netlify
pnpm add -D @sveltejs/adapter-node
```

Run `node build/index.js` behind a reverse proxy. Need to handle process management, SSL, log aggregation yourself.

## Troubleshooting

| Symptom                                           | Likely cause                                                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Build fails: `Cannot find module '@supabase/ssr'` | `pnpm install` issues. Check Netlify build logs — possibly `engine-strict` failing. Ensure `NODE_VERSION = "20"` in `netlify.toml`. |
| Build succeeds but the site shows blank page      | Env vars missing or misnamed. Check browser console for "URL is undefined".                                                         |
| 401/403 on data queries in prod                   | Wrong anon key, or wrong Site URL in Supabase causing OAuth bounce. Verify keys match the hosted project, not the local one.        |
| OAuth redirect goes to localhost in prod          | Site URL not updated in Supabase Auth settings.                                                                                     |
| Service worker shows stale content                | `autoUpdate` strategy waits for the next reload. Force-refresh, or check Application → Service Workers in DevTools.                 |
| `Function exceeded the maximum allowed duration`  | Long-running server route — move work to a background job or stream the response.                                                   |
| Preview deploy can't sign in                      | Preview URL not in Supabase Redirect URLs. Add `https://deploy-preview-*--yourapp.netlify.app` to the allow-list.                   |

For Netlify-specific docs: <https://docs.netlify.com/integrations/frameworks/sveltekit/>.
For Supabase production hosting: <https://supabase.com/docs/guides/platform>.

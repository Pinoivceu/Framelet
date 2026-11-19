# Framelet

Framelet is a free widget embedding platform for Notion pages and websites. It includes five live widgets, a two-panel editor, private widget management, and public iframe rendering.

## Stack

- Next.js 16 App Router
- Supabase Auth and Postgres with Row Level Security
- TypeScript
- Vitest

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Supabase (requires Docker access):

   ```bash
   npx supabase@latest start
   npx supabase@latest db reset
   npx supabase@latest status
   ```

3. Copy the local API URL and publishable key into `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local publishable key>
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). Local magic-link emails are available in the Supabase mail catcher shown by `npx supabase@latest status`.

## Hosted Supabase setup

1. Create a Supabase project and apply the migration:

   ```bash
   npx supabase@latest link --project-ref <project-ref>
   npx supabase@latest db push
   ```

2. In Supabase Authentication URL Configuration, set the Site URL to the production origin and add:

   ```text
   https://your-domain.example/auth/callback
   http://localhost:3000/auth/callback
   ```

3. Enable Google in Authentication Providers. Register `https://<project-ref>.supabase.co/auth/v1/callback` as the Google OAuth redirect URI.

4. Add the production environment variables from `.env.example` to the hosting provider. `NEXT_PUBLIC_SITE_URL` must be the public canonical origin without a trailing slash.

The browser only receives the Supabase publishable key. Never place a service-role key in a `NEXT_PUBLIC_` variable.

## Verification

```bash
npm run lint
npm test
npm run build
npm audit
```

The database behavior can be checked in an isolated PostgreSQL database:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/local_prelude.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261119010520_widget_platform.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/verify.sql
```

The verification script asserts profile provisioning, public widget reads, hidden owner columns for anonymous clients, owner-only inserts, cross-owner rejection, editable profile fields, and the `updated_at` trigger.

## Product decisions

- Widgets use transparent themed surfaces so they inherit the host’s page background. System mode switches automatically through `prefers-color-scheme`; explicit Light or Dark mode remains available.
- Pomodoro state is client-only and resets when the embed reloads. This avoids storing visitor state without asking for permission.
- iframe heights are generated per widget type: Clock 200px, Countdown 210px, Quote 200px, Progress 140px, Pomodoro 230px.
- Public embed reads expose only widget presentation fields. Anonymous clients do not have a column grant for `user_id`.

## Routes

- `/` marketing page
- `/login` Google and Magic Link authentication
- `/dashboard` widget collection and management
- `/dashboard/profile` basic profile editing
- `/editor/new?type=clock` widget creation
- `/editor/[id]` widget editing and embed snippets
- `/embed/[id]` public iframe renderer

## Security notes

- RLS is enabled on `profiles` and `widgets`.
- Widget writes require `auth.uid() = user_id`.
- Profile email cannot be changed through the Data API; only the display name and avatar fields are client-updatable.
- The public embed query never selects `user_id`.
- Magic-link and OAuth callbacks exchange PKCE codes server-side and store sessions through `@supabase/ssr` cookies.

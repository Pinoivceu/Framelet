# Framelet MVP task list

Source: `prd.md`. The requested `task.md` did not exist, so this checklist tracks the PRD’s MVP requirements.

## Foundation

- [x] Create a production Next.js application with TypeScript and pinned dependencies.
- [x] Set up Supabase browser, server, and proxy clients using secure cookie sessions.
- [x] Add the profile and widget schema, enums, indexes, timestamps, grants, and RLS.
- [x] Provision profiles automatically from new Supabase Auth users.

## Authentication

- [x] Add Google OAuth sign-in.
- [x] Add email Magic Link sign-in with inline email validation.
- [x] Exchange auth callbacks into cookie sessions and redirect to the dashboard.
- [x] Protect `/dashboard` and `/editor/*`; redirect unauthenticated visitors to `/login`.
- [x] Handle expired or invalid login links explicitly.
- [x] Add sign-out and basic profile name editing.

## Widgets

- [x] Build Clock with 12/24-hour format, seconds, date, and timezone controls.
- [x] Build Countdown with target date, completion message, and no negative values.
- [x] Build Quote with daily or custom source and left/center alignment.
- [x] Build Progress with current/target values, percentage/ratio display, accent color, and 100% visual clamping.
- [x] Build interactive Pomodoro with focus/break durations, Start/Pause, Reset, and automatic phase switching.
- [x] Support Inter, Playfair Display, JetBrains Mono, and Nunito.
- [x] Support Light, Dark, and System themes.

## Studio

- [x] Add a dashboard listing title, type, last edit, Edit, Copy Link, and Delete.
- [x] Add empty state and five-widget creation rail.
- [x] Require confirmation before deleting a widget.
- [x] Add the two-panel editor with live preview and Light/Dark host simulation.
- [x] Save and update widgets through validated, owner-scoped API routes.
- [x] Preserve form state when saving fails and show a clear error.
- [x] Generate Direct URL and responsive iframe snippets with widget-specific heights.

## Public embedding

- [x] Render `/embed/[id]` publicly without application chrome.
- [x] Add cross-origin framing headers for the embed route.
- [x] Add a minimal unavailable-widget fallback for invalid or deleted IDs.
- [x] Support system color preference and WCAG-conscious transparent themes.
- [x] Keep all five widgets responsive down to a 250px container.

## Verification

- [x] Pass TypeScript checks.
- [x] Pass widget logic tests.
- [x] Apply the migration against PostgreSQL and verify auth profile provisioning.
- [x] Verify public reads, owner-only writes, cross-owner rejection, column grants, and update timestamps.
- [x] Pass a production Next.js build.
- [x] Pass dependency audit with zero known vulnerabilities.
- [x] Smoke-test public routes and embed response headers.

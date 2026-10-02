This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Daycare Admin Dashboard (`/admin`)

Tour availability is maintained from the dashboard instead of by editing `partners.ts`.

**Access**

Sign in at `/admin/login` with a 6-digit code emailed to the address. **Only these four
addresses can request a code and edit tour settings** — no other address (including a
partner's `ownerEmail`) can sign in:

| Email | Role |
| --- | --- |
| `daycare@waymakerbiz.com` | Super Admin |
| `darecallad0000@gmail.com` | Administrator |
| `center.admin@sunnychildcare.com` | Administrator |
| `lavi810102@gmail.com` | Administrator |

All four can manage every daycare. The list lives in `ADMIN_EMAILS` in `src/lib/auth.ts` and
can be overridden with the `ADMIN_EMAILS` environment variable (comma separated) so it can be
changed without a code edit. `SUPER_ADMIN_EMAILS` marks who keeps the highest
view/override rights.

**What can be changed**

- **Weekly tour hours** — which weekdays accept tours and the time offered on each day. Saved as the
  familiar `tourHours` string (e.g. `Fri 4:00 PM - 6:00 PM | Sat 10:00 AM`).
- **Closed dates** — single days or a date range that should not accept tours.
  Dates baked into `partners.ts` show as *fixed* and can only be changed in code.

**How it takes effect**

Changes are stored in Redis under `daycare:{slug}:schedule` and merged over the static partner data
on read, so the public booking form (`/book-tour`) reflects them immediately. `POST /api/contact`
re-validates the requested date server-side, so a closed date is rejected with **409** even if the
form was loaded before the change.

**Existing bookings**

Blocking a date (or removing a weekday) that already has bookings returns **409 CONFLICTING_BOOKINGS**
with the affected list. The dashboard then offers two explicit choices: cancel those bookings and
email the parents, or apply the change while keeping the bookings for a manual follow-up.

**Activity log**

Every dashboard action is written to an append-only audit trail so an unexpected change can
always be traced to a person. Recorded actions: login code requested, successful sign-in,
**failed sign-in**, sign-out, tour hours changed, dates closed, dates re-opened. Each entry
stores the acting email, the daycare, a timestamp, the client IP and user agent, the
before/after value, and any bookings the action affected. Attempts that were **refused**
(for example closing a date that already has bookings) are recorded too, with outcome
`denied`.

The trail is visible at the bottom of the dashboard, filterable by administrator, action and
date range, and switchable between the selected location and all activity. There is no API
that edits or deletes entries. Entries live in Redis (`audit:tour`, capped at 10,000, plus
`audit:tour:daycare:{slug}` capped at 2,000) and are mirrored to the server log with an
`AUDIT` prefix so they survive even a full Redis loss.

### API

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/request-code` | Email a one-time login code |
| `POST` | `/api/auth/verify-code` | Exchange the code for a session cookie |
| `POST` | `/api/auth/logout` | Destroy the session |
| `GET` | `/api/auth/session` | Current session |
| `GET` | `/api/admin/daycares` | Locations the caller may manage |
| `GET`/`PUT` | `/api/admin/daycares/[slug]/schedule` | Read / replace weekly tour hours |
| `POST`/`DELETE` | `/api/admin/daycares/[slug]/blocked-dates` | Close / re-open dates |
| `GET` | `/api/admin/daycares/[slug]/bookings` | Upcoming bookings (emails masked) |
| `GET` | `/api/admin/audit-log` | Read the activity trail (`slug`, `actor`, `action`, `from`, `to`, `limit`, `offset`) |
| `GET` | `/api/tour-availability?slug=` | Public live availability |

## Google Calendar auto-sync

Every new tour booking is added to the Waymaker Google Calendar automatically, so nobody has
to click "Add to Google Calendar" in the notification email. When the parent cancels, or an
administrator cancels the booking from the dashboard, the event is removed again. It works like
sunny-next: the app acts as one Google account through an OAuth refresh token and writes to
that account's own calendar (`src/lib/google-calendar.ts`).

**The event** — titled `{Daycare} Tour - {Parent}`, spanning the booked window in Pacific time
(a single time gets one hour), with the daycare address as location, the parent's email, phone
and form notes in the description, and pop-up reminders one day and one hour before.

**It cannot hold up a booking**

- The work runs after the response through `after()` (Vercel `waitUntil`): the parent's
  confirmation never waits for Google, and the call is not dropped when the function returns.
- Every request to Google is aborted after 8 s; a whole calendar job, retry included, after 15 s.
- Failures are only logged (`📅 …` / `❌ Failed to … calendar event`); the booking and the emails
  are unaffected.
- The event id is derived from the booking id, so a cancellation always finds its event and a
  retried insert cannot create a duplicate.

**Setup**

| Variable | Value |
| --- | --- |
| `GOOGLE_OAUTH_CLIENT_ID` | OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | Refresh token of the account whose calendar receives the tours (`daycare@waymakerbiz.com`) |
| `GOOGLE_CALENDAR_ID` | Optional — another calendar of that account; defaults to its main calendar |

Until the first three are set the sync is skipped with a warning in the logs.

1. In Google Cloud Console, enable the **Google Calendar API**.
2. Configure the OAuth consent screen as **Internal** (needs a project in the waymakerbiz.com
   Workspace). With **External**, set the publishing status to **In production**: in *Testing*,
   Google expires refresh tokens after 7 days and the sync quietly stops (the "Google hasn't
   verified this app" screen during sign-in is expected — *Advanced* → continue). A client whose
   consent screen is Internal to another domain (e.g. sunnychildcare.com) cannot be authorized
   by a waymakerbiz.com account.
3. Create an OAuth client ID of type *Web application* with the authorized redirect URI
   `https://developers.google.com/oauthplayground`.
4. In the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground): ⚙️ → tick
   *Use your own OAuth credentials* and paste the client ID/secret (the Playground's own
   credentials produce tokens that die within a day) → scope
   `https://www.googleapis.com/auth/calendar.events` → *Authorize APIs* signed in as
   `daycare@waymakerbiz.com` → *Exchange authorization code for tokens* → copy the refresh token.
5. Add the variables to Vercel (Production, and Preview if wanted) and to `.env.local`, then
   redeploy.
6. Verify: `node --env-file=.env.local scripts/verify-google-calendar.js --write` shows the
   calendar the tours go to, then creates and deletes a test event.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

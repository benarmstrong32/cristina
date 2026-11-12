# Ad Results Dashboard

Tracks Meta ad spend, leads, intro calls, the sales funnel, and ROAS for clients, combining
**Meta Ads** (spend and delivery) with **GoHighLevel** (leads, pipeline, calendar).

Two views, one login page:

| Who signs in | What they see |
|---|---|
| **Team** (`role: "team"`) | **Team view**: Overview · Intro calls · Leads · Ads · Data health. They can also open the **Client view** to see exactly what the client sees. |
| **Client** (`role: "client"`) | Only their own streamlined **Client view**: 6 KPI cards, the lead-journey funnel, a daily trend, and an expandable "Ad Performance" section. Team URLs return 404 for them. |

## How the numbers are defined

| KPI | Source / rule |
|---|---|
| Ad Spend | Meta spend (excludes management fees) |
| New Leads | GHL contacts created by an ad funnel form (`adLeadSources` in `config/clients.ts`) or with Facebook/Instagram first-touch attribution. Tests, team emails, and form starts with no name/email are excluded. |
| Qualified Leads | Lead's opportunity is at or past `qualifiedStages` in the client's pipeline |
| Appointments Booked | Ad leads with a non-cancelled booking on an intro-call calendar (`introCalendarIds`) |
| Appointments Completed | Those bookings marked **Showed** in GHL |
| New Customers | Opportunity **won**, or in the "Closed" stage |
| Revenue / ROAS / Ad Cost per Customer | Won opportunity value ÷ spend. Shown to the team; turn on for clients with `showRevenueToClient`. |

## Run it locally

```bash
cd dashboard
npm install
npm run dev
```

Open http://localhost:3000 and sign in as `team@demo` / `demo` or `client@demo` / `demo`.
The demo logins exist only in development.

Without API tokens, the app reads saved exports in `data/*.local.json`. These are gitignored
because they contain client data.

## Go live (Vercel recommended)

1. Import this repo in Vercel and set the **Root Directory** to `dashboard`.
2. Add the environment variables from `.env.example`:
   - `SESSION_SECRET`: a long random string.
   - `DASHBOARD_USERS`: the logins. Hash each password with `npm run hash-password -- 'password'`.
   - `META_ACCESS_TOKEN`: a Meta System User token with `ads_read` on the client's ad account.
   - `GHL_TOKEN_NEW_VELOCITY`: a GHL **Private Integration** token from the New Velocity sub-account,
     with read scopes for contacts, opportunities, calendars, and calendar events.
   - `EXCLUDE_EMAILS`: personal emails of team members who submit test leads.
3. Deploy. Meta data refreshes hourly and GHL data every 15 minutes.

## Add another client

Add an entry to `config/clients.ts` (ad account ID, GHL location, calendar, pipeline, form names),
add a `GHL_TOKEN_<CLIENT>` env var, and add a client user to `DASHBOARD_USERS` with that `clientId`.

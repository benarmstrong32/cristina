# 9miles Growth Scorecard

Team dashboard for 9miles Media's own marketing: Meta ad spend, applications, ROAS, intros booked vs completed,
and Cristina's monthly bonus. Built on the same look and login as the New Velocity ad results portal.

Live: https://nine-miles-growth-scorecard.vercel.app (Vercel project `nine-miles-growth-scorecard`).

## Where the numbers come from

| What | Source |
|---|---|
| Meta spend, clicks, applications | Meta Marketing API when `META_ACCESS_TOKEN` is set (cached 3 hours, **Refresh now** clears it). Otherwise the saved copy in `data/meta-saved.json`. |
| Intros, show rate | Intros Booked tab of the sales ops sheet, saved in `data/sheet.json`. |
| Won deals, revenue, ROAS | Won deals from the monthly pipeline tabs, counted in the month they closed, saved in `data/sheet.json`. |
| Bonus goals and rules | `config/scorecard.ts` |

`data/` holds client names and deal values, so it is **gitignored** and only uploaded with each deploy.

## Update the data

1. Replace `data/sheet.json` (and `data/meta-saved.json` if Meta is not live).
2. Deploy from this folder: `npx vercel deploy --prod`.

## Logins

`DASHBOARD_USERS` in Vercel is a JSON array of `{email, name, role: "team", passwordHash}`.
Hash a password with `npm run hash-password -- 'the-password'`.

## Run locally

```bash
npm install
npm run dev
```

Sign in as `team@demo` / `demo` (development only). Needs `data/sheet.json` and `data/meta-saved.json`.

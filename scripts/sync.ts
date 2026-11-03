import "./env";
import { runSync } from "../src/lib/meta";

// Usage:
//   npm run sync                               -> re-pull the trailing SYNC_LOOKBACK_DAYS
//   npm run sync -- --since 2026-01-01         -> backfill from a date
//   npm run sync -- --account act_123 --since 2026-06-01 --until 2026-06-30
const args = process.argv.slice(2);
const get = (flag: string) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const account = get("--account");

runSync({ since: get("--since"), until: get("--until"), accountIds: account ? [account] : undefined })
  .then((r) => {
    console.log(`Sync ${r.status}: ${r.rows} campaign-days`);
    if (r.failures.length) process.exitCode = 1;
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });

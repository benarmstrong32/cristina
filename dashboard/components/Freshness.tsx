import type { Snapshot } from "@/lib/types";
import { dateTime, shortDate } from "@/lib/format";
import { REFRESH_HOURS } from "@/lib/data";

/** How fresh the numbers are, with a Refresh button when the data is live. */
export function Freshness({ snap, clientId, back, error, team }: { snap: Snapshot; clientId: string; back: string; error?: string; team?: boolean }) {
  const live = snap.source === "live";
  return (
    <div className="freshness">
      <span>
        {live ? (
          <>Live data · updated {dateTime(snap.generatedAt)} ET · refreshes every {REFRESH_HOURS} hours</>
        ) : (
          <>Ad results through {shortDate(snap.dataThrough)}{snap.crmThrough ? <> · applications and calls through {shortDate(snap.crmThrough)}</> : null}</>
        )}
        {team && error ? <span className="fresh-err"> · Live update failed: {error}</span> : null}
      </span>
      {live && (
        <form method="post" action="/api/refresh">
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="back" value={back} />
          <button className="btn-link" type="submit">Refresh now</button>
        </form>
      )}
    </div>
  );
}

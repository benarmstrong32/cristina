import { startSync, updateAccount } from "../actions";
import { ago } from "../../lib/format";
import { lastSync, listAccounts } from "../../lib/queries";

export const dynamic = "force-dynamic";

const STATUS: Record<number, string> = { 1: "active", 2: "disabled", 3: "unsettled", 7: "pending review", 9: "grace period", 101: "closed" };

export default async function Settings() {
  const accounts = listAccounts(true);
  const sync = lastSync();
  const configured = Boolean(process.env.META_ACCESS_TOKEN);

  return (
    <>
      <h1>Accounts &amp; sync</h1>

      <h2>Sync</h2>
      <div className="card">
        {!configured && <div className="notice">META_ACCESS_TOKEN is not set, so syncing is off. See <code>.env.example</code>.</div>}
        <p style={{ marginTop: 0 }}>
          Last run: <b>{sync ? sync.status : "never"}</b>
          {sync && <> · started {ago(sync.started_at)} · {sync.rows} campaign-days{sync.finished_at ? "" : " (running…)"}</>}
        </p>
        {sync?.message && <pre className="small" style={{ whiteSpace: "pre-wrap", color: "var(--critical)" }}>{sync.message}</pre>}
        <form action={startSync}><button type="submit" disabled={!configured}>Sync now</button></form>
        <p className="small muted">
          Each sync re-pulls the last {process.env.SYNC_LOOKBACK_DAYS || 28} days, because Meta keeps attributing purchases to past days.
          Schedule <code>npm run sync</code> (e.g. every 3 hours with cron) to keep numbers current.
        </p>
      </div>

      <h2>Accounts ({accounts.length})</h2>
      <p className="small muted">Mark which accounts are ours vs clients, group them under a client name, and set a target ROAS to flag under-performers. Hidden accounts are skipped by sync and the dashboard.</p>
      <div className="tablewrap">
        <table>
          <thead><tr><th>Account</th><th>Meta status</th><th colSpan={5} style={{ textAlign: "left" }}>Owner · client name · target ROAS · hide</th></tr></thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id}>
                <td>{a.name}<div className="small muted">{a.id} · {a.currency}{a.business_name ? ` · ${a.business_name}` : ""}</div></td>
                <td className="small">{a.account_status != null ? STATUS[a.account_status] ?? a.account_status : "—"}</td>
                <td colSpan={5} style={{ textAlign: "left" }}>
                  <form action={updateAccount} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="hidden" name="id" value={a.id} />
                    <select name="owner_type" defaultValue={a.owner_type} aria-label="Owner">
                      <option value="client">Client</option>
                      <option value="internal">Ours</option>
                    </select>
                    <input name="client_name" defaultValue={a.client_name ?? ""} placeholder={a.name} aria-label="Client name" />
                    <input name="target_roas" type="number" step="0.1" min="0" defaultValue={a.target_roas ?? ""} placeholder="e.g. 3.0" style={{ width: 90 }} aria-label="Target ROAS" />
                    <label className="small"><input type="checkbox" name="is_hidden" defaultChecked={!!a.is_hidden} /> hide</label>
                    <button type="submit" className="ghost">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

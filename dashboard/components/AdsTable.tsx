import type { Snapshot } from "@/lib/types";
import { num, pct, usd } from "@/lib/format";

/** Each ad with spend in the last 90 days: Meta numbers beside GoHighLevel results. */
export function AdsTable({ ads }: { ads: Snapshot["adTable"] }) {
  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ad</th><th>Ad set</th><th>Status</th><th className="r">Spend</th><th className="r">Impr.</th>
            <th className="r">Link CTR</th><th className="r">Cost per click</th><th className="r">Meta leads</th>
            <th className="r">Applications &amp; opt-ins</th><th className="r">Qualified</th>
          </tr>
        </thead>
        <tbody>
          {ads.length === 0 && <tr><td colSpan={10}>No ad spend in the last 90 days.</td></tr>}
          {ads.map((a) => (
            <tr key={a.ad_id}>
              <td>{a.ad_name}</td>
              <td style={{ color: "var(--text-3)" }}>{a.adset_name}</td>
              <td><span className={a.status === "Active" ? "pill good" : "pill"}>{a.status}</span></td>
              <td className="r tnum">{usd(a.spend)}</td>
              <td className="r tnum">{num(a.impressions)}</td>
              <td className="r tnum">{pct(a.ctr, 2)}</td>
              <td className="r tnum">{usd(a.cpc, true)}</td>
              <td className="r tnum">{num(a.meta_leads)}</td>
              <td className="r tnum">{num(a.ghl_submissions)}</td>
              <td className="r tnum">{num(a.qualified)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

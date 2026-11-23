import type { Person } from "@/lib/types";
import type { AdCreative } from "@/lib/data";

const metaLink = (accountId: string, adId: string) =>
  `https://adsmanager.facebook.com/adsmanager/manage/ads?act=${accountId}&selected_ad_ids=${adId}`;
export const ghlLink = (locationId: string, contactId: string) =>
  `https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${contactId}`;

function step(p: Person) {
  if (p.call !== "—") return `${p.funnel_a} · call ${p.call.toLowerCase()}`;
  return p.funnel_a === "—" ? (p.funnel_b !== "—" ? "Funnel B opt-in" : "Lead") : p.funnel_a;
}

/** One card per ad: the creative, its links, and every person it brought in. */
export function AdsByLead({ people, creatives, metaAccountId, ghlLocationId }: {
  people: Person[]; creatives: Record<string, AdCreative>; metaAccountId: string; ghlLocationId: string;
}) {
  const groups = new Map<string, Person[]>();
  // Only people GoHighLevel can tie to a specific ad.
  for (const p of people.filter((x) => x.ad_id)) {
    const k = p.ad_id || "";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(p);
  }
  const ordered = [...groups.entries()].sort((a, b) => (a[0] === "" ? 1 : b[0] === "" ? -1 : b[1].length - a[1].length));
  return (
    <div className="ads-by-lead">
      {ordered.map(([adId, list]) => {
        const c = creatives[adId];
        return (
          <div className="card ad-card" key={adId || "untracked"}>
            <div className="ad-creative">
              {c?.image ? <img src={c.image} alt={`${list[0].ad_name} ad`} /> : <div className={adId ? "ad-noimg" : "ad-noimg short"}>{adId ? "No preview" : "No ad tracking"}</div>}
            </div>
            <div className="ad-body">
              <div className="ad-title">{adId ? list[0].ad_name : "Ad not recorded"}</div>
              <div className="ad-meta">
                {adId ? <>{list[0].adset_name}{c?.format ? ` · ${c.format}` : ""} · {list.length} {list.length === 1 ? "person" : "people"}</> : "These people arrived without ad tracking, so GoHighLevel can’t say which ad they saw."}
              </div>
              {adId && (
                <div className="ad-links">
                  <a href={metaLink(metaAccountId, adId)} target="_blank" rel="noreferrer">Open in Meta Ads Manager ↗</a>
                </div>
              )}
              {c?.body && (
                <details className="ad-copy">
                  <summary>Ad copy</summary>
                  <p>{c.body}</p>
                </details>
              )}
              <table className="ad-people">
                <tbody>
                  {list.map((p) => (
                    <tr key={p.person}>
                      <td><strong>{p.name}</strong></td>
                      <td className="muted">{step(p)}</td>
                      <td className="r">{p.contact_id ? <a href={ghlLink(ghlLocationId, p.contact_id)} target="_blank" rel="noreferrer">Open in GHL ↗</a> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

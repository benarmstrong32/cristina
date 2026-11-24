import type { AdTotal, Creative } from "@/lib/types";
import { num, pct, usd } from "@/lib/format";

const statusLabel = (s: string) => (s === "ACTIVE" ? "Active" : s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()));

/** Ad image, what the ad is, its copy and results. */
export function AdPreview({ ad, c, children }: { ad: AdTotal | undefined; c: Creative | undefined; children?: React.ReactNode }) {
  const id = ad?.id ?? "";
  return (
    <div className="card ad-card">
      <div className="ad-creative">
        {c?.image ? <img src={c.image} alt={`Preview of ${ad?.name ?? "the ad"}`} loading="lazy" /> : <div className="ad-noimg">No preview saved</div>}
      </div>
      <div className="ad-body">
        <div className="ad-title">{ad?.name ?? "Unknown ad"}</div>
        <div className="ad-meta">
          {ad && !ad.id ? "Ad name from GoHighLevel's tracking (no Meta ad ID recorded)" : [c?.format, c?.adset, ad ? statusLabel(ad.status) : null].filter(Boolean).join(" · ")}
        </div>
        {c?.about ? <p className="ad-about">{c.about}</p> : null}
        {ad && ad.id ? (
          <div className="ad-stats tnum">
            <span><b>{usd(ad.spend)}</b> spent</span>
            <span><b>{num(ad.applications)}</b> applications{ad.applications ? ` · ${usd(ad.spend / ad.applications)} each` : ""}</span>
            <span><b>{pct(ad.impressions ? ad.clicks / ad.impressions : null, 2)}</b> CTR</span>
          </div>
        ) : null}
        {c?.headline || c?.body ? (
          <details className="ad-copy">
            <summary>Ad copy</summary>
            {c.headline ? <p><strong>{c.headline}</strong></p> : null}
            {c.body ? <p>{c.body}</p> : null}
          </details>
        ) : null}
        {id ? <div className="ad-links"><a href={`https://adsmanager.facebook.com/adsmanager/manage/ads?act=1890396841064251&selected_ad_ids=${id}`} target="_blank" rel="noreferrer">Open in Meta Ads Manager ↗</a></div> : null}
        {children}
      </div>
    </div>
  );
}

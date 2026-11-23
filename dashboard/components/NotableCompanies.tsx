import type { NotableContent } from "@/lib/content";
import { shortDate } from "@/lib/format";

/** Leads from verified, well-established companies, with why they stand out. */
export function NotableCompanies({ content: NOTABLE_COMPANIES }: { content: NotableContent | null }) {
  if (!NOTABLE_COMPANIES || !NOTABLE_COMPANIES.items.length) return null;
  return (
    <>
      <h2 className="section">Companies worth a closer look <span className="sub">leads from established companies we could verify · as of {shortDate(NOTABLE_COMPANIES.asOf)}</span></h2>
      <div className="grid kpis notable">
        {NOTABLE_COMPANIES.items.map((c) => (
          <div className="card notable-card" key={c.company}>
            <div className="notable-head">
              <span className="notable-company">{c.company}</span>
              <span className="pill good">{c.fit}</span>
            </div>
            <div className="notable-lead">{c.lead} · <span>{c.role}</span></div>
            <p>{c.why}</p>
            <div className="notable-sources">
              {c.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a>)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

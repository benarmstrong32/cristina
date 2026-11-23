import type { Person, Snapshot } from "@/lib/types";
import { shortDate } from "@/lib/format";

const pill = (v: string, good: string[], warn: string[], bad: string[] = []) =>
  v === "—" ? undefined : good.includes(v) ? "pill good" : warn.includes(v) ? "pill warn" : bad.includes(v) ? "pill bad" : "pill";

/** Application answers, labelled with the questions as asked on the form. */
const FORM_COLUMNS: { key: keyof Person; label: string }[] = [
  { key: "role", label: "Job title / role" },
  { key: "company", label: "Company or website" },
  { key: "team_size", label: "Sales team size" },
  { key: "challenge", label: "Biggest thing holding the team back" },
  { key: "budget", label: "Budget for sales training" },
  { key: "timeline", label: "When looking to make a change" },
  { key: "decision_maker", label: "Who makes the final call" },
  { key: "training", label: "How the team is trained today" },
  { key: "notes", label: "Anything else Chris should know" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
];

function phone(v: string) {
  const d = v.replace(/\D/g, "");
  const us = d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
  return us.length === 10 ? `(${us.slice(0, 3)}) ${us.slice(3, 6)}-${us.slice(6)}` : v;
}

/** Everyone who entered either funnel: furthest step reached plus everything they told us on the form. */
export function PeopleTable({ people, showTracking }: { people: Snapshot["people"]; showTracking?: boolean }) {
  // Only show answer columns that someone actually filled in.
  const cols = FORM_COLUMNS.filter((c) => people.some((p) => p[c.key]));
  const span = 6 + cols.length + (showTracking ? 2 : 0);
  return (
    <div className="card table-wrap">
      <table className="people">
        <thead>
          <tr>
            <th>First seen</th><th>Name</th>
            {cols.map((c) => <th key={c.key}>{c.label}</th>)}
            <th>Funnel A application</th><th>Funnel B</th><th>Call with Chris</th><th>Sales outcome</th>
            {showTracking && <th>Ad tracking</th>}
            {showTracking && <th>9miles media lead tag</th>}
          </tr>
        </thead>
        <tbody>
          {people.length === 0 && <tr><td colSpan={span}>Nobody has entered either funnel yet.</td></tr>}
          {people.map((p) => (
            <tr key={p.person}>
              <td className="tnum">{shortDate(p.first_date)}</td>
              <td><strong>{p.name}</strong></td>
              {cols.map((c) => {
                const v = String(p[c.key] ?? "");
                return (
                  <td key={c.key} className={c.key === "notes" || c.key === "challenge" ? "wrap" : undefined}>
                    {!v ? "—" : c.key === "email" ? <a href={`mailto:${v}`}>{v}</a> : c.key === "phone" ? <span className="tnum">{phone(v)}</span> : v}
                  </td>
                );
              })}
              <td><span className={pill(p.funnel_a, ["Completed · qualified"], ["Started, did not finish"])}>{p.funnel_a}</span></td>
              <td>{p.funnel_b}</td>
              <td><span className={pill(p.call, ["Attended"], ["Booked · outcome not marked"], ["No-show"])}>{p.call}</span></td>
              <td><span className={pill(p.sales, ["Customer"], [], ["Lost"])}>{p.sales}</span></td>
              {showTracking && <td>{p.from_ads}</td>}
              {showTracking && <td><span className={p.lead_tag === "Yes" ? "pill good" : "pill warn"}>{p.lead_tag}</span></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

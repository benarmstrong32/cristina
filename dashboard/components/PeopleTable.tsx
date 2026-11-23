import type { Snapshot } from "@/lib/types";
import { shortDate } from "@/lib/format";

const pill = (v: string, good: string[], warn: string[], bad: string[] = []) =>
  v === "—" ? undefined : good.includes(v) ? "pill good" : warn.includes(v) ? "pill warn" : bad.includes(v) ? "pill bad" : "pill";

/** Everyone who entered either funnel, with the furthest step each reached. */
export function PeopleTable({ people, showTracking }: { people: Snapshot["people"]; showTracking?: boolean }) {
  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>First seen</th><th>Name</th><th>Funnel A application</th><th>Funnel B</th><th>Call with Chris</th><th>Sales outcome</th>
            {showTracking && <th>Ad tracking</th>}
          </tr>
        </thead>
        <tbody>
          {people.length === 0 && <tr><td colSpan={showTracking ? 7 : 6}>Nobody has entered either funnel yet.</td></tr>}
          {people.map((p) => (
            <tr key={p.person}>
              <td className="tnum">{shortDate(p.first_date)}</td>
              <td>{p.name}</td>
              <td><span className={pill(p.funnel_a, ["Completed · qualified"], ["Started, did not finish"])}>{p.funnel_a}</span></td>
              <td>{p.funnel_b}</td>
              <td><span className={pill(p.call, ["Attended"], ["Booked · outcome not marked"], ["No-show"])}>{p.call}</span></td>
              <td><span className={pill(p.sales, ["Customer"], [], ["Lost"])}>{p.sales}</span></td>
              {showTracking && <td>{p.from_ads}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

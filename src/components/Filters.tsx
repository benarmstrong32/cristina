import Link from "next/link";
import { PRESETS } from "../lib/dates";

type Props = {
  basePath: string;
  params: Record<string, string | undefined>;
  range: { since: string; until: string; label: string };
  extra?: React.ReactNode;
};

function href(base: string, params: Record<string, string | undefined>, patch: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...params, ...patch })) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export function Filters({ basePath, params, range, extra }: Props) {
  return (
    <div className="filters">
      <div className="seg" role="group" aria-label="Date range">
        {Object.keys(PRESETS).map((k) => (
          <Link key={k} className={range.label === k ? "on" : ""}
            href={href(basePath, params, { range: k, since: undefined, until: undefined })}>
            {k}
          </Link>
        ))}
      </div>
      <form method="get" action={basePath} style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {Object.entries(params).filter(([k, v]) => v && !["range", "since", "until"].includes(k)).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <input type="date" name="since" defaultValue={range.since} aria-label="From" />
        <span className="muted">→</span>
        <input type="date" name="until" defaultValue={range.until} aria-label="To" />
        <button className="ghost" type="submit">Apply</button>
      </form>
      {extra}
    </div>
  );
}

export function SegLinks({ basePath, params, name, options, current }: {
  basePath: string; params: Record<string, string | undefined>; name: string;
  options: { value?: string; label: string }[]; current?: string;
}) {
  return (
    <div className="seg" role="group" aria-label={name}>
      {options.map((o) => (
        <Link key={o.label} className={current === o.value ? "on" : ""} href={href(basePath, params, { [name]: o.value })}>
          {o.label}
        </Link>
      ))}
    </div>
  );
}

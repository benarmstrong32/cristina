import { monthLabel } from "@/lib/metrics";

type Bar = { month: string; value: number; target?: number; second?: number };

/** Monthly bars with the value printed on top. Optional second bar and a dashed target line per month. */
export function MonthBars({
  data, color, secondColor, format, label, width = 560,
}: { data: Bar[]; color: string; secondColor?: string; format: "usd" | "int"; label: string; width?: number }) {
  const W = width, H = 190, padT = 22, padB = 24, padX = 8;
  const max = Math.max(1, ...data.flatMap((d) => [d.value, d.second ?? 0, d.target ?? 0]));
  const plotH = H - padT - padB;
  const step = (W - padX * 2) / Math.max(1, data.length);
  const two = data.some((d) => d.second != null);
  const barW = Math.min(two ? 34 : 56, step * (two ? 0.3 : 0.5));
  const y = (v: number) => padT + plotH - (v / max) * plotH;
  const fmt = (v: number) => (format === "usd" ? `$${Math.round(v).toLocaleString("en-US")}` : Math.round(v).toLocaleString("en-US"));
  const bar = (x: number, v: number, c: string) => {
    const h = v > 0 ? Math.max(2, (v / max) * plotH) : 0;
    return (
      <g>
        {h > 0 && <rect x={x} y={padT + plotH - h} width={barW} height={h} rx={3} fill={c} />}
        <text className="axis val tnum" x={x + barW / 2} y={padT + plotH - h - 5} textAnchor="middle">{fmt(v)}</text>
      </g>
    );
  };
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <line className="grid-line" x1={padX} x2={W - padX} y1={padT + plotH} y2={padT + plotH} />
        {data.map((d, i) => {
          const cx = padX + i * step + step / 2;
          const x1 = two ? cx - barW - 3 : cx - barW / 2;
          return (
            <g key={d.month}>
              {bar(x1, d.value, color)}
              {two && bar(cx + 3, d.second ?? 0, secondColor ?? color)}
              {d.target != null && (
                <>
                  <line x1={cx - barW - 14} x2={cx + barW + 14} y1={y(d.target)} y2={y(d.target)} className="target-line" />
                  <text className="axis" x={cx - barW - 18} y={y(d.target) + 4} textAnchor="end">goal {d.target}</text>
                </>
              )}
              <text className="axis" x={cx} y={H - 6} textAnchor="middle">{monthLabel(d.month)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

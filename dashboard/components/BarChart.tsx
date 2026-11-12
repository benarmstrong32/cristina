"use client";
import { useState } from "react";

type Point = { date: string; value: number };

/** Daily bar chart: thin bars, 4px rounded tops anchored to baseline, hover tooltip. */
export function BarChart({
  data, color, format, label,
}: { data: Point[]; color: string; format: "usd" | "int"; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 560, H = 180, padL = 44, padB = 22, padT = 8;
  const max = Math.max(1, ...data.map((d) => d.value));
  const nice = niceMax(max);
  const plotW = W - padL, plotH = H - padB - padT;
  const step = plotW / Math.max(1, data.length);
  const barW = Math.max(2, Math.min(18, step - 2));
  const fmt = (v: number) =>
    format === "usd" ? `$${v.toLocaleString("en-US", { maximumFractionDigits: v < 100 ? 2 : 0 })}` : v.toLocaleString("en-US");
  const ticks = [0, nice / 2, nice];
  const labelEvery = Math.ceil(data.length / 6);
  const h = hover != null ? data[hover] : null;

  return (
    <div className="chart" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {ticks.map((t) => {
          const y = padT + plotH - (t / nice) * plotH;
          return (
            <g key={t}>
              <line className="grid-line" x1={padL} x2={W} y1={y} y2={y} />
              <text className="axis tnum" x={padL - 6} y={y + 4} textAnchor="end">
                {format === "usd" ? `$${Math.round(t)}` : Math.round(t)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = padL + i * step + (step - barW) / 2;
          const bh = (d.value / nice) * plotH;
          const y = padT + plotH - bh;
          const r = Math.min(4, barW / 2, bh);
          return (
            <g key={d.date}>
              {bh > 0 && (
                <path
                  d={`M${x},${y + plotH - (y - padT) + 0} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${padT + plotH} Z`}
                  fill={color}
                  opacity={hover == null || hover === i ? 1 : 0.45}
                />
              )}
              {i % labelEvery === 0 && (
                <text className="axis" x={x + barW / 2} y={H - 6} textAnchor="middle">
                  {short(d.date)}
                </text>
              )}
              <rect className="hit" x={padL + i * step} y={padT} width={step} height={plotH} onMouseEnter={() => setHover(i)} />
            </g>
          );
        })}
      </svg>
      {h && hover != null && (
        <div
          className="tip tnum"
          style={{
            left: `${((padL + hover * step + step / 2) / W) * 100}%`,
            top: `${((padT + plotH - (h.value / nice) * plotH) / H) * 100}%`,
          }}
        >
          {short(h.date)} · {fmt(h.value)}
        </div>
      )}
    </div>
  );
}

function short(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

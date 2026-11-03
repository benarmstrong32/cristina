"use client";
import { useMemo, useRef, useState } from "react";

export type Series = { key: string; label: string; color: string; values: (number | null)[]; dashed?: boolean };

type Props = {
  dates: string[];
  series: Series[];
  /** Formatter is chosen here because functions can't cross the server→client boundary. */
  unit: { kind: "money"; currency: string } | { kind: "roas" };
  reference?: { value: number; label: string };
  height?: number;
};

const W = 640, PAD = { t: 10, r: 12, b: 24, l: 56 };

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= v)!;
}

/** Single-axis line chart with crosshair + tooltip. All series share one unit. */
export function TrendChart({ dates, series, unit, reference, height = 220 }: Props) {
  const format = (v: number) => unit.kind === "roas" ? `${+v.toFixed(2)}x`
    : new Intl.NumberFormat("en-US", { style: "currency", currency: unit.currency, notation: v >= 10_000 ? "compact" : "standard", maximumFractionDigits: 0 }).format(v);
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const H = height;
  const innerW = W - PAD.l - PAD.r, innerH = H - PAD.t - PAD.b;

  const max = useMemo(() => niceMax(Math.max(
    reference?.value ?? 0,
    ...series.flatMap((s) => s.values.filter((v): v is number => v != null)),
  )), [series, reference]);

  const x = (i: number) => PAD.l + (dates.length <= 1 ? innerW / 2 : (i / (dates.length - 1)) * innerW);
  const y = (v: number) => PAD.t + innerH - (v / max) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const xTicks = dates.length ? [0, Math.floor((dates.length - 1) / 2), dates.length - 1] : [];

  const path = (vals: (number | null)[]) => {
    let d = "", pen = false;
    vals.forEach((v, i) => {
      if (v == null) { pen = false; return; }
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  };

  function onMove(e: React.PointerEvent) {
    const svg = ref.current;
    if (!svg || !dates.length) return;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - PAD.l) / innerW) * (dates.length - 1));
    setHover(Math.max(0, Math.min(dates.length - 1, i)));
  }

  const short = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

  return (
    <div className="chart">
      {series.length > 1 && (
        <div className="legend">
          {series.map((s) => <span key={s.key} style={{ ["--c" as string]: s.color }}>{s.label}</span>)}
          {reference && <span style={{ ["--c" as string]: "var(--text-3)" }}>{reference.label}</span>}
        </div>
      )}
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img"
        aria-label={series.map((s) => s.label).join(", ") + " by day"}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--grid)" strokeWidth={1} />
            <text x={PAD.l - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={10} fill="var(--text-3)">{format(t)}</text>
          </g>
        ))}
        {xTicks.map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === dates.length - 1 ? "end" : "middle"} fontSize={10} fill="var(--text-3)">
            {short(dates[i])}
          </text>
        ))}
        {reference && (
          <line x1={PAD.l} x2={W - PAD.r} y1={y(reference.value)} y2={y(reference.value)} stroke="var(--text-3)" strokeDasharray="4 4" strokeWidth={1} />
        )}
        {series.map((s) => (
          <path key={s.key} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
            strokeDasharray={s.dashed ? "5 4" : undefined} />
        ))}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + innerH} stroke="var(--text-3)" strokeWidth={1} />
            {series.map((s) => s.values[hover] != null && (
              <circle key={s.key} cx={x(hover)} cy={y(s.values[hover]!)} r={4} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
            ))}
          </g>
        )}
        <rect x={PAD.l} y={PAD.t} width={innerW} height={innerH} fill="transparent" />
      </svg>
      {hover != null && (
        <div className="tip" style={{ left: `${(x(hover) / W) * 100}%`, top: 8, transform: `translateX(${x(hover) > W / 2 ? "-105%" : "5%"})` }}>
          <b>{short(dates[hover])}</b>
          {series.map((s) => (
            <div key={s.key} style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
              <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: s.color, marginRight: 6 }} />{s.label}</span>
              <span>{s.values[hover] == null ? "—" : format(s.values[hover]!)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

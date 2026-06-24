"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ControlSeries } from "@/lib/factions/control-history";
import { useFactionsStore } from "@/stores/factions-store";
import { cn } from "@/lib/utils";

type Range = "24h" | "7d";

type Props = {
  series24h: ControlSeries[];
  series7d: ControlSeries[];
};

const W = 560;
const H = 220;
const PAD = { top: 12, right: 12, bottom: 28, left: 36 };

function buildPath(
  points: { t: number; percent: number }[],
  tMin: number,
  tMax: number,
  plotW: number,
  plotH: number
): string {
  if (points.length === 0) return "";
  const tSpan = tMax - tMin || 1;

  return points
    .map((p, i) => {
      const x = PAD.left + ((p.t - tMin) / tSpan) * plotW;
      const y = PAD.top + plotH - (p.percent / 100) * plotH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function FactionControlChart({ series24h, series7d }: Props) {
  const [range, setRange] = useState<Range>("24h");
  const liveFactions = useFactionsStore((s) => s.factions);

  const series = range === "24h" ? series24h : series7d;

  const hasData = series.some((s) => s.points.length > 0);

    const { plotW, plotH, paths, yTicks, xLabels } = useMemo(() => {
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    const allPoints = series.flatMap((s) => s.points);
    if (allPoints.length === 0) {
      return {
        plotW,
        plotH,
        paths: [] as { slug: string; color: string; d: string }[],
        yTicks: [0, 25, 50, 75, 100],
        xLabels: [] as { x: number; label: string }[],
      };
    }

    const tMin = Math.min(...allPoints.map((p) => p.t));
    const tMax = Math.max(...allPoints.map((p) => p.t));
    const tSpan = tMax - tMin || 1;

    const paths = series.map((s) => ({
      slug: s.slug,
      color: s.color,
      d: buildPath(s.points, tMin, tMax, plotW, plotH),
    }));

    const yTicks = [0, 25, 50, 75, 100];

    const xLabelCount = range === "24h" ? 5 : 7;
    const xLabels = Array.from({ length: xLabelCount }, (_, i) => {
      const t = tMin + (tSpan * i) / (xLabelCount - 1);
      const x = PAD.left + (plotW * i) / (xLabelCount - 1);
      const fmt = range === "24h" ? "HH:mm" : "EEE d";
      return { x, label: format(new Date(t), fmt, { locale: fr }) };
    });

    return { plotW, plotH, paths, yTicks, xLabels };
  }, [series, range]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-3">
          {series.map((s) => {
            const live = liveFactions.find((f) => f.slug === s.slug);
            const current = live
              ? Number(live.control_percent).toFixed(1)
              : s.points.at(-1)?.percent.toFixed(1) ?? "—";
            return (
              <div key={s.slug} className="flex items-center gap-1.5 text-meta">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span style={{ color: s.color }}>{s.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {current}%
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex shrink-0 rounded-lg border border-border p-0.5">
          {(["24h", "7j"] as const).map((label) => {
            const value: Range = label === "24h" ? "24h" : "7d";
            return (
              <button
                key={label}
                type="button"
                onClick={() => setRange(value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-meta font-medium transition-colors",
                  range === value
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {!hasData ? (
        <p className="rounded-lg border border-border bg-secondary/20 px-4 py-8 text-center text-meta text-muted-foreground">
          L&apos;historique se remplit au fil de l&apos;activité du réseau.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full min-w-[280px] max-w-full"
            role="img"
            aria-label="Évolution du contrôle des factions"
          >
            {yTicks.map((tick) => {
              const y = PAD.top + plotH - (tick / 100) * plotH;
              return (
                <g key={tick}>
                  <line
                    x1={PAD.left}
                    y1={y}
                    x2={W - PAD.right}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={0.08}
                  />
                  <text
                    x={PAD.left - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-muted-foreground text-[9px]"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {paths.map(
              (p) =>
                p.d && (
                  <path
                    key={p.slug}
                    d={p.d}
                    fill="none"
                    stroke={p.color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )
            )}

            {xLabels.map((lbl) => (
              <text
                key={lbl.label + lbl.x}
                x={lbl.x}
                y={H - 6}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px]"
              >
                {lbl.label}
              </text>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}

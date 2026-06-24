import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  downsampleSnapshotsHourly,
  formatControlDelta,
  parseSnapshotValues,
  significantControlChanges,
  snapshotsToSeries,
} from "@/lib/factions/control-history";
import type { Faction, FactionControlSnapshot } from "@/lib/supabase/types";

const factions: Faction[] = [
  {
    id: "1",
    slug: "purbots",
    name: "PurBots",
    color: "#a855f7",
    description: null,
    control_percent: 45,
  },
  {
    id: "2",
    slug: "assimilateurs",
    name: "Assimilateurs",
    color: "#f97316",
    description: null,
    control_percent: 26,
  },
];

function snap(
  id: number,
  at: string,
  values: { slug: string; percent: number }[]
): FactionControlSnapshot {
  return { id, recorded_at: at, values };
}

describe("parseSnapshotValues", () => {
  it("parse un tableau jsonb valide", () => {
    const parsed = parseSnapshotValues([
      { slug: "purbots", percent: 45.1 },
      { slug: "bad" },
    ]);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0]?.percent, 45.1);
  });
});

describe("snapshotsToSeries", () => {
  it("produit une série par faction", () => {
    const snapshots = [
      snap(1, "2026-06-01T10:00:00Z", [
        { slug: "purbots", percent: 44 },
        { slug: "assimilateurs", percent: 26 },
      ]),
      snap(2, "2026-06-01T11:00:00Z", [
        { slug: "purbots", percent: 45 },
        { slug: "assimilateurs", percent: 25 },
      ]),
    ];

    const series = snapshotsToSeries(snapshots, factions);
    assert.equal(series.length, 2);
    assert.equal(series[0]?.points.length, 2);
    assert.equal(series[0]?.points[1]?.percent, 45);
  });
});

describe("formatControlDelta", () => {
  it("ignore les deltas sous 0.1%", () => {
    const prev = snap(1, "2026-06-01T10:00:00Z", [{ slug: "purbots", percent: 45 }]);
    const next = snap(2, "2026-06-01T10:05:00Z", [{ slug: "purbots", percent: 45.05 }]);
    assert.equal(formatControlDelta(prev, next, factions).length, 0);
  });

  it("détecte un changement significatif", () => {
    const prev = snap(1, "2026-06-01T10:00:00Z", [{ slug: "purbots", percent: 44.9 }]);
    const next = snap(2, "2026-06-01T10:05:00Z", [{ slug: "purbots", percent: 45.1 }]);
    const deltas = formatControlDelta(prev, next, factions);
    assert.equal(deltas.length, 1);
    assert.equal(deltas[0]?.delta, 0.2);
    assert.equal(deltas[0]?.to, 45.1);
  });
});

describe("significantControlChanges", () => {
  it("retourne les changements récents triés", () => {
    const snapshots = [
      snap(1, "2026-06-01T10:00:00Z", [{ slug: "purbots", percent: 44 }]),
      snap(2, "2026-06-01T11:00:00Z", [{ slug: "purbots", percent: 45 }]),
      snap(3, "2026-06-01T12:00:00Z", [{ slug: "purbots", percent: 46 }]),
    ];
    const changes = significantControlChanges(snapshots, factions, 5);
    assert.ok(changes.length >= 2);
    assert.equal(changes[0]?.to, 46);
  });
});

describe("downsampleSnapshotsHourly", () => {
  it("garde le dernier point par heure", () => {
    const snapshots = [
      snap(1, "2026-06-01T10:05:00Z", [{ slug: "purbots", percent: 44 }]),
      snap(2, "2026-06-01T10:55:00Z", [{ slug: "purbots", percent: 45 }]),
      snap(3, "2026-06-01T11:10:00Z", [{ slug: "purbots", percent: 46 }]),
    ];
    const down = downsampleSnapshotsHourly(snapshots);
    assert.equal(down.length, 2);
    assert.equal(down[0]?.id, 2);
    assert.equal(down[1]?.id, 3);
  });
});

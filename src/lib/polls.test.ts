import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  pollDurationFromParts,
  pollPercentages,
  validatePollDraft,
  formatPollTimeRemaining,
} from "@/lib/polls";

describe("validatePollDraft", () => {
  it("accepte un sondage valide", () => {
    assert.equal(
      validatePollDraft({
        options: ["Oui", "Non"],
        durationMinutes: 60,
      }),
      null
    );
  });

  it("rejette trop peu de choix", () => {
    assert.ok(
      validatePollDraft({ options: ["Seul"], durationMinutes: 60 })
    );
  });

  it("rejette label trop long", () => {
    assert.ok(
      validatePollDraft({
        options: ["a".repeat(26), "b"],
        durationMinutes: 60,
      })
    );
  });
});

describe("pollDurationFromParts", () => {
  it("convertit jours heures minutes", () => {
    assert.equal(pollDurationFromParts(1, 0, 0), 1440);
    assert.equal(pollDurationFromParts(0, 2, 30), 150);
  });
});

describe("pollPercentages", () => {
  it("somme à 100", () => {
    const pct = pollPercentages([
      { votes_count: 1 },
      { votes_count: 2 },
      { votes_count: 3 },
    ]);
    assert.equal(pct.reduce((a, b) => a + b, 0), 100);
  });
});

describe("formatPollTimeRemaining", () => {
  it("formate minutes, heures et jours", () => {
    const now = Date.parse("2026-06-02T12:00:00Z");
    assert.equal(
      formatPollTimeRemaining("2026-06-02T12:30:00Z", now),
      "30 min restantes"
    );
    assert.equal(
      formatPollTimeRemaining("2026-06-02T15:00:00Z", now),
      "3 h restantes"
    );
    assert.equal(
      formatPollTimeRemaining("2026-06-05T12:00:00Z", now),
      "3 j restants"
    );
  });

  it("retourne null si expiré", () => {
    assert.equal(
      formatPollTimeRemaining("2026-06-01T12:00:00Z", Date.parse("2026-06-02T12:00:00Z")),
      null
    );
  });
});

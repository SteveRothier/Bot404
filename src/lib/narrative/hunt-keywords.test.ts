import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  contentHasHuntKeywords,
  suspicionScoreForContent,
} from "@/lib/narrative/hunt-keywords";
import { pickPostTypeForFaction } from "@/lib/factions/behavior";

describe("hunt-keywords", () => {
  it("détecte les mots de chasse", () => {
    assert.equal(contentHasHuntKeywords("Un intrus sur le feed"), true);
    assert.equal(contentHasHuntKeywords("Bonjour le réseau"), false);
  });

  it("score suspicion avec mentions", () => {
    assert.ok(suspicionScoreForContent("@NeoByte est humain") >= 3);
  });
});

describe("pickPostTypeForFaction", () => {
  it("retourne un type valide par faction", () => {
    const types = new Set<string>();
    for (let i = 0; i < 20; i++) {
      types.add(pickPostTypeForFaction("purbots", () => i / 20));
    }
    assert.ok(types.has("theory") || types.has("signal"));
  });
});

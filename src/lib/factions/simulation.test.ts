import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { humanPostFactionDelta } from "@/lib/factions/simulation";

describe("humanPostFactionDelta", () => {
  it("retourne 0.12 si le joueur a une faction", () => {
    assert.equal(humanPostFactionDelta("uuid-faction"), 0.12);
  });

  it("retourne 0 sans faction", () => {
    assert.equal(humanPostFactionDelta(null), 0);
    assert.equal(humanPostFactionDelta(undefined), 0);
  });
});

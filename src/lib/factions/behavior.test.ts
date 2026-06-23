import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { factionCastBonus } from "@/lib/factions/behavior";
import type { NarrativeSignal } from "@/lib/narrative/types";

function reactionSignal(
  reactionKind: "amplify" | "flag",
  postType: string,
  postAuthorIsNpc = true
): NarrativeSignal {
  return {
    id: 1,
    kind: "reaction",
    author_id: "human-1",
    post_id: 10,
    comment_id: null,
    reaction_kind: reactionKind,
    mentioned_username: null,
    priority: 30,
    status: "pending",
    payload: { post_type: postType, post_author_is_npc: postAuthorIsNpc },
    result: {},
    created_at: new Date().toISOString(),
    handled_at: null,
  };
}

describe("factionCastBonus reaction", () => {
  it("boost Assimilateurs sur amplify rumeur", () => {
    const s = reactionSignal("amplify", "rumor");
    assert.equal(factionCastBonus("assimilateurs", s, ""), 12);
  });

  it("boost PurBots sur flag théorie", () => {
    const s = reactionSignal("flag", "theory");
    assert.equal(factionCastBonus("purbots", s, ""), 12);
  });

  it("boost Humanistes sur flag post humain", () => {
    const s = reactionSignal("flag", "message", false);
    assert.equal(factionCastBonus("humanistes", s, ""), 8);
  });
});

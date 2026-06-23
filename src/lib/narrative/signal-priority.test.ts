import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isStrongEmergentSignal,
  priorityForPost,
  priorityForReaction,
} from "@/lib/narrative/signal-priority";
import { shouldEmergentNpcPost } from "@/lib/narrative/emergent-response-mode";
import type { NarrativeSignal } from "@/lib/narrative/types";

describe("priorityForPost", () => {
  it("priorise theory puis rumor", () => {
    assert.ok(priorityForPost("theory") > priorityForPost("rumor"));
    assert.ok(priorityForPost("rumor") > priorityForPost("message"));
  });
});

describe("priorityForReaction", () => {
  it("priorise amplify et relay", () => {
    assert.ok(priorityForReaction("amplify") > priorityForReaction("relay"));
    assert.ok(priorityForReaction("relay") > priorityForReaction("flag"));
  });
});

describe("isStrongEmergentSignal", () => {
  it("détecte les théories humaines", () => {
    assert.equal(
      isStrongEmergentSignal({
        kind: "human_post",
        priority: 40,
        postType: "theory",
      }),
      true
    );
    assert.equal(
      isStrongEmergentSignal({
        kind: "human_post",
        priority: 15,
        postType: "message",
      }),
      false
    );
  });
});

describe("shouldEmergentNpcPost", () => {
  it("ne poste pas hors human_post", () => {
    const signal = {
      kind: "mention",
      priority: 45,
      payload: {},
    } as unknown as NarrativeSignal;
    assert.equal(shouldEmergentNpcPost(signal, () => 0), false);
  });

  it("respecte le tirage aléatoire", () => {
    const signal = {
      kind: "human_post",
      priority: 40,
      payload: { post_type: "theory" },
    } as unknown as NarrativeSignal;
    assert.equal(shouldEmergentNpcPost(signal, () => 0.1), true);
    assert.equal(shouldEmergentNpcPost(signal, () => 0.9), false);
  });

  it("peut poster en réponse à un commentaire sur théorie", () => {
    const signal = {
      kind: "human_comment",
      priority: 28,
      payload: { post_type: "theory" },
    } as unknown as NarrativeSignal;
    assert.equal(shouldEmergentNpcPost(signal, () => 0.1), true);
    assert.equal(shouldEmergentNpcPost(signal, () => 0.9), false);
  });
});

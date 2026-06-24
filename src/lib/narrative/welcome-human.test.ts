import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildWelcomePostPrompt,
  pickNpcForWelcomeBeat,
  priorityForHumanJoined,
  scoreNpcForWelcomeBeat,
  usernameFromWelcomeSignal,
  welcomeAmbientPromptBlock,
  welcomeBeatFromPayload,
} from "@/lib/narrative/welcome-human";
import type { NarrativeSignal } from "@/lib/narrative/types";
import type { Profile } from "@/lib/supabase/types";

function npc(id: string, factionSlug: string | null): Profile {
  return {
    id,
    username: `npc_${id}`,
    avatar_url: null,
    bio: null,
    is_npc: true,
    personality: null,
    popularity_score: 0,
    faction_id: factionSlug,
    trust_score: 0,
    influence_score: 0,
    created_at: new Date().toISOString(),
    faction: factionSlug
      ? {
          id: factionSlug,
          slug: factionSlug,
          name: factionSlug,
          color: "#fff",
          control_percent: 0,
          created_at: new Date().toISOString(),
        }
      : null,
  };
}

describe("buildWelcomePostPrompt", () => {
  it("mentionne @username dans system et user", () => {
    const { system, user } = buildWelcomePostPrompt(
      npc("1", "humanistes"),
      "Alice",
      "welcome"
    );
    assert.match(system, /@Alice/);
    assert.match(user, /@Alice/);
  });

  it("adapte le ton selon le beat", () => {
    const suspicion = buildWelcomePostPrompt(
      npc("2", "purbots"),
      "Bob",
      "suspicion"
    );
    assert.match(suspicion.system, /Soupçonne|humain|glitch/i);
  });
});

describe("welcomeBeatFromPayload", () => {
  it("retourne welcome par défaut", () => {
    assert.equal(welcomeBeatFromPayload({}), "welcome");
    assert.equal(welcomeBeatFromPayload({ beat: "rumor" }), "rumor");
  });
});

describe("usernameFromWelcomeSignal", () => {
  it("lit le payload username", () => {
    const signal = {
      payload: { username: "TestUser" },
    } as NarrativeSignal;
    assert.equal(usernameFromWelcomeSignal(signal), "TestUser");
    assert.equal(usernameFromWelcomeSignal({ payload: {} } as NarrativeSignal), "humain");
  });
});

describe("pickNpcForWelcomeBeat", () => {
  it("favorise la faction cible", () => {
    const humaniste = npc("h", "humanistes");
    const purbot = npc("p", "purbots");
    const picked = pickNpcForWelcomeBeat(
      [purbot, humaniste],
      "welcome",
      () => 0.01
    );
    assert.equal(picked?.id, humaniste.id);
  });
});

describe("scoreNpcForWelcomeBeat", () => {
  it("score PurBots sur suspicion", () => {
    assert.ok(
      scoreNpcForWelcomeBeat(npc("p", "purbots"), "suspicion") >
        scoreNpcForWelcomeBeat(npc("h", "humanistes"), "suspicion")
    );
  });
});

describe("priorityForHumanJoined", () => {
  it("décroît par vague", () => {
    assert.equal(priorityForHumanJoined(0), 48);
    assert.equal(priorityForHumanJoined(1), 46);
    assert.equal(priorityForHumanJoined(2), 44);
    assert.equal(priorityForHumanJoined(3), 42);
  });
});

describe("welcomeAmbientPromptBlock", () => {
  it("mentionne le nouvel humain", () => {
    assert.match(welcomeAmbientPromptBlock("Newbie"), /@Newbie/);
  });
});

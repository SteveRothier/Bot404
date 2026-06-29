import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  NPC_GENERATION_FLAG_FILE,
  getNpcGenerationDisabledReason,
  isNpcGenerationEnabled,
} from "@/lib/engine/shared/generation-gate";

const flagPath = resolve(process.cwd(), NPC_GENERATION_FLAG_FILE);

describe("generation-gate", () => {
  const originalEnv = process.env.NPC_GENERATION_ENABLED;

  beforeEach(() => {
    if (existsSync(flagPath)) unlinkSync(flagPath);
    delete process.env.NPC_GENERATION_ENABLED;
  });

  afterEach(() => {
    if (existsSync(flagPath)) unlinkSync(flagPath);
    if (originalEnv === undefined) {
      delete process.env.NPC_GENERATION_ENABLED;
    } else {
      process.env.NPC_GENERATION_ENABLED = originalEnv;
    }
  });

  it("activé par défaut sans fichier ni env", () => {
    assert.equal(isNpcGenerationEnabled(), true);
    assert.equal(getNpcGenerationDisabledReason(), null);
  });

  it("désactivé si le fichier flag existe", () => {
    writeFileSync(flagPath, "", "utf8");
    assert.equal(isNpcGenerationEnabled(), false);
    assert.match(getNpcGenerationDisabledReason() ?? "", /\.npc-generation-off/);
  });

  it("désactivé si NPC_GENERATION_ENABLED=false", () => {
    process.env.NPC_GENERATION_ENABLED = "false";
    assert.equal(isNpcGenerationEnabled(), false);
    assert.match(getNpcGenerationDisabledReason() ?? "", /NPC_GENERATION_ENABLED/);
  });
});

import { existsSync } from "node:fs";
import { resolve } from "node:path";

export const NPC_GENERATION_FLAG_FILE = ".npc-generation-off";
export const NPC_GENERATION_DISABLED_ERROR = "Génération NPC désactivée.";

function flagFilePath(): string {
  return resolve(process.cwd(), NPC_GENERATION_FLAG_FILE);
}

export function isNpcGenerationEnabled(): boolean {
  return getNpcGenerationDisabledReason() === null;
}

export function getNpcGenerationDisabledReason(): string | null {
  const env = process.env.NPC_GENERATION_ENABLED?.trim().toLowerCase();
  if (env === "false" || env === "0" || env === "off") {
    return "NPC_GENERATION_ENABLED=false";
  }
  if (existsSync(flagFilePath())) {
    return "fichier .npc-generation-off";
  }
  return null;
}

export type NpcGenerationStatus = {
  enabled: boolean;
  reason: string | null;
};

export function getNpcGenerationStatus(): NpcGenerationStatus {
  const reason = getNpcGenerationDisabledReason();
  return { enabled: reason === null, reason };
}

import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  NPC_GENERATION_FLAG_FILE,
  getNpcGenerationStatus,
} from "@/lib/engine/shared/generation-gate";

const flagPath = resolve(process.cwd(), NPC_GENERATION_FLAG_FILE);
const command = process.argv[2]?.toLowerCase();

function printStatus() {
  const status = getNpcGenerationStatus();
  if (status.enabled) {
    console.log("on — génération NPC activée");
    return;
  }
  console.log(`off — génération NPC désactivée (${status.reason})`);
}

switch (command) {
  case "off": {
    writeFileSync(flagPath, `${new Date().toISOString()}\n`, "utf8");
    console.log("Génération NPC désactivée.");
    break;
  }
  case "on": {
    if (existsSync(flagPath)) {
      unlinkSync(flagPath);
    }
    console.log("Génération NPC activée.");
    break;
  }
  case "status":
    printStatus();
    break;
  default:
    console.error("Usage: npm run npc:generation:on|off|status");
    process.exit(1);
}

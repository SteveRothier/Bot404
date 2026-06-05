import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const result = spawnSync(
  "npx",
  ["tsx", resolve("scripts/npc-generate-cli.ts"), ...args],
  { stdio: "inherit", shell: true, cwd: process.cwd() }
);

process.exit(result.status ?? 1);

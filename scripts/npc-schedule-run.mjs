import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv(resolve(process.cwd(), ".env.local"));

const mode = (process.argv[2] ?? "both").toLowerCase();
const argCount = process.argv[3];

function parseCount(raw, envKey, fallback, max) {
  if (raw && /^\d+$/.test(raw)) {
    return Math.min(max, Math.max(1, Number.parseInt(raw, 10)));
  }
  const fromEnv = Number.parseInt(process.env[envKey] ?? "", 10);
  if (Number.isFinite(fromEnv) && fromEnv >= 1) {
    return Math.min(max, fromEnv);
  }
  return fallback;
}

function runNode(args) {
  const result = spawnSync("node", args, {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
  });
  process.exit(result.status ?? 1);
}

if (mode === "tick") {
  const result = spawnSync("npm", ["run", "npc:tick"], {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
  });
  process.exit(result.status ?? 1);
}

const localScript = resolve("scripts/npc-generate-local.mjs");

if (mode === "posts") {
  const count = parseCount(argCount, "NPC_SCHEDULE_POST_COUNT", 1, 5);
  runNode([localScript, "--posts", String(count)]);
}

if (mode === "comments") {
  const count = parseCount(argCount, "NPC_SCHEDULE_COMMENT_COUNT", 3, 10);
  runNode([localScript, "--comments", String(count)]);
}

runNode([localScript]);

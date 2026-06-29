import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { NarrativeTickResult } from "@/lib/engine/shared/types";

const LAST_TICK_PATH = resolve(process.cwd(), "logs/last-tick.json");

export function persistLastTickResult(result: NarrativeTickResult): void {
  try {
    mkdirSync(dirname(LAST_TICK_PATH), { recursive: true });
    writeFileSync(
      LAST_TICK_PATH,
      JSON.stringify({ ...result, recorded_at: new Date().toISOString() }, null, 2),
      "utf8"
    );
  } catch {
    // ignore — logs dir may be unavailable in some deploy contexts
  }
}

export function lastTickLogPath(): string {
  return LAST_TICK_PATH;
}

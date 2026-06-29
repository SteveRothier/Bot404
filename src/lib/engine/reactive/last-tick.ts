import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { NarrativeTickResult } from "@/lib/engine/shared/types";
import { lastTickLogPath } from "@/lib/engine/reactive/tick-metrics";

export type LastTickRecord = NarrativeTickResult & {
  recorded_at?: string;
};

export function readLastTickResult(): LastTickRecord | null {
  const path = lastTickLogPath();
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as LastTickRecord;
  } catch {
    return null;
  }
}

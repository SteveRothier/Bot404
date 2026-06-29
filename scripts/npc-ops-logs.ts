import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const LOG_PATH = resolve(process.cwd(), "logs/narrative-tick.log");
const LINE_LIMIT = 50;

function tailLines(path: string, limit: number): string[] {
  if (!existsSync(path)) return [];
  const content = readFileSync(path, "utf8");
  return content.split(/\r?\n/).filter(Boolean).slice(-limit);
}

function summarizeTickLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(trimmed) as {
      handled?: boolean;
      mode?: string;
      detail?: Record<string, unknown>;
      metrics?: { duration_ms?: number };
    };
    const duration =
      parsed.metrics?.duration_ms != null
        ? `${(parsed.metrics.duration_ms / 1000).toFixed(1)}s`
        : "?";
    const skipped = parsed.detail?.skipped;
    if (skipped === "generation_disabled") {
      return `SKIP génération désactivée (${duration})`;
    }
    const author = parsed.detail?.author as string | undefined;
    return `${parsed.mode ?? "?"} handled=${parsed.handled} ${author ? `@${author}` : ""} (${duration})`.trim();
  } catch {
    return null;
  }
}

function main() {
  if (!existsSync(LOG_PATH)) {
    console.log(`Aucun log: ${LOG_PATH}`);
    process.exit(0);
  }

  const lines = tailLines(LOG_PATH, LINE_LIMIT);
  console.log(`--- ${LOG_PATH} (${lines.length} lignes) ---\n`);

  for (const line of lines) {
    const summary = summarizeTickLine(line);
    if (summary) {
      console.log(summary);
    } else if (line.includes("START")) {
      console.log(line);
    }
  }

  const lastJson = [...lines].reverse().find((l) => l.trim().startsWith("{"));
  if (lastJson) {
    console.log("\n--- Dernier tick (JSON) ---");
    try {
      console.log(JSON.stringify(JSON.parse(lastJson), null, 2));
    } catch {
      console.log(lastJson);
    }
  }
}

main();

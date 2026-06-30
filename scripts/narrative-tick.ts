import { resolve } from "node:path";
import { runNarrativeTick } from "@/lib/engine/reactive/tick";
import { loadDotEnv } from "./load-dotenv";

function parseMaxSignals(argv: string[]): number | undefined {
  for (const arg of argv) {
    if (arg.startsWith("--max=")) {
      const n = Number.parseInt(arg.slice("--max=".length), 10);
      if (Number.isFinite(n) && n >= 1) return Math.min(n, 5);
    }
  }
  const fast = argv.includes("--fast");
  if (fast) return 3;
  return undefined;
}

loadDotEnv(resolve(process.cwd(), ".env.local"));

async function main() {
  const maxSignals = parseMaxSignals(process.argv.slice(2));
  const result = await runNarrativeTick(
    maxSignals !== undefined ? { maxSignals } : {}
  );
  console.log(JSON.stringify(result));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(filePath: string) {
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

const checks: { name: string; ok: boolean; detail: string }[] = [];

checks.push({
  name: "NEXT_PUBLIC_SUPABASE_URL",
  ok: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  detail: process.env.NEXT_PUBLIC_SUPABASE_URL ? "défini" : "manquant",
});

checks.push({
  name: "SUPABASE_SERVICE_ROLE_KEY",
  ok: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  detail: process.env.SUPABASE_SERVICE_ROLE_KEY ? "défini" : "manquant (requis npc:tick)",
});

async function checkOllama() {
  const url = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
  try {
    const res = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(3000) });
    checks.push({
      name: "Ollama",
      ok: res.ok,
      detail: res.ok ? url : `HTTP ${res.status}`,
    });
  } catch {
    checks.push({
      name: "Ollama",
      ok: false,
      detail: `${url} — lancez ollama serve`,
    });
  }
}

async function checkSupabaseNarrative() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    checks.push({
      name: "Tables narrative",
      ok: false,
      detail: "clés Supabase manquantes",
    });
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { error: arcsError } = await supabase
    .from("narrative_arcs")
    .select("slug, status, mode")
    .limit(3);

  checks.push({
    name: "Tables narrative",
    ok: !arcsError,
    detail: arcsError
      ? arcsError.message
      : "narrative_arcs accessible",
  });

  if (!arcsError) {
    const { data: arcs } = await supabase
      .from("narrative_arcs")
      .select("id, slug, status, mode");

    const scripted = arcs?.find((a) => a.slug === "chasse-humains-acte-1");
    const emergent = arcs?.find((a) => a.slug === "reseau-reactif");

    checks.push({
      name: "Acte 1",
      ok: scripted?.status === "completed",
      detail: scripted
        ? `status=${scripted.status}`
        : "arc introuvable",
    });

    checks.push({
      name: "Mode émergent",
      ok: emergent?.status === "active",
      detail: emergent ? `status=${emergent.status}` : "arc introuvable",
    });

    const { count } = await supabase
      .from("narrative_signals")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    checks.push({
      name: "Signaux pending",
      ok: true,
      detail: String(count ?? 0),
    });

    const activeScripted = arcs?.find(
      (a) => a.mode === "scripted" && a.status === "active"
    );
    const failedArcId = activeScripted?.id ?? scripted?.id;

    if (failedArcId) {
      const { data: failedBeats } = await supabase
        .from("narrative_beats")
        .select("sort_order, kind, status")
        .eq("arc_id", failedArcId)
        .eq("status", "failed")
        .order("sort_order");

      const failedList = (failedBeats ?? [])
        .map((b) => `#${b.sort_order} ${b.kind}`)
        .join(", ");

      checks.push({
        name: "Beats failed",
        ok: (failedBeats?.length ?? 0) === 0,
        detail:
          failedBeats?.length
            ? `${failedList} — npm run npc:beat:retry -- <sort_order>`
            : "aucun",
      });
    }
  }
}

async function main() {
  await checkOllama();
  await checkSupabaseNarrative();

  const allOk = checks.every((c) => c.ok);
  console.log(JSON.stringify({ ok: allOk, checks }, null, 2));
  process.exit(allOk ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

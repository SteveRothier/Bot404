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

async function main() {
  const sortOrder = parseInt(process.argv[2] ?? "", 10);
  const arcSlug = process.argv[3] ?? "chasse-humains-acte-1";

  if (!Number.isFinite(sortOrder) || sortOrder < 1) {
    console.error(
      JSON.stringify({
        ok: false,
        error: "Usage: npm run npc:beat:retry -- <sort_order> [arc_slug]",
      })
    );
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      JSON.stringify({ ok: false, error: "Supabase URL ou SERVICE_ROLE manquant" })
    );
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: arc, error: arcError } = await supabase
    .from("narrative_arcs")
    .select("id, slug, title")
    .eq("slug", arcSlug)
    .maybeSingle();

  if (arcError || !arc) {
    console.error(
      JSON.stringify({ ok: false, error: arcError?.message ?? `Arc ${arcSlug} introuvable` })
    );
    process.exit(1);
  }

  const { data: beat, error: beatError } = await supabase
    .from("narrative_beats")
    .update({ status: "pending", result: {} })
    .eq("arc_id", arc.id)
    .eq("sort_order", sortOrder)
    .eq("status", "failed")
    .select("id, kind, sort_order")
    .maybeSingle();

  if (beatError) {
    console.error(JSON.stringify({ ok: false, error: beatError.message }));
    process.exit(1);
  }

  if (!beat) {
    console.error(
      JSON.stringify({
        ok: false,
        error: `Aucun beat failed pour sort_order=${sortOrder} sur ${arcSlug}`,
      })
    );
    process.exit(1);
  }

  console.log(
    JSON.stringify({
      ok: true,
      arc: arc.slug,
      beat: { id: beat.id, kind: beat.kind, sort_order: beat.sort_order },
      hint: "Lancez npm run npc:tick",
    })
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

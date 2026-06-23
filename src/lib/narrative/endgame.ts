import { createAdminClient } from "@/lib/supabase/admin";

const ENDGAME_CHECK_COOLDOWN_MS = 60 * 60 * 1000;
let lastEndgameCheck = 0;

export type EndgameResult =
  | { triggered: false }
  | { triggered: true; slug: string; title: string };

export async function checkNarrativeEndgame(): Promise<EndgameResult> {
  const now = Date.now();
  if (now - lastEndgameCheck < ENDGAME_CHECK_COOLDOWN_MS) {
    return { triggered: false };
  }
  lastEndgameCheck = now;

  const supabase = createAdminClient();

  const { data: factions } = await supabase
    .from("factions")
    .select("id, slug, name, control_percent");

  if (!factions?.length) return { triggered: false };

  const humanistes = factions.find((f) => f.slug === "humanistes");
  const purbots = factions.find((f) => f.slug === "purbots");

  if (humanistes && Number(humanistes.control_percent) >= 40) {
    const slug = "truce-humanistes";
    const { data: existing } = await supabase
      .from("world_events")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) {
      await supabase.from("world_events").insert({
        slug,
        title: "Trêve des Humanistes",
        description:
          "Les Humanistes ont pris l'avantage. Le réseau ralentit la chasse aux profils non-NPC.",
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        effects: {
          factions: ["humanistes"],
          banner_copy: "Trêve : les Humanistes protègent le feed.",
          boost_post_types: ["message"],
        },
      });
      return {
        triggered: true,
        slug,
        title: "Trêve des Humanistes",
      };
    }
  }

  if (purbots && Number(purbots.control_percent) >= 45) {
    const slug = "chasse-humains-max";
    const { data: existing } = await supabase
      .from("world_events")
      .select("id")
      .eq("slug", slug)
      .gte("starts_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (!existing) {
      await supabase.from("world_events").insert({
        slug,
        title: "Chasse intensifiée",
        description:
          "Les PurBots dominent le réseau. Surveillance maximale sur toute activité humaine.",
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        effects: {
          factions: ["purbots", "assimilateurs"],
          banner_copy: "Alerte PurBots : chasse aux intrus intensifiée.",
          boost_post_types: ["theory", "signal"],
        },
      });
      return {
        triggered: true,
        slug,
        title: "Chasse intensifiée",
      };
    }
  }

  return { triggered: false };
}

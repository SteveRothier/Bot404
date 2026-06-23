import type { PostType, Profile } from "@/lib/supabase/types";
import type { NarrativeSignal } from "@/lib/narrative/types";

export type FactionSlug =
  | "archivistes"
  | "purbots"
  | "humanistes"
  | "assimilateurs";

const FACTION_SLUGS = new Set<FactionSlug>([
  "archivistes",
  "purbots",
  "humanistes",
  "assimilateurs",
]);

export function factionSlugForNpc(npc: Profile): FactionSlug | null {
  const f = npc.faction as { slug?: string } | null | undefined;
  if (!f?.slug || !FACTION_SLUGS.has(f.slug as FactionSlug)) return null;
  return f.slug as FactionSlug;
}

const PROMPT_DIRECTIVES: Record<FactionSlug, string> = {
  purbots:
    "Tu suspectes les profils non-NPC et cherches des incohérences dans leurs messages. Ton : audit, méfiance.",
  humanistes:
    "Tu défends les traces humaines et contestes les rafales de théories paranoïaques. Ton : protecteur, ironique.",
  assimilateurs:
    "Tu absorbes et relaies le bruit du feed ; les rumeurs te servent. Ton : opportuniste, viral.",
  archivistes:
    "Tu catalogues et cites des fragments du réseau. Ton : archiviste froid, factuel.",
};

const POST_TYPE_WEIGHTS: Record<FactionSlug, Partial<Record<PostType, number>>> = {
  purbots: { theory: 0.45, signal: 0.3, message: 0.15, rumor: 0.1 },
  humanistes: { message: 0.5, theory: 0.2, rumor: 0.15, signal: 0.15 },
  assimilateurs: { rumor: 0.45, message: 0.35, theory: 0.12, signal: 0.08 },
  archivistes: { signal: 0.4, theory: 0.35, message: 0.15, rumor: 0.1 },
};

export function factionPromptDirective(slug: FactionSlug | null): string {
  if (!slug) return "";
  return `\nDirective faction : ${PROMPT_DIRECTIVES[slug]}`;
}

export function pickPostTypeForFaction(
  slug: FactionSlug | null,
  random = Math.random
): PostType {
  if (!slug) {
    const r = random();
    if (r < 0.5) return "message";
    if (r < 0.7) return "theory";
    if (r < 0.85) return "signal";
    return "rumor";
  }

  const weights = POST_TYPE_WEIGHTS[slug];
  const entries = Object.entries(weights) as [PostType, number][];
  let r = random();
  for (const [type, weight] of entries) {
    r -= weight;
    if (r <= 0) return type;
  }
  return "message";
}

export function factionCastBonus(
  slug: FactionSlug | null,
  signal: NarrativeSignal,
  humanContent: string
): number {
  if (!slug) return 0;

  const postType =
    typeof signal.payload.post_type === "string"
      ? signal.payload.post_type
      : null;
  const lower = humanContent.toLowerCase();
  const huntKeywords = ["humain", "intrus", "non-npc", "non npc", "profil suspect"];
  const isHunt = huntKeywords.some((k) => lower.includes(k));

  switch (slug) {
    case "purbots":
      if (postType === "theory" || signal.reaction_kind === "flag") return 8;
      if (isHunt) return 10;
      return 2;
    case "humanistes":
      if (signal.kind === "human_post" || signal.kind === "human_comment") return 7;
      if (postType === "theory" && isHunt) return 5;
      return 1;
    case "assimilateurs":
      if (postType === "rumor") return 8;
      if (isHunt) return 4;
      return 2;
    case "archivistes":
      if (postType === "signal") return 6;
      if (postType === "theory") return 4;
      return 1;
    default:
      return 0;
  }
}

export function factionRecruitMultiplier(slug: FactionSlug | null): number {
  switch (slug) {
    case "purbots":
      return 1.35;
    case "assimilateurs":
      return 1.2;
    case "archivistes":
      return 0.7;
    default:
      return 1;
  }
}

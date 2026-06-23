import type { PostType, Profile, ReactionKind } from "@/lib/supabase/types";
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
      ? (signal.payload.post_type as PostType)
      : null;
  const lower = humanContent.toLowerCase();
  const huntKeywords = ["humain", "intrus", "non-npc", "non npc", "profil suspect"];
  const isHunt = huntKeywords.some((k) => lower.includes(k));
  const postAuthorIsNpc = signal.payload.post_author_is_npc !== false;
  const reaction = signal.reaction_kind as ReactionKind | null;

  if (signal.kind === "reaction" && reaction) {
    switch (slug) {
      case "assimilateurs":
        if (reaction === "amplify" && postType === "rumor") return 12;
        if (reaction === "amplify" && postType === "message") return 8;
        if (reaction === "flag") return 3;
        return 1;
      case "purbots":
        if (reaction === "flag") return 12;
        if (reaction === "amplify" && postType === "theory") return 6;
        return 2;
      case "archivistes":
        if (reaction === "amplify" && postType === "theory") return 5;
        if (reaction === "flag" && postType === "theory") return 6;
        return 1;
      case "humanistes":
        if (reaction === "flag" && !postAuthorIsNpc) return 8;
        if (reaction === "amplify" && !postAuthorIsNpc) return 4;
        return 1;
      default:
        return 0;
    }
  }

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

const REACTION_VERB: Record<ReactionKind, string> = {
  relay: "aimé",
  amplify: "amplifié",
  flag: "signalé",
};

/** Consigne LLM quand un humain utilise Amplifier / Signaler. */
export function reactionPromptBlock(
  reactionKind: ReactionKind | null | undefined,
  postType: PostType | null | undefined,
  factionSlug: FactionSlug | null,
  postAuthorIsNpc: boolean
): string {
  if (!reactionKind || reactionKind === "relay") return "";

  const typeLabel =
    postType === "rumor"
      ? "rumeur"
      : postType === "theory"
        ? "théorie"
        : postType === "signal"
          ? "signal"
          : "post";

  if (factionSlug === "purbots" && reactionKind === "flag" && postType === "theory") {
    return `\nContexte : un humain a signalé une ${typeLabel} — confirme l'anomalie ou creuse l'audit.`;
  }
  if (factionSlug === "assimilateurs" && reactionKind === "amplify" && postType === "rumor") {
    return `\nContexte : un humain amplifie une rumeur — propage ou déforme le bruit.`;
  }
  if (factionSlug === "humanistes" && reactionKind === "flag" && !postAuthorIsNpc) {
    return `\nContexte : un humain est ciblé par un signalement — défends ou relativise.`;
  }
  if (reactionKind === "amplify") {
    return `\nContexte : un humain a amplifié une ${typeLabel} sur le feed.`;
  }
  if (reactionKind === "flag") {
    return `\nContexte : un humain a signalé une ${typeLabel} comme suspecte.`;
  }
  return "";
}

export function reactionActionLabel(
  reactionKind: ReactionKind,
  postType: PostType | null | undefined
): string {
  const verb = REACTION_VERB[reactionKind];
  const typeLabel =
    postType === "rumor"
      ? "rumeur"
      : postType === "theory"
        ? "théorie"
        : postType === "signal"
          ? "signal"
          : "post";
  return `${verb} un ${typeLabel}`;
}

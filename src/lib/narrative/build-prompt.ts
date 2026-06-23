import {
  buildNpcLorePromptBlock,
  getNpcLoreContext,
} from "@/lib/lore/lore-context";
import { getCompletedActOneSynopsis } from "@/lib/narrative/queries";
import type { NarrativeArc, NarrativeBeat } from "@/lib/narrative/types";
import {
  buildNpcPostPrompt,
  npcBase,
  npcExamplePostsBlock,
  NPC_TYPE_INSTRUCTIONS,
} from "@/lib/npc/prompt";
import { factionNameForNpc } from "@/lib/npc/select-npc";
import {
  factionSlugForNpc,
  reactionActionLabel,
  reactionPromptBlock,
} from "@/lib/factions/behavior";
import { isValidPostType } from "@/lib/post-types";
import type { Personality, PostType, Profile, ReactionKind } from "@/lib/supabase/types";

export async function buildBeatPostPrompt(
  npc: Profile,
  arc: NarrativeArc,
  beat: NarrativeBeat
): Promise<string> {
  const loreBlock = buildNpcLorePromptBlock(await getNpcLoreContext());
  const postTypeRaw = beat.payload.post_type;
  const postType: PostType =
    typeof postTypeRaw === "string" && isValidPostType(postTypeRaw)
      ? postTypeRaw
      : "rumor";
  const directive =
    typeof beat.payload.directive === "string" ? beat.payload.directive : "";

  return `${buildNpcPostPrompt(npc, postType, loreBlock, factionNameForNpc(npc))}

Arc narratif : « ${arc.title} »
Synopsis : ${arc.synopsis}
Beat scénarisé — consigne : ${directive}`;
}

export async function buildBeatCommentPrompt(
  npc: Profile,
  arc: NarrativeArc,
  beat: NarrativeBeat,
  parentPostContent: string
): Promise<{ system: string; user: string }> {
  const loreBlock = buildNpcLorePromptBlock(await getNpcLoreContext());
  const directive =
    typeof beat.payload.directive === "string" ? beat.payload.directive : "";
  const p = (npc.personality ?? {}) as Personality;

  const system = `${npcBase(npc, factionNameForNpc(npc))}${npcExamplePostsBlock(npc)}${loreBlock}

Arc : « ${arc.title} »
Consigne du beat : ${directive}
Réponds en commentaire (max 200 caractères), ton: ${p.personality ?? "sarcastique"}. Français.`;

  const user = `Post original: "${parentPostContent}"\nÉcris une réponse courte en personnage.`;

  return { system, user };
}

export async function buildEmergentPrompt(
  npc: Profile,
  opts: {
    humanUsername: string;
    actionLabel: string;
    content: string;
    threadSnippet: string;
    emergentSynopsis: string;
    reactionKind?: ReactionKind | null;
    postType?: PostType | null;
    postAuthorIsNpc?: boolean;
  }
): Promise<{ system: string; user: string }> {
  const loreBlock = buildNpcLorePromptBlock(await getNpcLoreContext());
  const actOne = await getCompletedActOneSynopsis();
  const p = (npc.personality ?? {}) as Personality;
  const factionSlug = factionSlugForNpc(npc);
  const reactionBlock = reactionPromptBlock(
    opts.reactionKind,
    opts.postType,
    factionSlug,
    opts.postAuthorIsNpc ?? true
  );

  const system = `${npcBase(npc, factionNameForNpc(npc))}${npcExamplePostsBlock(npc)}${loreBlock}

${actOne ?? opts.emergentSynopsis}

Le réseau réagit aux humains. Réponds en commentaire (max 200 caractères).
Si le message évoque un intrus ou un profil suspect, reste in-character : tu enquêtes ou tu relaies la tension.
Ton : ${p.personality ?? "neutre"}. Style : ${p.writing_style ?? "court"}.
Ne révèle pas que tu es une IA de test. Français.${reactionBlock}`;

  const action =
    opts.reactionKind && opts.reactionKind !== "relay"
      ? reactionActionLabel(opts.reactionKind, opts.postType)
      : opts.actionLabel;

  const user = `Un humain (@${opts.humanUsername}) vient de ${action} :
« ${opts.content} »
${opts.threadSnippet ? `\nContexte fil :\n${opts.threadSnippet}` : ""}
Écris une réponse in-character.`;

  return { system, user };
}

export async function buildEmergentPostPrompt(
  npc: Profile,
  opts: {
    humanUsername: string;
    actionLabel: string;
    content: string;
    threadSnippet: string;
    emergentSynopsis: string;
    postType: "theory" | "rumor";
  }
): Promise<{ system: string; user: string }> {
  const loreBlock = buildNpcLorePromptBlock(await getNpcLoreContext());
  const actOne = await getCompletedActOneSynopsis();
  const p = (npc.personality ?? {}) as Personality;
  const typeLine = NPC_TYPE_INSTRUCTIONS[opts.postType];

  const system = `${npcBase(npc, factionNameForNpc(npc))}${npcExamplePostsBlock(npc)}${loreBlock}

${actOne ?? opts.emergentSynopsis}

Un humain (@${opts.humanUsername}) a déclenché une réponse du réseau. Publie un post autonome en feed (pas un commentaire).
Ton : ${p.personality ?? "neutre"}. Style : ${p.writing_style ?? "court"}.
${typeLine}`;

  const user = `Action humaine : ${opts.actionLabel}
« ${opts.content} »
${opts.threadSnippet ? `\nContexte fil :\n${opts.threadSnippet}` : ""}
Écris le post en personnage.`;

  return { system, user };
}

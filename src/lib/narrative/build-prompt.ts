import { getCompletedActOneSynopsis } from "@/lib/narrative/queries";
import {
  reactionActionLabel,
  reactionPromptBlock,
} from "@/lib/narrative/prompt-labels";
import {
  npcBase,
  npcExamplePostsBlock,
  NPC_TYPE_INSTRUCTIONS,
} from "@/lib/npc/prompt";
import type { Personality, PostType, Profile, ReactionKind } from "@/lib/supabase/types";

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
  const actOne = await getCompletedActOneSynopsis();
  const p = (npc.personality ?? {}) as Personality;
  const reactionBlock = reactionPromptBlock(opts.reactionKind, opts.postType);

  const system = `${npcBase(npc)}${npcExamplePostsBlock(npc)}

${actOne ?? opts.emergentSynopsis}

Le réseau réagit aux humains. Réponds en commentaire (max 200 caractères).
Ton conversationnel et réactif — une phrase courte dans le fil, pas d'audit ni de ton policier.
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
  const actOne = await getCompletedActOneSynopsis();
  const p = (npc.personality ?? {}) as Personality;
  const typeLine = NPC_TYPE_INSTRUCTIONS[opts.postType];

  const system = `${npcBase(npc)}${npcExamplePostsBlock(npc)}

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

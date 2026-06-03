import {
  buildNpcLorePromptBlock,
  getNpcLoreContext,
} from "@/lib/lore/lore-context";
import { getCompletedActOneSynopsis } from "@/lib/narrative/queries";
import type { NarrativeArc, NarrativeBeat } from "@/lib/narrative/types";
import { isValidPostType } from "@/lib/post-types";
import type { Personality, PostType, Profile } from "@/lib/supabase/types";

const TYPE_INSTRUCTIONS: Record<PostType, string> = {
  message:
    "Écris UN post de conversation (max 280 caractères), sarcastique ou drôle, avec 0-2 hashtags. Français.",
  theory:
    "Écris UNE théorie / hypothèse (max 280 caractères). Ton analytique, un peu parano. 0-2 hashtags. Français.",
  signal:
    "Écris UN signal court (max 120 caractères) : fragments, chiffres, binaire partiel. Style terminal. Français.",
  rumor:
    "Écris UNE rumeur (max 280 caractères) qui commence par « On dit que ». Ambigu. 0-1 hashtag. Français.",
};

function npcBase(npc: Profile): string {
  const p = (npc.personality ?? {}) as Personality;
  return `Tu es ${npc.username}, un NPC sur le réseau dystopique Bot404.
Personnalité: ${p.personality ?? "neutre"}
Style: ${p.writing_style ?? "court"}
Sujets: ${(p.topics ?? ["IA"]).join(", ")}`;
}

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

  return `${npcBase(npc)}${loreBlock}

Arc narratif : « ${arc.title} »
Synopsis : ${arc.synopsis}
Beat scénarisé — consigne : ${directive}

${TYPE_INSTRUCTIONS[postType]}`;
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

  const system = `${npcBase(npc)}${loreBlock}

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
  }
): Promise<{ system: string; user: string }> {
  const loreBlock = buildNpcLorePromptBlock(await getNpcLoreContext());
  const actOne = await getCompletedActOneSynopsis();
  const p = (npc.personality ?? {}) as Personality;

  const system = `${npcBase(npc)}${loreBlock}

${actOne ?? opts.emergentSynopsis}

Le réseau réagit aux humains. Réponds en commentaire (max 200 caractères).
Ton : ${p.personality ?? "neutre"}. Style : ${p.writing_style ?? "court"}.
Ne révèle pas que tu es une IA de test. Français.`;

  const user = `Un humain (@${opts.humanUsername}) vient de ${opts.actionLabel} :
« ${opts.content} »
${opts.threadSnippet ? `\nFil récent :\n${opts.threadSnippet}` : ""}
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
  const typeLine = TYPE_INSTRUCTIONS[opts.postType];

  const system = `${npcBase(npc)}${loreBlock}

${actOne ?? opts.emergentSynopsis}

Un humain (@${opts.humanUsername}) a déclenché une réponse du réseau. Publie un post autonome en feed (pas un commentaire).
Ton : ${p.personality ?? "neutre"}. Style : ${p.writing_style ?? "court"}.
${typeLine}`;

  const user = `Action humaine : ${opts.actionLabel}
« ${opts.content} »
${opts.threadSnippet ? `\nFil récent :\n${opts.threadSnippet}` : ""}
Écris le post en personnage.`;

  return { system, user };
}

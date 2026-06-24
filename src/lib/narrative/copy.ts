/** Libellés joueur — source unique pour feed, dashboard, trending. */

export const NARRATIVE_COPY = {
  sections: {
    narration: "Histoire",
    networkStory: "Histoire du réseau",
    botReplies: "Réponses des bots aux joueurs",
  },
  emergent: {
    kicker: "Le réseau vous écoute",
    body: "Vos posts et commentaires peuvent provoquer une réponse d'un bot.",
    dashboardTitle: "Le réseau répond aux joueurs",
    howToTitle: "Comment participer ?",
    guideLink: "Guide complet",
    actions: [
      "Publier une théorie ou une rumeur (onglets Théories / Rumeurs)",
      "Mentionner un bot (@NeoByte, etc.)",
      "Amplifier, signaler ou aimer un post",
      "Commenter un fil — parfois un bot publie sa propre théorie ou rumeur en réponse",
    ] as const,
  },
  inactive: "Aucune histoire active pour le moment.",
  commentBadge: "Réponse du réseau",
  queuedInteraction:
    "Le réseau a enregistré votre interaction. Une réponse de bot peut arriver dans la minute.",
  queuedTheory:
    "Théorie enregistrée — des archivistes et bots du réseau vont probablement réagir.",
  queuedRumor:
    "Rumeur enregistrée — propagation accélérée, le bruit du feed adore ça.",
  queuedComment:
    "Commentaire enregistré — un bot peut répondre sur ce fil dans la minute.",
  interactionKind: {
    post: "post",
    comment: "commentaire",
  },
  viewPostLink: "Voir le post →",
  viewThreadLink: "Voir le fil →",
  viewYourPostLink: "Votre post →",
  emergentPostContext: (human: string) =>
    `En réponse à l'activité de @${human}`,
} as const;

export function formatPendingInteractions(count: number): string {
  if (count === 0) {
    return "Aucune interaction en attente pour le moment.";
  }
  if (count === 1) {
    return "1 interaction en attente";
  }
  return `${count} interactions en attente`;
}

export function queuedMessageForPostType(
  postType: "message" | "theory" | "signal" | "rumor"
): string {
  if (postType === "theory") return NARRATIVE_COPY.queuedTheory;
  if (postType === "rumor") return NARRATIVE_COPY.queuedRumor;
  return NARRATIVE_COPY.queuedInteraction;
}

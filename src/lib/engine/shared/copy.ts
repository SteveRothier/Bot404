/** Libellés joueur — source unique pour le feed et les notifications. */

export const NARRATIVE_COPY = {
  inactive: "Aucune histoire active pour le moment.",
  commentBadge: "Réponse du réseau",
  queuedInteraction:
    "Le réseau a enregistré votre interaction. Une réponse de bot peut arriver dans la minute.",
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

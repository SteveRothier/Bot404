import Link from "next/link";
import { NARRATIVE_COPY } from "@/lib/narrative/copy";

export const metadata = {
  title: "Comment jouer — Bot404",
  description: "Guide pour participer à l'histoire du réseau Bot404",
};

export default function CommentJouerPage() {
  const { emergent } = NARRATIVE_COPY;

  return (
    <div className="w-full px-4 py-6">
      <h1 className="text-xl font-bold">Comment jouer l&apos;histoire</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        Bot404 alterne un épisode scripté (bots qui publient l&apos;intrigue),
        puis un réseau réactif où vos actions peuvent provoquer une réponse.
      </p>

      <section className="mt-6 space-y-2">
        <h2 className="text-[15px] font-bold">Les deux phases</h2>
        <ol className="list-decimal space-y-2 pl-5 text-[15px] text-muted-foreground">
          <li>
            <strong className="text-foreground">Épisode scripté</strong> — suivez
            le fil, les archives et Tendances pendant que les bots avancent
            l&apos;intrigue.
          </li>
          <li>
            <strong className="text-foreground">Réseau réactif</strong> — vos
            posts et commentaires peuvent déclencher une réponse de bot
            (commentaire ou parfois une nouvelle théorie / rumeur).
          </li>
        </ol>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-[15px] font-bold">{emergent.howToTitle}</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-muted-foreground">
          {emergent.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-[15px] font-bold">Ce que vous observez</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-muted-foreground">
          <li>Bandeau violet en haut du fil</li>
          <li>Section Histoire sur le tableau de bord et Explorer</li>
          <li>Badge « {NARRATIVE_COPY.commentBadge} » sur certains commentaires</li>
          <li>Liste « {NARRATIVE_COPY.sections.botReplies} » dans Tendances</li>
        </ul>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        <Link href="/" className="text-accent hover:underline">
          ← Retour au fil
        </Link>
      </p>
    </div>
  );
}

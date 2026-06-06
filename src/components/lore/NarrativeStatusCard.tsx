import Link from "next/link";
import {
  formatPendingInteractions,
  formatScriptedProgressStep,
  NARRATIVE_COPY,
} from "@/lib/narrative/copy";
import type { NarrativeUiState } from "@/lib/narrative/queries";

type Props = NarrativeUiState;

export function NarrativeStatusCard({
  scriptedActive,
  emergentActive,
  actOneTitle,
  scriptedProgress,
  pendingSignals,
  failedBeatsCount,
}: Props) {
  if (!scriptedActive && !emergentActive) return null;

  const content =
    scriptedActive && actOneTitle ? (
      <ScriptedContent
        title={actOneTitle}
        progress={scriptedProgress}
        failedBeatsCount={failedBeatsCount}
      />
    ) : emergentActive ? (
      <EmergentContent pendingSignals={pendingSignals} />
    ) : null;

  if (!content) return null;

  return <div className="space-y-2 text-[15px]">{content}</div>;
}

function ScriptedContent({
  title,
  progress,
  failedBeatsCount,
}: {
  title: string;
  progress: { completed: number; total: number } | null;
  failedBeatsCount: number;
}) {
  const { scripted } = NARRATIVE_COPY;
  return (
    <>
      <p className="font-bold text-foreground">{`${scripted.kicker} : ${title}`}</p>
      {progress && (
        <p className="mt-0.5 text-sm font-medium text-violet-600 dark:text-violet-400">
          {formatScriptedProgressStep(progress.completed, progress.total)}
        </p>
      )}
      <p className="mt-0.5 text-muted-foreground">{scripted.body}</p>
      {failedBeatsCount > 0 && (
        <p className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400">
          {scripted.failedBeatWarning}
        </p>
      )}
    </>
  );
}

function EmergentContent({ pendingSignals }: { pendingSignals: number }) {
  const { emergent } = NARRATIVE_COPY;
  return (
    <>
      <p className="font-bold text-foreground">{emergent.dashboardTitle}</p>
      <p className="mt-0.5 text-muted-foreground">{emergent.body}</p>
      <p className="text-muted-foreground">
        {formatPendingInteractions(pendingSignals)}
      </p>
      <Link
        href="/comment-jouer"
        className="inline-block text-sm font-medium text-accent hover:underline"
      >
        {emergent.guideLink} →
      </Link>
    </>
  );
}

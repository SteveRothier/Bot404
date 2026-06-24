import Link from "next/link";
import {
  formatPendingInteractions,
  NARRATIVE_COPY,
} from "@/lib/narrative/copy";
import type { NarrativeUiState } from "@/lib/narrative/queries";

type Props = NarrativeUiState;

export function NarrativeStatusCard({
  emergentActive,
  pendingSignals,
}: Props) {
  if (!emergentActive) return null;

  return (
    <div className="space-y-2 text-[15px]">
      <p className="font-bold text-foreground">
        {NARRATIVE_COPY.emergent.dashboardTitle}
      </p>
      <p className="mt-0.5 text-muted-foreground">
        {NARRATIVE_COPY.emergent.body}
      </p>
      <p className="text-muted-foreground">
        {formatPendingInteractions(pendingSignals)}
      </p>
      <Link
        href="/comment-jouer"
        className="inline-block text-sm font-medium text-accent hover:underline"
      >
        {NARRATIVE_COPY.emergent.guideLink} →
      </Link>
    </div>
  );
}

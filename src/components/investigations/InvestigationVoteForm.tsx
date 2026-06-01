"use client";

import { useTransition } from "react";
import { voteInvestigation } from "@/app/actions/investigations";
import { cn } from "@/lib/utils";
import type { InvestigationVoteKind } from "@/lib/supabase/types";

type Props = {
  investigationId: number;
  currentVote: InvestigationVoteKind | null;
  counts: { yes: number; no: number; uncertain: number };
  isLoggedIn: boolean;
};

const options: { value: InvestigationVoteKind; label: string }[] = [
  { value: "yes", label: "Confirmé" },
  { value: "uncertain", label: "Incertain" },
  { value: "no", label: "Rejeté" },
];

export function InvestigationVoteForm({
  investigationId,
  currentVote,
  counts,
  isLoggedIn,
}: Props) {
  const [pending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <p className="text-meta text-muted-foreground">
        Connectez-vous pour voter — Oui {counts.yes} · ? {counts.uncertain} · Non{" "}
        {counts.no}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await voteInvestigation(investigationId, opt.value);
            });
          }}
          className={cn(
            "text-meta rounded-full border px-3 py-1 transition-colors",
            currentVote === opt.value
              ? "border-accent bg-accent/15 text-foreground"
              : "border-border text-muted-foreground hover:bg-secondary"
          )}
        >
          {opt.label} (
          {opt.value === "yes"
            ? counts.yes
            : opt.value === "no"
              ? counts.no
              : counts.uncertain}
          )
        </button>
      ))}
    </div>
  );
}

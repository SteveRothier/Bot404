"use client";

import { Radio } from "lucide-react";

type Props = {
  scriptedActive: boolean;
  emergentActive: boolean;
  actOneTitle: string | null;
};

export function NarrativeModeStrip({
  scriptedActive,
  emergentActive,
  actOneTitle,
}: Props) {
  if (!scriptedActive && !emergentActive) return null;

  return (
    <div className="border-b border-border bg-violet-500/5 px-4 py-2.5">
      <div className="flex items-start gap-2">
        <Radio
          className="mt-0.5 size-4 shrink-0 text-violet-500"
          strokeWidth={1.75}
          aria-hidden
        />
        <div className="min-w-0">
          {scriptedActive && actOneTitle ? (
            <>
              <p className="text-meta font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                Histoire en cours
              </p>
              <p className="text-[15px] font-bold text-foreground">
                {actOneTitle}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Le réseau déroule l&apos;Acte 1 — observez le feed et les
                archives.
              </p>
            </>
          ) : emergentActive ? (
            <>
              <p className="text-meta font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                Réseau réactif
              </p>
              <p className="text-[15px] font-bold text-foreground">
                Le réseau réagit à vos signaux
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Publiez des théories, mentionnez des NPC ou relancez des
                rumeurs — ils vous répondront.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

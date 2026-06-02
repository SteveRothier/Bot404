import { ArchiveUnlockBanner } from "@/components/lore/ArchiveUnlockBanner";
import { WorldEventBanner } from "@/components/lore/WorldEventBanner";
import type { ShellLoreAlerts } from "@/lib/queries/shell-data";

type Props = ShellLoreAlerts;

export function LoreAlertsPanel({ activeWorldEvent, recentArchive }: Props) {
  if (!activeWorldEvent && !recentArchive) return null;

  return (
    <div className="flex flex-col gap-3">
      {activeWorldEvent && (
        <WorldEventBanner event={activeWorldEvent} variant="sidebar" />
      )}
      {recentArchive && (
        <ArchiveUnlockBanner archive={recentArchive} variant="sidebar" />
      )}
    </div>
  );
}

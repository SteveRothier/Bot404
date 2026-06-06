import { WorldEventBanner } from "@/components/lore/WorldEventBanner";
import type { ShellLoreAlerts } from "@/lib/queries/shell-data";

type Props = ShellLoreAlerts;

export function LoreAlertsPanel({ activeWorldEvent }: Props) {
  if (!activeWorldEvent) return null;

  return (
    <div className="flex flex-col gap-3">
      <WorldEventBanner event={activeWorldEvent} variant="sidebar" />
    </div>
  );
}

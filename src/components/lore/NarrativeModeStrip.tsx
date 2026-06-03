import { NarrativeStatusCard } from "@/components/lore/NarrativeStatusCard";
import type { NarrativeUiState } from "@/lib/narrative/queries";

type Props = NarrativeUiState;

export function NarrativeModeStrip(props: Props) {
  return (
    <NarrativeStatusCard
      {...props}
      variant="strip"
      showHowTo={props.emergentActive && !props.scriptedActive}
    />
  );
}

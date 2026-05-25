import { NpcOnlineList } from "@/components/widgets/NpcOnlineList";
import { TrendingList } from "@/components/widgets/TrendingList";
import { EventCard } from "@/components/widgets/EventCard";
import type {
  Profile,
  TrendingEvent,
  TrendingHashtag,
} from "@/lib/supabase/types";

type Props = {
  onlineNpcs: Profile[];
  hashtags: TrendingHashtag[];
  event?: TrendingEvent | null;
};

export function RightSidebar({ onlineNpcs, hashtags, event }: Props) {
  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-4 xl:flex">
      <NpcOnlineList npcs={onlineNpcs} />
      <TrendingList hashtags={hashtags} />
      <EventCard event={event} />
    </aside>
  );
}

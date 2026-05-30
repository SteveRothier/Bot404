import { NetworkSummary } from "@/components/widgets/NetworkSummary";
import { TrendingList } from "@/components/widgets/TrendingList";
import { EventCard } from "@/components/widgets/EventCard";
import type {
  NetworkStats,
  TrendingEvent,
  TrendingHashtag,
} from "@/lib/supabase/types";

type Props = {
  stats: NetworkStats;
  hashtags: TrendingHashtag[];
  event?: TrendingEvent | null;
};

export function RightSidebar({ stats, hashtags, event }: Props) {
  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-4 xl:flex">
      <NetworkSummary stats={stats} />
      <TrendingList hashtags={hashtags} />
      <EventCard event={event} />
    </aside>
  );
}

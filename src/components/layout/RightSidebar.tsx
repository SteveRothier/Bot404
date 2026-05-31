import { TrendingList } from "@/components/widgets/TrendingList";
import type { TrendingHashtag } from "@/lib/supabase/types";

type Props = {
  hashtags: TrendingHashtag[];
};

export function RightSidebar({ hashtags }: Props) {
  return (
    <aside className="sidebar-sticky hidden w-80 shrink-0 xl:block">
      <TrendingList hashtags={hashtags} />
    </aside>
  );
}

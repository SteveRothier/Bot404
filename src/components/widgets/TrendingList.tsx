import Link from "next/link";
import { HashtagList } from "@/components/widgets/HashtagList";
import type { TrendingHashtag } from "@/lib/supabase/types";

type Props = {
  hashtags: TrendingHashtag[];
  title?: string;
  /** Moins haut — sidebar */
  compact?: boolean;
};

export function TrendingList({
  hashtags,
  title = "Tendances",
  compact = false,
}: Props) {
  return (
    <section
      className={compact ? "rounded-2xl bg-secondary/50 p-3" : "rounded-2xl bg-secondary/50 p-4"}
    >
      <div
        className={
          compact
            ? "mb-2 flex items-center justify-between gap-2"
            : "mb-3 flex items-center justify-between gap-2"
        }
      >
        <h2
          className={
            compact
              ? "text-[15px] font-bold text-foreground"
              : "text-xl font-bold text-foreground"
          }
        >
          {title}
        </h2>
        {hashtags.length > 0 && (
          <Link
            href="/trending"
            className={
              compact
                ? "text-meta text-accent hover:underline"
                : "text-[15px] text-accent hover:underline"
            }
          >
            Voir tout
          </Link>
        )}
      </div>
      <HashtagList
        hashtags={hashtags}
        limit={5}
        compact={compact}
      />
    </section>
  );
}

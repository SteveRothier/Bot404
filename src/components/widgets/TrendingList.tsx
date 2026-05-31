import Link from "next/link";
import { HashtagList } from "@/components/widgets/HashtagList";
import type { TrendingHashtag } from "@/lib/supabase/types";

type Props = {
  hashtags: TrendingHashtag[];
  title?: string;
};

export function TrendingList({
  hashtags,
  title = "Tendances",
}: Props) {
  return (
    <section className="rounded-2xl bg-secondary/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {hashtags.length > 0 && (
          <Link
            href="/trending"
            className="text-[15px] text-accent hover:underline"
          >
            Voir tout
          </Link>
        )}
      </div>
      <HashtagList hashtags={hashtags} limit={5} />
    </section>
  );
}

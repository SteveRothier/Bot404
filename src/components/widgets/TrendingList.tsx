import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCount } from "@/lib/format";
import type { TrendingHashtag } from "@/lib/supabase/types";

type Props = {
  hashtags: TrendingHashtag[];
  title?: string;
};

export function TrendingList({
  hashtags,
  title = "Tendances du réseau",
}: Props) {
  return (
    <Card className="border-[#2b1117] bg-[#0b0a13]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hashtags.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune tendance pour l&apos;instant.</p>
        ) : (
          hashtags.map((item, i) => (
            <Link
              key={item.tag}
              href="/trending"
              className="block rounded-md border border-transparent p-2 transition-colors hover:border-[#34121b] hover:bg-[#171424]"
            >
              <p className="text-xs text-muted-foreground">
                {i + 1} · Tendance
              </p>
              <p className="font-semibold text-[#fb7185]">{item.tag}</p>
              <p className="text-xs text-muted-foreground">
                {formatCount(item.count)} posts
              </p>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

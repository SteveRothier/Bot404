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
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
              className="block rounded-lg p-2 transition-colors hover:bg-secondary"
            >
              <p className="text-xs text-muted-foreground">
                {i + 1} · Tendance
              </p>
              <p className="font-semibold text-primary">{item.tag}</p>
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

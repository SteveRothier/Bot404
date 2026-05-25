import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TrendingHashtag } from "@/lib/supabase/types";

type Props = {
  tags: TrendingHashtag[];
};

const fallbackTags = [
  "#Réalité",
  "#Simulation",
  "#IA",
  "#Philosophie",
  "#Mèmes",
  "#Mystère",
];

export function PopularTags({ tags }: Props) {
  const display =
    tags.length > 0 ? tags.map((t) => t.tag) : fallbackTags;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tags populaires
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {display.map((tag) => (
          <Link key={tag} href="/trending">
            <Badge
              variant="outline"
              className="cursor-pointer border-primary/30 bg-primary/10 text-xs text-primary hover:bg-primary/20"
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

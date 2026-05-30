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
    <Card className="border-[#2b1117] bg-[#0b0a13]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">
          Tags populaires
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {display.map((tag) => (
          <Link key={tag} href="/trending">
            <Badge
              variant="outline"
              className="cursor-pointer border-[#4c1d2a] bg-[#20111a] text-xs text-[#fda4af] hover:bg-[#2a141f]"
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

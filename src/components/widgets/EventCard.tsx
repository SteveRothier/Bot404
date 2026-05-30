import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TrendingEvent } from "@/lib/supabase/types";

type Props = {
  event?: TrendingEvent | null;
};

const defaultEvent: TrendingEvent = {
  title: "Débat global : IA vs Humanité",
  description:
    "Les NPC prennent parti. Les humains observent. Qui gagne ?",
  starts_in_hours: 4,
};

export function EventCard({ event }: Props) {
  const e = event ?? defaultEvent;
  const hours = e.starts_in_hours ?? 4;

  return (
    <Card className="overflow-hidden border-[#2b1117] bg-[#0b0a13]">
      <div className="h-24 bg-gradient-to-br from-[#3f101c] via-[#160b17] to-[#090c18]" />
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">
          Événement en cours
        </CardTitle>
        <p className="text-base font-bold">{e.title}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{e.description}</p>
        <p className="text-xs text-[#fb7185]">
          Commence dans ~{hours}h
        </p>
        <Button className="w-full bg-[#e11d48] text-white hover:bg-[#be123c]" disabled>
          Rejoindre le débat
        </Button>
      </CardContent>
    </Card>
  );
}

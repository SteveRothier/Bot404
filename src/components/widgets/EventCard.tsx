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
    <Card className="overflow-hidden border-border bg-card">
      <div className="h-24 bg-gradient-to-br from-primary/40 via-card to-background" />
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Événement en cours
        </CardTitle>
        <p className="text-base font-bold">{e.title}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{e.description}</p>
        <p className="text-xs text-primary">
          Commence dans ~{hours}h
        </p>
        <Button className="w-full" disabled>
          Rejoindre le débat
        </Button>
      </CardContent>
    </Card>
  );
}

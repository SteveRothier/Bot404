"use client";

import { useEffect, useState } from "react";
import { minutesUntilNextNpcRun } from "@/lib/npc-schedule";

type ScheduleItem = {
  key: string;
  intervalMinutes: number;
  lastAt: string | null;
  initialMinutes: number;
};

type Props = {
  items: ScheduleItem[];
  render: (minutes: Record<string, number>) => React.ReactNode;
};

export function NpcScheduleDisplay({ items, render }: Props) {
  const [minutes, setMinutes] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((item) => [item.key, item.initialMinutes]))
  );

  useEffect(() => {
    setMinutes(
      Object.fromEntries(items.map((item) => [item.key, item.initialMinutes]))
    );
  }, [items]);

  useEffect(() => {
    const update = () => {
      setMinutes(
        Object.fromEntries(
          items.map((item) => [
            item.key,
            minutesUntilNextNpcRun(
              item.lastAt ? new Date(item.lastAt) : null,
              item.intervalMinutes
            ),
          ])
        )
      );
    };

    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, [items]);

  return render(minutes);
}

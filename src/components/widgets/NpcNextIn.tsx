"use client";

import { useEffect, useState } from "react";
import { minutesUntilNextNpcRun } from "@/lib/npc-schedule";

type Props = {
  intervalMinutes: number;
  lastAt: string | null;
  /** Snapshot serveur pour éviter un mismatch d'hydratation. */
  initialMinutes: number;
};

export function NpcNextIn({
  intervalMinutes,
  lastAt,
  initialMinutes,
}: Props) {
  const [minutes, setMinutes] = useState(initialMinutes);

  useEffect(() => {
    setMinutes(initialMinutes);
  }, [initialMinutes]);

  useEffect(() => {
    const update = () =>
      setMinutes(
        minutesUntilNextNpcRun(
          lastAt ? new Date(lastAt) : null,
          intervalMinutes
        )
      );

    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, [intervalMinutes, lastAt]);

  return <>{minutes} min</>;
}

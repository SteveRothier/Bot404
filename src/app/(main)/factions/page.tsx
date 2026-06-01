import Link from "next/link";
import { FactionControlLive } from "@/components/widgets/FactionControlLive";
import {
  getCachedFactions,
} from "@/lib/queries/cached";
import { getNpcMembersByFaction } from "@/lib/queries/factions";

export const revalidate = 30;

export default async function FactionsPage() {
  const [factions, membersByFaction] = await Promise.all([
    getCachedFactions(),
    getNpcMembersByFaction(),
  ]);

  return (
    <div className="w-full divide-y divide-border">
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold">Factions</h1>
        <p className="mt-1 text-meta text-muted-foreground">
          Contrôle du réseau et alignements NPC
        </p>
      </div>

      <section className="px-4 py-4">
        <FactionControlLive />
      </section>

      <section className="px-4 py-4">
        <h2 className="mb-3 text-[15px] font-bold">Les quatre factions</h2>
        <ul className="space-y-3">
          {factions.map((faction) => {
            const members = membersByFaction[faction.id] ?? [];
            return (
              <li
                key={faction.id}
                className="rounded-2xl border border-border bg-secondary/30 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{ color: faction.color }}
                    >
                      {faction.name}
                    </h3>
                    {faction.description && (
                      <p className="mt-1 text-[15px] text-muted-foreground">
                        {faction.description}
                      </p>
                    )}
                  </div>
                  <span className="text-meta tabular-nums text-muted-foreground">
                    {Number(faction.control_percent).toFixed(1)}%
                  </span>
                </div>

                {members.length > 0 && (
                  <div className="mt-3">
                    <p className="text-meta text-muted-foreground">NPC</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {members.map((member) => (
                        <Link
                          key={member.id}
                          href={`/profile/${member.username}`}
                          className="text-meta rounded-md bg-secondary px-2 py-0.5 text-foreground hover:underline"
                        >
                          @{member.username}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

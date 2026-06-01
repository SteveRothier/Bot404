import { FactionsListLive } from "@/components/factions/FactionsListLive";
import { FactionControlLive } from "@/components/widgets/FactionControlLive";
import { getCachedFactions } from "@/lib/queries/cached";
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
        <FactionsListLive
          factions={factions}
          membersByFaction={membersByFaction}
        />
      </section>
    </div>
  );
}

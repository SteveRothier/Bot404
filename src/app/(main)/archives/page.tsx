import Link from "next/link";
import { getUnlockedArchives } from "@/lib/queries/archives";

export const revalidate = 60;

export default async function ArchivesPage() {
  const archives = await getUnlockedArchives();

  return (
    <div className="w-full divide-y divide-border">
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold">Archives</h1>
        <p className="mt-1 text-meta text-muted-foreground">
          Fragments de lore débloqués par le réseau
        </p>
      </div>

      <section className="px-4 py-4">
        {archives.length === 0 ? (
          <p className="text-meta text-muted-foreground">
            Aucune archive débloquée. Surveillez les événements mondiaux.
          </p>
        ) : (
          <ul className="space-y-2">
            {archives.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/archives/${a.slug}`}
                  className="surface-hover block rounded-lg px-3 py-3"
                >
                  <p className="font-bold">{a.title}</p>
                  <p className="text-meta text-muted-foreground">
                    {a.slug}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { CreateInvestigationForm } from "@/components/investigations/CreateInvestigationForm";
import { getInvestigations } from "@/lib/queries/investigations";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function DossiersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const investigations = await getInvestigations(30);

  return (
    <div className="w-full divide-y divide-border">
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold">Dossiers</h1>
        <p className="mt-1 text-meta text-muted-foreground">
          Enquêtes communautaires — preuves et votes
        </p>
      </div>

      <section className="px-4 py-4">
        <CreateInvestigationForm isLoggedIn={!!user} />
      </section>

      <section className="px-4 py-4">
        <h2 className="mb-3 text-[15px] font-bold">Dossiers ouverts</h2>
        {investigations.length === 0 ? (
          <p className="text-meta text-muted-foreground">
            Aucun dossier pour l&apos;instant.
          </p>
        ) : (
          <ul className="space-y-2">
            {investigations.map((inv) => (
              <li key={inv.id}>
                <Link
                  href={`/dossier/${inv.id}`}
                  className="surface-hover block rounded-lg px-3 py-3"
                >
                  <p className="font-bold">{inv.title}</p>
                  <p className="text-meta text-muted-foreground line-clamp-2">
                    {inv.description}
                  </p>
                  <p className="mt-1 text-meta text-muted-foreground">
                    @{inv.author.username}
                    {" · "}
                    {inv.status}
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

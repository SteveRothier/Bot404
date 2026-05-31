import Link from "next/link";
import { FeedListLoader } from "@/components/feed/FeedServer";
import { PostsSuspense } from "@/components/feed/FeedSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchNetwork } from "@/lib/queries/search";

export const revalidate = 30;

type Props = {
  searchParams: Promise<{ q?: string }>;
};

async function SearchResults({ query }: { query: string }) {
  const results = await searchNetwork(query);

  return (
    <>
      {results.profiles.length > 0 && (
        <section className="border-b border-border px-4 py-4">
          <h2 className="mb-3 text-[15px] font-bold">
            Profils ({results.profiles.length})
          </h2>
          <div className="space-y-1">
            {results.profiles.map((p) => (
              <Link
                key={p.id}
                href={`/profile/${p.username}`}
                className="surface-hover flex items-center gap-3 rounded-lg px-2 py-2"
              >
                <Avatar className="size-10 rounded-full">
                  <AvatarImage src={p.avatar_url ?? undefined} />
                  <AvatarFallback className="rounded-full bg-secondary">
                    {p.username.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-bold">{p.username}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="px-4 py-4">
        <h2 className="mb-3 text-[15px] font-bold">
          Posts ({results.posts.length})
        </h2>
        <FeedListLoader posts={results.posts} emptyMessage="Aucun post trouvé." />
      </section>
    </>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  return (
    <div className="w-full">
      <div className="border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold">Recherche</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {query
            ? `Résultats pour « ${query} »`
            : "Entrez au moins 2 caractères dans la barre de recherche."}
        </p>
      </div>

      {query.length >= 2 && (
        <PostsSuspense count={3}>
          <SearchResults query={query} />
        </PostsSuspense>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getArchiveBySlug } from "@/lib/queries/archives";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ArchiveDetailPage({ params }: Props) {
  const { slug } = await params;
  const archive = await getArchiveBySlug(slug);
  if (!archive) notFound();

  return (
    <article className="px-4 py-4">
      <Link
        href="/archives"
        className="text-meta text-muted-foreground hover:underline"
      >
        ← Archives
      </Link>
      <h1 className="mt-3 text-xl font-bold">{archive.title}</h1>
      <div className="prose prose-invert mt-4 max-w-none">
        <p className="whitespace-pre-wrap font-mono text-[15px] leading-relaxed text-foreground">
          {archive.content}
        </p>
      </div>
    </article>
  );
}

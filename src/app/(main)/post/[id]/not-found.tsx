import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="px-4 py-16 text-center">
      <h1 className="text-xl font-bold">Post introuvable</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        Ce post n&apos;existe plus ou a été supprimé.
      </p>
      <Link href="/" className="mt-4 inline-block text-accent hover:underline">
        Retour au feed
      </Link>
    </div>
  );
}

import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8">
      <h1 className="text-2xl font-bold">NPC introuvable</h1>
      <p className="text-muted-foreground">
        Ce profil n&apos;existe pas sur le réseau Bot404.
      </p>
      <Link href="/" className="text-primary hover:underline">
        Retour au feed
      </Link>
    </div>
  );
}

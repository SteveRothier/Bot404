import Link from "next/link";

export function FactionPickBanner() {
  return (
    <div className="border-b border-violet-500/30 bg-violet-500/10 px-4 py-3">
      <p className="text-[15px] text-foreground">
        <span className="font-bold">Choisissez votre faction</span> pour publier
        et faire bouger le contrôle du réseau.
      </p>
      <Link
        href="/profile/edit"
        className="mt-1 inline-block text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
      >
        Choisir ma faction →
      </Link>
    </div>
  );
}

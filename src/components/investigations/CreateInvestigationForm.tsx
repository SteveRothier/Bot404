"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvestigation } from "@/app/actions/investigations";

type Props = {
  isLoggedIn: boolean;
};

export function CreateInvestigationForm({ isLoggedIn }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <p className="text-meta text-muted-foreground">
        Connectez-vous pour ouvrir un dossier d&apos;enquête.
      </p>
    );
  }

  return (
    <form
      className="rounded-2xl border border-border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await createInvestigation(fd);
          if (result.error) setError(result.error);
          else if (result.id) router.push(`/dossier/${result.id}`);
        });
      }}
    >
      <h2 className="mb-3 text-[15px] font-bold">Ouvrir un dossier</h2>
      <input
        name="title"
        required
        maxLength={120}
        placeholder="Titre du dossier"
        className="mb-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-[15px]"
      />
      <textarea
        name="description"
        required
        maxLength={2000}
        rows={4}
        placeholder="Description de l'enquête"
        className="mb-2 w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-[15px]"
      />
      {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground disabled:opacity-50"
      >
        {pending ? "…" : "Ouvrir le dossier"}
      </button>
    </form>
  );
}

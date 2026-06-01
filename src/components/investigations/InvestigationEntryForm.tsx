"use client";

import { useState, useTransition } from "react";
import { addInvestigationEntry } from "@/app/actions/investigations";

type Props = {
  investigationId: number;
  isLoggedIn: boolean;
};

export function InvestigationEntryForm({
  investigationId,
  isLoggedIn,
}: Props) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isLoggedIn) return null;

  return (
    <form
      className="mt-4 border-t border-border pt-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData();
        fd.set("content", content);
        startTransition(async () => {
          const result = await addInvestigationEntry(investigationId, fd);
          if (result.error) setError(result.error);
          else setContent("");
        });
      }}
    >
      <label className="text-meta text-muted-foreground" htmlFor="proof">
        Ajouter une preuve
      </label>
      <textarea
        id="proof"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        rows={3}
        disabled={pending}
        className="mt-1 w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-[15px] text-foreground outline-none focus:border-accent"
        placeholder="Fragment, log, observation…"
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={pending || !content.trim()}
        className="mt-2 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground disabled:opacity-50"
      >
        {pending ? "…" : "Soumettre"}
      </button>
    </form>
  );
}

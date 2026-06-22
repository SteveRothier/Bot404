"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";

const MIN_SEARCH_LENGTH = 2;
const SEARCH_HINT = "2 caractères minimum.";

function submitSearchQuery(
  q: string,
  router: ReturnType<typeof useRouter>
): string | null {
  const trimmed = q.trim();
  if (trimmed.length < MIN_SEARCH_LENGTH) {
    return SEARCH_HINT;
  }
  router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  return null;
}

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hint, setHint] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setHint(submitSearchQuery(q, router));
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Rechercher"
        className="h-10 rounded-full border-0 bg-secondary pl-11 text-[15px] placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          if (hint && e.target.value.trim().length >= MIN_SEARCH_LENGTH) {
            setHint(null);
          }
        }}
        aria-describedby={hint ? "search-hint" : undefined}
      />
      {hint && (
        <p id="search-hint" className="mt-1 px-2 text-xs text-destructive" role="alert">
          {hint}
        </p>
      )}
    </form>
  );
}

export function SearchBarPage({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [hint, setHint] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setHint(submitSearchQuery(q, router));
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Rechercher profils et posts…"
        className="h-10 rounded-full border-0 bg-secondary pl-11 text-[15px] placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          if (hint && e.target.value.trim().length >= MIN_SEARCH_LENGTH) {
            setHint(null);
          }
        }}
        aria-describedby={hint ? "search-page-hint" : undefined}
      />
      {hint && (
        <p id="search-page-hint" className="mt-1 text-xs text-destructive" role="alert">
          {hint}
        </p>
      )}
    </form>
  );
}

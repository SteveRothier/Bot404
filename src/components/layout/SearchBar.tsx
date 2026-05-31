"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto hidden max-w-md flex-1 md:block"
    >
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Rechercher"
        className="h-10 rounded-full border-0 bg-secondary pl-11 text-[15px] placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </form>
  );
}

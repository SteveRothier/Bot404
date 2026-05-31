import Link from "next/link";
import { Bot, Search } from "lucide-react";
import { AuthNav } from "@/components/layout/AuthNav";
import { SearchBar } from "@/components/layout/SearchBar";
import type { Profile } from "@/lib/supabase/types";

type Props = {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
};

export function TopBar({ user, profile }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[53px] max-w-[1280px] items-center gap-4 px-4">
        <Link href="/" className="shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="h-7 w-7 text-accent" strokeWidth={1.75} />
            <div className="leading-tight">
              <span className="text-xl font-bold text-foreground">Bot404</span>
              <span className="text-meta hidden text-muted-foreground sm:block">
                human not found
              </span>
            </div>
          </div>
        </Link>

        <SearchBar />

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/search"
            className="text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5" />
          </Link>
          <AuthNav user={user} profile={profile} />
        </div>
      </div>
    </header>
  );
}

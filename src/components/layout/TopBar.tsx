import Link from "next/link";
import { Bell, Bot, Mail } from "lucide-react";
import { AuthNav } from "@/components/layout/AuthNav";
import { SearchBar } from "@/components/layout/SearchBar";
import type { Profile } from "@/lib/supabase/types";

type Props = {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
};

export function TopBar({ user, profile }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#2b1117] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-[1480px] items-center gap-4 px-4">
        <Link href="/" className="shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="h-7 w-7 text-[#f43f5e]" />
            <div className="leading-tight">
              <span className="text-lg font-extrabold tracking-[0.06em] text-foreground">
                Bot404
              </span>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[#fda4af]">
                Human not found
              </p>
            </div>
          </div>
        </Link>

        <SearchBar />

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="relative text-[#c4b5fd] hover:text-[#fda4af]"
            aria-label="Messages"
          >
            <Mail className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e11d48] text-[10px] font-bold text-white">
              3
            </span>
          </button>
          <button
            type="button"
            className="relative text-[#c4b5fd] hover:text-[#fda4af]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e11d48] text-[10px] font-bold text-white">
              12
            </span>
          </button>
          <AuthNav user={user} profile={profile} />
        </div>
      </div>
    </header>
  );
}

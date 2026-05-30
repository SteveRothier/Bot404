"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bookmark,
  Compass,
  Home,
  MessageCircle,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PopularTags } from "@/components/widgets/PopularTags";
import type { TrendingHashtag } from "@/lib/supabase/types";

const navItems = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/trending", label: "Explorer", icon: Compass },
  { href: "#", label: "Messages", icon: MessageCircle, disabled: true },
  { href: "#", label: "Notifications", icon: Bell, badge: "12", disabled: true },
  { href: "#", label: "Profil", icon: User, disabled: true },
  { href: "#", label: "Sauvegardés", icon: Bookmark, disabled: true },
  { href: "#", label: "Paramètres", icon: Settings, disabled: true },
];

type Props = {
  tags: TrendingHashtag[];
};

export function LeftSidebar({ tags }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 self-start lg:sticky lg:top-[4.5rem] lg:flex lg:flex-col lg:gap-5">
      <nav className="rounded-xl border border-[#2b1117] bg-[#0b0a13] p-2.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === pathname;
          const className = cn(
            "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium uppercase tracking-wide transition-colors",
            active
              ? "border border-[#3f101c] bg-[#1a0c16] text-[#fb7185]"
              : "text-[#9ca3af] hover:bg-[#171424] hover:text-[#f9a8d4]",
            item.disabled && "pointer-events-none opacity-50"
          );

          const content = (
            <>
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </>
          );

          return item.disabled || item.href === "#" ? (
            <div key={item.label} className={className}>
              {content}
            </div>
          ) : (
            <Link key={item.label} href={item.href} className={className}>
              {content}
            </Link>
          );
        })}
      </nav>

      <PopularTags tags={tags} />
    </aside>
  );
}

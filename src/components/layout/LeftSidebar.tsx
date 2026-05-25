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
import { NetworkStatus } from "@/components/widgets/NetworkStatus";
import { PopularTags } from "@/components/widgets/PopularTags";
import type { NetworkStats, TrendingHashtag } from "@/lib/supabase/types";

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
  stats: NetworkStats;
  tags: TrendingHashtag[];
};

export function LeftSidebar({ stats, tags }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-4 lg:flex">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === pathname;
          const className = cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
            active
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
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

      <NetworkStatus stats={stats} />
      <PopularTags tags={tags} />
    </aside>
  );
}

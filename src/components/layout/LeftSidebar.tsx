import { AppSidebarContent } from "@/components/layout/AppSidebarContent";
import type { Profile } from "@/lib/supabase/types";

type SidebarAuth = {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  profileUsername: string | null;
};

type Props = {
  sidebarAuth: SidebarAuth;
};

export function LeftSidebar({ sidebarAuth }: Props) {
  const { user, profile, profileUsername } = sidebarAuth;

  return (
    <aside className="flex h-[100dvh] w-full flex-col overflow-x-visible overflow-y-auto border-r border-border bg-background">
      <AppSidebarContent
        user={user}
        profile={profile}
        profileUsername={profileUsername}
        className="pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      />
    </aside>
  );
}

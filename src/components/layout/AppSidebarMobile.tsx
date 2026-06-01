import { AppSidebarContent } from "@/components/layout/AppSidebarContent";
import { AppSidebarDrawer } from "@/components/layout/AppSidebarDrawer";
import type { Profile } from "@/lib/supabase/types";

type SidebarAuth = {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  profileUsername: string | null;
};

type Props = {
  sidebarAuth: SidebarAuth;
};

export function AppSidebarMobile({ sidebarAuth }: Props) {
  const { user, profile, profileUsername } = sidebarAuth;

  return (
    <AppSidebarDrawer>
      <AppSidebarContent
        user={user}
        profile={profile}
        profileUsername={profileUsername}
      />
    </AppSidebarDrawer>
  );
}

import { AppSidebarContent } from "@/components/layout/AppSidebarContent";
import { AppSidebarDrawer } from "@/components/layout/AppSidebarDrawer";
import { AppSidebarNetworkMobile } from "@/components/layout/AppSidebarNetworkMobile";
import { getSidebarAuth } from "@/lib/queries/sidebar-auth";
import type { NetworkStats } from "@/lib/supabase/types";

type Props = {
  stats: NetworkStats;
};

export async function AppSidebarMobile({ stats }: Props) {
  const { user, profile, profileUsername } = await getSidebarAuth();

  return (
    <AppSidebarDrawer>
      <AppSidebarContent
        user={user}
        profile={profile}
        profileUsername={profileUsername}
      />
      <AppSidebarNetworkMobile stats={stats} />
    </AppSidebarDrawer>
  );
}

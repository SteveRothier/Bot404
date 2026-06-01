import { AppSidebarContent } from "@/components/layout/AppSidebarContent";
import { AppSidebarDrawer } from "@/components/layout/AppSidebarDrawer";
import { getSidebarAuth } from "@/lib/queries/sidebar-auth";

export async function AppSidebarMobile() {
  const { user, profile, profileUsername } = await getSidebarAuth();

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

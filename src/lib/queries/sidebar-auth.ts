import { getCurrentUserProfile } from "@/lib/queries/feed";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export async function getSidebarAuth(): Promise<{
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  profileUsername: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? await getCurrentUserProfile() : null;

  return {
    user,
    profile,
    profileUsername: profile?.username ?? null,
  };
}

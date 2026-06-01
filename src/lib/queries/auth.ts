import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export type RequestAuth = {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
};

async function fetchRequestAuth(): Promise<RequestAuth> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data } = await supabase
    .from("profiles")
    .select("*, faction:factions(*)")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: (data as Profile) ?? null };
}

export const getRequestAuth = cache(fetchRequestAuth);

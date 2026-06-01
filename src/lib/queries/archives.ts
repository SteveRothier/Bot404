import { createClient } from "@/lib/supabase/server";
import type { Archive } from "@/lib/supabase/types";

export async function getUnlockedArchives(): Promise<Archive[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("archives")
    .select("*")
    .not("unlocked_at", "is", null)
    .lte("unlocked_at", now)
    .order("unlocked_at", { ascending: false });

  if (error || !data) return [];
  return data as Archive[];
}

export async function getArchiveBySlug(slug: string): Promise<Archive | null> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("archives")
    .select("*")
    .eq("slug", slug)
    .not("unlocked_at", "is", null)
    .lte("unlocked_at", now)
    .maybeSingle();

  return (data as Archive) ?? null;
}

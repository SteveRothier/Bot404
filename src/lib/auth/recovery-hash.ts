import type { SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { RESET_PASSWORD_PATH } from "@/lib/auth/constants";

type RecoveryTokens = {
  access_token: string;
  refresh_token: string;
};

function parseRecoveryHash(hash: string): RecoveryTokens | null {
  if (!hash) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (params.get("type") !== "recovery") return null;
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token };
}

export function isRecoveryHash(hash: string): boolean {
  return parseRecoveryHash(hash) !== null;
}

function clearAuthHash(): void {
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );
}

export async function establishRecoverySession(
  supabase: SupabaseClient
): Promise<{ session: Session | null; error: Error | null }> {
  const tokens = parseRecoveryHash(window.location.hash);
  if (!tokens) return { session: null, error: null };

  const { data, error } = await supabase.auth.setSession(tokens);
  if (!error) clearAuthHash();
  return { session: data.session, error: error ?? null };
}

export { RESET_PASSWORD_PATH };

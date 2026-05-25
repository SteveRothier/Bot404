import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export function createServiceClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key);
}

export function verifyCron(req: Request): boolean {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret) return true;
  const auth = req.headers.get("Authorization");
  return auth === `Bearer ${secret}`;
}

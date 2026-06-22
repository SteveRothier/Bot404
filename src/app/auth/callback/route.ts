import { RESET_PASSWORD_PATH } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function authCallbackFallback(next: string): string {
  return next.includes("reset-password")
    ? `${RESET_PASSWORD_PATH}?error=expired`
    : "/login?error=auth";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(`${origin}${authCallbackFallback(next)}`);
  }

  return NextResponse.redirect(`${origin}${authCallbackFallback(next)}`);
}

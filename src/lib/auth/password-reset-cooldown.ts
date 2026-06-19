import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOLDOWN_MS = 5 * 60 * 1000;

function cookieKey(email: string): string {
  const hash = createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
  return `pwd_reset_${hash}`;
}

export async function checkPasswordResetCooldown(
  email: string
): Promise<{ ok: true } | { ok: false }> {
  const cookieStore = await cookies();
  const last = cookieStore.get(cookieKey(email))?.value;
  if (!last) return { ok: true };

  const elapsed = Date.now() - Number(last);
  if (elapsed < COOLDOWN_MS) {
    return { ok: false };
  }

  return { ok: true };
}

export async function setPasswordResetCooldown(email: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(cookieKey(email), String(Date.now()), {
    maxAge: COOLDOWN_MS / 1000,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

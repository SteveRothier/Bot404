"use server";

import {
  checkPasswordResetCooldown,
  setPasswordResetCooldown,
} from "@/lib/auth/password-reset-cooldown";
import { getSiteOrigin } from "@/lib/auth/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

export type PasswordResetResult =
  | { ok: true }
  | {
      ok: false;
      reason: "invalid" | "not_found" | "rate_limited" | "error";
      message?: string;
    };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRateLimitError(error: { code?: string; message?: string }): boolean {
  if (error.code === "over_request_rate_limit") return true;
  const lower = (error.message ?? "").toLowerCase();
  return (
    lower.includes("security purposes") ||
    lower.includes("only request this after") ||
    lower.includes("rate limit")
  );
}

export async function requestPasswordReset(
  email: string,
  origin: string
): Promise<PasswordResetResult> {
  const normalized = email.trim().toLowerCase();

  if (!normalized || !EMAIL_PATTERN.test(normalized)) {
    return { ok: false, reason: "invalid" };
  }

  const cooldown = await checkPasswordResetCooldown(normalized);
  if (!cooldown.ok) {
    return { ok: false, reason: "rate_limited" };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, reason: "error", message: "Configuration serveur indisponible." };
  }

  const { data: exists, error: existsError } = await admin.rpc(
    "auth_email_exists",
    { target_email: normalized }
  );

  if (existsError) {
    return {
      ok: false,
      reason: "error",
      message: "Impossible de vérifier l'adresse e-mail.",
    };
  }

  if (!exists) {
    return { ok: false, reason: "not_found" };
  }

  const siteOrigin = getSiteOrigin(origin);
  const redirectTo = `${siteOrigin}/login/reset-password`;

  const { error: sendError } = await admin.auth.resetPasswordForEmail(
    normalized,
    { redirectTo }
  );

  if (sendError) {
    if (isRateLimitError(sendError)) {
      return {
        ok: false,
        reason: "error",
        message: "Trop de demandes. Réessayez dans quelques instants.",
      };
    }
    return {
      ok: false,
      reason: "error",
      message: "Impossible d'envoyer l'email. Réessayez.",
    };
  }

  await setPasswordResetCooldown(normalized);
  return { ok: true };
}

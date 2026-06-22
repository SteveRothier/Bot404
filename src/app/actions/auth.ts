"use server";

import {
  AUTH_MESSAGES,
  EMAIL_PATTERN,
  passwordResetCooldownMessage,
  RESET_PASSWORD_PATH,
} from "@/lib/auth/constants";
import {
  checkPasswordResetCooldown,
  PASSWORD_RESET_COOLDOWN_MINUTES,
  setPasswordResetCooldown,
} from "@/lib/auth/password-reset-cooldown";
import { getSiteOrigin } from "@/lib/auth/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

type PasswordResetFailure = {
  ok: false;
  reason: "invalid" | "not_found" | "rate_limited" | "error";
  message: string;
  field?: "email";
};

export type PasswordResetResult = { ok: true } | PasswordResetFailure;

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
    return {
      ok: false,
      reason: "invalid",
      message: AUTH_MESSAGES.emailInvalid,
      field: "email",
    };
  }

  const cooldown = await checkPasswordResetCooldown(normalized);
  if (!cooldown.ok) {
    return {
      ok: false,
      reason: "rate_limited",
      message: passwordResetCooldownMessage(PASSWORD_RESET_COOLDOWN_MINUTES),
      field: "email",
    };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      ok: false,
      reason: "error",
      message: AUTH_MESSAGES.serverConfigUnavailable,
    };
  }

  const { data: exists, error: existsError } = await admin.rpc(
    "auth_email_exists",
    { target_email: normalized }
  );

  if (existsError) {
    return {
      ok: false,
      reason: "error",
      message: AUTH_MESSAGES.resetVerifyFailed,
    };
  }

  if (!exists) {
    return {
      ok: false,
      reason: "not_found",
      message: AUTH_MESSAGES.emailNotFound,
      field: "email",
    };
  }

  const siteOrigin = getSiteOrigin(origin);
  const redirectTo = `${siteOrigin}${RESET_PASSWORD_PATH}`;

  const { error: sendError } = await admin.auth.resetPasswordForEmail(
    normalized,
    { redirectTo }
  );

  if (sendError) {
    if (isRateLimitError(sendError)) {
      return {
        ok: false,
        reason: "error",
        message: AUTH_MESSAGES.resetRateLimited,
      };
    }
    return {
      ok: false,
      reason: "error",
      message: AUTH_MESSAGES.resetEmailFailed,
    };
  }

  await setPasswordResetCooldown(normalized);
  return { ok: true };
}

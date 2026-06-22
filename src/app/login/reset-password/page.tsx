"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { AuthFormMessage } from "@/components/auth/AuthFormMessage";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthBackLink, AuthShell } from "@/components/auth/AuthShell";
import { AUTH_MESSAGES, validatePassword } from "@/lib/auth/constants";
import {
  establishRecoverySession,
  isRecoveryHash,
} from "@/lib/auth/recovery-hash";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expiredFromUrl = searchParams.get("error") === "expired";
  const urlExpiredMessage = expiredFromUrl ? AUTH_MESSAGES.recoveryExpired : null;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(!expiredFromUrl);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (expiredFromUrl) {
      setCheckingSession(false);
      return;
    }

    const supabase = createClient();
    let settled = false;

    function finish(session: Session | null, errorMessage?: string) {
      if (settled) return;
      settled = true;
      setSessionReady(!!session);
      setUserEmail(session?.user.email ?? null);
      if (!session) {
        setMessageIsError(true);
        setMessage(errorMessage ?? AUTH_MESSAGES.sessionInvalid);
      }
      setCheckingSession(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        finish(session);
      }
    });

    async function resolveSession() {
      if (isRecoveryHash(window.location.hash)) {
        const { session } = await establishRecoverySession(supabase);
        if (session) {
          finish(session);
          return;
        }
        finish(null, AUTH_MESSAGES.recoveryInvalid);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      finish(session);
    }

    void resolveSession();

    return () => subscription.unsubscribe();
  }, [expiredFromUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setMessageIsError(false);
    setPasswordError(null);
    setConfirmError(null);

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError(AUTH_MESSAGES.passwordMismatch);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessageIsError(true);
      setMessage(
        error.code === "same_password"
          ? AUTH_MESSAGES.samePassword
          : AUTH_MESSAGES.genericError
      );
      return;
    }

    await supabase.auth.signOut();
    setMessageIsError(false);
    setMessage(AUTH_MESSAGES.passwordUpdated);
    window.setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1200);
  }

  const displayMessage = message ?? urlExpiredMessage;
  const displayIsError = messageIsError || !!urlExpiredMessage;
  const canSubmit =
    sessionReady && !expiredFromUrl && !checkingSession && !loading;

  const subtitle = userEmail
    ? `Réinitialiser le mot de passe pour ${userEmail}`
    : "Saisissez et confirmez votre nouveau mot de passe";

  return (
    <AuthShell
      title="Choisir un nouveau mot de passe"
      subtitle={subtitle}
      footer={
        <AuthBackLink href="/login">Demander un nouveau lien</AuthBackLink>
      }
    >
      {checkingSession ? (
        <p className="text-sm text-muted-foreground">Vérification du lien…</p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <PasswordInput
            id="password"
            label="Nouveau mot de passe"
            value={password}
            disabled={!canSubmit}
            error={passwordError}
            onChange={(value) => {
              setPassword(value);
              if (passwordError) setPasswordError(null);
            }}
          />

          <PasswordInput
            id="confirm-password"
            label="Confirmer le mot de passe"
            value={confirmPassword}
            disabled={!canSubmit}
            error={confirmError}
            onChange={(value) => {
              setConfirmPassword(value);
              if (confirmError) setConfirmError(null);
            }}
          />

          {displayMessage && (
            <AuthFormMessage message={displayMessage} isError={displayIsError} />
          )}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-10 w-full rounded-md bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
          >
            {loading ? "..." : "Enregistrer le mot de passe"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

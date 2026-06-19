"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import {
  AuthBackLink,
  AuthShell,
} from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expiredFromUrl = searchParams.get("error") === "expired";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(
    expiredFromUrl
      ? "Lien expiré ou déjà utilisé. Demandez un nouveau lien."
      : null
  );
  const [messageIsError, setMessageIsError] = useState(expiredFromUrl);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(!expiredFromUrl);

  useEffect(() => {
    if (expiredFromUrl) {
      setCheckingSession(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionReady(!!session);
      if (!session) {
        setMessageIsError(true);
        setMessage(
          "Session invalide. Utilisez le lien reçu par email ou demandez-en un nouveau."
        );
      }
      setCheckingSession(false);
    });
  }, [expiredFromUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setMessageIsError(false);

    if (password.length < 6) {
      setMessageIsError(true);
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setMessageIsError(true);
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessageIsError(true);
      setMessage(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  const canSubmit = sessionReady && !expiredFromUrl && !checkingSession;

  return (
    <AuthShell
      title="Choisir un nouveau mot de passe"
      subtitle="Saisissez et confirmez votre nouveau mot de passe"
      footer={
        <>
          <AuthBackLink href="/login">Demander un nouveau lien</AuthBackLink>
          <AuthBackLink href="/login">Retour à la connexion</AuthBackLink>
        </>
      }
    >
      {checkingSession ? (
        <p className="text-sm text-muted-foreground">Vérification du lien…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            id="password"
            label="Nouveau mot de passe"
            required
            minLength={6}
            value={password}
            disabled={loading || !canSubmit}
            onChange={setPassword}
          />

          <PasswordInput
            id="confirm-password"
            label="Confirmer le mot de passe"
            required
            minLength={6}
            value={confirmPassword}
            disabled={loading || !canSubmit}
            onChange={setConfirmPassword}
          />

          {message && (
            <p
              className={cn(
                "text-sm",
                messageIsError ? "text-destructive" : "text-muted-foreground"
              )}
              role={messageIsError ? "alert" : "status"}
            >
              {message}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || !canSubmit}
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

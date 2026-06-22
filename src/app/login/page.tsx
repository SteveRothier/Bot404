"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { requestPasswordReset } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordResetSentDialog } from "@/components/auth/PasswordResetSentDialog";
import { createClient } from "@/lib/supabase/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const searchParams = useSearchParams();
  const authErrorFromUrl = searchParams.get("error") === "auth";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState<string | null>(
    authErrorFromUrl ? "Lien de connexion invalide ou expiré." : null
  );
  const [messageIsError, setMessageIsError] = useState(authErrorFromUrl);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);

  useEffect(() => {
    if (authErrorFromUrl) {
      setMessageIsError(true);
      setMessage("Lien de connexion invalide ou expiré.");
    }
  }, [authErrorFromUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setMessageIsError(false);
    setEmailError(null);
    setPasswordError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Saisissez votre adresse e-mail.");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError("Adresse e-mail invalide.");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: { username: username || undefined },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoading(false);
      if (error) {
        setMessageIsError(true);
        if (error.code === "user_already_exists") {
          setMessage("Un compte existe déjà avec cette adresse e-mail.");
        } else {
          setMessage("Une erreur est survenue. Réessayez.");
        }
        return;
      }
      if (data.session) {
        window.location.href = "/profile/edit";
        return;
      }
      if (data.user && !data.user.email_confirmed_at) {
        setMessage(
          "Compte créé. Un email de confirmation a été envoyé (vérifiez les spams)."
        );
        return;
      }
      setMessage("Compte créé. Vous pouvez vous connecter.");
      setMode("login");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      setLoading(false);
      if (error) {
        setMessageIsError(true);
        setMessage(
          error.code === "email_not_confirmed"
            ? "Confirmez votre adresse e-mail avant de vous connecter (vérifiez vos spams)."
            : "Email ou mot de passe incorrect."
        );
      } else {
        window.location.href = "/";
      }
    }
  }

  function handleModeToggle() {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setMessage(null);
    setMessageIsError(false);
    setEmailError(null);
    setPasswordError(null);
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (emailError) setEmailError(null);
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (passwordError) setPasswordError(null);
  }

  async function handleForgotPassword() {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Saisissez votre adresse e-mail.");
      return;
    }

    setForgotLoading(true);
    setEmailError(null);
    setMessage(null);

    const result = await requestPasswordReset(trimmed, window.location.origin);
    setForgotLoading(false);

    if (!result.ok) {
      if (result.reason === "invalid") {
        setEmailError("Adresse e-mail invalide.");
        return;
      }
      if (result.reason === "not_found") {
        setEmailError("Adresse e-mail inexistante.");
        return;
      }
      if (result.reason === "rate_limited") {
        setEmailError(
          "Un email a déjà été envoyé à cette adresse. Réessayez dans 5 minutes ou consultez votre boîte de réception."
        );
        return;
      }
      setMessageIsError(true);
      setMessage(result.message ?? "Impossible d'envoyer l'email.");
      return;
    }

    setForgotDialogOpen(true);
  }

  return (
    <>
      <AuthCard
        mode={mode}
        email={email}
        password={password}
        username={username}
        message={message}
        messageIsError={messageIsError}
        loading={loading}
        emailError={emailError}
        passwordError={passwordError}
        forgotLoading={forgotLoading}
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        onUsernameChange={setUsername}
        onModeToggle={handleModeToggle}
        onSubmit={handleSubmit}
        onForgotPassword={handleForgotPassword}
      />
      <PasswordResetSentDialog
        open={forgotDialogOpen}
        email={email.trim()}
        onClose={() => setForgotDialogOpen(false)}
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

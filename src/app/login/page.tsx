"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordResetSentDialog } from "@/components/auth/PasswordResetSentDialog";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setMessageIsError(false);
    setEmailError(null);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username || undefined },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoading(false);
      if (error) {
        setMessageIsError(true);
        setMessage(error.message);
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
        email,
        password,
      });
      setLoading(false);
      if (error) {
        setMessageIsError(true);
        setMessage(error.message);
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
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (emailError) setEmailError(null);
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
        forgotLoading={forgotLoading}
        onEmailChange={handleEmailChange}
        onPasswordChange={setPassword}
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

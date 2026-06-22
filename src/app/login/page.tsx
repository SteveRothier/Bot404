"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { requestPasswordReset } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordResetSentDialog } from "@/components/auth/PasswordResetSentDialog";
import { AUTH_MESSAGES, validateEmail, validatePassword } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const urlAuthError =
    searchParams.get("error") === "auth" ? AUTH_MESSAGES.callbackAuthError : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setMessageIsError(false);
    setEmailError(null);
    setPasswordError(null);

    const trimmedEmail = email.trim();
    const emailValidation = validateEmail(trimmedEmail);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
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
        setMessage(
          error.code === "user_already_exists"
            ? AUTH_MESSAGES.userExists
            : AUTH_MESSAGES.genericError
        );
        return;
      }
      if (data.session) {
        window.location.href = "/profile/edit";
        return;
      }
      if (data.user && !data.user.email_confirmed_at) {
        setMessage(AUTH_MESSAGES.signupConfirmationSent);
        return;
      }
      setMessage(AUTH_MESSAGES.signupSuccess);
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
            ? AUTH_MESSAGES.emailNotConfirmed
            : AUTH_MESSAGES.loginInvalid
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
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    setForgotLoading(true);
    setEmailError(null);
    setMessage(null);

    const result = await requestPasswordReset(email.trim(), window.location.origin);
    setForgotLoading(false);

    if (!result.ok) {
      if (result.field === "email") {
        setEmailError(result.message);
      } else {
        setMessageIsError(true);
        setMessage(result.message);
      }
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
        message={message ?? urlAuthError}
        messageIsError={messageIsError || !!urlAuthError}
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

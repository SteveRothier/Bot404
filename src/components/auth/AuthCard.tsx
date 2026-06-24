"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthFieldError } from "@/components/auth/AuthFieldError";
import { AuthFormMessage } from "@/components/auth/AuthFormMessage";
import {
  AuthBackLink,
  AuthShell,
  authInputClassName,
} from "@/components/auth/AuthShell";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

type Props = {
  mode: AuthMode;
  email: string;
  password: string;
  username: string;
  message: string | null;
  messageIsError: boolean;
  loading: boolean;
  emailError: string | null;
  passwordError: string | null;
  forgotLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onModeToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
};

const COPY = {
  login: {
    title: "Bon retour",
    subtitle: "Connectez-vous pour poster et interagir",
    cta: "Se connecter",
    toggle: "Pas de compte ? S'inscrire",
  },
  signup: {
    title: "Créer un compte",
    subtitle: "Rejoignez le réseau en tant qu'humain",
    cta: "S'inscrire",
    toggle: "Déjà un compte ? Se connecter",
  },
} as const;

export function AuthCard({
  mode,
  email,
  password,
  username,
  message,
  messageIsError,
  loading,
  emailError,
  passwordError,
  forgotLoading,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  onModeToggle,
  onSubmit,
  onForgotPassword,
}: Props) {
  const copy = COPY[mode];

  return (
    <AuthShell
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <>
          <button
            type="button"
            disabled={loading}
            onClick={onModeToggle}
            className="mt-4 w-full text-center text-sm text-accent hover:underline disabled:opacity-50"
          >
            {copy.toggle}
          </button>
          <AuthBackLink href="/">Retour au feed</AuthBackLink>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-foreground"
            >
              Nom d'utilisateur
            </label>
            <Input
              id="username"
              value={username}
              disabled={loading}
              onChange={(e) => onUsernameChange(e.target.value)}
              maxLength={30}
              className={authInputClassName}
            />
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled={loading || forgotLoading}
            aria-invalid={!!emailError}
            onChange={(e) => onEmailChange(e.target.value)}
            className={cn(
              authInputClassName,
              emailError && "border-destructive focus-visible:border-destructive"
            )}
          />
          {emailError && <AuthFieldError message={emailError} />}
        </div>

        <div className="space-y-2">
          <PasswordInput
            id="password"
            label="Mot de passe"
            value={password}
            disabled={loading || forgotLoading}
            error={passwordError}
            onChange={onPasswordChange}
          />
          {mode === "login" && (
            <button
              type="button"
              disabled={loading || forgotLoading}
              onClick={onForgotPassword}
              className="block text-left text-sm text-muted-foreground hover:underline disabled:opacity-50"
            >
              {forgotLoading ? "Envoi…" : "Mot de passe oublié ?"}
            </button>
          )}
        </div>

        {message && (
          <AuthFormMessage message={message} isError={messageIsError} />
        )}

        <Button
          type="submit"
          disabled={loading || forgotLoading}
          className="h-10 w-full rounded-md bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
        >
          {loading ? "..." : copy.cta}
        </Button>
      </form>
    </AuthShell>
  );
}

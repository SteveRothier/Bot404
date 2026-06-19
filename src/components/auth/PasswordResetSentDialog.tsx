"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  email: string;
  onClose: () => void;
};

export function PasswordResetSentDialog({ open, email, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-reset-dialog-title"
        className="relative w-full max-w-[440px] rounded-xl border border-border bg-card p-6 shadow-[0_16px_44px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="password-reset-dialog-title"
            className="text-lg font-bold text-foreground"
          >
            Instructions envoyées
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nous vous avons envoyé des instructions pour changer votre mot de passe
          à l&apos;adresse{" "}
          <span className="font-semibold text-foreground">{email}</span>.
          Consultez votre boîte de réception et vos courriers indésirables pour
          les retrouver.
        </p>

        <Button
          type="button"
          autoFocus
          onClick={onClose}
          className="mt-6 h-10 w-full rounded-md bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
        >
          OK
        </Button>
      </div>
    </div>
  );
}

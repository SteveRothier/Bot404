"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { authInputClassName } from "@/components/auth/AuthShell";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
};

export function PasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  required,
  minLength,
  disabled,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(authInputClassName, "pr-10")}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          onClick={() => setVisible((prev) => !prev)}
          className={cn(
            "absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          {visible ? (
            <EyeOff className="size-4" strokeWidth={1.75} />
          ) : (
            <Eye className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </div>
  );
}

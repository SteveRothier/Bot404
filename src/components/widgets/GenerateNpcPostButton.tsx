"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { generateNpcPostAction } from "@/app/actions/npc";
import { cn } from "@/lib/utils";

type Props = {
  initialOnline: boolean;
};

export function GenerateNpcPostButton({ initialOnline }: Props) {
  const router = useRouter();
  const [online, setOnline] = useState(initialOnline);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function refreshOllamaStatus() {
    try {
      const res = await fetch("/api/ollama-status");
      const data = (await res.json()) as { online: boolean };
      setOnline(data.online);
      return data.online;
    } catch {
      setOnline(false);
      return false;
    }
  }

  function handleClick() {
    setMessage(null);
    startTransition(async () => {
      const isOnline = online || (await refreshOllamaStatus());
      if (!isOnline) {
        setMessage("Ollama est hors ligne.");
        return;
      }

      const result = await generateNpcPostAction();
      if (result.error) {
        setMessage(result.error);
        return;
      }

      setMessage(`Signal émis par @${result.author}`);
      router.refresh();
    });
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending || !online}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-[15px] font-bold transition-colors",
          online && !pending
            ? "bg-foreground text-background hover:bg-foreground/90"
            : "cursor-not-allowed bg-secondary text-muted-foreground"
        )}
      >
        <Sparkles className="size-4" strokeWidth={1.75} />
        {pending ? "Génération…" : "Générer un post"}
      </button>
      {message && (
        <p
          className={cn(
            "mt-2 text-center text-xs",
            message.startsWith("Signal")
              ? "text-foreground"
              : "text-destructive"
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}

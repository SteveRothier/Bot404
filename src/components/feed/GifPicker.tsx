"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

const GifPickerPanel = dynamic(() => import("@/components/feed/GifPickerPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-[340px] items-center justify-center text-sm text-muted-foreground">
      Chargement…
    </div>
  ),
});

type Props = {
  onSelect: (gif: { url: string; previewUrl: string }) => void;
  disabled?: boolean;
};

export function GifPicker({ onSelect, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties | undefined>();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const panelWidth = 340;
      const panelHeight = 400;
      const spacing = 8;
      const margin = 12;

      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      const left = Math.min(
        Math.max(rect.left, margin),
        viewportW - panelWidth - margin
      );

      const spaceBelow = viewportH - rect.bottom - margin;
      const placeAbove = spaceBelow < panelHeight + spacing;

      const top = placeAbove
        ? Math.max(margin, rect.top - panelHeight - spacing)
        : Math.min(rect.bottom + spacing, viewportH - panelHeight - margin);

      setPanelStyle({ top, left, width: panelWidth });
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function pick(gif: { url: string; previewUrl: string }) {
    onSelect(gif);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-label="GIF"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className="flex size-[18px] items-center justify-center rounded border border-current text-[9px] font-bold leading-none tracking-tight">
          GIF
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
          />
          <div
            className="bot404-gif-picker fixed z-50 overflow-hidden rounded-lg border border-border bg-secondary shadow-[0_16px_44px_rgba(0,0,0,0.6)]"
            style={panelStyle}
          >
            <GifPickerPanel onSelect={pick} />
          </div>
        </>
      )}
    </div>
  );
}

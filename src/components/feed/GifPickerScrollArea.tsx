"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ThumbState = {
  height: number;
  top: number;
  visible: boolean;
};

type Props = {
  children: ReactNode;
  className?: string;
};

export function GifPickerScrollArea({ children, className }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<ThumbState>({
    height: 0,
    top: 0,
    visible: false,
  });

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollHeight, clientHeight, scrollTop } = el;
    if (scrollHeight <= clientHeight + 1) {
      setThumb({ height: 0, top: 0, visible: false });
      return;
    }

    const height = Math.max(40, (clientHeight / scrollHeight) * clientHeight);
    const maxTop = clientHeight - height;
    const top =
      maxTop <= 0
        ? 0
        : (scrollTop / (scrollHeight - clientHeight)) * maxTop;

    setThumb({ height, top, visible: true });
  }, []);

  useEffect(() => {
    updateThumb();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateThumb, { passive: true });
    el.addEventListener("load", updateThumb, true);
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateThumb);
      el.removeEventListener("load", updateThumb, true);
      ro.disconnect();
    };
  }, [updateThumb, children]);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        className={`bot404-gif-picker-scroll-hidden h-full overflow-y-auto overflow-x-hidden ${className ?? ""}`}
      >
        {children}
      </div>

      {thumb.visible && (
        <div
          aria-hidden
          className="bot404-gif-picker-scrollbar-track pointer-events-none absolute inset-y-0 right-0 w-1"
        >
          <div
            className="bot404-gif-picker-scrollbar-thumb absolute right-0 w-full"
            style={{ height: thumb.height, top: thumb.top }}
          />
        </div>
      )}
    </div>
  );
}

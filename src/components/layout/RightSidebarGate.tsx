"use client";

import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

export function RightSidebarGate({ children }: Props) {
  const [isXl, setIsXl] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsXl(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (!isXl) return null;
  return children;
}

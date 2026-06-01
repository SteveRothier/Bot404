"use client";

import { createContext, useContext } from "react";

const NavDrawerContext = createContext<(() => void) | null>(null);

export function NavDrawerProvider({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <NavDrawerContext.Provider value={onClose}>
      {children}
    </NavDrawerContext.Provider>
  );
}

export function useNavDrawerClose() {
  return useContext(NavDrawerContext);
}

"use client";

import { useEffect } from "react";
import { ToastHost } from "@/components/ui/toast-host";
import type { OllamaStatus } from "@/lib/ollama";
import {
  startNotificationsRealtime,
  stopNotificationsRealtime,
  useNotificationsStore,
} from "@/stores/notifications-store";
import { useOllamaStore } from "@/stores/ollama-store";

type Props = {
  ollama: OllamaStatus;
  userId: string | null;
  initialUnreadCount: number;
  children: React.ReactNode;
};

export function ClientStoresHydrator({
  ollama,
  userId,
  initialUnreadCount,
  children,
}: Props) {
  useEffect(() => {
    useNotificationsStore.getState().hydrate(initialUnreadCount);
    if (ollama.model) {
      useOllamaStore.setState({ model: ollama.model });
    }
  }, [ollama.model, initialUnreadCount]);

  useEffect(() => {
    if (!userId) {
      stopNotificationsRealtime();
      return;
    }

    startNotificationsRealtime(userId);
    return () => stopNotificationsRealtime();
  }, [userId]);

  return (
    <>
      {children}
      <ToastHost />
    </>
  );
}

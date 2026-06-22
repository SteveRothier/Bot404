"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  clearAuthHash,
  isRecoveryHash,
  RESET_PATH,
} from "@/lib/auth/recovery-hash";

export function AuthRecoveryHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!isRecoveryHash(hash)) return;

    if (pathname !== RESET_PATH) {
      router.replace(`${RESET_PATH}${hash}`);
      return;
    }

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        clearAuthHash();
      }
    });

    void supabase.auth.getSession();

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}

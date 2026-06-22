"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isRecoveryHash, RESET_PASSWORD_PATH } from "@/lib/auth/recovery-hash";

export function AuthRecoveryHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!isRecoveryHash(hash)) return;

    if (pathname !== RESET_PASSWORD_PATH) {
      router.replace(`${RESET_PASSWORD_PATH}${hash}`);
    }
  }, [pathname, router]);

  return null;
}

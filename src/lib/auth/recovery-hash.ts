const RESET_PATH = "/login/reset-password";

export function isRecoveryHash(hash: string): boolean {
  if (!hash) return false;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return params.get("type") === "recovery" && Boolean(params.get("access_token"));
}

export function clearAuthHash(): void {
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );
}

export { RESET_PATH };

export function getSiteOrigin(fallbackOrigin: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return fallbackOrigin.replace(/\/$/, "");
}

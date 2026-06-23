export function isNarrativeAdminEnabled(): boolean {
  return process.env.NARRATIVE_ADMIN === "1";
}

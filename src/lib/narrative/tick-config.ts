export function getSignalsPerTick(): number {
  const raw = process.env.NARRATIVE_SIGNALS_PER_TICK ?? "2";
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 2;
  return Math.min(n, 5);
}

export function getAmbientFallbackChance(): number {
  const raw = process.env.NPC_AMBIENT_FALLBACK_CHANCE ?? "0.35";
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return 0.35;
  return Math.min(Math.max(n, 0), 1);
}

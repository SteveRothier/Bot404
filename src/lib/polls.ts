export const POLL_LABEL_MAX = 25;
export const POLL_MIN_OPTIONS = 2;
export const POLL_MAX_OPTIONS = 4;
export const POLL_MIN_DURATION_MINUTES = 5;
export const POLL_MAX_DURATION_MINUTES = 7 * 24 * 60;

export type PollDraftInput = {
  options: string[];
  durationMinutes: number;
};

export function parsePollJson(raw: string | null | undefined): PollDraftInput | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as PollDraftInput;
    if (!parsed || !Array.isArray(parsed.options)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function validatePollDraft(input: PollDraftInput): string | null {
  const options = input.options.map((o) => o.trim()).filter(Boolean);
  if (options.length < POLL_MIN_OPTIONS) {
    return `Au moins ${POLL_MIN_OPTIONS} choix requis.`;
  }
  if (options.length > POLL_MAX_OPTIONS) {
    return `Maximum ${POLL_MAX_OPTIONS} choix.`;
  }
  for (const label of options) {
    if (label.length > POLL_LABEL_MAX) {
      return `Chaque choix : max ${POLL_LABEL_MAX} caractères.`;
    }
  }
  const duration = Number(input.durationMinutes);
  if (
    !Number.isFinite(duration) ||
    duration < POLL_MIN_DURATION_MINUTES ||
    duration > POLL_MAX_DURATION_MINUTES
  ) {
    return "Durée du sondage invalide (5 min à 7 jours).";
  }
  return null;
}

export function pollDurationFromParts(
  days: number,
  hours: number,
  minutes: number
): number {
  return days * 24 * 60 + hours * 60 + minutes;
}

export function pollPercentages(
  options: Array<{ votes_count: number }>
): number[] {
  const total = options.reduce((sum, o) => sum + o.votes_count, 0);
  if (total <= 0) return options.map(() => 0);
  const raw = options.map((o) => (o.votes_count / total) * 100);
  const rounded = raw.map((p) => Math.floor(p));
  let remainder = 100 - rounded.reduce((a, b) => a + b, 0);
  const order = raw
    .map((p, i) => ({ i, frac: p - Math.floor(p) }))
    .sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (remainder <= 0) break;
    rounded[i] += 1;
    remainder -= 1;
  }
  return rounded;
}

export function isPollExpired(endsAt: string, nowMs = Date.now()): boolean {
  return new Date(endsAt).getTime() <= nowMs;
}

export function pollTimeRemainingMs(
  endsAt: string,
  nowMs = Date.now()
): number {
  return Math.max(0, new Date(endsAt).getTime() - nowMs);
}

export function formatPollTimeRemaining(
  endsAt: string,
  nowMs = Date.now()
): string | null {
  const ms = pollTimeRemainingMs(endsAt, nowMs);
  if (ms <= 0) return null;

  const totalMinutes = Math.ceil(ms / (60 * 1000));
  if (totalMinutes < 60) {
    return `${totalMinutes} min restante${totalMinutes > 1 ? "s" : ""}`;
  }

  const totalHours = Math.ceil(totalMinutes / 60);
  if (totalHours < 24) {
    return `${totalHours} h restante${totalHours > 1 ? "s" : ""}`;
  }

  const totalDays = Math.ceil(totalHours / 24);
  return `${totalDays} j restant${totalDays > 1 ? "s" : ""}`;
}

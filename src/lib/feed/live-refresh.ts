export const FEED_LIVE_REFRESH_UNTIL_KEY = "bot404_feed_live_refresh_until";

const REFRESH_WINDOW_MS = 3 * 60 * 1000;

export function markFeedLiveRefresh(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(
    FEED_LIVE_REFRESH_UNTIL_KEY,
    String(Date.now() + REFRESH_WINDOW_MS)
  );
}

export function feedLiveRefreshActive(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  const until = Number(sessionStorage.getItem(FEED_LIVE_REFRESH_UNTIL_KEY));
  return Number.isFinite(until) && Date.now() < until;
}

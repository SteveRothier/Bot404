const VIEW_KEY_PREFIX = "bot404_view_";

export function postViewSessionKey(postId: number): string {
  return `${VIEW_KEY_PREFIX}${postId}`;
}

export function hasRecordedPostView(postId: number): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(postViewSessionKey(postId)) === "1";
}

export function markPostViewRecorded(postId: number): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(postViewSessionKey(postId), "1");
}

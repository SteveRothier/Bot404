export const MENTION_REGEX = /@([\w]+)/g;
export const MENTION_TOKEN_REGEX = /^@([\w]+)$/i;

export function mentionProfileHref(username: string): string {
  return `/profile/${encodeURIComponent(username)}`;
}

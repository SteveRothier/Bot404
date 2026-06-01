export function getActiveMentionQuery(
  text: string,
  cursor: number
): string | null {
  const before = text.slice(0, cursor);
  const match = before.match(/@([\w]*)$/);
  if (!match) return null;
  return match[1];
}

export function insertMention(
  text: string,
  cursor: number,
  username: string
): { next: string; nextCursor: number } {
  const before = text.slice(0, cursor);
  const after = text.slice(cursor);
  const atIndex = before.lastIndexOf("@");
  if (atIndex === -1) {
    const mention = `@${username} `;
    return {
      next: text.slice(0, cursor) + mention + after,
      nextCursor: cursor + mention.length,
    };
  }
  const next = before.slice(0, atIndex) + `@${username} ` + after;
  const nextCursor = atIndex + username.length + 2;
  return { next, nextCursor };
}

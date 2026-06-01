import { HASHTAG_TOKEN_REGEX } from "@/lib/hashtags";
import { MENTION_TOKEN_REGEX } from "@/lib/mentions";

const CONTENT_TOKEN_REGEX = /(#[\w\u00C0-\u024F]+|@[\w]+)/gi;

export function splitContentTokens(content: string): string[] {
  return content.split(CONTENT_TOKEN_REGEX);
}

export function isHashtagToken(part: string): boolean {
  return HASHTAG_TOKEN_REGEX.test(part);
}

export function isMentionToken(part: string): boolean {
  return MENTION_TOKEN_REGEX.test(part);
}

export function mentionUsernameFromToken(part: string): string {
  return part.replace(/^@/i, "");
}

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: false, locale: fr });
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

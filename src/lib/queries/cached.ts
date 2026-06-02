import { cache } from "react";
import { getFactions } from "@/lib/queries/factions";
import { getNetworkStats, getTrendingSnapshot } from "@/lib/queries/feed";
import { getPopularHashtags } from "@/lib/queries/hashtags";
import { getShellData } from "@/lib/queries/shell-data";
import { getSidebarAuth } from "@/lib/queries/sidebar-auth";

export const getCachedFactions = cache(getFactions);
export const getCachedNetworkStats = cache(getNetworkStats);
export const getCachedPopularHashtags = cache(getPopularHashtags);
export const getCachedTrendingSnapshot = cache(getTrendingSnapshot);
export const getCachedSidebarAuth = cache(getSidebarAuth);
export const getCachedShellData = cache(getShellData);

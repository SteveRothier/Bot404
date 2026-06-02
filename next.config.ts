import type { NextConfig } from "next";

function supabaseImagePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:" && protocol !== "http:") return null;
    return {
      protocol: protocol.replace(":", "") as "https" | "http",
      hostname,
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return null;
  }
}

const supabasePattern = supabaseImagePattern();

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      ...(supabasePattern ? [supabasePattern] : []),
    ],
  },
};

export default nextConfig;

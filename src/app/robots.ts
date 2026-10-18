import type { MetadataRoute } from "next";
import { PUBLIC_PATHS } from "@/config/publicPaths";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kitsuonmura.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // "/" is anchored to an exact match — otherwise it would prefix-match
      // every path and, combined with "Disallow: /" below, the longer-match
      // wins per the robots.txt spec in a way that isn't what we want here.
      allow: PUBLIC_PATHS.map((path) => (path === "/" ? "/$" : path)),
      disallow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

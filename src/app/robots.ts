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
      // robots.txt and sitemap.xml must be explicitly allowed too: they
      // aren't in PUBLIC_PATHS (that list is about login-gated pages), and
      // without this, "Disallow: /" silently blocked Googlebot from ever
      // fetching the sitemap it was told to submit — Search Console
      // reports that as a fetch failure even though the URL itself returns
      // 200 for any request that skips robots.txt, like a plain curl.
      allow: [
        ...PUBLIC_PATHS.map((path) => (path === "/" ? "/$" : path)),
        "/robots.txt",
        "/sitemap.xml",
      ],
      disallow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

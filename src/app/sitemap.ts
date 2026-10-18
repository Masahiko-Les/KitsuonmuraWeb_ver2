import type { MetadataRoute } from "next";
import { PUBLIC_PATHS } from "@/config/publicPaths";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kitsuonmura.com";

// /auth is a confirmation-link callback, not a content page — excluded here
// even though it's public (and crawlable) in PUBLIC_PATHS.
const PRIORITY: Record<string, number> = {
  "/": 1,
  "/about": 0.8,
  "/login": 0.5,
  "/signup": 0.5,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_PATHS.filter((path) => path !== "/auth").map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: PRIORITY[path] ?? 0.5,
  }));
}

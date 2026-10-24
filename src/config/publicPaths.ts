// Routes reachable without a logged-in session. Single source of truth for
// src/lib/supabase/middleware.ts's auth gate, app/robots.ts, and
// app/sitemap.ts — keeping them in sync so a new private page can't
// accidentally become crawlable just because robots.ts wasn't updated.
export const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/auth",
  "/about",
  // iPhoneアプリ「吃音村Lite」のプライバシーポリシー（App Store の審査で使う）
  "/lite/privacy",
];

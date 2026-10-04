import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted instead of next/font/google: Turbopack's dev-time fetch of
// these files from fonts.gstatic.com was timing out intermittently on this
// machine's network, breaking every `next dev` run. These are the same
// Noto Sans JP / Shippori Mincho files, subset to just the Latin range
// Google's own "latin" subset covers (see OFL-*.txt for license/
// attribution; the actual visible Japanese text always rendered via the
// browser's system fonts regardless, since subsets: ["latin"] never
// included Japanese glyphs in the first place).
const bodyFont = localFont({
  variable: "--font-body",
  src: [
    { path: "./fonts/noto-sans-jp-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/noto-sans-jp-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/noto-sans-jp-latin-700.woff2", weight: "700", style: "normal" },
  ],
});

const headingFont = localFont({
  variable: "--font-heading",
  src: [
    { path: "./fonts/shippori-mincho-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/shippori-mincho-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/shippori-mincho-latin-800.woff2", weight: "800", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "吃音村",
  description: "吃音を持つ人たちが、弱さや苦労を分かち合う小さな村",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

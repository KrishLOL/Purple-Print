import type { Metadata } from "next";
import Script from "next/script";
import { spaceGrotesk, inter, jetbrainsMono } from "@/lib/fonts";
import { themeInitScript } from "@/components/theme-toggle";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Western Eng Insider",
    template: "%s — Western Eng Insider",
  },
  description:
    "Course and professor reviews for Western University's Faculty of Engineering, written by students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <div className="blueprint-grid" aria-hidden />
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}

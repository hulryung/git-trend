import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trend.hulryung.com";

export const metadata: Metadata = {
  title: {
    default: "git-trend - GitHub Trending with AI Analysis",
    template: "%s | git-trend",
  },
  description:
    "Discover trending GitHub repositories with AI-powered analysis. Daily/weekly/monthly trending repos with Korean/English summaries, tech stack detection, related news, and webhook notifications.",
  keywords: [
    "GitHub",
    "trending",
    "repositories",
    "AI analysis",
    "open source",
    "developer tools",
    "GitHub trending",
    "tech stack",
    "Korean",
    "깃허브",
    "트렌딩",
    "오픈소스",
  ],
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed/rss.xml",
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    alternateLocale: "en_US",
    url: appUrl,
    siteName: "git-trend",
    title: "git-trend - GitHub Trending with AI Analysis",
    description:
      "Discover trending GitHub repositories with AI-powered analysis. Daily/weekly/monthly trending repos with Korean/English summaries, tech stack detection, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "git-trend - GitHub Trending with AI Analysis",
    description:
      "Discover trending GitHub repositories with AI-powered analysis.",
    creator: "@hulryung",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "git-trend",
    url: appUrl,
    description:
      "Discover trending GitHub repositories with AI-powered analysis. Daily/weekly/monthly trending repos with Korean/English summaries.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "hulryung",
      url: "https://x.com/hulryung",
    },
  };

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main className="container mx-auto px-4 py-6">{children}</main>
        <footer className="border-t mt-12">
          <div className="container mx-auto px-4 py-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} git-trend</span>
            <a
              href="https://x.com/hulryung"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              @hulryung
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}

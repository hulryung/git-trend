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

export const metadata: Metadata = {
  title: "git-trend - GitHub Trending with AI Analysis",
  description:
    "Discover trending GitHub repositories with AI-powered analysis. Get Korean/English summaries, tech stack detection, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
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

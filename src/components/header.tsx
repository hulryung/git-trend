import Link from "next/link";
import { TrendingUp, Rss } from "lucide-react";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <TrendingUp className="w-6 h-6 text-primary" />
          git-trend
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/feed/rss.xml"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="RSS Feed"
          >
            <Rss className="w-5 h-5" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

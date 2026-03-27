import Link from "next/link";
import { Star, GitFork, TrendingUp, ExternalLink, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsItem {
  title: string;
  url: string;
  source: string;
  sourceLabel: string;
  date: string | null;
  points?: number;
  comments?: number;
  commentsUrl?: string;
}

interface RepoCardProps {
  rank: number;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  starsToday: number | null;
  category?: string | null;
  summaryKo?: string | null;
  news?: NewsItem[];
}

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  PHP: "#4F5D95",
  Shell: "#89e051",
  Zig: "#ec915c",
};

const sourceBadgeColor: Record<string, string> = {
  hackernews: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  github_release: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  devto: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
};

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

export function RepoCard({
  rank,
  fullName,
  description,
  language,
  stars,
  forks,
  starsToday,
  category,
  summaryKo,
  news,
}: RepoCardProps) {
  const [owner, name] = fullName.split("/");

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-muted-foreground text-sm font-mono w-6 shrink-0 pt-0.5 text-right">
            {rank}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/repo/${owner}/${name}`}
                className="text-primary hover:underline font-semibold text-lg truncate"
              >
                <span className="text-muted-foreground font-normal">
                  {owner}/
                </span>
                {name}
              </Link>
              {category && (
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {summaryKo || description || "No description"}
            </p>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
              {language && (
                <span className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{
                      backgroundColor:
                        languageColors[language] || "#8b8b8b",
                    }}
                  />
                  {language}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {formatNumber(stars)}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="w-4 h-4" />
                {formatNumber(forks)}
              </span>
              {starsToday != null && starsToday > 0 && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <TrendingUp className="w-4 h-4" />
                  {starsToday} today
                </span>
              )}
            </div>

            {news && news.length > 0 && (
              <div className="mt-3 pt-3 border-t space-y-1.5">
                {news.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Badge
                      className={`text-[9px] px-1 py-0 shrink-0 ${sourceBadgeColor[item.source] || "bg-muted text-muted-foreground"}`}
                    >
                      {item.sourceLabel}
                    </Badge>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-primary hover:underline"
                    >
                      {item.title}
                      <ExternalLink className="w-3 h-3 inline-block ml-1 align-text-bottom" />
                    </a>
                    {item.commentsUrl && item.comments != null && (
                      <a
                        href={item.commentsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
                        title="댓글 보기"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {item.comments}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

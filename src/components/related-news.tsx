"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink, MessageSquare, ArrowUp, Tag, Loader2 } from "lucide-react";

interface NewsItem {
  title: string;
  url: string;
  source: "hackernews" | "github_release" | "devto";
  sourceLabel: string;
  date: string | null;
  points?: number;
  comments?: number;
  summary?: string;
  tag?: string;
}

const sourceBadgeColor: Record<string, string> = {
  hackernews:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  github_release:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  devto:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export function RelatedNews({ owner, name }: { owner: string; name: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/repo/${owner}/${name}/news`)
      .then((res) => res.json())
      .then((data) => setNews(data))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, [owner, name]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Related News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading news...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (news.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          Related News & Releases
          <Badge variant="secondary" className="ml-auto text-xs">
            {news.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {news.map((item, i) => (
            <div
              key={`${item.source}-${i}`}
              className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge
                    className={`text-[10px] px-1.5 py-0 ${sourceBadgeColor[item.source]}`}
                  >
                    {item.sourceLabel}
                  </Badge>
                  {item.tag && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Tag className="w-3 h-3" />
                      {item.tag}
                    </span>
                  )}
                  {item.date && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.date)}
                    </span>
                  )}
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline line-clamp-2 inline-flex items-center gap-1"
                >
                  {item.title}
                  <ExternalLink className="w-3 h-3 shrink-0 text-muted-foreground" />
                </a>
                {item.summary && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {item.summary}
                  </p>
                )}
                {(item.points != null || item.comments != null) && (
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    {item.points != null && (
                      <span className="flex items-center gap-0.5">
                        <ArrowUp className="w-3 h-3" />
                        {item.points}
                      </span>
                    )}
                    {item.comments != null && (
                      <span className="flex items-center gap-0.5">
                        <MessageSquare className="w-3 h-3" />
                        {item.comments}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

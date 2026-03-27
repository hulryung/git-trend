"use client";

import { useState, useEffect } from "react";
import { RepoCard } from "./repo-card";

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

interface TrendingItem {
  rank: number;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  starsToday: number | null;
  category?: string | null;
  summaryKo?: string | null;
}

interface TrendingListProps {
  items: TrendingItem[];
}

export function TrendingList({ items }: TrendingListProps) {
  const [newsMap, setNewsMap] = useState<Record<string, NewsItem[]>>({});

  useEffect(() => {
    if (items.length === 0) return;

    const top = items.slice(0, 10);
    Promise.allSettled(
      top.map((r) => {
        const [owner, name] = r.fullName.split("/");
        return fetch(`/api/repo/${owner}/${name}/news`)
          .then((res) => res.json())
          .then((data: NewsItem[]) => ({ fullName: r.fullName, news: data }));
      })
    ).then((results) => {
      const map: Record<string, NewsItem[]> = {};
      for (const result of results) {
        if (result.status === "fulfilled") {
          map[result.value.fullName] = result.value.news.slice(0, 3);
        }
      }
      setNewsMap(map);
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No trending repositories found.</p>
        <p className="text-sm mt-2">Try a different period or language filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <RepoCard
          key={item.fullName}
          {...item}
          news={newsMap[item.fullName]}
        />
      ))}
    </div>
  );
}

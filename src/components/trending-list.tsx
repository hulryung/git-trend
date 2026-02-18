import { RepoCard } from "./repo-card";

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
        <RepoCard key={item.fullName} {...item} />
      ))}
    </div>
  );
}

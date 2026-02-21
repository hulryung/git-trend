import { db } from "@/lib/db";
import { repositories, trendingSnapshots, analyses } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { TrendingList } from "@/components/trending-list";
import { PeriodSelector } from "@/components/period-selector";
import { LanguageFilter } from "@/components/language-filter";
import { DateNavigator } from "@/components/date-navigator";

interface PageProps {
  searchParams: Promise<{ period?: string; language?: string; date?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { period = "daily", language, date } = await searchParams;

  // Get all available dates for this period (newest first)
  const allDates = await db
    .selectDistinct({ date: trendingSnapshots.date })
    .from(trendingSnapshots)
    .where(eq(trendingSnapshots.period, period))
    .orderBy(desc(trendingSnapshots.date));

  const dates = allDates.map((d) => d.date);

  // Determine current date: use param, or fall back to latest available
  const currentDate = date && dates.includes(date) ? date : dates[0];

  if (!currentDate) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">GitHub Trending</h1>
          <p className="text-muted-foreground">
            Trending repositories with AI-powered analysis
          </p>
        </div>
        <PeriodSelector current={period} />
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No data collected yet.</p>
        </div>
      </div>
    );
  }

  const results = await db
    .select({
      rank: trendingSnapshots.rank,
      starsToday: trendingSnapshots.starsToday,
      fullName: repositories.fullName,
      description: repositories.description,
      language: repositories.language,
      stars: repositories.stars,
      forks: repositories.forks,
      category: analyses.category,
      summaryKo: analyses.summaryKo,
    })
    .from(trendingSnapshots)
    .innerJoin(repositories, eq(trendingSnapshots.repoId, repositories.id))
    .leftJoin(analyses, eq(repositories.id, analyses.repoId))
    .where(
      and(
        eq(trendingSnapshots.period, period),
        eq(trendingSnapshots.date, currentDate)
      )
    )
    .orderBy(trendingSnapshots.rank)
    .limit(50);

  const filtered = language
    ? results.filter((r) => r.language === language)
    : results;

  const items = filtered.map((r) => ({
    rank: r.rank ?? 0,
    fullName: r.fullName,
    description: r.description,
    language: r.language,
    stars: r.stars,
    forks: r.forks,
    starsToday: r.starsToday,
    category: r.category,
    summaryKo: r.summaryKo,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">GitHub Trending</h1>
        <p className="text-muted-foreground">
          Trending repositories with AI-powered analysis
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <PeriodSelector current={period} />
      </div>

      <DateNavigator currentDate={currentDate} dates={dates} />

      <LanguageFilter current={language || ""} />

      <TrendingList items={items} />
    </div>
  );
}

import { db } from "@/lib/db";
import {
  repositories,
  trendingSnapshots,
  starHistory,
} from "@/lib/db/schema";
import { scrapeGitHubTrending } from "./github-trending";
import { fetchFromSearchAPI } from "./github-search-api";
import type { TrendingRepo } from "@/types";

export async function collectTrending(
  period: "daily" | "weekly" | "monthly"
): Promise<{ count: number; source: string }> {
  let repos: TrendingRepo[];
  let source = "scrape";

  try {
    repos = await scrapeGitHubTrending(period);
  } catch (error) {
    console.warn(
      `Scraping failed for ${period}, falling back to Search API:`,
      error
    );
    repos = await fetchFromSearchAPI(period);
    source = "api";
  }

  if (repos.length === 0) {
    return { count: 0, source };
  }

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  for (const repo of repos) {
    // Upsert repository
    const [inserted] = await db
      .insert(repositories)
      .values({
        fullName: repo.fullName,
        owner: repo.owner,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stars,
        forks: repo.forks,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: repositories.fullName,
        set: {
          description: repo.description,
          language: repo.language,
          stars: repo.stars,
          forks: repo.forks,
          updatedAt: now,
        },
      })
      .returning({ id: repositories.id });

    const repoId = inserted.id;

    // Insert trending snapshot (upsert on repo+date+period)
    await db
      .insert(trendingSnapshots)
      .values({
        repoId,
        date: today,
        period,
        rank: repo.rank,
        starsToday: repo.starsToday,
        source,
        collectedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          trendingSnapshots.repoId,
          trendingSnapshots.date,
          trendingSnapshots.period,
        ],
        set: {
          rank: repo.rank,
          starsToday: repo.starsToday,
          source,
          collectedAt: now,
        },
      });

    // Upsert star history
    await db
      .insert(starHistory)
      .values({
        repoId,
        date: today,
        stars: repo.stars,
      })
      .onConflictDoUpdate({
        target: [starHistory.repoId, starHistory.date],
        set: {
          stars: repo.stars,
        },
      });
  }

  return { count: repos.length, source };
}

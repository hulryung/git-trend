import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { repositories, trendingSnapshots, analyses } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get("period") || "daily";
  const language = searchParams.get("language");
  const date = searchParams.get("date");

  const targetDate =
    date || new Date().toISOString().split("T")[0];

  const conditions = [
    eq(trendingSnapshots.period, period),
  ];

  if (date) {
    conditions.push(eq(trendingSnapshots.date, targetDate));
  }

  const results = await db
    .select({
      rank: trendingSnapshots.rank,
      starsToday: trendingSnapshots.starsToday,
      snapshotDate: trendingSnapshots.date,
      fullName: repositories.fullName,
      owner: repositories.owner,
      name: repositories.name,
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
    .where(and(...conditions))
    .orderBy(
      desc(trendingSnapshots.date),
      trendingSnapshots.rank
    )
    .limit(50);

  const filtered = language
    ? results.filter((r) => r.language === language)
    : results;

  return NextResponse.json(filtered);
}

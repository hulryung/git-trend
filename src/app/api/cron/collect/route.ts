import { NextRequest, NextResponse } from "next/server";
import { collectTrending } from "@/lib/collectors";
import { sendWebhookNotifications } from "@/lib/notifications/webhook";
import { db } from "@/lib/db";
import { repositories, trendingSnapshots } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const periods = ["daily", "weekly", "monthly"] as const;
    const results: Record<string, { count: number; source: string }> = {};

    for (const period of periods) {
      results[period] = await collectTrending(period);
    }

    // Send webhook notifications with daily trending repos
    const today = new Date().toISOString().split("T")[0];
    const dailyRepos = await db
      .select({
        fullName: repositories.fullName,
        owner: repositories.owner,
        name: repositories.name,
        description: repositories.description,
        language: repositories.language,
        stars: repositories.stars,
        forks: repositories.forks,
        starsToday: trendingSnapshots.starsToday,
        rank: trendingSnapshots.rank,
      })
      .from(trendingSnapshots)
      .innerJoin(repositories, eq(trendingSnapshots.repoId, repositories.id))
      .where(
        and(
          eq(trendingSnapshots.date, today),
          eq(trendingSnapshots.period, "daily")
        )
      )
      .orderBy(trendingSnapshots.rank);

    if (dailyRepos.length > 0) {
      await sendWebhookNotifications(
        dailyRepos.map((r) => ({
          fullName: r.fullName,
          owner: r.owner,
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stars,
          forks: r.forks,
          starsToday: r.starsToday ?? 0,
          rank: r.rank ?? 0,
          url: `https://github.com/${r.fullName}`,
        })),
        today
      );
    }

    return NextResponse.json({
      success: true,
      date: today,
      results,
    });
  } catch (error) {
    console.error("Cron collect error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

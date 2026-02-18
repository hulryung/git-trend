import { db } from "@/lib/db";
import { repositories, trendingSnapshots, analyses } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

interface RSSOptions {
  language?: string | null;
  period?: string;
}

export async function generateRSS(options: RSSOptions): Promise<string> {
  const period = options.period || "daily";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://git-trend.vercel.app";

  const conditions = [eq(trendingSnapshots.period, period)];

  const results = await db
    .select({
      fullName: repositories.fullName,
      description: repositories.description,
      stars: repositories.stars,
      language: repositories.language,
      summaryKo: analyses.summaryKo,
      date: trendingSnapshots.date,
      collectedAt: trendingSnapshots.collectedAt,
    })
    .from(trendingSnapshots)
    .innerJoin(repositories, eq(trendingSnapshots.repoId, repositories.id))
    .leftJoin(analyses, eq(repositories.id, analyses.repoId))
    .where(and(...conditions))
    .orderBy(desc(trendingSnapshots.date), trendingSnapshots.rank)
    .limit(50);

  const filtered = options.language
    ? results.filter((r) => r.language === options.language)
    : results;

  const items = filtered
    .map(
      (repo) => `    <item>
      <title>${escapeXml(repo.fullName)} - ${repo.stars} stars</title>
      <link>https://github.com/${repo.fullName}</link>
      <description>${escapeXml(repo.summaryKo || repo.description || "")}</description>
      <pubDate>${new Date(repo.collectedAt).toUTCString()}</pubDate>
      <guid>${appUrl}/repo/${repo.fullName}#${repo.date}</guid>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>git-trend - GitHub Trending with AI Analysis</title>
    <link>${appUrl}</link>
    <description>AI-powered GitHub trending repository analysis</description>
    <atom:link href="${appUrl}/feed/rss.xml" rel="self" type="application/rss+xml"/>
    <language>ko</language>
${items}
  </channel>
</rss>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { repositories, trendingSnapshots } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://trend.hulryung.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${appUrl}/webhooks`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Get recently trending repos for dynamic pages
  const recentRepos = await db
    .select({
      fullName: repositories.fullName,
      updatedAt: repositories.updatedAt,
    })
    .from(trendingSnapshots)
    .innerJoin(repositories, eq(trendingSnapshots.repoId, repositories.id))
    .orderBy(desc(trendingSnapshots.date))
    .limit(200);

  const seen = new Set<string>();
  const repoPages: MetadataRoute.Sitemap = [];

  for (const repo of recentRepos) {
    if (seen.has(repo.fullName)) continue;
    seen.add(repo.fullName);

    const [owner, name] = repo.fullName.split("/");
    repoPages.push({
      url: `${appUrl}/repo/${owner}/${name}`,
      lastModified: new Date(repo.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return [...staticPages, ...repoPages];
}

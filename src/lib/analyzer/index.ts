import { db } from "@/lib/db";
import { repositories, analyses } from "@/lib/db/schema";
import { eq, sql, isNull, or, lt } from "drizzle-orm";
import { extractRepoContent } from "./repo-content";
import { analyzeWithClaude } from "./claude";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runAnalysisBatch(limit = 5) {
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Find repos that have no analysis or analysis older than 7 days
  const repos = await db
    .select({
      id: repositories.id,
      owner: repositories.owner,
      name: repositories.name,
      fullName: repositories.fullName,
    })
    .from(repositories)
    .leftJoin(analyses, eq(repositories.id, analyses.repoId))
    .where(or(isNull(analyses.id), lt(analyses.analyzedAt, sevenDaysAgo)))
    .limit(limit);

  console.log(`[analyzer] Found ${repos.length} repos to analyze`);

  let success = 0;
  let failed = 0;

  for (const repo of repos) {
    try {
      console.log(`[analyzer] Analyzing ${repo.fullName}...`);

      const content = await extractRepoContent(repo.owner, repo.name);
      const result = await analyzeWithClaude(content);

      // Delete existing analysis if any
      await db.delete(analyses).where(eq(analyses.repoId, repo.id));

      // Insert new analysis
      await db.insert(analyses).values({
        repoId: repo.id,
        summaryKo: result.summaryKo,
        summaryEn: result.summaryEn,
        techStack: JSON.stringify(result.techStack),
        category: result.category,
        useCases: JSON.stringify(result.useCases),
        similarProjects: JSON.stringify(result.similarProjects),
        highlights: JSON.stringify(result.highlights),
        difficulty: result.difficulty,
        modelVersion: "anthropic/claude-4-sonnet",
        analyzedAt: new Date().toISOString(),
      });

      success++;
      console.log(`[analyzer] Done: ${repo.fullName}`);
    } catch (err) {
      failed++;
      console.error(`[analyzer] Failed: ${repo.fullName}`, err);
    }

    // Rate limit: wait 1s between requests
    if (repo !== repos[repos.length - 1]) {
      await sleep(1000);
    }
  }

  return { total: repos.length, success, failed };
}

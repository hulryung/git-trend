import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  repositories,
  analyses,
  trendingSnapshots,
  starHistory,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  const { owner, name } = await params;
  const fullName = `${owner}/${name}`;

  const repo = await db
    .select()
    .from(repositories)
    .where(eq(repositories.fullName, fullName))
    .limit(1);

  if (repo.length === 0) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  const repoData = repo[0];

  const analysis = await db
    .select()
    .from(analyses)
    .where(eq(analyses.repoId, repoData.id))
    .orderBy(desc(analyses.analyzedAt))
    .limit(1);

  const snapshots = await db
    .select()
    .from(trendingSnapshots)
    .where(eq(trendingSnapshots.repoId, repoData.id))
    .orderBy(desc(trendingSnapshots.date))
    .limit(30);

  const stars = await db
    .select()
    .from(starHistory)
    .where(eq(starHistory.repoId, repoData.id))
    .orderBy(starHistory.date)
    .limit(90);

  const analysisData = analysis[0] ?? null;

  return NextResponse.json({
    repo: repoData,
    analysis: analysisData
      ? {
          ...analysisData,
          techStack: JSON.parse(analysisData.techStack || "[]"),
          useCases: JSON.parse(analysisData.useCases || "[]"),
          similarProjects: JSON.parse(analysisData.similarProjects || "[]"),
          highlights: JSON.parse(analysisData.highlights || "[]"),
        }
      : null,
    snapshots,
    starHistory: stars,
  });
}

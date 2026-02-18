import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  repositories,
  analyses,
  trendingSnapshots,
  starHistory,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AnalysisPanel } from "@/components/analysis-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  GitFork,
  ExternalLink,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { StarHistoryChart } from "@/components/star-history-chart";

interface PageProps {
  params: Promise<{ owner: string; name: string }>;
}

export default async function RepoDetailPage({ params }: PageProps) {
  const { owner, name } = await params;
  const fullName = `${owner}/${name}`;

  const repo = await db
    .select()
    .from(repositories)
    .where(eq(repositories.fullName, fullName))
    .limit(1);

  if (repo.length === 0) {
    notFound();
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
  const topics: string[] = repoData.topics ? JSON.parse(repoData.topics) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Trending
      </Link>

      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold">
            <span className="text-muted-foreground font-normal">{owner}/</span>
            {name}
          </h1>
          <a
            href={`https://github.com/${fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        {repoData.description && (
          <p className="text-muted-foreground mt-2 text-lg">
            {repoData.description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-4 text-sm flex-wrap">
          {repoData.language && (
            <Badge variant="outline">{repoData.language}</Badge>
          )}
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {repoData.stars.toLocaleString()} stars
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-4 h-4" />
            {repoData.forks.toLocaleString()} forks
          </span>
          {repoData.createdAt && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {new Date(repoData.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {topics.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {topics.map((topic: string) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {analysisData && (
        <AnalysisPanel
          summaryKo={analysisData.summaryKo}
          summaryEn={analysisData.summaryEn}
          category={analysisData.category}
          techStack={JSON.parse(analysisData.techStack || "[]")}
          useCases={JSON.parse(analysisData.useCases || "[]")}
          similarProjects={JSON.parse(analysisData.similarProjects || "[]")}
          highlights={JSON.parse(analysisData.highlights || "[]")}
          difficulty={analysisData.difficulty}
          analyzedAt={analysisData.analyzedAt}
        />
      )}

      {stars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Star History</CardTitle>
          </CardHeader>
          <CardContent>
            <StarHistoryChart
              data={stars.map((s) => ({ date: s.date, stars: s.stars }))}
            />
          </CardContent>
        </Card>
      )}

      {snapshots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trending History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {snapshots.map((s) => (
                <div
                  key={`${s.date}-${s.period}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{s.date}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{s.period}</Badge>
                    {s.rank && (
                      <span className="text-muted-foreground">#{s.rank}</span>
                    )}
                    {s.starsToday != null && (
                      <span className="text-amber-600 dark:text-amber-400">
                        +{s.starsToday}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

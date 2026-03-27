import { db } from "@/lib/db";
import { webhookSubscriptions, analyses, repositories } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { TrendingRepo } from "@/types";

interface RepoWithSummary extends TrendingRepo {
  summaryKo?: string | null;
  summaryEn?: string | null;
}

export async function sendWebhookNotifications(
  repos: TrendingRepo[],
  date: string
) {
  const subs = await db
    .select()
    .from(webhookSubscriptions)
    .where(eq(webhookSubscriptions.isActive, true));

  if (subs.length === 0) return;

  // Check if any sub needs Korean — if so, fetch analyses
  const needsKorean = subs.some((s) => s.language === "ko");
  let reposWithSummary: RepoWithSummary[] = repos;

  if (needsKorean) {
    const repoNames = repos.map((r) => r.fullName);
    const repoRows = await db
      .select({ id: repositories.id, fullName: repositories.fullName })
      .from(repositories)
      .where(inArray(repositories.fullName, repoNames));

    const repoIds = repoRows.map((r) => r.id);
    const analysisList =
      repoIds.length > 0
        ? await db
            .select({
              repoId: analyses.repoId,
              summaryKo: analyses.summaryKo,
              summaryEn: analyses.summaryEn,
            })
            .from(analyses)
            .where(inArray(analyses.repoId, repoIds))
        : [];

    const repoIdByName = new Map(repoRows.map((r) => [r.fullName, r.id]));
    const analysisByRepoId = new Map(
      analysisList.map((a) => [a.repoId, a])
    );

    reposWithSummary = repos.map((r) => {
      const repoId = repoIdByName.get(r.fullName);
      const analysis = repoId ? analysisByRepoId.get(repoId) : undefined;
      return {
        ...r,
        summaryKo: analysis?.summaryKo ?? null,
        summaryEn: analysis?.summaryEn ?? null,
      };
    });
  }

  for (const sub of subs) {
    const filters = sub.filters ? JSON.parse(sub.filters) : {};
    const filtered = applyFilters(reposWithSummary, filters);
    if (filtered.length === 0) continue;

    const lang = sub.language || "en";
    const payload = buildPayload(sub.platform, filtered, date, lang);

    try {
      await fetch(sub.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error(`Webhook failed for ${sub.url}:`, error);
    }
  }
}

function applyFilters(
  repos: RepoWithSummary[],
  filters: { language?: string; minStars?: number }
): RepoWithSummary[] {
  let result = repos;
  if (filters.language) {
    result = result.filter((r) => r.language === filters.language);
  }
  if (filters.minStars) {
    result = result.filter((r) => r.stars >= filters.minStars!);
  }
  return result;
}

function getDescription(repo: RepoWithSummary, lang: string): string {
  if (lang === "ko") {
    return repo.summaryKo || repo.description || "설명 없음";
  }
  return repo.description || "No description";
}

function getTitle(date: string, lang: string): string {
  if (lang === "ko") {
    return `GitHub 트렌딩 - ${date}`;
  }
  return `GitHub Trending - ${date}`;
}

function buildPayload(
  platform: string,
  repos: RepoWithSummary[],
  date: string,
  lang: string
) {
  const title = getTitle(date, lang);

  if (platform === "slack") {
    return {
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: title },
        },
        ...repos.slice(0, 10).map((repo) => ({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*<https://github.com/${repo.fullName}|${repo.fullName}>* ${repo.stars} stars\n${getDescription(repo, lang)}`,
          },
        })),
      ],
    };
  }

  if (platform === "discord") {
    return {
      embeds: [
        {
          title,
          fields: repos.slice(0, 10).map((repo) => ({
            name: `${repo.fullName} - ${repo.stars} stars`,
            value: getDescription(repo, lang),
            inline: false,
          })),
        },
      ],
    };
  }

  if (platform === "teams") {
    return {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.4",
            body: [
              {
                type: "TextBlock",
                size: "Large",
                weight: "Bolder",
                text: title,
              },
              ...repos.slice(0, 10).map((repo) => ({
                type: "Container",
                items: [
                  {
                    type: "TextBlock",
                    text: `[${repo.fullName}](https://github.com/${repo.fullName}) ⭐ ${repo.stars}`,
                    wrap: true,
                    weight: "Bolder",
                  },
                  {
                    type: "TextBlock",
                    text: getDescription(repo, lang),
                    wrap: true,
                    isSubtle: true,
                    spacing: "None",
                  },
                ],
                separator: true,
              })),
            ],
          },
        },
      ],
    };
  }

  // Generic JSON
  return {
    date,
    language: lang,
    repos: repos.slice(0, 25).map((repo) => ({
      fullName: repo.fullName,
      owner: repo.owner,
      name: repo.name,
      description: getDescription(repo, lang),
      language: repo.language,
      stars: repo.stars,
      forks: repo.forks,
      starsToday: repo.starsToday,
      rank: repo.rank,
      url: `https://github.com/${repo.fullName}`,
    })),
  };
}

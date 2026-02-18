import { db } from "@/lib/db";
import { webhookSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { TrendingRepo } from "@/types";

export async function sendWebhookNotifications(
  repos: TrendingRepo[],
  date: string
) {
  const subs = await db
    .select()
    .from(webhookSubscriptions)
    .where(eq(webhookSubscriptions.isActive, true));

  for (const sub of subs) {
    const filters = sub.filters ? JSON.parse(sub.filters) : {};
    const filtered = applyFilters(repos, filters);
    if (filtered.length === 0) continue;

    const payload = buildPayload(sub.platform, filtered, date);

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
  repos: TrendingRepo[],
  filters: { language?: string; minStars?: number }
): TrendingRepo[] {
  let result = repos;
  if (filters.language) {
    result = result.filter((r) => r.language === filters.language);
  }
  if (filters.minStars) {
    result = result.filter((r) => r.stars >= filters.minStars!);
  }
  return result;
}

function buildPayload(
  platform: string,
  repos: TrendingRepo[],
  date: string
) {
  if (platform === "slack") {
    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `GitHub Trending - ${date}`,
          },
        },
        ...repos.slice(0, 10).map((repo) => ({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*<https://github.com/${repo.fullName}|${repo.fullName}>* ${repo.stars} stars\n${repo.description || ""}`,
          },
        })),
      ],
    };
  }

  if (platform === "discord") {
    return {
      embeds: [
        {
          title: `GitHub Trending - ${date}`,
          fields: repos.slice(0, 10).map((repo) => ({
            name: `${repo.fullName} - ${repo.stars} stars`,
            value: repo.description || "No description",
            inline: false,
          })),
        },
      ],
    };
  }

  return { date, repos: repos.slice(0, 25) };
}

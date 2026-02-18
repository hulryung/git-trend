import type { TrendingRepo } from "@/types";

function getDateThreshold(period: "daily" | "weekly" | "monthly"): string {
  const now = new Date();
  switch (period) {
    case "daily":
      now.setDate(now.getDate() - 1);
      break;
    case "weekly":
      now.setDate(now.getDate() - 7);
      break;
    case "monthly":
      now.setMonth(now.getMonth() - 1);
      break;
  }
  return now.toISOString().split("T")[0];
}

export async function fetchFromSearchAPI(
  period: "daily" | "weekly" | "monthly"
): Promise<TrendingRepo[]> {
  const date = getDateThreshold(period);
  const query = `created:>${date}`;

  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "stars");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", "30");

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "git-trend-collector",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    throw new Error(
      `GitHub Search API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const items: Array<{
    full_name: string;
    owner: { login: string };
    name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    html_url: string;
  }> = data.items ?? [];

  return items.map((item, index) => ({
    fullName: item.full_name,
    owner: item.owner.login,
    name: item.name,
    description: item.description,
    language: item.language,
    stars: item.stargazers_count,
    forks: item.forks_count,
    starsToday: 0,
    rank: index + 1,
    url: item.html_url,
  }));
}

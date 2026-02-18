import * as cheerio from "cheerio";
import type { TrendingRepo } from "@/types";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export async function scrapeGitHubTrending(
  period: "daily" | "weekly" | "monthly",
  language?: string
): Promise<TrendingRepo[]> {
  const params = new URLSearchParams({ since: period });
  if (language) {
    params.set("spoken_language_code", "");
  }

  const url = language
    ? `https://github.com/trending/${encodeURIComponent(language)}?${params}`
    : `https://github.com/trending?${params}`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch trending page: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const repos: TrendingRepo[] = [];

  $("article.Box-row").each((index, element) => {
    const el = $(element);

    const repoLink = el.find("h2 a").attr("href")?.trim();
    if (!repoLink) return;

    const fullName = repoLink.replace(/^\//, "");
    const [owner, name] = fullName.split("/");
    if (!owner || !name) return;

    const description =
      el.find("p.col-9").text().trim() || null;

    const language =
      el.find('[itemprop="programmingLanguage"]').text().trim() || null;

    const starsText = el
      .find('a[href$="/stargazers"]')
      .text()
      .trim()
      .replace(/,/g, "");
    const stars = parseInt(starsText, 10) || 0;

    const forksLink = el
      .find('a[href$="/forks"]')
      .text()
      .trim()
      .replace(/,/g, "");
    const forks = parseInt(forksLink, 10) || 0;

    const todayText = el
      .find("span.d-inline-block.float-sm-right")
      .text()
      .trim()
      .replace(/,/g, "");
    const todayMatch = todayText.match(/(\d+)/);
    const starsToday = todayMatch ? parseInt(todayMatch[1], 10) : 0;

    repos.push({
      fullName,
      owner,
      name,
      description,
      language,
      stars,
      forks,
      starsToday,
      rank: index + 1,
      url: `https://github.com/${fullName}`,
    });
  });

  return repos;
}

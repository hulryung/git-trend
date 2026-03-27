export interface NewsItem {
  title: string;
  url: string;
  source: "hackernews" | "github_release" | "devto";
  sourceLabel: string;
  date: string | null;
  points?: number;
  comments?: number;
  commentsUrl?: string;
  summary?: string;
  tag?: string;
}

export async function fetchRelatedNews(
  owner: string,
  name: string
): Promise<NewsItem[]> {
  const results = await Promise.allSettled([
    searchHackerNews(`${owner}/${name}`),
    fetchGitHubReleases(owner, name),
    searchDevTo(name),
  ]);

  const items: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
  }

  // Sort by date descending, nulls last
  items.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return items.slice(0, 20);
}

async function searchHackerNews(query: string): Promise<NewsItem[]> {
  const res = await fetch(
    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=10`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return (data.hits || [])
    .filter(
      (hit: { url: string | null }) => hit.url && hit.url.trim() !== ""
    )
    .map(
      (hit: {
        title: string;
        url: string;
        objectID: string;
        created_at: string;
        points: number;
        num_comments: number;
      }) => ({
        title: hit.title,
        url: hit.url,
        source: "hackernews" as const,
        sourceLabel: "Hacker News",
        date: hit.created_at,
        points: hit.points,
        comments: hit.num_comments,
        commentsUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
      })
  );
}

async function fetchGitHubReleases(
  owner: string,
  name: string
): Promise<NewsItem[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/releases?per_page=5`,
    { headers, next: { revalidate: 3600 } }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return (data || []).map(
    (release: {
      name: string;
      tag_name: string;
      html_url: string;
      published_at: string;
      body: string;
    }) => ({
      title: `${release.name || release.tag_name}`,
      url: release.html_url,
      source: "github_release" as const,
      sourceLabel: "GitHub Release",
      date: release.published_at,
      tag: release.tag_name,
      summary: release.body
        ? release.body.slice(0, 200).replace(/[#*`\n]/g, " ").trim()
        : undefined,
    })
  );
}

async function searchDevTo(repoName: string): Promise<NewsItem[]> {
  const res = await fetch(
    `https://dev.to/api/articles?per_page=5&tag=${encodeURIComponent(repoName.toLowerCase())}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return (data || []).map(
    (article: {
      title: string;
      url: string;
      published_at: string;
      description: string;
    }) => ({
      title: article.title,
      url: article.url,
      source: "devto" as const,
      sourceLabel: "DEV.to",
      date: article.published_at,
      summary: article.description,
    })
  );
}

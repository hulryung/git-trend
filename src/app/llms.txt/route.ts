import { NextResponse } from "next/server";

export async function GET() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://trend.hulryung.com";

  const content = `# git-trend

> Discover and analyze trending GitHub repositories with AI-powered insights.

git-trend is a web service that tracks GitHub trending repositories (daily, weekly, monthly) and provides AI-generated analysis including Korean/English summaries, tech stack detection, difficulty assessment, and related news from Hacker News, GitHub Releases, and DEV.to.

## Key Features

- Daily/weekly/monthly GitHub trending repository tracking
- AI-powered repository analysis (summaries in Korean & English)
- Tech stack detection and categorization
- Related news aggregation (Hacker News, GitHub Releases, DEV.to)
- Webhook notifications (Slack, Discord, Teams) with Korean language support
- RSS feed for subscribing to trending repositories
- Star history charts and trending history

## Pages

- [Home](${appUrl}/): Browse trending repositories by period and language
- [Repository Detail](${appUrl}/repo/{owner}/{name}): Detailed AI analysis, related news, star history
- [Webhooks](${appUrl}/webhooks): Register webhook notifications
- [RSS Feed](${appUrl}/feed/rss.xml): Subscribe to trending repos via RSS

## API Endpoints

- GET ${appUrl}/api/trending?period=daily&language=TypeScript&date=2024-01-01
- GET ${appUrl}/api/repo/{owner}/{name}
- GET ${appUrl}/api/repo/{owner}/{name}/news
- GET ${appUrl}/feed/rss.xml?period=daily&language=Python

## Data Sources

- GitHub Trending page (scraped daily)
- GitHub API (releases, repository details)
- Hacker News Algolia API (related discussions)
- DEV.to API (related articles)
- AI analysis via Claude (Replicate)
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

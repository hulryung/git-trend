import { NextResponse } from "next/server";

export async function GET() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://trend.hulryung.com";

  return NextResponse.json({
    schema_version: "v1",
    name_for_human: "git-trend",
    name_for_model: "git_trend",
    description_for_human:
      "Discover and analyze trending GitHub repositories with AI-powered insights, related news, and webhook notifications.",
    description_for_model:
      "A service that tracks GitHub trending repositories daily/weekly/monthly and provides AI analysis (summaries in Korean/English, tech stack, difficulty, categories), related news from Hacker News and DEV.to, GitHub releases, star history, and webhook notifications. Use the API to query trending repos by period, language, and date, or get detailed analysis for a specific repository.",
    auth: { type: "none" },
    api: {
      type: "openapi",
      url: `${appUrl}/api/openapi.json`,
    },
    logo_url: `${appUrl}/favicon.ico`,
    contact_email: "",
    legal_info_url: `${appUrl}`,
  });
}

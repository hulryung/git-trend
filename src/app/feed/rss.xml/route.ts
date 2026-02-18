import { NextRequest } from "next/server";
import { generateRSS } from "@/lib/notifications/rss";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const language = searchParams.get("language");
  const period = searchParams.get("period") || "daily";

  const feed = await generateRSS({ language, period });

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

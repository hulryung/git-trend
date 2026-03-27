import { NextResponse } from "next/server";
import { fetchRelatedNews } from "@/lib/search/news";

interface RouteParams {
  params: Promise<{ owner: string; name: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { owner, name } = await params;

  try {
    const news = await fetchRelatedNews(owner, name);
    return NextResponse.json(news);
  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

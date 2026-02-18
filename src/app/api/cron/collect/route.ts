import { NextRequest, NextResponse } from "next/server";
import { collectTrending } from "@/lib/collectors";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const periods = ["daily", "weekly", "monthly"] as const;
    const results: Record<string, { count: number; source: string }> = {};

    for (const period of periods) {
      results[period] = await collectTrending(period);
    }

    return NextResponse.json({
      success: true,
      date: new Date().toISOString().split("T")[0],
      results,
    });
  } catch (error) {
    console.error("Cron collect error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

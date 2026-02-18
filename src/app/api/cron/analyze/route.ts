import { NextResponse } from "next/server";
import { runAnalysisBatch } from "@/lib/analyzer";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runAnalysisBatch(5);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[cron/analyze] Error:", err);
    return NextResponse.json(
      { error: "Analysis batch failed" },
      { status: 500 }
    );
  }
}

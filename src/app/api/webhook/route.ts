import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { webhookSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const subs = await db.select().from(webhookSubscriptions).orderBy(webhookSubscriptions.id);
  return NextResponse.json(subs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, platform, filters } = body;

  if (!url || !platform) {
    return NextResponse.json(
      { error: "url and platform are required" },
      { status: 400 }
    );
  }

  const result = await db
    .insert(webhookSubscriptions)
    .values({
      url,
      platform,
      filters: filters ? JSON.stringify(filters) : null,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db
    .delete(webhookSubscriptions)
    .where(eq(webhookSubscriptions.id, id));

  return NextResponse.json({ success: true });
}

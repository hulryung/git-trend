import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { webhookSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const UNAUTHORIZED = NextResponse.json(
  { error: "Unauthorized" },
  { status: 401 }
);

function isAuthorized(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return true;
  return request.headers.get("x-admin-password") === password;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return UNAUTHORIZED;
  const subs = await db
    .select()
    .from(webhookSubscriptions)
    .orderBy(webhookSubscriptions.id);
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
      isActive: false,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) return UNAUTHORIZED;

  const body = await request.json();
  const { id, isActive } = body;

  if (!id || typeof isActive !== "boolean") {
    return NextResponse.json(
      { error: "id and isActive are required" },
      { status: 400 }
    );
  }

  const result = await db
    .update(webhookSubscriptions)
    .set({ isActive })
    .where(eq(webhookSubscriptions.id, id))
    .returning();

  return NextResponse.json(result[0]);
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) return UNAUTHORIZED;

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

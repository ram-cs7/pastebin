import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { createPaste } from "@/lib/db";

// nanoid with a URL-safe alphabet, 8 chars = 57 billion combinations — low collision risk
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, ttl_seconds, max_views } = body;

    // Validate
    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Content is required." }, { status: 400 });
    }

    // Determine current time
    let nowMs = Date.now();
    if (process.env.TEST_MODE === "1") {
      const testNowMs = req.headers.get("x-test-now-ms");
      if (testNowMs) {
        nowMs = parseInt(testNowMs, 10);
      }
    }

    // Calculate expiry timestamp
    let expires_at: string | null = null;
    if (ttl_seconds !== undefined && ttl_seconds !== null) {
      if (typeof ttl_seconds !== "number" || ttl_seconds < 1 || !Number.isInteger(ttl_seconds)) {
        return NextResponse.json({ error: "Invalid ttl_seconds." }, { status: 400 });
      }
      expires_at = new Date(nowMs + ttl_seconds * 1000).toISOString();
    }

    let final_max_views: number | null = null;
    if (max_views !== undefined && max_views !== null) {
      if (typeof max_views !== "number" || max_views < 1 || !Number.isInteger(max_views)) {
        return NextResponse.json({ error: "Invalid max_views." }, { status: 400 });
      }
      final_max_views = max_views;
    }

    const slug = nanoid();
    const paste = await createPaste({
      slug,
      title: null,
      content,
      expires_at,
      max_views: final_max_views,
    });

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const url = `${protocol}://${host}/p/${paste.slug}`;

    return NextResponse.json({ id: paste.slug, url }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/pastes]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

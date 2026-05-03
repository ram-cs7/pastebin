import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { createPaste } from "@/lib/db";

// nanoid with a URL-safe alphabet, 8 chars = 57 billion combinations — low collision risk
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, expiresIn, maxViews } = body;

    // Validate
    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Content is required." }, { status: 400 });
    }
    if (content.length > 500_000) {
      return NextResponse.json({ error: "Content too large (max 500KB)." }, { status: 400 });
    }

    // Calculate expiry timestamp
    let expires_at: string | null = null;
    if (expiresIn && expiresIn !== "never") {
      const durations: Record<string, number> = {
        "1h":  1 * 60 * 60 * 1000,
        "1d":  24 * 60 * 60 * 1000,
        "7d":  7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
      };
      if (!durations[expiresIn]) {
        return NextResponse.json({ error: "Invalid expiry value." }, { status: 400 });
      }
      expires_at = new Date(Date.now() + durations[expiresIn]).toISOString();
    }

    // max_views: null means unlimited
    const max_views = maxViews && maxViews !== "unlimited"
      ? parseInt(maxViews, 10)
      : null;

    if (max_views !== null && (isNaN(max_views) || max_views < 1)) {
      return NextResponse.json({ error: "Invalid max views value." }, { status: 400 });
    }

    const slug = nanoid();
    const paste = await createPaste({
      slug,
      title: title?.trim() || null,
      content: content.trim(),
      expires_at,
      max_views,
    });

    return NextResponse.json({ slug: paste.slug }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/paste]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

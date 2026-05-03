import { NextRequest, NextResponse } from "next/server";
import { getPasteBySlug, incrementViewCount, isPasteValid } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paste = await getPasteBySlug(params.id);

    if (!paste) {
      return NextResponse.json({ error: "Paste not found." }, { status: 404 });
    }

    let nowMs = Date.now();
    if (process.env.TEST_MODE === "1") {
      const testNowMs = req.headers.get("x-test-now-ms");
      if (testNowMs) {
        nowMs = parseInt(testNowMs, 10);
      }
    }

    if (!isPasteValid(paste, nowMs)) {
      return NextResponse.json({ error: "Paste is unavailable." }, { status: 404 });
    }

    // Increment view count AFTER the validity check
    await incrementViewCount(params.id);

    const remaining_views = paste.max_views !== null 
      ? Math.max(0, paste.max_views - (paste.view_count + 1))
      : null;

    return NextResponse.json({
      content:    paste.content,
      remaining_views: remaining_views,
      expires_at: paste.expires_at,
    });
  } catch (err) {
    console.error("[GET /api/pastes/:id]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

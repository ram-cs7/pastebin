import { NextRequest, NextResponse } from "next/server";
import { getPasteBySlug, incrementViewCount, isPasteValid } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const paste = await getPasteBySlug(params.slug);

    if (!paste) {
      return NextResponse.json({ error: "Paste not found." }, { status: 404 });
    }

    if (!isPasteValid(paste)) {
      return NextResponse.json({ error: "This paste has expired." }, { status: 410 });
    }

    // Increment view count AFTER the validity check
    await incrementViewCount(params.slug);

    return NextResponse.json({
      slug:       paste.slug,
      title:      paste.title,
      content:    paste.content,
      created_at: paste.created_at,
      expires_at: paste.expires_at,
      max_views:  paste.max_views,
      view_count: paste.view_count + 1, // reflect the just-incremented count
    });
  } catch (err) {
    console.error("[GET /api/paste/:slug]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [content, setContent]   = useState("");
  const [expiresIn, setExpires] = useState("never");
  const [maxViews, setMaxViews] = useState("unlimited");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!content.trim()) { setError("Content cannot be empty."); return; }

    setLoading(true);
    
    // Convert to integers
    let ttl_seconds: number | undefined;
    const durations: Record<string, number> = {
      "1h": 3600,
      "1d": 86400,
      "7d": 604800,
      "30d": 2592000,
    };
    if (expiresIn !== "never" && durations[expiresIn]) {
      ttl_seconds = durations[expiresIn];
    }
    
    let parsed_max_views: number | undefined;
    if (maxViews !== "unlimited") {
      parsed_max_views = parseInt(maxViews, 10);
    }

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, ttl_seconds, max_views: parsed_max_views }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      router.push(`/p/${data.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">📋 PasteShare</h1>
          <p className="text-gray-400 mt-1 text-sm">Paste text. Get a link. Share it.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Content */}
          <textarea
            placeholder="Paste your content here..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={16}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />

          {/* Options row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Expires after</label>
              <select
                value={expiresIn}
                onChange={e => setExpires(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="never">Never</option>
                <option value="1h">1 Hour</option>
                <option value="1d">1 Day</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Expire after views</label>
              <select
                value={maxViews}
                onChange={e => setMaxViews(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="unlimited">Unlimited</option>
                <option value="1">1 view</option>
                <option value="5">5 views</option>
                <option value="10">10 views</option>
                <option value="50">50 views</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors"
          >
            {loading ? "Creating paste…" : "Create Paste →"}
          </button>
        </form>
      </div>
    </main>
  );
}

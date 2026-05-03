"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type PasteData = {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
};

export default function PastePage() {
  const params              = useParams();
  const router              = useRouter();
  const id                  = params.id as string;
  const [paste, setPaste]   = useState<PasteData | null>(null);
  const [error, setError]   = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`/api/pastes/${id}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed to load paste."); return; }
        setPaste(data);
      } catch {
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyContent() {
    if (!paste) return;
    navigator.clipboard.writeText(paste.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString();
  }

  function expiryBadge() {
    if (!paste) return null;
    const parts = [];
    if (paste.expires_at) parts.push(`Expires ${formatDate(paste.expires_at)}`);
    if (paste.remaining_views !== null)  parts.push(`${paste.remaining_views} views remaining`);
    if (!parts.length)    parts.push("Never expires · Unlimited views");
    return parts.join("  ·  ");
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400 text-sm animate-pulse">Loading paste…</p>
    </main>
  );

  if (error) return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-4">
      <div className="text-center">
        <p className="text-5xl mb-4">⏳</p>
        <h1 className="text-white text-xl font-semibold mb-2">
          {error.includes("expired") ? "This paste has expired" : "Paste not found"}
        </h1>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Create a new paste
        </button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl">

        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            ← New paste
          </button>
          <div className="flex gap-2">
            <button
              onClick={copyContent}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              Copy text
            </button>
            <button
              onClick={copyLink}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy link"}
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-white mb-1">
          Paste
        </h1>

        {/* Meta */}
        <p className="text-gray-500 text-xs mb-4">
          {expiryBadge()}
        </p>

        {/* Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* Line numbers + content */}
          <div className="flex overflow-x-auto">
            {/* Line numbers */}
            <div className="select-none bg-gray-950 border-r border-gray-800 px-3 py-4 text-right">
              {paste!.content.split("\n").map((_, i) => (
                <div key={i} className="text-gray-600 text-xs font-mono leading-6">{i + 1}</div>
              ))}
            </div>
            {/* Code */}
            <pre className="flex-1 px-4 py-4 text-sm font-mono text-gray-200 whitespace-pre leading-6 overflow-x-auto">
              {paste!.content}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-xs mt-4 text-center">
          Share this URL: <span className="text-gray-400 select-all">{typeof window !== "undefined" ? window.location.href : ""}</span>
        </p>
      </div>
    </main>
  );
}

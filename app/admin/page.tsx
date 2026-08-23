"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, RefreshCw, Sparkles, ExternalLink, Image as ImageIcon, ShieldAlert } from "lucide-react";
import type { HostSubmission } from "@/lib/server/types";
import Button from "@/components/ui/Button";
import { createBrowserClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<HostSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState<string | null>(null);

  const getAuthToken = async (): Promise<string> => {
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || "";
    } catch {
      return "";
    }
  };

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setUnauthorized(null);
    try {
      const token = await getAuthToken();
      const res = await fetch("/api/admin/events", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const json = await res.json();

      if (res.status === 401 || res.status === 403) {
        setUnauthorized(json.error?.message || "Admin authorization required.");
        setSubmissions([]);
        return;
      }

      if (res.ok) {
        setSubmissions(json.data?.submissions || json.data?.events || []);
      } else {
        setMessage(json.error?.message || "Failed to load pending host submissions");
      }
    } catch {
      setMessage("Failed to load pending host submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    setActionId(id);
    setMessage(null);

    try {
      const token = await getAuthToken();
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, status }),
      });

      const json = await res.json();

      if (res.ok) {
        const title = json.data?.submission?.eventTitle || json.data?.event?.title || "Submission";
        setMessage(`Submission "${title}" successfully ${status}!`);
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      } else {
        setMessage(json.error?.message || "Failed to update submission status");
      }
    } catch {
      setMessage("Network error while updating submission status");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Sparkles size={14} /> Havli Admin Portal
          </span>
          <h1 className="text-3xl font-black text-[var(--color-foreground)]">
            Pending Host Approvals
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={fetchPending} disabled={loading}>
            <RefreshCw size={14} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button href="/explore" variant="secondary" size="sm">
            Explore <ExternalLink size={14} className="ml-1.5" />
          </Button>
        </div>
      </div>

      {unauthorized ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-foreground)]">
            Access Restricted
          </h2>
          <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto">
            {unauthorized}
          </p>
        </div>
      ) : (
        <>
          {message && (
            <div className="bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/30 rounded-xl px-4 py-3 text-sm font-semibold text-[var(--color-primary)]">
              {message}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                ✓
              </div>
              <h2 className="text-lg font-bold text-[var(--color-foreground)]">
                No Pending Host Submissions
              </h2>
              <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto">
                All submitted parties have been reviewed. Submit a new party from &quot;Host a Party&quot; to test the approval queue.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col sm:flex-row items-start justify-between gap-5"
                >
                  {/* Image preview */}
                  {sub.image ? (
                    <img
                      src={sub.image}
                      alt={sub.eventTitle}
                      className="w-full sm:w-28 h-36 sm:h-28 object-cover rounded-xl border border-[var(--color-border)] shrink-0"
                    />
                  ) : (
                    <div className="w-full sm:w-28 h-24 sm:h-28 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] shrink-0">
                      <ImageIcon size={28} />
                    </div>
                  )}

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Pending Approval
                      </span>
                      <span className="text-xs text-[var(--color-muted)]">• {sub.eventType}</span>
                      <span className="text-xs text-[var(--color-muted)]">• {sub.city}</span>
                      {sub.vibe && (
                        <span className="text-xs text-[var(--color-muted)]">• {sub.vibe}</span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[var(--color-foreground)] truncate">
                      {sub.eventTitle}
                    </h3>

                    <p className="text-xs text-[var(--color-muted)] line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-[var(--color-muted)]">
                      <span>📍 <strong>Area:</strong> {sub.area}, {sub.city}</span>
                      <span>📅 <strong>Date:</strong> {sub.date}</span>
                      <span>⏰ <strong>Time:</strong> {sub.startTime}</span>
                      <span>💰 <strong>Price:</strong> {sub.price === 0 ? "Free" : `₹${sub.price}`}</span>
                      <span>👥 <strong>Capacity:</strong> {sub.capacity}</span>
                      <span>👤 <strong>Host:</strong> {sub.name} ({sub.phone})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleUpdateStatus(sub.id, "approved")}
                      disabled={actionId === sub.id}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(sub.id, "rejected")}
                      disabled={actionId === sub.id}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

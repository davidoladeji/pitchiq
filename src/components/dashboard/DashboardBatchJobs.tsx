"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BatchJobSummary {
  id: string;
  name: string;
  status: string;
  totalDecks: number;
  completed: number;
  failed: number;
  createdAt: string;
}

function statusBadge(status: string): { label: string; classes: string } {
  switch (status) {
    case "completed":
      return { label: "Completed", classes: "bg-emerald/15 text-emerald" };
    case "processing":
      return { label: "Processing", classes: "bg-electric/15 text-electric" };
    case "failed":
      return { label: "Failed", classes: "bg-red-50 text-red-700" };
    default:
      return { label: "Pending", classes: "bg-navy-100 text-navy-600" };
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DashboardBatchJobs({ plan }: { plan: string }) {
  const isEnterprise = plan === "enterprise";
  const [jobs, setJobs] = useState<BatchJobSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isEnterprise) {
      setLoading(false);
      return;
    }

    async function fetchJobs() {
      try {
        const res = await fetch("/api/batch-score");
        if (res.ok) {
          const data = await res.json();
          setJobs((data.jobs || []).slice(0, 3));
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [isEnterprise]);

  // Locked state for non-enterprise plans
  if (!isEnterprise) {
    return (
      <div className="bg-white rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center">
          <svg
            className="w-8 h-8 text-navy-300 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <p className="text-sm font-medium text-navy-600 mb-1">Enterprise Feature</p>
          <Link
            href="/#pricing"
            className="text-xs text-electric font-medium hover:underline"
          >
            Upgrade to unlock
          </Link>
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-3">Batch Scoring</h3>
        <div className="space-y-2 opacity-40">
          <div className="h-12 bg-navy-50 rounded-lg" />
          <div className="h-12 bg-navy-50 rounded-lg" />
          <div className="h-12 bg-navy-50 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-navy-900">Batch Scoring</h3>
        <div className="flex items-center gap-2">
          <Link
            href="/batch-score"
            className="text-xs text-navy-500 hover:text-navy-700 font-medium transition"
          >
            View All
          </Link>
          <Link
            href="/batch-score"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-electric rounded-lg hover:bg-electric/90 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Batch
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-navy-50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-6">
          <svg
            className="w-10 h-10 text-navy-200 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
            />
          </svg>
          <p className="text-sm text-navy-400">No batch jobs yet</p>
          <Link
            href="/batch-score"
            className="text-sm text-electric font-medium hover:underline mt-1 inline-block"
          >
            Score your first batch
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => {
            const badge = statusBadge(job.status);
            return (
              <Link
                key={job.id}
                href="/batch-score"
                className="flex items-center justify-between px-3 py-2.5 bg-navy-50 rounded-lg hover:bg-navy-100/70 transition group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-navy-800 truncate">
                      {job.name}
                    </p>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0 ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-navy-400 mt-0.5">
                    {job.completed}/{job.totalDecks} scored — {formatDate(job.createdAt)}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-navy-300 group-hover:text-navy-500 transition shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

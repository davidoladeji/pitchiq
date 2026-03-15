"use client";

import { useState } from "react";
import { DeckData } from "@/lib/types";
import { THEMES } from "@/lib/themes";
import FormField, { inputClass } from "@/components/ui/FormField";
import { getPlanLimits } from "@/lib/plan-limits";

interface GitHubRepoFormProps {
  onGenerated: (deck: DeckData) => void;
  userPlan?: string;
}

export default function GitHubRepoForm({ onGenerated, userPlan = "starter" }: GitHubRepoFormProps) {
  const planLimits = getPlanLimits(userPlan);
  const [repoUrl, setRepoUrl] = useState("");
  const [themeId, setThemeId] = useState("midnight");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidUrl = repoUrl.match(/github\.com\/[^\/]+\/[^\/\?#]+/);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUrl) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/decks/from-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, themeId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate deck from repository");
      }

      const deck: DeckData = await res.json();
      onGenerated(deck);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="min-h-[300px] relative">
        {/* Loading skeleton */}
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col justify-center rounded-xl bg-navy-50/90 border border-navy-100 p-8 animate-fade-in" aria-live="polite" aria-busy="true">
            <div className="flex flex-col items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-electric/10 border border-electric/20 flex items-center justify-center">
                <svg className="animate-spin h-7 w-7 text-electric" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-navy">Analyzing repository...</p>
                <p className="text-xs text-gray-500 mt-1">Extracting README, languages, contributors & more</p>
              </div>
              <div className="w-full max-w-xs space-y-3">
                <div className="h-2 rounded-full bg-navy-100 animate-pulse" style={{ width: "100%" }} />
                <div className="h-2 rounded-full bg-navy-100 animate-pulse" style={{ width: "85%" }} />
                <div className="h-2 rounded-full bg-navy-100 animate-pulse" style={{ width: "70%" }} />
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-xl bg-electric/5 border border-electric/20 p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-electric shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <div>
                  <p className="text-navy text-sm font-semibold">Generate a pitch deck from any GitHub repo</p>
                  <p className="text-gray-500 text-xs mt-1">
                    We&apos;ll extract the README, tech stack, stars, contributors, and more to auto-generate a complete investor deck.
                  </p>
                </div>
              </div>
            </div>

            <FormField label="GitHub Repository URL" required>
              <input
                type="url"
                required
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/your-org/your-repo"
                className={inputClass}
                autoFocus
              />
              {repoUrl && !isValidUrl && (
                <p className="text-red-500 text-xs mt-1.5">Please enter a valid GitHub repository URL</p>
              )}
            </FormField>

            <FormField label="Choose a Theme" hint="Pick a visual theme for your deck slides">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {THEMES.map((theme) => {
                  const isLocked = !planLimits.allowedThemes.includes(theme.id);
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        if (isLocked) return;
                        setThemeId(theme.id);
                      }}
                      disabled={isLocked}
                      className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 ${
                        isLocked
                          ? "border-gray-100 opacity-60 cursor-not-allowed"
                          : themeId === theme.id
                          ? "border-electric bg-electric/5 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="w-full aspect-[16/9] rounded-lg overflow-hidden flex items-end relative"
                        style={{ background: theme.bgDark }}
                      >
                        <div className="w-full px-2 pb-1.5">
                          <div
                            className="h-1 rounded-full mb-1"
                            style={{ background: theme.accent, width: "60%" }}
                          />
                          <div
                            className="h-0.5 rounded-full opacity-40"
                            style={{ background: theme.textSecondary, width: "80%" }}
                          />
                        </div>
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                            <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isLocked
                            ? "text-gray-400"
                            : themeId === theme.id ? "text-electric" : "text-gray-500"
                        }`}
                      >
                        {theme.name}
                        {isLocked && (
                          <span className="ml-1 text-[9px] font-bold text-electric/70 uppercase">Pro</span>
                        )}
                      </span>
                      {!isLocked && themeId === theme.id && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-electric flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </FormField>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm" role="alert">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <svg
                className="w-4 h-4 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="min-h-[44px] shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric-dark transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end mt-10 pt-6 border-t border-gray-100">
        <div className="flex flex-col items-end gap-2">
          <button
            type="submit"
            disabled={loading || !isValidUrl}
            aria-busy={loading}
            aria-label={loading ? "Generating your pitch deck from repository" : "Generate pitch deck from repository"}
            className="min-h-[44px] inline-flex items-center px-8 py-3.5 rounded-xl bg-electric text-white font-semibold hover:bg-electric-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-electric/20 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            {loading ? (
              <span className="flex items-center gap-2.5">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Generate from Repo
              </span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

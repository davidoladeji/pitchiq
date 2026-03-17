"use client";

import { useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { getPlanLimits } from "@/lib/plan-limits";

interface SettingsClientProps {
  name: string | null;
  email: string;
  image: string | null;
  plan: string;
  brandingEnabled: boolean;
  customLogoUrl: string | null;
  customCompanyName: string | null;
  customAccentColor: string | null;
}

const PLAN_INFO: Record<string, { label: string; color: string; bgColor: string }> = {
  starter: { label: "Starter", color: "text-navy-600", bgColor: "bg-navy-100" },
  pro: { label: "Pro", color: "text-electric", bgColor: "bg-electric/10" },
  growth: { label: "Growth", color: "text-violet-700", bgColor: "bg-violet-100" },
  enterprise: { label: "Enterprise", color: "text-amber-700", bgColor: "bg-amber-100" },
};

export default function SettingsClient({
  name,
  email,
  image,
  plan,
  brandingEnabled: initialBrandingEnabled,
  customLogoUrl: initialLogoUrl,
  customCompanyName: initialCompanyName,
  customAccentColor: initialAccentColor,
}: SettingsClientProps) {
  const [brandingEnabled, setBrandingEnabled] = useState(initialBrandingEnabled);
  const [customLogoUrl, setCustomLogoUrl] = useState(initialLogoUrl || "");
  const [customCompanyName, setCustomCompanyName] = useState(initialCompanyName || "");
  const [customAccentColor, setCustomAccentColor] = useState(initialAccentColor || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const limits = getPlanLimits(plan);
  const canCustomizeBranding = !limits.showBranding; // Pro+ can customize
  const info = PLAN_INFO[plan] || PLAN_INFO.starter;

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandingEnabled,
          customLogoUrl: customLogoUrl || null,
          customCompanyName: customCompanyName || null,
          customAccentColor: customAccentColor || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccess("Settings saved successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <AppNav />

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none" aria-label="Main content">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-navy font-display tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-navy-500 mt-1">
              Manage your profile and deck branding preferences.
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3" role="alert">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3" role="status">
              <p className="text-sm text-emerald-700 font-medium">{success}</p>
            </div>
          )}

          {/* Profile card */}
          <div className="rounded-2xl border border-navy-200 bg-white p-6 space-y-4">
            <h2 className="text-sm font-bold text-navy-500 uppercase tracking-wider">Profile</h2>
            <div className="flex items-center gap-4">
              {image ? (
                <img
                  src={image}
                  alt=""
                  className="w-12 h-12 rounded-full border border-navy-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-electric/10 border border-electric/20 flex items-center justify-center text-electric text-lg font-bold">
                  {(name?.[0] || email[0] || "U").toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy truncate">{name || "User"}</p>
                <p className="text-xs text-navy-500 truncate">{email}</p>
              </div>
              <span className={`ml-auto shrink-0 px-3 py-1 rounded-lg text-xs font-bold ${info.color} ${info.bgColor}`}>
                {info.label}
              </span>
            </div>
          </div>

          {/* Deck Branding card */}
          <div className="rounded-2xl border border-navy-200 bg-white p-6 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-navy-500 uppercase tracking-wider">Deck Branding</h2>
              <p className="text-xs text-navy-400 mt-1">
                Control how PitchIQ branding appears on your decks and exports.
              </p>
            </div>

            {/* Branding toggle */}
            <div className="flex items-center justify-between gap-4 py-3 border-b border-navy-100">
              <div>
                <p className="text-sm font-medium text-navy">
                  Show &ldquo;Made with PitchIQ&rdquo;
                </p>
                <p className="text-xs text-navy-400 mt-0.5">
                  Displayed on shared decks and PDF exports
                </p>
              </div>
              {canCustomizeBranding ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={brandingEnabled}
                  onClick={() => setBrandingEnabled(!brandingEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    brandingEnabled ? "bg-electric" : "bg-navy-200"
                  }`}
                  aria-label={brandingEnabled ? "PitchIQ branding is shown — click to hide" : "PitchIQ branding is hidden — click to show"}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
                      brandingEnabled ? "translate-x-5" : "translate-x-0.5"
                    } mt-0.5`}
                  />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-electric/10 text-electric uppercase tracking-wide">
                    Pro
                  </span>
                  <div
                    className="relative inline-flex h-6 w-11 shrink-0 rounded-full bg-navy-100 cursor-not-allowed opacity-50"
                    aria-label="Upgrade to Pro to toggle branding"
                  >
                    <span className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm translate-x-5 mt-0.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Custom company name */}
            <div className="space-y-1.5">
              <label htmlFor="customCompanyName" className="text-sm font-medium text-navy">
                Custom company name
              </label>
              <p className="text-xs text-navy-400">
                Override the company name shown in branding
              </p>
              <input
                id="customCompanyName"
                type="text"
                value={customCompanyName}
                onChange={(e) => setCustomCompanyName(e.target.value)}
                disabled={!canCustomizeBranding}
                placeholder="Your Company"
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm text-navy outline-none transition-colors focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-navy-50"
              />
            </div>

            {/* Custom logo URL */}
            <div className="space-y-1.5">
              <label htmlFor="customLogoUrl" className="text-sm font-medium text-navy">
                Custom logo URL
              </label>
              <p className="text-xs text-navy-400">
                Direct link to your logo image (PNG or SVG recommended)
              </p>
              <input
                id="customLogoUrl"
                type="url"
                value={customLogoUrl}
                onChange={(e) => setCustomLogoUrl(e.target.value)}
                disabled={!canCustomizeBranding}
                placeholder="https://example.com/logo.png"
                maxLength={500}
                className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm text-navy outline-none transition-colors focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-navy-50"
              />
            </div>

            {/* Custom accent color */}
            <div className="space-y-1.5">
              <label htmlFor="customAccentColor" className="text-sm font-medium text-navy">
                Accent color
              </label>
              <p className="text-xs text-navy-400">
                Hex color for branding accent (e.g. #3B82F6)
              </p>
              <div className="flex items-center gap-3">
                <input
                  id="customAccentColor"
                  type="text"
                  value={customAccentColor}
                  onChange={(e) => setCustomAccentColor(e.target.value)}
                  disabled={!canCustomizeBranding}
                  placeholder="#3B82F6"
                  maxLength={7}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-navy-200 text-sm text-navy font-mono outline-none transition-colors focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-navy-50"
                />
                {customAccentColor && /^#[0-9a-fA-F]{6}$/.test(customAccentColor) && (
                  <div
                    className="w-10 h-10 rounded-xl border border-navy-200 shrink-0"
                    style={{ backgroundColor: customAccentColor }}
                    aria-label={`Preview of accent color ${customAccentColor}`}
                  />
                )}
              </div>
            </div>

            {/* Free tier upgrade prompt */}
            {!canCustomizeBranding && (
              <div className="rounded-xl border border-electric/15 bg-electric/[0.03] p-4">
                <p className="text-sm text-navy-600">
                  <span className="font-semibold">Upgrade to Pro</span> to remove PitchIQ branding, add your company logo, and customize accent colors on exported decks.
                </p>
                <Link
                  href="/billing"
                  className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  aria-label="View plans and upgrade"
                >
                  View Plans
                </Link>
              </div>
            )}

            {/* Save button */}
            {canCustomizeBranding && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  aria-busy={saving}
                  aria-label={saving ? "Saving settings…" : "Save branding settings"}
                  className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 disabled:cursor-wait"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving…
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border border-navy-200 bg-white p-6">
            <h2 className="text-sm font-bold text-navy-500 uppercase tracking-wider mb-4">Account</h2>
            <div className="space-y-1">
              <Link
                href="/billing"
                className="flex items-center justify-between min-h-[44px] px-4 py-3 rounded-xl hover:bg-navy-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-inset"
                aria-label="Go to billing"
              >
                <span className="text-sm text-navy font-medium">Billing & Subscription</span>
                <svg className="w-4 h-4 text-navy-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-between min-h-[44px] px-4 py-3 rounded-xl hover:bg-navy-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-inset"
                aria-label="Go to dashboard"
              >
                <span className="text-sm text-navy font-medium">Dashboard</span>
                <svg className="w-4 h-4 text-navy-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Back to dashboard */}
          <div className="text-center">
            <Link
              href="/dashboard"
              aria-label="Back to dashboard"
              className="text-sm text-navy-500 hover:text-electric font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

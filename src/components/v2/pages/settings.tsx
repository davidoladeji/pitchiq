"use client";

import { useState } from "react";
import { mockUserProfile, mockNotificationPrefs } from "@/lib/mock-data";

import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/v2/ui/card";
import { Input } from "@/components/v2/ui/input";

/* ────────────────────── Toggle Switch ────────────────────── */

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors"
      style={{ background: checked ? "var(--neon-electric)" : "rgba(255,255,255,0.1)" }}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ──────────────────── Notification Row ───────────────────── */

function NotificationRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--void-text-muted)" }}>{label}</p>
        <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ──────────────────────── Accent Colors ─────────────────── */

const ACCENT_COLORS = [
  { name: "primary", color: "var(--neon-electric)" },
  { name: "success", color: "var(--neon-emerald)" },
  { name: "warning", color: "#FBBF24" },
  { name: "error", color: "#F87171" },
  { name: "neutral", color: "rgba(255,255,255,0.4)" },
  { name: "violet", color: "var(--neon-violet)" },
];

/* ═══════════════════════ Settings Page ═══════════════════════ */

export default function SettingsPage() {
  const [selectedColor, setSelectedColor] = useState("primary");
  const [removeBranding, setRemoveBranding] = useState(false);
  const [notifs, setNotifs] = useState(mockNotificationPrefs);

  const updateNotif = (key: keyof typeof notifs, value: boolean) =>
    setNotifs((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <h1 className="text-2xl font-bold" style={{ color: "var(--void-text)" }}>Settings</h1>

      {/* ─── Section 1: Profile ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: "rgba(67,97,238,0.15)" }}>
            <span className="text-xl font-bold" style={{ color: "var(--neon-cyan)" }}>
              {mockUserProfile.name.charAt(0)}
            </span>
          </div>

          <Input label="Full Name" defaultValue={mockUserProfile.name} />
          <Input label="Email" defaultValue={mockUserProfile.email} />
          <Input label="Company" defaultValue={mockUserProfile.company} />

          <Button className="mt-4">Save Changes</Button>
        </CardContent>
      </Card>

      {/* ─── Section 2: Branding ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Branding</CardTitle>
            <Badge variant="primary">Growth+</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Company Name" placeholder="Enter company name" />

          {/* Logo upload */}
          <div>
            <p className="mb-1.5 text-sm font-medium" style={{ color: "var(--void-text-muted)" }}>Logo</p>
            <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed" style={{ borderColor: "var(--void-border)" }}>
              <span className="text-sm" style={{ color: "var(--void-text-dim)" }}>
                Drop logo here or click to upload
              </span>
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <p className="mb-1.5 text-sm font-medium" style={{ color: "var(--void-text-muted)" }}>
              Accent Color
            </p>
            <div className="flex gap-3">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  className="h-8 w-8 rounded-full transition-shadow"
                  style={{
                    background: c.color,
                    boxShadow: selectedColor === c.name ? `0 0 0 2px var(--void-1), 0 0 0 4px ${c.color}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Remove branding toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: "var(--void-text-muted)" }}>
              Remove PitchIQ branding
            </span>
            <Toggle checked={removeBranding} onChange={setRemoveBranding} />
          </div>
        </CardContent>
      </Card>

      {/* ─── Section 3: Startup Profile ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Startup Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: "var(--void-text-muted)" }}>
            You have 1 startup profile configured.
          </p>
          <Button variant="outline" className="mt-3">
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* ─── Section 4: Notifications ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y" style={{ borderColor: "var(--void-border)" }}>
            <NotificationRow
              label="Deck Viewed"
              description="Get notified when someone views your deck"
              checked={notifs.deckViewed}
              onChange={(v) => updateNotif("deckViewed", v)}
            />
            <NotificationRow
              label="Score Updated"
              description="Get notified when your PIQ score changes"
              checked={notifs.scoreUpdated}
              onChange={(v) => updateNotif("scoreUpdated", v)}
            />
            <NotificationRow
              label="Investor Match"
              description="Get notified of new investor matches"
              checked={notifs.investorMatch}
              onChange={(v) => updateNotif("investorMatch", v)}
            />
            <NotificationRow
              label="Weekly Digest"
              description="Receive a weekly summary email"
              checked={notifs.weeklyDigest}
              onChange={(v) => updateNotif("weeklyDigest", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Section 5: Danger Zone ─── */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: "var(--void-text-muted)" }}>
            Permanently delete your account and all associated data.
          </p>
          <Button variant="destructive" className="mt-3">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

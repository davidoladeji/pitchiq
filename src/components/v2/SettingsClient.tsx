"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, Palette, Save, Loader2, Check } from "lucide-react";
import AppShellV2 from "./shell/AppShell";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

interface Props {
  name: string | null;
  email: string;
  image: string | null;
  plan: string;
  brandingEnabled: boolean;
  customLogoUrl: string | null;
  customCompanyName: string | null;
  customAccentColor: string | null;
}

type Tab = "profile" | "branding";

export default function SettingsV2(props: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile form
  const [name, setName] = useState(props.name || "");
  // Branding form
  const [companyName, setCompanyName] = useState(props.customCompanyName || "");
  const [accentColor, setAccentColor] = useState(props.customAccentColor || "#4361ee");
  const [logoUrl, setLogoUrl] = useState(props.customLogoUrl || "");

  const handleSaveProfile = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* */ }
    setSaving(false);
  }, [name]);

  const handleSaveBranding = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/settings/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customCompanyName: companyName, customAccentColor: accentColor, customLogoUrl: logoUrl }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* */ }
    setSaving(false);
  }, [companyName, accentColor, logoUrl]);

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "branding", label: "Branding", icon: Palette },
  ];

  return (
    <AppShellV2
      userName={props.name || undefined}
      userPlan={props.plan}
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your account and preferences</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-neutral-200">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  active
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile tab */}
        {activeTab === "profile" && (
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-700">
                {(props.name || props.email || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-neutral-900">{props.name || "No name set"}</p>
                <p className="text-sm text-neutral-500">{props.email}</p>
                <Badge variant="primary" size="sm" className="mt-1">{props.plan}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Display Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Email</label>
                <Input value={props.email} disabled className="opacity-60" />
                <p className="text-[10px] text-neutral-400 mt-1">Email cannot be changed</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : saved ? <Check size={14} className="mr-1" /> : <Save size={14} className="mr-1" />}
                {saved ? "Saved!" : "Save Profile"}
              </Button>
              <Button variant="outline" onClick={() => router.push("/billing")}>
                {props.plan === "starter" ? "Upgrade Plan" : "Manage Billing"}
              </Button>
            </div>
          </Card>
        )}

        {/* Branding tab */}
        {activeTab === "branding" && (
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Deck Branding</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Customize how your shared decks look to viewers</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Company Name (on shared decks)</label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer"
                  />
                  <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-28 font-mono text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Logo URL</label>
                <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
                {logoUrl && (
                  <div className="mt-2 w-12 h-12 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center overflow-hidden">
                    <img src={logoUrl} alt="Logo preview" className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleSaveBranding} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : saved ? <Check size={14} className="mr-1" /> : <Save size={14} className="mr-1" />}
              {saved ? "Saved!" : "Save Branding"}
            </Button>
          </Card>
        )}

      </div>
    </AppShellV2>
  );
}

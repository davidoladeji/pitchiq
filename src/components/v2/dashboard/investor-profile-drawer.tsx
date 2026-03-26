"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Globe, MapPin, DollarSign, Target, Building2,
  TrendingUp, Users, Briefcase, CheckCircle, ExternalLink,
  Loader2, Bookmark,
} from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InvestorProfile {
  id: string;
  name: string;
  type: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  thesis?: string;
  stages: string[];
  sectors: string[];
  geographies: string[];
  chequeMin?: number;
  chequeMax?: number;
  country?: string;
  city?: string;
  businessModels: string[];
  customerTypes: string[];
  dealStructures: string[];
  valuationMin?: number;
  valuationMax?: number;
  minRevenue?: number;
  minGrowthRate?: number;
  fundSize?: number;
  fundVintage?: number;
  deploymentPace?: string;
  averageCheckCount?: number;
  leadPreference?: string;
  boardSeatRequired?: boolean;
  syndicateOpen?: boolean;
  followOnReserve?: boolean;
  impactFocus?: boolean;
  diversityLens?: boolean;
  thesisKeywords: string[];
  portfolioCompanies: string[];
}

interface InvestorProfileDrawerProps {
  investorId: string | null;
  fitScore?: number;
  onClose: () => void;
  onSaveToPipeline?: (name: string, id: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function InvestorProfileDrawer({ investorId, fitScore, onClose, onSaveToPipeline }: InvestorProfileDrawerProps) {
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!investorId) { setProfile(null); return; }
    setLoading(true);
    setError("");
    fetch(`/api/investor-profiles/${investorId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load profile");
        return r.json();
      })
      .then((data) => { setProfile(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [investorId]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const formatCurrency = (v?: number) => {
    if (!v) return null;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toLocaleString()}`;
  };

  return (
    <AnimatePresence>
      {investorId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/30"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[45%] sm:min-w-[400px] sm:max-w-[600px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">Investor Profile</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={24} className="animate-spin text-primary-500" />
                </div>
              )}

              {error && (
                <div className="p-6 text-center">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {profile && !loading && (
                <div className="p-6 space-y-6">
                  {/* Identity */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      {profile.logoUrl ? (
                        <img src={profile.logoUrl} alt={profile.name} className="w-10 h-10 rounded-lg object-contain" />
                      ) : (
                        <Building2 size={24} className="text-primary-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-neutral-900">{profile.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant={profile.type === "vc" ? "primary" : profile.type === "angel" ? "warning" : "success"}>
                          {profile.type}
                        </Badge>
                        {profile.city && profile.country && (
                          <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                            <MapPin size={12} /> {profile.city}, {profile.country}
                          </span>
                        )}
                        {fitScore && (
                          <Badge variant={fitScore >= 70 ? "success" : fitScore >= 50 ? "warning" : "default"}>
                            {fitScore}% fit
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {profile.description && (
                    <p className="text-sm text-neutral-600 leading-relaxed">{profile.description}</p>
                  )}

                  {/* Thesis */}
                  {profile.thesis && (
                    <Section title="Investment Thesis" icon={Target}>
                      <p className="text-sm text-neutral-600 leading-relaxed">{profile.thesis}</p>
                    </Section>
                  )}

                  {/* Cheque & Fund */}
                  <Section title="Investment Range" icon={DollarSign}>
                    <div className="grid grid-cols-2 gap-3">
                      {(profile.chequeMin || profile.chequeMax) && (
                        <InfoCard label="Cheque Size" value={`${formatCurrency(profile.chequeMin) || "?"} – ${formatCurrency(profile.chequeMax) || "?"}`} />
                      )}
                      {profile.fundSize && <InfoCard label="Fund Size" value={formatCurrency(profile.fundSize) || ""} />}
                      {profile.fundVintage && <InfoCard label="Fund Vintage" value={String(profile.fundVintage)} />}
                      {profile.averageCheckCount && <InfoCard label="Deals/Year" value={`~${profile.averageCheckCount}`} />}
                      {profile.leadPreference && <InfoCard label="Lead Preference" value={profile.leadPreference.replace(/-/g, " ")} />}
                      {profile.deploymentPace && <InfoCard label="Deployment" value={profile.deploymentPace} />}
                    </div>
                  </Section>

                  {/* Stages & Sectors */}
                  {profile.stages.length > 0 && (
                    <Section title="Target Stages" icon={TrendingUp}>
                      <TagList items={profile.stages} />
                    </Section>
                  )}

                  {profile.sectors.length > 0 && (
                    <Section title="Focus Sectors" icon={Briefcase}>
                      <TagList items={profile.sectors} />
                    </Section>
                  )}

                  {profile.geographies.length > 0 && (
                    <Section title="Geographies" icon={Globe}>
                      <TagList items={profile.geographies} />
                    </Section>
                  )}

                  {/* Preferences */}
                  {(profile.businessModels.length > 0 || profile.customerTypes.length > 0 || profile.dealStructures.length > 0) && (
                    <Section title="Preferences" icon={Users}>
                      <div className="space-y-2">
                        {profile.businessModels.length > 0 && (
                          <div>
                            <p className="text-[11px] text-neutral-400 uppercase tracking-wide mb-1">Business Models</p>
                            <TagList items={profile.businessModels} />
                          </div>
                        )}
                        {profile.customerTypes.length > 0 && (
                          <div>
                            <p className="text-[11px] text-neutral-400 uppercase tracking-wide mb-1">Customer Types</p>
                            <TagList items={profile.customerTypes} />
                          </div>
                        )}
                        {profile.dealStructures.length > 0 && (
                          <div>
                            <p className="text-[11px] text-neutral-400 uppercase tracking-wide mb-1">Deal Structures</p>
                            <TagList items={profile.dealStructures} />
                          </div>
                        )}
                      </div>
                    </Section>
                  )}

                  {/* Thesis Keywords */}
                  {profile.thesisKeywords.length > 0 && (
                    <Section title="Thesis Keywords" icon={CheckCircle}>
                      <TagList items={profile.thesisKeywords} variant="primary" />
                    </Section>
                  )}

                  {/* Flags */}
                  {(profile.impactFocus || profile.diversityLens || profile.syndicateOpen || profile.boardSeatRequired) && (
                    <Section title="Special Flags" icon={CheckCircle}>
                      <div className="flex flex-wrap gap-2">
                        {profile.impactFocus && <Badge variant="success">Impact Focus</Badge>}
                        {profile.diversityLens && <Badge variant="success">Diversity Lens</Badge>}
                        {profile.syndicateOpen && <Badge variant="primary">Syndicate Open</Badge>}
                        {profile.boardSeatRequired && <Badge variant="warning">Board Seat Required</Badge>}
                        {profile.followOnReserve && <Badge variant="default">Follow-On Reserve</Badge>}
                      </div>
                    </Section>
                  )}

                  {/* Portfolio */}
                  {profile.portfolioCompanies.length > 0 && (
                    <Section title="Portfolio Companies" icon={Building2}>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.portfolioCompanies.slice(0, 12).map((c, i) => (
                          <span key={i} className="px-2 py-1 rounded-md bg-neutral-50 text-xs text-neutral-700 border border-neutral-100">{c}</span>
                        ))}
                        {profile.portfolioCompanies.length > 12 && (
                          <span className="px-2 py-1 text-xs text-neutral-400">+{profile.portfolioCompanies.length - 12} more</span>
                        )}
                      </div>
                    </Section>
                  )}
                </div>
              )}
            </div>

            {/* Footer actions */}
            {profile && (
              <div className="px-6 py-4 border-t border-neutral-100 flex items-center gap-3">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                  >
                    <ExternalLink size={14} /> Website
                  </a>
                )}
                <Button
                  className="flex-1"
                  onClick={() => onSaveToPipeline?.(profile.name, profile.id)}
                >
                  <Bookmark size={14} className="mr-1.5" /> Save to Pipeline
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-neutral-400" />
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
      <p className="text-[11px] text-neutral-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-neutral-800 mt-0.5 capitalize">{value}</p>
    </div>
  );
}

function TagList({ items, variant = "default" }: { items: string[]; variant?: "default" | "primary" }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={i}
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium capitalize",
            variant === "primary"
              ? "bg-primary-50 text-primary-700 border border-primary-100"
              : "bg-neutral-50 text-neutral-600 border border-neutral-100",
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

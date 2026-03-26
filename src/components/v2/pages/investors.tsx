"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserCheck } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { relativeTime } from "@/lib/cn";

import { Card, CardHeader, CardTitle } from "@/components/v2/ui/card";
import { Badge } from "@/components/v2/ui/badge";
import { Input } from "@/components/v2/ui/input";

import type { InvestorMatch, InvestorContact } from "@/types";

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<InvestorMatch[]>([]);
  const [contacts, setContacts] = useState<InvestorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/v2/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setInvestors(d.investors || []);
        setContacts(d.investorContacts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredContacts = contacts.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.firm.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="section-gap">
        <div className="h-8 w-48 bg-surface-muted rounded-lg animate-pulse" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-surface-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="section-gap">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Investor Matches</h2>
          <p className="text-sm text-neutral-500 mt-1">{investors.length} matches found</p>
        </div>
      </motion.div>

      {investors.length > 0 && (
        <motion.div variants={fadeInUp} className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {investors.map((inv) => (
            <Card key={inv.id} className="hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
                    {inv.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm">{inv.name}</CardTitle>
                    <p className="text-xs text-neutral-500">{inv.type}</p>
                  </div>
                  <Badge variant="primary">{inv.fitScore}% fit</Badge>
                </div>
              </CardHeader>
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-1">
                  {inv.matchReasons.map((r, i) => (
                    <span key={i} className="px-2 py-0.5 bg-surface-muted rounded text-xs text-neutral-600">{r}</span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      <motion.div variants={fadeInUp}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">CRM Contacts ({contacts.length})</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm w-48" />
          </div>
        </div>

        {filteredContacts.length === 0 ? (
          <Card className="text-center py-8">
            <UserCheck size={24} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No investor contacts yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredContacts.map((c) => (
              <Card key={c.id} className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-xs font-semibold text-primary-600">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{c.name}</p>
                  <p className="text-xs text-neutral-500">{c.firm}</p>
                </div>
                <Badge variant={c.stage === "meeting" ? "success" : c.stage === "contacted" ? "warning" : "default"}>
                  {c.stage}
                </Badge>
                <span className="text-xs text-neutral-400">{relativeTime(c.lastUpdated)}</span>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

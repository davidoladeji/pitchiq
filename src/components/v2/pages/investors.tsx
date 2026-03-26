"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Inbox } from "lucide-react";

import { cn, relativeTime } from "@/lib/cn";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { mockInvestors, mockInvestorContacts } from "@/lib/mock-data";
import type { InvestorMatch, InvestorContact } from "@/types";

import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card } from "@/components/v2/ui/card";
import { Select } from "@/components/v2/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/v2/ui/tabs";
import { EmptyState } from "@/components/v2/ui/empty-state";

const typeOptions = [
  { value: "all", label: "All" },
  { value: "vc", label: "VC" },
  { value: "accelerator", label: "Accelerator" },
  { value: "angel", label: "Angel" },
];

const sortOptions = [
  { value: "fitScore", label: "Fit Score" },
  { value: "name", label: "Name" },
];

const PIPELINE_STAGES: {
  key: InvestorContact["stage"];
  label: string;
}[] = [
  { key: "identified", label: "Identified" },
  { key: "contacted", label: "Contacted" },
  { key: "meeting", label: "Meeting" },
  { key: "due_diligence", label: "Due Diligence" },
  { key: "term_sheet", label: "Term Sheet" },
];

function getScoreBarColor(score: number): string {
  if (score >= 85) return "bg-success-500";
  if (score >= 70) return "bg-primary-500";
  if (score >= 50) return "bg-warning-500";
  return "bg-error-500";
}

export default function InvestorsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("fitScore");

  const filteredInvestors = useMemo(() => {
    let result = mockInvestors.filter((inv: InvestorMatch) => {
      return typeFilter === "all" || inv.type === typeFilter;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "fitScore") return b.fitScore - a.fitScore;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [typeFilter, sortBy]);

  const contactsByStage = useMemo(() => {
    const map: Record<string, InvestorContact[]> = {};
    for (const stage of PIPELINE_STAGES) {
      map[stage.key] = mockInvestorContacts.filter((c) => c.stage === stage.key);
    }
    return map;
  }, []);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-neutral-900">Investors</h1>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="matched">
        <motion.div variants={fadeInUp}>
          <TabsList>
            <TabsTrigger value="matched">Matched Investors</TabsTrigger>
            <TabsTrigger value="pipeline">My Pipeline</TabsTrigger>
          </TabsList>
        </motion.div>

        {/* Matched Investors Tab */}
        <TabsContent value="matched">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {/* Filter row */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-44">
                <Select
                  options={typeOptions}
                  value={typeFilter}
                  onChange={setTypeFilter}
                />
              </div>
              <div className="w-full sm:w-44">
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                />
              </div>
            </motion.div>

            {/* Investor cards */}
            {filteredInvestors.map((investor) => (
              <motion.div key={investor.id} variants={fadeInUp}>
                <Card className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Left */}
                    <div className="flex-shrink-0 md:w-52">
                      <h3 className="font-semibold text-lg text-neutral-900">
                        {investor.name}
                      </h3>
                      <Badge variant="primary" size="sm" className="mt-1">
                        {investor.type.toUpperCase()}
                      </Badge>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-neutral-100">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all",
                              getScoreBarColor(investor.fitScore)
                            )}
                            style={{ width: `${investor.fitScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-neutral-700">
                          {investor.fitScore}%
                        </span>
                      </div>
                    </div>

                    {/* Middle */}
                    <div className="flex-1">
                      <ul className="space-y-1">
                        {investor.matchReasons.map((reason) => (
                          <li
                            key={reason}
                            className="flex items-center gap-2 text-sm text-neutral-600"
                          >
                            <CheckCircle className="h-4 w-4 text-success-500 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right */}
                    <div className="flex-shrink-0">
                      <Button variant="outline">Save to Pipeline</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline">
          <motion.div
            variants={fadeInUp}
            className="overflow-x-auto"
          >
            <div className="grid grid-cols-5 gap-3 min-w-[800px]">
              {PIPELINE_STAGES.map((stage) => {
                const contacts = contactsByStage[stage.key] || [];
                return (
                  <div key={stage.key} className="space-y-3">
                    {/* Column header */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-700">
                        {stage.label}
                      </span>
                      <Badge size="sm">{contacts.length}</Badge>
                    </div>

                    {/* Contact cards */}
                    {contacts.length === 0 ? (
                      <EmptyState
                        icon={Inbox}
                        title="No contacts"
                        description={`No investors in ${stage.label} yet.`}
                        className="py-8"
                      />
                    ) : (
                      contacts.map((contact) => (
                        <Card key={contact.id} className="p-3">
                          <p className="font-medium text-neutral-900">
                            {contact.name}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {contact.firm}
                          </p>
                          <p className="mt-1 text-xs text-neutral-400 truncate">
                            {contact.notes}
                          </p>
                          <p className="mt-2 text-xs text-neutral-400">
                            {relativeTime(contact.lastUpdated)}
                          </p>
                        </Card>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

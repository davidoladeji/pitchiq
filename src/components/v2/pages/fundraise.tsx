"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/v2/ui/card";
import { mockInvestorContacts, mockPipelineActivity } from "@/lib/mock-data";
import { relativeTime } from "@/lib/cn";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const STAGES = [
  { key: "identified", label: "Identified", color: "bg-primary-300" },
  { key: "contacted", label: "Contacted", color: "bg-primary-400" },
  { key: "meeting", label: "Meeting", color: "bg-primary-500" },
  { key: "due_diligence", label: "Due Diligence", color: "bg-primary-600" },
  { key: "term_sheet", label: "Term Sheet", color: "bg-primary-700" },
] as const;

function contactsByStage(stage: string) {
  return mockInvestorContacts.filter((c) => c.stage === stage);
}

export default function FundraisePage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-neutral-900">Fundraise Tracker</h1>
          <Badge>{mockInvestorContacts.length} contacts</Badge>
        </div>
        <Button variant="default">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </motion.div>

      {/* Pipeline summary bar */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
        {STAGES.map((stage) => {
          const count = contactsByStage(stage.key).length;
          return (
            <div key={stage.key} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
              <span className="text-sm text-neutral-600">{stage.label}</span>
              <Badge variant="primary" size="sm">
                {count}
              </Badge>
            </div>
          );
        })}
      </motion.div>

      {/* Kanban board */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5"
      >
        {STAGES.map((stage) => {
          const contacts = contactsByStage(stage.key);
          return (
            <Card key={stage.key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{stage.label}</span>
                  <Badge variant="primary">{contacts.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {contacts.length === 0 ? (
                  <p className="text-xs text-neutral-400">No contacts</p>
                ) : (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="rounded-lg border p-3 bg-surface-page"
                    >
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-neutral-500">{contact.firm}</p>
                      {contact.notes && (
                        <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                          {contact.notes}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-neutral-400">
                        {relativeTime(contact.lastUpdated)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Activity log */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {mockPipelineActivity.map((activity, i) => (
              <div key={activity.id}>
                <div className="flex items-start justify-between py-3">
                  <p className="text-sm">{activity.description}</p>
                  <span className="shrink-0 text-xs text-neutral-400 ml-4">
                    {relativeTime(activity.timestamp)}
                  </span>
                </div>
                {i < mockPipelineActivity.length - 1 && (
                  <div className="h-px bg-neutral-100" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

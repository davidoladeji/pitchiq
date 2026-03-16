"use client";

import { TEMPLATES, type DeckTemplate } from "@/lib/templates";

export default function TemplateBrowser({
  onSelect,
  disabled = false,
}: {
  onSelect: (template: DeckTemplate) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-navy mb-1">Start from a template</h3>
        <p className="text-xs text-navy-500">
          Pre-built decks for common startup types. Your details will be filled in automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            disabled={disabled}
            className={`text-left rounded-xl border border-navy-100 bg-white p-4 hover:border-electric/30 hover:shadow-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${template.bg} flex items-center justify-center shrink-0`}>
                <svg className={`w-5 h-5 ${template.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={template.icon} />
                </svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-navy group-hover:text-electric transition-colors">
                  {template.name}
                </h4>
                <p className="text-xs text-navy-500 mt-0.5 line-clamp-2">
                  {template.description}
                </p>
                <span className="inline-block mt-1.5 text-[10px] font-medium text-navy-400 bg-navy-50 px-2 py-0.5 rounded">
                  {template.slides.length} slides · {template.industry}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

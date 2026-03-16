import React from "react";

export const inputClass =
  "w-full px-4 py-3.5 rounded-xl border border-navy-200 bg-white focus:border-electric focus:ring-2 focus:ring-electric/10 outline-none transition-all text-navy placeholder:text-navy-500 text-sm";

export default function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-navy">
        {label}{" "}
        {required && <span className="text-electric text-xs">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-navy-500 pl-1">{hint}</p>}
    </div>
  );
}

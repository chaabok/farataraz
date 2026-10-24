"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { FormFieldWrapper } from "./FormFieldWrapper";

interface GlobalSearchProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function GlobalSearch({
  label,
  value,
  onChange,
  placeholder = "جستجوی کلی...",
  error,
  required
}: GlobalSearchProps) {
  return (
    <FormFieldWrapper label={label} error={error} required={required}>
      <div className="relative group">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <Search className="w-3.5 h-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full ps-9 pe-9 h-[25px] text-[11px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute inset-y-0 end-0 flex items-center pe-3 hover:text-red-500 text-gray-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </FormFieldWrapper>
  );
}

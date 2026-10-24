"use client";

import React from "react";
import { Mail } from "lucide-react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/lib/utils";

interface EmailInputProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  labelWidth?: string;
  alignVertical?: boolean;
}

export function EmailInput({ label, value, onChange, placeholder, required, error, labelWidth, alignVertical }: EmailInputProps) {
  return (
    <FormFieldWrapper label={label} required={required} error={error} labelWidth={labelWidth} alignVertical={alignVertical}>
      <div className="relative">
        <Mail className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="email"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "example@email.com"}
          dir="ltr"
          autoComplete="off"
          className={cn(
            "w-full pl-10 pr-10 h-[25px] text-[11px] bg-gray-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400",
            error 
              ? "border-rose-500 ring-rose-500/20 ring-1" 
              : ""
          )}
        />
      </div>
    </FormFieldWrapper>
  );
}

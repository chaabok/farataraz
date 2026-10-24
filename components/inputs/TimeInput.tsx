"use client";

import React from "react";
import { Clock } from "lucide-react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/lib/utils";

interface TimeInputProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  error?: string;
  labelWidth?: string;
  alignVertical?: boolean;
}

export function TimeInput({ label, value, onChange, required, error, labelWidth, alignVertical }: TimeInputProps) {
  return (
    <FormFieldWrapper label={label} required={required} error={error} labelWidth={labelWidth} alignVertical={alignVertical}>
      <div className="relative">
        <input
          type="time"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className={cn(
            "w-full pe-10 ps-4 h-[25px] text-[11px] bg-gray-50/50 dark:bg-slate-800/50 border rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400 cursor-pointer block",
            error 
              ? "border-rose-500 ring-rose-500/20 ring-1" 
              : "border-gray-200 dark:border-slate-700"
          )}
        />
        <Clock className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </FormFieldWrapper>
  );
}

"use client";

import React from "react";
import { Check } from "lucide-react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface MultiCheckboxProps {
  label?: string;
  values: string[];
  onChange: (vals: string[]) => void;
  options: Option[];
  required?: boolean;
  error?: string;
  labelWidth?: string;
  alignVertical?: boolean;
  disabled?: boolean;
}

export function MultiCheckbox({ label, values, onChange, options, required, error, labelWidth, alignVertical, disabled }: MultiCheckboxProps) {
  const toggle = (val: string) => {
    if (disabled) return;
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  return (
    <FormFieldWrapper label={label} required={required} error={error} alignTop={options.length > 1} labelWidth={labelWidth} alignVertical={alignVertical}>
      <div className={cn(
        "flex flex-wrap gap-4 pt-1 px-2 rounded-lg transition-all",
        error ? "border border-rose-500/50 ring-1 ring-rose-500/20" : "",
        disabled ? "opacity-60 pointer-events-none" : ""
      )}>
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={values.includes(option.value)}
                onChange={() => toggle(option.value)}
                className={cn(
                  "peer shrink-0 appearance-none w-4 h-4 rounded border bg-white dark:bg-slate-800 checked:bg-indigo-500 checked:border-indigo-500 focus:outline-none transition-all",
                  error ? "border-rose-500" : "border-gray-300 dark:border-slate-600"
                )}
              />
              <Check className={cn("absolute w-3 h-3 text-white transition-transform stroke-[3]", values.includes(option.value) ? "scale-100" : "scale-0")} />
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </FormFieldWrapper>
  );
}

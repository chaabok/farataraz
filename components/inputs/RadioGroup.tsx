"use client";

import React from "react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string | number;
}

interface RadioGroupProps {
  label?: string;
  value: string | number;
  onChange: (val: any) => void;
  options: Option[];
  required?: boolean;
  error?: string;
  name: string;
  labelWidth?: string;
  alignVertical?: boolean;
  containerClassName?: string;
  disabled?: boolean;
}

export function RadioGroup({ label, value, onChange, options, required, error, name, labelWidth, alignVertical, containerClassName, disabled }: RadioGroupProps) {
  return (
    <FormFieldWrapper label={label} required={required} error={error} alignTop={options.length > 1} labelWidth={labelWidth} alignVertical={alignVertical}>
      <div className={cn(
        "flex flex-wrap gap-4 pt-1 px-2 rounded-lg transition-all",
        containerClassName || "",
        error ? "border border-rose-500/50 ring-1 ring-rose-500/20" : ""
      )}>
        {options.map((option) => (
          <label 
            key={option.value} 
            className={cn(
              "flex items-center gap-2 select-none",
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer group"
            )}
          >
            <div className="relative flex items-center justify-center">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => !disabled && onChange(option.value)}
                disabled={disabled}
                className={cn(
                  "peer shrink-0 appearance-none w-4 h-4 rounded-full border bg-white dark:bg-slate-800 checked:border-indigo-500 focus:outline-none transition-all disabled:border-slate-300 dark:disabled:border-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-900",
                  error ? "border-rose-500" : "border-gray-300 dark:border-slate-600"
                )}
              />
              <div className={cn(
                "absolute w-2 h-2 rounded-full transition-transform",
                value === option.value ? "scale-100" : "scale-0",
                disabled ? "bg-slate-400 dark:bg-slate-500" : "bg-indigo-500"
              )} />
            </div>
            <span className={cn(
              "text-sm transition-colors",
              disabled 
                ? "text-slate-400 dark:text-slate-500" 
                : "text-slate-700 dark:text-slate-300 group-hover:text-indigo-500"
            )}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </FormFieldWrapper>
  );
}

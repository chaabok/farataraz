"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/lib/utils";

interface Option {
  label?: string;
  value?: string | number;
  id?: string | number;
  title?: string;
  name?: string;
  hidden?: boolean;
}

interface SelectProps {
  label?: string;
  value: string | number;
  onChange: (val: string) => void;
  options: (Option | any)[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  labelWidth?: string;
  alignVertical?: boolean;
}

export function Select({ label, value, onChange, options = [], required, error, disabled, placeholder, labelWidth, alignVertical }: SelectProps) {
  return (
    <FormFieldWrapper label={label} required={required} error={error} labelWidth={labelWidth} alignVertical={alignVertical}>
      <div className="relative">
        <select
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full pe-10 ps-4 h-[25px] text-[11px] bg-gray-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 transition-all outline-none appearance-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
            error 
              ? "border-rose-500 ring-rose-500/20 ring-1" 
              : ""
          )}
        >
          {placeholder && <option key="select_placeholder" value="">{placeholder}</option>}
          {options.map((opt: any, idx: number) => {
            const optValue = opt.value !== undefined ? opt.value : (opt.id !== undefined ? opt.id : "");
            const optLabel = opt.label !== undefined ? opt.label : (opt.title !== undefined ? opt.title : (opt.name !== undefined ? opt.name : String(optValue)));
            return (
              <option key={optValue !== "" ? `opt_${optValue}_${idx}` : `opt_${idx}`} value={optValue} hidden={opt.hidden}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <ChevronDown className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </FormFieldWrapper>
  );
}

"use client";

import React from "react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/lib/utils";

interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  error?: string;
  rows?: number;
  labelWidth?: string;
  alignVertical?: boolean;
  className?: string;
  isDescription?: boolean;
  name?: string;
}

export function TextArea({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required, 
  disabled,
  minLength, 
  maxLength, 
  error, 
  rows = 1,
  labelWidth,
  alignVertical,
  className,
  isDescription,
  name
}: TextAreaProps) {
  return (
    <FormFieldWrapper 
      label={label} 
      required={required} 
      error={error} 
      alignTop={false} 
      labelWidth={labelWidth} 
      alignVertical={alignVertical}
      isDescription={isDescription}
      name={name}
    >
      <textarea
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        rows={1}
        className={cn(
          "w-full px-3 h-[25px] text-[11px] bg-gray-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400 resize-none overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed py-0 leading-[25px]",
          error 
            ? "border-rose-500 ring-rose-500/20 ring-1" 
            : "",
          className
        )}
      />
    </FormFieldWrapper>
  );
}

export const TextareaInput = TextArea;
export type TextareaInputProps = TextAreaProps;

"use client";

import React from "react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/lib/utils";

interface TextInputProps {
  label?: string;
  value?: string;
  onChange?: (val: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  error?: string;
  labelWidth?: string;
  alignVertical?: boolean;
  id?: string;
  type?: string;
  dir?: "ltr" | "rtl" | "auto" | string;
  name?: string;
  className?: string;
  labelClassName?: string;
  isDescription?: boolean;
}

export function TextInput({ 
  label, 
  value = "", 
  onChange = () => {}, 
  onBlur,
  placeholder, 
  required, 
  disabled,
  minLength, 
  maxLength, 
  error,
  labelWidth,
  alignVertical,
  id,
  type = "text",
  dir,
  name,
  className,
  labelClassName,
  isDescription
}: TextInputProps) {
  return (
    <FormFieldWrapper 
      label={label} 
      required={required} 
      error={error} 
      labelWidth={labelWidth} 
      alignVertical={alignVertical}
      labelClassName={labelClassName}
      isDescription={isDescription}
      name={name}
    >
      <input
        id={id}
        name={name}
        type={type}
        dir={dir}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        autoComplete="off"
        className={cn(
          "w-full px-4 h-[25px] text-[11px] bg-gray-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed",
          error 
            ? "border-rose-500 ring-rose-500/20 ring-1" 
            : "",
          className
        )}
      />
    </FormFieldWrapper>
  );
}

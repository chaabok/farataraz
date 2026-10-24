"use client";

import React, { ChangeEvent } from "react";
import { FormFieldWrapper } from "./FormFieldWrapper";

import { cn } from "@/lib/utils";

export interface AmountInputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  labelWidth?: string;
  alignVertical?: boolean;
  className?: string;
}

export function AmountInput({ 
  label, 
  value, 
  onChange, 
  required, 
  error, 
  placeholder,
  name,
  disabled,
  readOnly,
  labelWidth,
  alignVertical,
  className
}: AmountInputProps) {
  
  const formatAmount = (val: string | number) => {
    if (val === null || val === undefined || val === '') return '';
    const strVal = String(val).replace(/,/g, '');
    const hasTrailingDot = strVal.endsWith('.');
    const parts = strVal.split('.');
    const integerPart = parseFloat(parts[0]);
    if (isNaN(integerPart) && parts[0] !== '') return '';
    
    const formattedInt = isNaN(integerPart) ? '' : integerPart.toLocaleString('en-US');
    if (parts.length > 1) {
      return `${formattedInt}.${parts[1]}`;
    }
    if (hasTrailingDot) {
      return `${formattedInt}.`;
    }
    return formattedInt;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    onChange(rawValue);
  };

  const displayValue = formatAmount(value);

  return (
    <FormFieldWrapper 
      label={label} 
      required={required} 
      error={error} 
      labelWidth={labelWidth}
      alignVertical={alignVertical}
    >
      <input
        type="text"
        name={name}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete="off"
        className={className || cn(
          "w-full px-4 h-[25px] text-[11px] bg-gray-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400",
          error ? "border-rose-500 ring-rose-500/20 ring-1" : "",
          disabled ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""
        )}
        dir="ltr"
      />
    </FormFieldWrapper>
  );
}

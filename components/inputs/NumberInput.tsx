"use client";

import React from "react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/stores/languageStore";
import { latinizeDigits, localizeNumericString, normalizeNumericInput } from "@/lib/digitLocale";

interface NumberInputProps {
  label?: string;
  value: string | number;
  onChange: (val: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  name?: string;
  id?: string;
  labelWidth?: string;
  alignVertical?: boolean;
  integerOnly?: boolean;
  thousandsSeparator?: boolean;
  /** Task 62: نمایش و ورود اعداد بر اساس زبان انتخاب‌شده کاربر (مثلاً ارقام فارسی در زبان فارسی) */
  localizeDigits?: boolean;
  className?: string;
  labelClassName?: string;
}

export function NumberInput({ 
  label, 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  required, 
  minLength, 
  maxLength, 
  error,
  labelWidth,
  alignVertical,
  disabled,
  readOnly,
  min,
  max,
  step,
  name,
  id,
  integerOnly,
  thousandsSeparator,
  localizeDigits,
  className,
  labelClassName
}: NumberInputProps) {
  
  const { language } = useLanguage();

  const displayValue = React.useMemo(() => {
    if (value === null || value === undefined || value === "") return value;
    if (!thousandsSeparator && !localizeDigits) return value;

    let valStr = latinizeDigits(String(value)).replace(/,/g, '');

    if (thousandsSeparator) {
      const parts = valStr.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      valStr = parts.join('.');
    }

    // Task 62: نمایش ارقام بر اساس زبان انتخاب‌شده (مثلاً ۱٬۲۳۴٬۵۶۷ در فارسی)
    if (localizeDigits) {
      valStr = localizeNumericString(valStr, language);
    }

    return valStr;
  }, [value, thousandsSeparator, localizeDigits, language]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Task 62: نرمال‌سازی ورودی کاربر از هر زبانی (ارقام فارسی/عربی/هندی و...) به عدد لاتین
    let val = localizeDigits
      ? normalizeNumericInput(e.target.value, language)
      : e.target.value.replace(/,/g, '');
    
    if (integerOnly) {
      if (val !== "" && !/^-?\d*$/.test(val)) return;
    } else {
      if (val !== "" && !/^-?\d*(\.\d*)?$/.test(val)) return;
    }

    if (maxLength && val.length > maxLength) return;
    
    if (max !== undefined && val !== "") {
      const numVal = parseFloat(val);
      if (!isNaN(numVal) && numVal > parseFloat(max.toString())) {
        val = max.toString();
      }
    }
    
    if (min !== undefined && val !== "" && parseFloat(val) < parseFloat(min.toString())) {
      if (parseFloat(min.toString()) >= 0 && val.startsWith('-')) {
         return;
      }
    }

    onChange(val);
  };

  return (
    <FormFieldWrapper 
      label={label} 
      required={required} 
      error={error} 
      labelWidth={labelWidth} 
      alignVertical={alignVertical}
      labelClassName={labelClassName}
    >
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        value={displayValue ?? ""}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        dir="ltr"
        autoComplete="off"
        className={cn(
          "w-full px-4 h-[25px] text-[11px] bg-gray-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400",
          error ? "border-rose-500 ring-rose-500/20 ring-1" : "",
          disabled ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : "",
          className
        )}
      />
    </FormFieldWrapper>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/lib/utils";

interface ShabaNumberInputProps {
  label?: string;
  value?: string;
  onChange?: (val: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  labelWidth?: string;
  alignVertical?: boolean;
  id?: string;
  name?: string;
}

export function ShabaNumberInput({
  label,
  value = "",
  onChange = () => {},
  onBlur,
  placeholder = "IR00 0000 0000 0000 0000 0000 00",
  required,
  disabled,
  error,
  labelWidth,
  alignVertical,
  id,
  name
}: ShabaNumberInputProps) {
  const [internalError, setInternalError] = useState("");
  const [touched, setTouched] = useState(false);

  const validateSheba = (iban: string) => {
    if (!iban) return required ? "شماره شبا الزامی است." : "";
    
    const cleanIban = String(iban).toUpperCase().replace(/[\s\-]/g, '');
    
    if (cleanIban.length !== 26) return "طول شماره شبا باید ۲۶ کاراکتر باشد.";
    if (!cleanIban.startsWith('IR')) return "شماره شبا باید با IR شروع شود.";
    if (!/^IR\d{24}$/.test(cleanIban)) return "شماره شبا باید فقط شامل اعداد باشد (پس از IR).";

    const charCodeA = 'A'.charCodeAt(0) - 10;
    const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
    let numericIban = '';
    
    for (let i = 0; i < rearranged.length; i++) {
      const charCode = rearranged.charCodeAt(i);
      if (charCode >= 65 && charCode <= 90) {
        numericIban += (charCode - charCodeA).toString();
      } else {
        numericIban += rearranged[i];
      }
    }

    let remainder = 0;
    for (let i = 0; i < numericIban.length; i++) {
      remainder = (remainder * 10 + parseInt(numericIban[i], 10)) % 97;
    }
    
    if (remainder !== 1) {
      return "شماره شبا وارد شده نامعتبر است.";
    }

    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    
    // Auto-prepend 'IR' if user puts digits at the beginning
    if (val.length > 0 && /^\d+$/.test(val.replace(/[\s\-]/g, ''))) {
      val = "IR" + val;
    }
    
    onChange(val);
    
    if (touched) {
      setInternalError(validateSheba(val));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setInternalError(validateSheba(value));
    if (onBlur) onBlur();
  };
  
  useEffect(() => {
    if (touched) {
       setInternalError(validateSheba(value));
    }
  }, [value, touched]);

  const displayError = error || (touched ? internalError : "");

  return (
    <FormFieldWrapper label={label} required={required} error={displayError} labelWidth={labelWidth} alignVertical={alignVertical}>
      <input
        id={id}
        name={name}
        type="text"
        dir="ltr"
        value={value ?? ""}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={32}
        autoComplete="off"
        className={cn(
          "w-full px-4 h-[25px] text-[11px] bg-gray-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-mono",
          displayError 
            ? "border-rose-500 ring-rose-500/20 ring-1" 
            : ""
        )}
      />
    </FormFieldWrapper>
  );
}

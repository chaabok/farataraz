"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { useLanguage } from "@/components/Providers";
import { cn, toEnglishDigits } from "@/lib/utils";
import moment from "moment";
import momentJalaali from "moment-jalaali";
import momentHijri from "moment-hijri";

interface DatePickerProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  noWrapper?: boolean;
  className?: string;
}

export function toGregorianIsoDate(val: string, language: string = "fa"): string {
  if (!val) return "";
  const clean = toEnglishDigits(val).trim().replace(/-/g, "/");
  if (clean.length !== 10) return val;
  const match = clean.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!match) return val;

  const year = parseInt(match[1], 10);
  const monthStr = match[2];
  const dayStr = match[3];

  if (year >= 1300 && year <= 1499) {
    if (language === "ar") {
      const hDate = momentHijri(`${year}/${monthStr}/${dayStr}`, "iYYYY/iMM/iDD");
      if (hDate.isValid()) return toEnglishDigits(hDate.clone().locale("en").format("YYYY-MM-DD"));
    } else {
      const jDate = momentJalaali(`${year}/${monthStr}/${dayStr}`, "jYYYY/jMM/jDD");
      if (jDate.isValid()) return toEnglishDigits(jDate.clone().locale("en").format("YYYY-MM-DD"));
    }
  } else if (year > 1900) {
    const d = moment.utc(`${year}-${monthStr}-${dayStr}`, "YYYY-MM-DD");
    if (d.isValid()) return toEnglishDigits(d.clone().locale("en").format("YYYY-MM-DD"));
  }
  return val;
}

export function toLocalizedDisplayDate(val: string, language: string = "fa"): string {
  if (!val) return "";
  const clean = toEnglishDigits(val).trim();
  if (!clean) return "";

  if (clean.length < 10) return clean;

  const matchIso = clean.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  if (matchIso) {
    const year = parseInt(matchIso[1], 10);
    const monthStr = matchIso[2];
    const dayStr = matchIso[3];

    if (year >= 1300 && year <= 1500) {
      if (language === "fa") {
        return `${year}/${monthStr}/${dayStr}`;
      }
    }

    if (year >= 1900 && year <= 2200) {
      const d = moment.utc(`${year}-${monthStr}-${dayStr}`, "YYYY-MM-DD");
      if (!d.isValid()) return val;

      if (language === "fa") {
        try {
          return toEnglishDigits(momentJalaali.utc(d).format("jYYYY/jMM/jDD"));
        } catch {
          return `${year}/${monthStr}/${dayStr}`;
        }
      } else if (language === "ar") {
        try {
          return toEnglishDigits(momentHijri.utc(d).format("iYYYY/iMM/iDD"));
        } catch {
          return `${year}/${monthStr}/${dayStr}`;
        }
      } else {
        return `${year}/${monthStr}/${dayStr}`;
      }
    }

    return `${year}/${monthStr}/${dayStr}`;
  }

  const matchSlash = clean.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (matchSlash) {
    const year = parseInt(matchSlash[1], 10);
    const monthStr = matchSlash[2];
    const dayStr = matchSlash[3];

    if (year >= 1300 && year <= 1499) {
      if (language === "fa") {
        return `${year}/${monthStr}/${dayStr}`;
      } else if (language === "ar") {
        const jDate = momentJalaali(`${year}/${monthStr}/${dayStr}`, "jYYYY/jMM/jDD");
        if (jDate.isValid()) {
          return toEnglishDigits(momentHijri.utc(jDate.toDate()).format("iYYYY/iMM/iDD"));
        }
      } else {
        const jDate = momentJalaali(`${year}/${monthStr}/${dayStr}`, "jYYYY/jMM/jDD");
        if (jDate.isValid()) {
          return toEnglishDigits(jDate.clone().locale("en").format("YYYY/MM/DD"));
        }
      }
    }

    if (year >= 1350 && year <= 1500 && language === "ar") {
      return `${year}/${monthStr}/${dayStr}`;
    }

    if (year > 1900) {
      const d = moment.utc(`${year}-${monthStr}-${dayStr}`, "YYYY-MM-DD");
      if (d.isValid()) {
        if (language === "fa") {
          return toEnglishDigits(momentJalaali.utc(d).format("jYYYY/jMM/jDD"));
        } else if (language === "ar") {
          return toEnglishDigits(momentHijri.utc(d).format("iYYYY/iMM/iDD"));
        } else {
          return `${year}/${monthStr}/${dayStr}`;
        }
      }
    }
  }

  return clean;
}

function formatDigitsToMask(digits: string, autoSlash: boolean = true): string {
  const cleanDigits = digits.replace(/[^\d]/g, '').slice(0, 8);
  const len = cleanDigits.length;
  if (len === 0) return "";
  if (len < 4) return cleanDigits;
  if (len === 4) return autoSlash ? `${cleanDigits}/` : cleanDigits;
  if (len < 6) return `${cleanDigits.slice(0, 4)}/${cleanDigits.slice(4)}`;
  if (len === 6) return autoSlash ? `${cleanDigits.slice(0, 4)}/${cleanDigits.slice(4, 6)}/` : `${cleanDigits.slice(0, 4)}/${cleanDigits.slice(4, 6)}`;
  return `${cleanDigits.slice(0, 4)}/${cleanDigits.slice(4, 6)}/${cleanDigits.slice(6)}`;
}

export function DatePicker({ id, label, value, onChange, required, error, disabled, onKeyDown, noWrapper, className }: DatePickerProps) {
  const { language } = useLanguage();
  const [internalError, setInternalError] = useState("");
  
  const placeholders: Record<string, string> = {
    fa: "YYYY/MM/DD",
    ar: "YYYY/MM/DD",
    ku: "YYYY/MM/DD",
    ps: "YYYY/MM/DD",
    en: "YYYY/MM/DD",
    zh: "YYYY/MM/DD"
  };
  const placeholderText = placeholders[language] || "YYYY/MM/DD";

  const errorMessages: Record<string, string> = {
    fa: "تاریخ شمسی نامعتبر است",
    ar: "تاريخ هجري غير صالح",
    ku: "بەرواری داغڵکراو نادروستە",
    ps: "داخله شوې نیټه ناسمه ده",
    en: "Invalid Gregorian date",
    zh: "无效的公历日期"
  };

  const [displayValue, setDisplayValue] = useState(() => toLocalizedDisplayDate(value, language));
  const lastPropValueRef = React.useRef(value);

  function validateDate(val: string) {
    if (!val || val.length !== 10) return false;
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(val)) return false;

    const parts = val.split("/");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (language === 'fa') {
      if (month < 1 || month > 12 || day < 1 || day > 31) return false;
      if (year < 1300 || year > 1500) return false;
      try {
        const m = momentJalaali(`${year}/${month}/${day}`, "jYYYY/jM/jD");
        return m.isValid() && m.jYear() === year && (m.jMonth() + 1) === month && m.jDate() === day;
      } catch {
        return false;
      }
    } else if (language === 'ar') {
      if (month < 1 || month > 12 || day < 1 || day > 30) return false;
      const m = momentHijri(`${year}/${month}/${day}`, "iYYYY/iM/iD");
      return m.isValid();
    } else {
      if (month < 1 || month > 12 || day < 1 || day > 31) return false;
      const m = moment.utc(`${year}-${month}-${day}`, "YYYY-M-D");
      return m.isValid() && m.year() === year && (m.month() + 1) === month && m.date() === day;
    }
  }

  useEffect(() => {
    if (value === "" || value === null || value === undefined) {
      if (displayValue !== "") {
        setDisplayValue("");
        setInternalError("");
      }
      lastPropValueRef.current = value;
      return;
    }

    const propChanged = value !== lastPropValueRef.current;
    lastPropValueRef.current = value;

    if (!propChanged) {
      return;
    }

    const newDisplay = toLocalizedDisplayDate(value, language);
    if (newDisplay !== displayValue) {
      setDisplayValue(newDisplay);
      if (newDisplay.length === 10) {
        setInternalError(validateDate(newDisplay) ? "" : (errorMessages[language] || errorMessages['en']));
      } else {
        setInternalError("");
      }
    }
  }, [value, language]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const input = e.currentTarget;
      const { selectionStart, selectionEnd } = input;
      if (selectionStart !== null && selectionEnd !== null && selectionStart === selectionEnd && selectionStart === displayValue.length) {
        e.preventDefault();
        const currentDigits = displayValue.replace(/[^\d]/g, '');
        if (currentDigits.length > 0) {
          const newDigits = currentDigits.slice(0, currentDigits.length - 1);
          const masked = formatDigitsToMask(newDigits, false);
          setDisplayValue(masked);

          if (masked === "") {
            setInternalError("");
            onChange("");
          } else if (masked.length === 10) {
            if (validateDate(masked)) {
              setInternalError("");
              const gregIso = toGregorianIsoDate(masked, language);
              onChange(gregIso || masked);
            } else {
              setInternalError(errorMessages[language] || errorMessages['en']);
              onChange(masked);
            }
          } else {
            setInternalError("");
            onChange(masked);
          }
        }
      }
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const enRaw = toEnglishDigits(raw);
    const digits = enRaw.replace(/[^\d]/g, '').slice(0, 8);
    const isDeletingSlash = displayValue.endsWith('/') && !raw.endsWith('/') && enRaw.replace(/[^\d]/g, '').length === (displayValue.replace(/[^\d]/g, '').length);
    const masked = formatDigitsToMask(digits, !isDeletingSlash);

    setDisplayValue(masked);

    if (masked === "") {
      setInternalError("");
      onChange("");
    } else if (masked.length === 10) {
      if (validateDate(masked)) {
        setInternalError("");
        const gregIso = toGregorianIsoDate(masked, language);
        onChange(gregIso || masked);
      } else {
        setInternalError(errorMessages[language] || errorMessages['en']);
        onChange(masked);
      }
    } else {
      setInternalError("");
      onChange(masked);
    }
  };

  const activeError = internalError || error;

  const inputContent = (
    <div className="relative w-full h-full">
      <input
        id={id}
        type="text"
        dir="ltr"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholderText}
        disabled={disabled}
        autoComplete="off"
        style={{ direction: 'ltr', textAlign: 'left' }}
        className={cn(
          "w-full pl-[22px] pr-2.5 h-[25px] text-[11px] text-left bg-gray-50/50 dark:bg-slate-800/50 border rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400 cursor-text block [direction:ltr]",
          activeError 
            ? "border-rose-500 ring-rose-500/20 ring-1" 
            : "border-gray-200 dark:border-slate-700",
          className
        )}
      />
      <Calendar className="absolute top-1/2 -translate-y-1/2 left-[3px] w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );

  if (noWrapper) {
    return inputContent;
  }

  return (
    <FormFieldWrapper label={label} required={required} error={activeError}>
      {inputContent}
    </FormFieldWrapper>
  );
}

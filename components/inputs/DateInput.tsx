"use client";

import React, { useEffect, useState, useRef } from "react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { useLanguage } from "../Providers";
import { apiFetch, toEnglishDigits, gregorianToJalaliDisplay, jalaliToGregorianISO, isValidJalaliDate, cn, formatDateByLocale } from "@/lib/utils";
import { localizeNumericString } from "@/lib/digitLocale";
import { Calendar } from "lucide-react";
import momentJalaali from "moment-jalaali";

export interface DateInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  name?: string;
  disabled?: boolean;
  labelWidth?: string;
  alignVertical?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  noWrapper?: boolean;
  isHeader?: boolean;
  fiscalYearRef?: number | string;
  outputFormat?: "dateString" | "iso" | "timestamp";
  checkFiscalYear?: boolean;
}

export function getTodayFormattedDate(lang: string = "fa"): string {
  try {
    return toEnglishDigits(momentJalaali().format("jYYYY/jMM/jDD"));
  } catch {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}/${m}/${d}`;
  }
}

function formatDigitsToMask(digits: string, autoSlash: boolean = true): string {
  const cleanDigits = toEnglishDigits(digits).replace(/[^\d]/g, "").slice(0, 8);
  const len = cleanDigits.length;
  if (len === 0) return "";
  if (len < 4) return cleanDigits;
  if (len === 4) return autoSlash ? `${cleanDigits}/` : cleanDigits;
  if (len < 6) return `${cleanDigits.slice(0, 4)}/${cleanDigits.slice(4)}`;
  if (len === 6) return autoSlash ? `${cleanDigits.slice(0, 4)}/${cleanDigits.slice(4, 6)}/` : `${cleanDigits.slice(0, 4)}/${cleanDigits.slice(4, 6)}`;
  return `${cleanDigits.slice(0, 4)}/${cleanDigits.slice(4, 6)}/${cleanDigits.slice(6)}`;
}

function cleanDateToDigits(str: string): string {
  if (!str) return "";
  return toEnglishDigits(str).replace(/[^\d]/g, "");
}

export function DateInput({
  id,
  label,
  value,
  onChange,
  required,
  error,
  name,
  disabled,
  labelWidth,
  alignVertical,
  onKeyDown,
  className,
  noWrapper,
  isHeader = false,
  fiscalYearRef,
  outputFormat = "timestamp",
  checkFiscalYear
}: DateInputProps) {
  const { language } = useLanguage();
  const [fiscalYearError, setFiscalYearError] = useState<string>("");
  const [rangeError, setRangeError] = useState<string>("");
  // Task 63: خطای قالب تاریخ — تاریخ کامل اما نامعتبر (مثل روز ۴۵)
  const [formatError, setFormatError] = useState<string>("");
  const [fiscalYearRange, setFiscalYearRange] = useState<{ startDate?: string; endDate?: string } | null>(null);

  const shouldCheckFiscalYear = checkFiscalYear !== undefined ? checkFiscalYear : isHeader;
  
  const initialDefaultSet = useRef<boolean>(false);
  const lastPropValueRef = useRef<string>(value);

  // Normalize initial/prop display value
  const normalizeDisplayValue = (val: string): string => {
    if (!val) return "";
    const enVal = toEnglishDigits(val).trim();
    if (!enVal) return "";
    let res = formatDateByLocale(enVal, language);
    // Task 63: تبدیل ارقام بومی به لاتین قبل از شمارش (locale سراسری moment ممکن است ارقام عربی تولید کند)
    res = toEnglishDigits(res);
    const digits = res.replace(/[^\d]/g, "");
    if (digits.length >= 8) {
      // Task 62: نمایش ارقام تاریخ بر اساس زبان انتخاب‌شده کاربر (مثلاً ۱۴۰۵/۰۸/۰۲ در فارسی)
      return localizeNumericString(formatDigitsToMask(digits, false), language);
    }
    // Task 63: مقادیر خراب/غیرقابل تجزیه (مثل "Invalid date") به‌جای نمایش خام، خالی نشان داده می‌شوند
    if (digits.length === 0) return "";
    return localizeNumericString(res, language);
  };

  const [displayValue, setDisplayValue] = useState<string>(() => normalizeDisplayValue(value));

  // Helper to emit date value to parent: converts Jalali to Gregorian ISO/TIMESTAMP based on outputFormat
  const emitValue = (maskedJalali: string) => {
    const digits = cleanDateToDigits(maskedJalali);
    let outVal = maskedJalali;

    // Task 63: تاریخ کامل اما نامعتبر هرگز تبدیل/رول‌اور نمی‌شود — رشته خام ارسال می‌شود
    // تا اعتبارسنجی فرم (هنگام ذخیره) جلوی ثبت اطلاعات خراب را بگیرد.
    if (digits.length === 8 && !isValidJalaliDate(maskedJalali)) {
      lastPropValueRef.current = outVal;
      onChange(outVal);
      return;
    }

    if (outputFormat === "dateString") {
      lastPropValueRef.current = outVal;
      onChange(outVal);
      return;
    }

    if (digits.length === 8 && language === 'fa') {
      outVal = jalaliToGregorianISO(maskedJalali);
    }
    const now = new Date();
    if (outVal && outVal.includes("/")) {
      const parts = outVal.split("/");
      if (parts.length === 3) {
        if (outputFormat === "iso") {
          outVal = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
        } else if (outputFormat === "timestamp") {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            const dateObj = new Date(Date.UTC(y, m, d, now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()));
            outVal = dateObj.toISOString();
          }
        }
      }
    } else if (outVal && outVal.includes("-") && !outVal.includes("T")) {
      const parts = outVal.split("-");
      if (parts.length === 3) {
        if (outputFormat === "iso") {
          outVal = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
        } else if (outputFormat === "timestamp") {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            const dateObj = new Date(Date.UTC(y, m, d, now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()));
            outVal = dateObj.toISOString();
          }
        }
      }
    } else if (outVal && outputFormat === "timestamp" && outVal.includes("T")) {
      const dObj = new Date(outVal);
      if (!isNaN(dObj.getTime())) {
        if (dObj.getUTCHours() === 0 && dObj.getUTCMinutes() === 0 && dObj.getUTCSeconds() === 0) {
          dObj.setUTCHours(now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
          outVal = dObj.toISOString();
        }
      }
    }
    lastPropValueRef.current = outVal;
    onChange(outVal);
  };

  // If header form, set default today date if value is empty
  useEffect(() => {
    if (isHeader && (!value || value.trim() === "") && typeof onChange === 'function' && !initialDefaultSet.current) {
      initialDefaultSet.current = true;
      const todayStr = getTodayFormattedDate(language);
      setDisplayValue(localizeNumericString(todayStr, language));
      emitValue(todayStr);
    }
  }, [isHeader, value, language, onChange]);

  // Keep displayValue in sync with value prop when parent changes value
  useEffect(() => {
    if (value !== lastPropValueRef.current) {
      lastPropValueRef.current = value;
      const newDisp = normalizeDisplayValue(value);
      setDisplayValue(newDisp);
    }
  }, [value]);

  // Task 62: با تغییر زبان، نمایش تاریخ به زبان جدید منتقل می‌شود
  // (در فارسی ارقام شمسی، در سایر زبان‌ها معادل میلادی؛ حین تایپ نیمه‌کاره نمایش دست‌نخورده می‌ماند)
  useEffect(() => {
    const src = lastPropValueRef.current || value || "";
    const srcDigits = cleanDateToDigits(src);
    if (srcDigits.length !== 0 && srcDigits.length !== 8) return;
    setDisplayValue(normalizeDisplayValue(src));
  }, [language]);

  // Fetch Fiscal Year information for validation
  useEffect(() => {
    let isMounted = true;

    const fetchFiscalYearInfo = async () => {
      try {
        let url = "/api/common/fiscalyear";
        if (fiscalYearRef) {
          url = `/api/common/fiscalyear/${fiscalYearRef}`;
        }
        const res = await apiFetch(url);
        if (res.ok) {
          const data = await res.json();
          let targetFy: any = null;
          if (fiscalYearRef && data && !Array.isArray(data)) {
            targetFy = data;
          } else {
            const items = Array.isArray(data) ? data : (data?.items || []);
            if (!items || items.length === 0) {
              if (isMounted && isHeader) {
                setFiscalYearError("اطلاعات سال مالی در سیستم تعریف نشده است");
              }
              return;
            }
            if (isMounted) setFiscalYearError("");

            if (fiscalYearRef) {
              targetFy = items.find((item: any) => 
                String(item.fiscalYearID || item.fiscalYearId || item.id) === String(fiscalYearRef)
              );
            }
            if (!targetFy) {
              const savedFyId = typeof window !== "undefined" ? localStorage.getItem("app-fiscal-year") : null;
              if (savedFyId) {
                targetFy = items.find((item: any) => 
                  String(item.fiscalYearID || item.fiscalYearId || item.id) === String(savedFyId)
                );
              }
            }
            if (!targetFy) {
              targetFy = items.find((item: any) => item.isActive || item.IsActive) || items[0];
            }
          }

          if (targetFy && isMounted) {
            let start = targetFy.startDate || targetFy.StartDate || "";
            let end = targetFy.endDate || targetFy.EndDate || "";
            start = formatDateByLocale(start, language);
            end = formatDateByLocale(end, language);
            setFiscalYearRange({ startDate: start, endDate: end });
          }
        } else {
          if (isMounted && isHeader) {
            setFiscalYearError("اطلاعات سال مالی در سیستم تعریف نشده است");
          }
        }
      } catch {
        if (isMounted && isHeader) {
          setFiscalYearError("اطلاعات سال مالی در سیستم تعریف نشده است");
        }
      }
    };

    fetchFiscalYearInfo();

    const handleFYUpdate = () => {
      fetchFiscalYearInfo();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("fiscalYearUpdated", handleFYUpdate);
      window.addEventListener("storage", handleFYUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("fiscalYearUpdated", handleFYUpdate);
        window.removeEventListener("storage", handleFYUpdate);
      }
    };
  }, [isHeader, fiscalYearRef]);

  // Validate date range against Fiscal Year when date or range changes
  useEffect(() => {
    if (!shouldCheckFiscalYear) {
      setRangeError("");
      return;
    }

    if (!displayValue || displayValue.length !== 10) {
      setRangeError("");
      return;
    }

    if (fiscalYearRange?.startDate && fiscalYearRange?.endDate) {
      const valDigits = cleanDateToDigits(displayValue);
      const startDigits = cleanDateToDigits(fiscalYearRange.startDate);
      const endDigits = cleanDateToDigits(fiscalYearRange.endDate);

      if (valDigits.length === 8 && startDigits.length === 8 && endDigits.length === 8) {
        const valNum = parseInt(valDigits, 10);
        const startNum = parseInt(startDigits, 10);
        const endNum = parseInt(endDigits, 10);

        if (valNum < startNum || valNum > endNum) {
          setRangeError("تاریخ وارد شده در محدوده سال مالی انتخاب شده نمی‌باشد");
        } else {
          setRangeError("");
        }
      } else {
        setRangeError("");
      }
    } else {
      setRangeError("");
    }
  }, [displayValue, fiscalYearRange, shouldCheckFiscalYear]);

  // Task 63: اعتبارسنجی تاریخ کامل‌شده — روز/ماه نامعتبر (مثل ۴۵) بلافاصله خطای قرمز می‌گیرد
  useEffect(() => {
    const digits = cleanDateToDigits(displayValue);
    if (digits.length !== 8) {
      setFormatError("");
      return;
    }
    const masked = formatDigitsToMask(digits, false);
    setFormatError(isValidJalaliDate(masked) ? "" : "تاریخ وارد شده معتبر نیست");
  }, [displayValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const input = e.currentTarget;
      const { selectionStart, selectionEnd } = input;
      const enDisplay = toEnglishDigits(displayValue);

      if (selectionStart !== null && selectionEnd !== null && selectionStart === selectionEnd && selectionStart === displayValue.length) {
        e.preventDefault();
        const currentDigits = cleanDateToDigits(enDisplay);
        if (currentDigits.length > 0) {
          const newDigits = currentDigits.slice(0, currentDigits.length - 1);
          const masked = formatDigitsToMask(newDigits, false);
          setDisplayValue(localizeNumericString(masked, language));
          emitValue(masked);
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
    const digits = enRaw.replace(/[^\d]/g, "").slice(0, 8);
    const isDeletingSlash = displayValue.endsWith("/") && !raw.endsWith("/") && cleanDateToDigits(raw).length === cleanDateToDigits(displayValue).length;
    const masked = formatDigitsToMask(digits, !isDeletingSlash);

    // Task 62: نمایش ارقام بر اساس زبان انتخاب‌شده؛ emitValue همیشه ماسک لاتین می‌گیرد
    setDisplayValue(localizeNumericString(masked, language));
    emitValue(masked);
  };

  const activeError = error || fiscalYearError || rangeError || formatError;
  const isDisabled = disabled || (isHeader && !!fiscalYearError);

  const inputElement = (
    <div className="relative flex items-center w-full">
      <input
        id={id}
        name={name}
        type="text"
        dir="ltr"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="YYYY/MM/DD"
        disabled={isDisabled}
        autoComplete="off"
        className={cn(
          "w-full pl-[23px] pr-2.5 h-[25px] text-[11px] bg-gray-50/50 dark:bg-slate-800/50 border rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400",
          activeError
            ? "border-rose-500 ring-rose-500/20 ring-1"
            : "border-slate-200 dark:border-slate-700",
          isDisabled ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : "",
          className
        )}
      />
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center">
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
      </div>
    </div>
  );

  if (noWrapper) {
    return inputElement;
  }

  return (
    <FormFieldWrapper
      id={id}
      label={label}
      required={required}
      error={activeError}
      labelWidth={labelWidth}
      alignVertical={alignVertical}
    >
      {inputElement}
    </FormFieldWrapper>
  );
}

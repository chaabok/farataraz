// Task 62: بومی‌سازی نمایش و ورود اعداد بر اساس زبان انتخاب‌شده کاربر
// هر زبان نگاشت ارقام و جداکننده‌های خودش را دارد؛ گروه‌بندی همیشه ۳ رقم ۳ رقم است.
import type { Language } from "./stores/languageStore";

export interface DigitLocaleConfig {
  /** ۱۰ کاراکتر معادل ارقام 0 تا 9 در زبان مقصد */
  digits: string;
  /** جداکننده گروه‌های هزارگان (۳ رقم ۳ رقم) */
  group: string;
  /** جداکننده اعشار */
  decimal: string;
}

const LATIN_DIGITS = "0123456789";
const NBSP = "\u00A0"; // ru/af (مطابق CLDR)
const NARROW_NBSP = "\u202F"; // fr (مطابق CLDR)

const DIGIT_LOCALES: Record<Language, DigitLocaleConfig> = {
  en: { digits: LATIN_DIGITS, group: ",", decimal: "." },
  fa: { digits: "۰۱۲۳۴۵۶۷۸۹", group: "٬", decimal: "٫" },
  ar: { digits: "٠١٢٣٤٥٦٧٨٩", group: "٬", decimal: "٫" },
  zh: { digits: LATIN_DIGITS, group: ",", decimal: "." },
  ku: { digits: "٠١٢٣٤٥٦٧٨٩", group: "٬", decimal: "٫" },
  de: { digits: LATIN_DIGITS, group: ".", decimal: "," },
  fr: { digits: LATIN_DIGITS, group: NARROW_NBSP, decimal: "," },
  hi: { digits: "०१२३४५६७८९", group: ",", decimal: "." },
  ru: { digits: LATIN_DIGITS, group: NBSP, decimal: "," },
  af: { digits: LATIN_DIGITS, group: NBSP, decimal: "," },
};

export function getDigitLocaleConfig(lang: Language): DigitLocaleConfig {
  return DIGIT_LOCALES[lang] || DIGIT_LOCALES.fa;
}

const isWhitespaceGroup = (ch: string) => ch === " " || ch === NBSP || ch === NARROW_NBSP;

/** تبدیل همه ارقام بومی (فارسی/عربی/دوناگری/فول‌ویدث) به ارقام لاتین */
export function latinizeDigits(input: string): string {
  if (!input) return input || "";
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0) || 0;
    if (code >= 0x06f0 && code <= 0x06f9) out += String.fromCharCode(code - 0x06f0 + 48); // ۰-۹ فارسی
    else if (code >= 0x0660 && code <= 0x0669) out += String.fromCharCode(code - 0x0660 + 48); // ٠-٩ عربی
    else if (code >= 0x0966 && code <= 0x096f) out += String.fromCharCode(code - 0x0966 + 48); // ०-९ دوناگری
    else if (code >= 0xff10 && code <= 0xff19) out += String.fromCharCode(code - 0xff10 + 48); // ０-۹ فول‌ویدث
    else out += ch;
  }
  return out;
}

/**
 * نرمال‌سازی ورودی کاربر (هر زبانی) به رشته عددی لاتین قابل اعتبارسنجی:
 * ارقام بومی → لاتین، جداکننده اعشار هر زبان → '.'، جداکننده‌های گروه‌بندی حذف می‌شوند.
 */
export function normalizeNumericInput(input: string, lang: Language): string {
  if (!input) return "";
  const cfg = getDigitLocaleConfig(lang);
  let s = latinizeDigits(input);

  // U+066B جداکننده اعشار عربی/فارسی → همیشه اعشار
  s = s.split("\u066B").join(".");
  // U+066C جداکننده هزارگان عربی/فارسی → همیشه گروه‌بندی → حذف
  s = s.split("\u066C").join("");

  // جداکننده گروه‌بندی زبان جاری حذف می‌شود
  if (isWhitespaceGroup(cfg.group)) {
    s = s.replace(/[\s\u00A0\u202F]/g, "");
  } else if (cfg.group !== ",") {
    s = s.split(cfg.group).join(""); // مثلا '.' در آلمانی
  }

  // جداکننده اعشار زبان جاری → '.'
  if (cfg.decimal === ",") {
    s = s.split(",").join(".");
  } else {
    s = s.split(",").join(""); // در سایر زبان‌ها ',' گروه‌بندی محسوب می‌شود
  }

  // در صورت پیست، فقط آخرین '.' به‌عنوان اعشار باقی می‌ماند
  const parts = s.split(".");
  if (parts.length > 2) {
    s = parts.slice(0, -1).join("") + "." + parts[parts.length - 1];
  }
  return s;
}

/** گروه‌بندی ۳ رقم ۳ رقم جزء صحیح یک رشته عددی لاتین */
export function groupLatinInteger(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** نگاشت یک رشته عددی لاتین (با جداکننده‌های لاتین) به ارقام/جداکننده‌های زبان مقصد */
export function localizeNumericString(s: string, lang: Language): string {
  if (!s) return s || "";
  const cfg = getDigitLocaleConfig(lang);
  let out = "";
  for (const ch of s) {
    const d = ch.charCodeAt(0) - 48;
    if (d >= 0 && d <= 9) out += cfg.digits[d];
    else if (ch === ",") out += cfg.group;
    else if (ch === ".") out += cfg.decimal;
    else out += ch; // منفی و سایر کاراکترها
  }
  return out;
}

/**
 * قالب‌بندی عدد برای نمایش: گروه‌بندی ۳ رقم ۳ رقم + ارقام زبان انتخاب‌شده.
 * برای سلول‌های فقط‌نمایشی (مثل مبلغ کل).
 */
export function formatLocalizedNumber(
  value: number | string | null | undefined,
  lang: Language,
  options?: { grouping?: boolean; fallback?: string }
): string {
  const { grouping = true, fallback = "" } = options || {};
  if (value === null || value === undefined || value === "") return fallback;
  let s = latinizeDigits(String(value)).trim();
  if (!s) return fallback;
  // پاک‌سازی جداکننده‌های احتمالی ورودی
  s = s.split("\u066C").join("").split("\u066B").join(".").split(",").join("");
  if (isWhitespaceGroup(getDigitLocaleConfig(lang).group)) {
    s = s.replace(/[\s\u00A0\u202F]/g, "");
  }
  const num = Number(s);
  if (isNaN(num)) return fallback;
  const neg = num < 0;
  const absStr = Math.abs(num).toString();
  const [intPart, decPart] = absStr.split(".");
  const groupedInt = grouping ? groupLatinInteger(intPart) : intPart;
  const out = localizeNumericString(groupedInt + (decPart !== undefined ? "." + decPart : ""), lang);
  return (neg ? "-" : "") + out;
}

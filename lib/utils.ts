import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from 'moment';
import momentJalaali from 'moment-jalaali';
import momentHijri from 'moment-hijri';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeStringify(obj: any): string {
  const cache = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (
        cache.has(value) || 
        value instanceof Element || 
        value.nodeType !== undefined || 
        value.$$typeof
      ) {
        return undefined;
      }
      cache.add(value);
    }
    return value;
  });
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit & { retries?: number }): Promise<Response> {
  const finalInit = { cache: 'no-store' as RequestCache, credentials: 'include' as RequestCredentials, ...init };
  let token = null;
  let companyId = null;
  let branchId = null;
  let agencyId = null;
  let fiscalYearId = null;
  
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
    fiscalYearId = localStorage.getItem('app-fiscal-year');
    
    // Parse current company from global selection
    try {
      const storageRaw = localStorage.getItem('app-company-storage');
      if (storageRaw) {
        const parsed = JSON.parse(storageRaw);
        const state = parsed?.state || {};
        companyId = state.currentCompany?.businessStructureId;
        branchId = state.currentBranch?.businessStructureId;
        agencyId = state.currentRep?.businessStructureId;
      }
    } catch(e) {}
  }

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (companyId) {
    headers.set('x-company-id', companyId.toString());
  }
  if (branchId) {
    headers.set('x-branch-id', branchId.toString());
  }
  if (agencyId) {
    headers.set('x-agency-id', agencyId.toString());
  }
  if (fiscalYearId) {
    headers.set('x-fiscal-year-id', fiscalYearId.toString());
  }
  
  if (init?.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const maxRetries = init?.retries ?? 4;
  let lastResponse: Response | null = null;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(input, {
        ...finalInit,
        headers,
      });
      lastResponse = response;

      const contentType = response.headers.get('content-type');
      let isRestartingError = false;
      
      const isHtmlType = contentType && contentType.includes('text/html');
      let bodyText = '';
      if (isHtmlType) {
        bodyText = await response.clone().text().catch(() => '');
        console.warn(`[apiFetch] Unexpected HTML received for ${input}:`, bodyText.slice(0, 500));
        isRestartingError = true;
      } else {
        // Double-check if the body actually starts with '<'
        const clonedText = await response.clone().text().catch(() => '');
        if (clonedText.trim().startsWith('<')) {
          console.warn(`[apiFetch] Unexpected HTML body received for ${input}:`, clonedText.slice(0, 500));
          isRestartingError = true;
        }
      }

      if (response.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        // Prevent unhandled JSON parsing exceptions while redirecting
        return new Promise(() => {}) as unknown as Promise<Response>;
      }

      if (isRestartingError || response.status === 503 || response.status === 429) {
        if (attempt < maxRetries) {
          let waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
          waitTime += Math.random() * 1000; // Add jitter
          
          // Handle Retry-After header if present
          const retryAfter = response.headers.get('Retry-After');
          if (retryAfter) {
            const parsedRetryAfter = parseInt(retryAfter, 10);
            if (!isNaN(parsedRetryAfter)) {
               waitTime = parsedRetryAfter * 1000;
            } else {
               const dateStr = new Date(retryAfter).getTime();
               if (!isNaN(dateStr)) {
                 waitTime = Math.max(0, dateStr - Date.now());
               }
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue; // Try again
        } else if (isRestartingError) {
          // Return a soft JSON response to prevent application crashes from proxy HTML errors
          return new Response(JSON.stringify({ 
            error: "Server Restarting", 
            message: "Server is currently restarting or unavailable. Please wait a moment and try again." 
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // Safe .json() method wrapper to prevent Uncaught SyntaxError: Unexpected token '<'
      const originalJson = response.json.bind(response);
      response.json = async () => {
        try {
          return await originalJson();
        } catch (err) {
          console.warn(`[apiFetch] Failed to parse JSON response for ${input}:`, err);
          return { error: true, message: 'Invalid JSON response received from server' };
        }
      };

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
         let waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
         waitTime += Math.random() * 1000; // Add jitter
         await new Promise(resolve => setTimeout(resolve, waitTime));
         continue;
      }
    }
  }

  if (lastResponse) {
    if (lastResponse.headers.get('content-type')?.includes('text/html')) {
       return new Response(JSON.stringify({ 
         error: "Server Restarting", 
         message: "Server is currently restarting or unavailable. Please wait a moment and try again." 
       }), {
         status: 503,
         headers: { 'Content-Type': 'application/json' }
       });
    }
    return lastResponse;
  }
  
  const errorMessage = lastError ? lastError.message : "Failed to fetch";
  throw new Error(`${errorMessage} (Url: ${input})`);
}

export function formatDateByLocale(dateString: string, locale: string): string {
  if (!dateString) return "";
  const clean = toEnglishDigits(dateString).trim();
  if (!clean) return "";

  try {
    const cleanISO = clean.split('T')[0];
    const parts = cleanISO.includes('-') ? cleanISO.split('-') : cleanISO.split('/');
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);

      // Jalaali year range (1300..1500)
      if (year >= 1300 && year <= 1500) {
        if (locale === 'fa') {
          return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
        }
        try {
          const m = momentJalaali(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
          if (m.isValid()) {
            if (locale === 'ar') {
              return toEnglishDigits(momentHijri(m).format('iYYYY/iMM/iDD'));
            }
            // Task 63: locale سراسری moment می‌تواند ar-sa باشد — حتماً en پین می‌شود تا ارقام لاتین بمانند
            return m.clone().locale('en').format('YYYY/MM/DD');
          }
        } catch (e) {
          console.error("formatDateByLocale Jalaali conversion error:", e);
        }
      }

      // Gregorian year range (1900..2200)
      if (year >= 1900 && year <= 2200) {
        if (locale === 'fa') {
          try {
            const m = moment(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, 'YYYY-MM-DD');
            if (m.isValid()) {
              return toEnglishDigits(momentJalaali(m).format('jYYYY/jMM/jDD'));
            }
          } catch (e) {
            console.error("formatDateByLocale Gregorian conversion error:", e);
          }
        } else if (locale === 'ar') {
          try {
            const m = moment(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, 'YYYY-MM-DD');
            if (m.isValid()) {
              return toEnglishDigits(momentHijri(m).format('iYYYY/iMM/iDD'));
            }
          } catch (e) {
            console.error("formatDateByLocale Hijri conversion error:", e);
          }
        } else {
          return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
        }
      }
    }

    const date = new Date(clean);
    if (!isNaN(date.getTime())) {
      if (locale === 'fa') {
        return toEnglishDigits(momentJalaali(date).format('jYYYY/jMM/jDD'));
      }
      if (locale === 'ar') {
        return toEnglishDigits(momentHijri(date).format('iYYYY/iMM/iDD'));
      }
      return toEnglishDigits(new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }).format(date)).replace(/-/g, '/');
    }
  } catch (e) {
    console.error("Error in formatDateByLocale:", e);
  }

  return clean;
}

export function jalaliToGregorianISO(dateStr: string): string {
  if (!dateStr) {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }
  const clean = toEnglishDigits(dateStr).trim();
  if (!clean) {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }

  try {
    const cleanStr = clean.split('T')[0].split(' ')[0];
    const parts = cleanStr.includes('-') ? cleanStr.split('-') : cleanStr.split('/');
    let year = 0, month = 0, day = 0;

    if (parts.length >= 3) {
      const p0 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[2], 10);
      if (p0 >= 1000) {
        year = p0;
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else if (p2 >= 1000) {
        year = p2;
        month = parseInt(parts[1], 10);
        day = parseInt(parts[0], 10);
      }
    } else {
      const onlyDigits = cleanStr.replace(/\D/g, '');
      if (onlyDigits.length === 8) {
        const first4 = parseInt(onlyDigits.substring(0, 4), 10);
        const last4 = parseInt(onlyDigits.substring(4, 8), 10);
        if (first4 >= 1000) {
          year = first4;
          month = parseInt(onlyDigits.substring(4, 6), 10);
          day = parseInt(onlyDigits.substring(6, 8), 10);
        } else if (last4 >= 1000) {
          year = last4;
          month = parseInt(onlyDigits.substring(2, 4), 10);
          day = parseInt(onlyDigits.substring(0, 2), 10);
        }
      }
    }

    if (year >= 1300 && year <= 1500 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const m = momentJalaali(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
      if (m.isValid()) {
        return toEnglishDigits(m.clone().locale('en').format('YYYY/MM/DD'));
      }
    } else if (year >= 1900 && year <= 2200 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    }
  } catch (e) {
    console.error("jalaliToGregorianISO error:", e);
  }

  const fallbackClean = toEnglishDigits(clean.split('T')[0]).replace(/-/g, '/');
  return fallbackClean;
}

export function gregorianToJalaliDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const clean = toEnglishDigits(dateStr).trim();
  if (!clean) return '';

  try {
    const cleanStr = clean.split('T')[0];
    const parts = cleanStr.includes('-') ? cleanStr.split('-') : cleanStr.split('/');
    let year = 0, month = 0, day = 0;

    if (parts.length >= 3) {
      const p0 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[2], 10);
      if (p0 >= 1000) {
        year = p0;
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else if (p2 >= 1000) {
        year = p2;
        month = parseInt(parts[1], 10);
        day = parseInt(parts[0], 10);
      }

      if (year >= 1300 && year <= 1500) {
        // Task 63: فقط تاریخ‌های واقعاً معتبر عبور می‌کنند — روز/ماه نامعتبر (مثل ۴۵) خالی برمی‌گردد
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const jm = momentJalaali(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
          if (jm.isValid() && jm.jYear() === year && jm.jMonth() + 1 === month && jm.jDate() === day) {
            return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
          }
        }
        return "";
      } else if (year >= 1900 && year <= 2200) {
        const m = moment(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, 'YYYY-MM-DD');
        if (m.isValid()) {
          return toEnglishDigits(momentJalaali(m).clone().locale('en').format('jYYYY/jMM/jDD'));
        }
      }
    }

    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      const formatted = toEnglishDigits(momentJalaali(d).clone().locale('en').format('jYYYY/jMM/jDD'));
      // Task 63: سال خارج از محدوده پشتیبانی شمسی (رکوردهای خراب قدیمی) هرگز "Invalid date" برنمی‌گرداند
      if (!formatted.includes("Invalid")) {
        return formatted;
      }
    }
  } catch (e) {
    console.error("gregorianToJalaliDisplay error:", e);
  }
  // Task 63: ورودی غیرقابل تجزیه → خالی (به‌جای نمایش رشته خام/"Invalid date")
  return "";
}

export function toEnglishDigits(str: string | number): string {
  if (str === null || str === undefined) return "";
  const s = String(str);
  return s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966))
    .replace(/[０-９]/g, (d) => String(d.charCodeAt(0) - 0xff10));
}

// ---------------------------------------------------------------------------
// Task 132: قاعده «تاریخ ثبت اطلاعات نمی‌تواند قبل از تاریخ سند مبنا باشد»
// در اسناد انبار و اسناد فروش، وقتی سند مبنا انتخاب شده باشد، تاریخ ثبت اطلاعات
// فرم نباید از تاریخ سند مبنا کوچک‌تر باشد.
// هر دو ورودی می‌توانند شمسی (1300-1500) یا میلادی ('YYYY/MM/DD' یا ISO با T) باشند؛
// اگر هرکدام قابل تجزیه نباشد یا خالی باشد، کنترل غیرفعال (false) در نظر گرفته می‌شود.
// ---------------------------------------------------------------------------
export function isFormDateBeforeBaseDocDate(
  formDateJalali: string | null | undefined,
  baseDocDateRaw: string | null | undefined,
): boolean {
  if (!formDateJalali || !baseDocDateRaw) return false;
  const formKey = jalaliToGregorianISO(String(formDateJalali)).replace(/\//g, "");
  const baseKey = jalaliToGregorianISO(toEnglishDigits(String(baseDocDateRaw)).trim()).replace(/\//g, "");
  if (!/^\d{8}$/.test(formKey) || !/^\d{8}$/.test(baseKey)) return false;
  return Number(formKey) < Number(baseKey);
}

/**
 * Task 63: اعتبارسنجی سخت‌گیرانه تاریخ شمسی (و میلادی) با چرخه بازگشتی
 * (جلوی رول‌اور moment برای روز/ماه نامعتبر مثل ۴۵ را می‌گیرد)
 * ورودی قابل قبول: 1405/08/02 | 1405-8-2 | 2026-10-24T12:00:00Z
 */
export function isValidJalaliDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const clean = toEnglishDigits(String(dateStr)).trim();
  if (!clean) return false;
  const cleanStr = clean.split("T")[0].split(" ")[0];
  const parts = cleanStr.includes("-") ? cleanStr.split("-") : cleanStr.split("/");
  if (parts.length < 3) return false;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) return false;
  try {
    if (y >= 1300 && y <= 1500) {
      const jm = momentJalaali(`${y}/${m}/${d}`, "jYYYY/jM/jD");
      return jm.isValid() && jm.jYear() === y && jm.jMonth() + 1 === m && jm.jDate() === d;
    }
    if (y >= 1900 && y <= 2200) {
      const gm = moment(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, "YYYY-MM-DD");
      return gm.isValid() && gm.year() === y && gm.month() + 1 === m && gm.date() === d;
    }
  } catch {
    return false;
  }
  return false;
}

export function normalizePersianText(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .trim();
}

export function parsePersianDateToISO(dateStr: string): string | null {
  if (!dateStr) return null;
  // Common formats: 1403/01/01 or 1403-01-01 or Persian digits equivalents
  const cleanStr = toEnglishDigits(dateStr).replace(/-/g, '/');
  try {
    // We can't import moment-jalaali here easily if it's not exported. 
    // But we know it's in the project.
    // For now, let's assume we use it in the component. 
    // Or we can try a simple regex if we don't want to depend on moment here.
    return null; // Let the component handle it with moment-jalaali
  } catch {
    return null;
  }
}

export function escapeHtml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  if (typeof unsafe !== 'string') unsafe = String(unsafe);
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function createId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
}

export function getPersianEntityName(entityName: string): string {
  const map: Record<string, string> = {
    'PaymentNotification': 'اعلامیه پرداخت',
    'ReceiptNotification': 'رسید دریافت',
    'BankAccount': 'حساب بانکی',
    'BankBranch': 'شعبه بانک',
    'Bank': 'بانک',
    'Cash': 'صندوق',
    'Chequebook': 'دسته چک',
    'PromissoryNote': 'سفته',
    'PaymentGateway': 'درگاه پرداخت',
    'RapReason': 'بابت دریافت و پرداخت',
    'Voucher': 'سند حسابداری',
    'DetailedAccount': 'حساب تفصیلی',
    'CostCenter': 'مرکز هزینه',
    'Account': 'حساب',
    'Party': 'طرف حساب',
    'Currency': 'ارز',
    'CurrencyExchangeRate': 'نرخ ارز',
    'User': 'کاربر',
    'UserGroup': 'گروه کاربری',
    'DocumentType': 'نوع سند',
    'Project': 'پروژه',
    'Contract': 'قرارداد',
    'ReceiptCheque': 'چک دریافتی',
    'PaymentCheque': 'چک پرداختی',
    'ChequePrintTemplate': 'قالب چاپ چک',
  };
  return map[entityName] || entityName;
}

export function getDeleteConfirmationMessage(title: string, values: Record<string, any> = {}): string {
  let formTitle = title || "";
  formTitle = formTitle.replace(/ویرایش|تعریف|ایجاد/g, "").trim();
  
  let numberVal = null;
  let titleVal = null;

  for (const key of Object.keys(values)) {
    if (key.match(/no$|number|code/i) && values[key] !== undefined && values[key] !== null && values[key] !== '') {
      numberVal = values[key];
      break;
    }
  }

  for (const key of Object.keys(values)) {
    if (key.match(/title|name/i) && values[key] !== undefined && values[key] !== null && values[key] !== '') {
      titleVal = values[key];
      break;
    }
  }

  if (numberVal) {
    return `از حذف اطلاعات ${formTitle} با شماره ${numberVal} اطمینان دارید؟`;
  } else if (titleVal) {
    return `از حذف اطلاعات ${formTitle} با عنوان ${titleVal} اطمینان دارید؟`;
  } else {
    return `از حذف اطلاعات ${formTitle} اطمینان دارید؟`;
  }
}

export function getBandStyleWidth(widthStr?: string): string {
  if (!widthStr) return '100%';
  const w = String(widthStr).trim();
  if (!w || w === '100%' || w === '100' || w === 'NaN' || w.includes('NaN')) return '100%';
  
  let num = NaN;
  if (w.endsWith('%')) {
    num = parseFloat(w);
  } else if (!w.endsWith('px') && !w.endsWith('rem') && !w.endsWith('em')) {
    num = parseFloat(w);
  }

  if (!isNaN(num) && num > 0 && num < 100) {
    const gapDeduction = ((100 - num) / 100) * 1.0;
    return `calc(${num}% - ${gapDeduction.toFixed(3)}rem)`;
  }
  
  return w;
}

// ---------------------------------------------------------------------------
// Task 71: کش مشترک تنظیمات اسناد فروش (SalesDocumentSettings)
// هدف: فرم‌هایی مانند سفارش فروش بتوانند تیک «نمایش پارامترهای خرید و فروش» و
// انبار پیش‌فرض را بلافاصله (بدون انتظار برای پاسخ شبکه) بخوانند تا باکس
// «عوامل سفارش» و بقیه فوتر هماهنگ با بقیه اجزای فرم و بدون پرش چیدمان باز شود.
// کش در حافظه صفحه نگه‌داری می‌شود و به ازای هر شرکت کلید مجزا دارد (همان منبعی
// که apiFetch برای x-company-id استفاده می‌کند). در هر mount فرم، واکشی تازه
// انجام می‌شود و کش و state به‌روزرسانی می‌گردد.
// ---------------------------------------------------------------------------

import { apiFetch } from "@/lib/utils";

export interface SalesDocumentSettingsData {
  SalesDocumentSettingsID?: number;
  SalesDocumentType?: number;
  HasBaseDocument?: boolean;
  BaseDocumentTypes?: string;
  ShowWarehouse?: boolean;
  DefaultWarehouseRef?: number | string | null;
  ShowSalesCenter?: boolean;
  DefaultSalesCenterRef?: number | string | null;
  ShowSalesType?: boolean;
  DefaultSalesTypeRef?: number | string | null;
  ShowDeliveryLocations?: boolean;
  DefaultDeliveryLocationRef?: number | string | null;
  ShowSettlementMethod?: boolean;
  DefaultSettlementMethodRef?: number | string | null;
  ShowPurchaseSalesParameters?: boolean;
  HasAccountingDocument?: boolean;
  IsActive?: boolean;
  [key: string]: any;
}

const cache = new Map<string, SalesDocumentSettingsData>();
const pending = new Map<number, Promise<SalesDocumentSettingsData | null>>();

function getCompanyId(): string {
  if (typeof window === "undefined") return "";
  try {
    const storageRaw = localStorage.getItem("app-company-storage");
    if (storageRaw) {
      const parsed = JSON.parse(storageRaw);
      const state = parsed?.state || {};
      return String(state?.currentCompany?.businessStructureId ?? "");
    }
  } catch (e) {
    /* ignore */
  }
  return "";
}

const buildKey = (type: number): string => `${getCompanyId()}|${type}`;

/** خواندن همزمان (بدون شبکه) از کش — اگر رکورد قبلاً واکشی شده باشد بلافاصله برمی‌گردد */
export function getCachedSalesDocumentSettings(type: number): SalesDocumentSettingsData | null {
  return cache.get(buildKey(type)) || null;
}

/** ذخیره رکورد در کش (مثلاً بعد از واکشی یا ذخیره فرم تنظیمات) */
export function setCachedSalesDocumentSettings(type: number, data: SalesDocumentSettingsData | null): void {
  if (!data) return;
  cache.set(buildKey(type), data);
}

/** خالی کردن کش یک نوع یا همه انواع (مثلاً بعد از تغییر تنظیمات در فرم تنظیمات اسناد فروش) */
export function invalidateSalesDocumentSettingsCache(type?: number): void {
  if (type === undefined) {
    cache.clear();
  } else {
    cache.delete(buildKey(type));
  }
}

/**
 * واکشی تنظیمات یک نوع سند — درخواست‌های همزمان برای یک نوع dedupe می‌شوند و
 * نتیجه موفق در کش ذخیره می‌شود تا mountهای بعدی فرم‌ها بتوانند همزمان رندر کنند.
 */
export function fetchSalesDocumentSettings(type: number): Promise<SalesDocumentSettingsData | null> {
  const existing = pending.get(type);
  if (existing) return existing;

  const promise = apiFetch(`/api/sle/sales-document-settings/by-type/${type}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((json) => {
      const data: SalesDocumentSettingsData | null = json?.success ? json?.data ?? null : null;
      if (data) {
        setCachedSalesDocumentSettings(type, data);
        return data;
      }
      return null;
    })
    .catch((err) => {
      console.error(`Error fetching sales document settings (type=${type}):`, err);
      return null;
    })
    .finally(() => {
      pending.delete(type);
    });

  pending.set(type, promise);
  return promise;
}

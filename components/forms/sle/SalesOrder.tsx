"use client";

import React, { useState, useEffect } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { FieldConfig } from "../SimpleFormTwoRow";
import { TabCellRow, TabCellConfig } from "../TabCellRow";
import { SingleSelectDropDown, SingleSelectColumn } from "@/components/inputs/SingleSelectDropDown";
import { MultiColumnDropDown, Column } from "@/components/inputs/MultiColumnDropdown";
import { NumberInput } from "@/components/inputs/NumberInput";
import { TextInput } from "@/components/inputs/TextInput";
import { DateInput } from "@/components/inputs/DateInput";
import { StateListInput, DocumentState, DocumentStateLabels } from "@/components/inputs/StateListInput";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { SubUnitModal } from "@/components/inputs/SubUnitModal";
import { TrackingFactorModal } from "@/components/forms/inv/TrackingFactorModal";
import { PurchaseSalesParameterDropDown } from "@/components/inputs/PurchaseSalesParameterDropDown";
import { StockSummaryBox } from "@/components/forms/inv/StockSummaryModal";
import { Plus, Pencil, X } from "lucide-react";
import { apiFetch, jalaliToGregorianISO, gregorianToJalaliDisplay, isValidJalaliDate } from "@/lib/utils";
import { useLanguage } from "@/lib/stores/languageStore";
import { formatLocalizedNumber } from "@/lib/digitLocale";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import {
  getCachedSalesDocumentSettings,
  fetchSalesDocumentSettings,
  SalesDocumentSettingsData,
} from "@/lib/salesDocumentSettingsCache";
import momentJalaali from "moment-jalaali";

interface SalesOrderProps {
  id?: number;
  tabId?: string;
}

function getTodayJalali() {
  try {
    return momentJalaali().format("jYYYY/jMM/jDD");
  } catch (e) {
    return "";
  }
}

const emptyRow = () => ({
  id: Date.now().toString(),
  RowNo: 1,
  ItemRef: null,
  ItemCode: "",
  ItemName: "",
  UnitName: "",
  Quantity: 1,
  UnitPrice: "",
  TotalPrice: "",
  Description: "",
});

// ---------------------------------------------------------------------------
// Task 82: پیش‌فرض‌های هدر فرم سفارش فروش از تنظیمات اسناد فروش (SalesDocumentType = 1)
// فقط فیلدهایی که در فرم تنظیمات تیک خورده‌اند و مقدار پیش‌فرض دارند تکمیل می‌شوند:
// نوع فروش / محل تحویل / روش تسویه / مرکز فروش
// ---------------------------------------------------------------------------
const extractHeaderDefaults = (data: SalesDocumentSettingsData | null) => ({
  SalesTypeRef:
    data?.ShowSalesType && data?.DefaultSalesTypeRef != null && data.DefaultSalesTypeRef !== ""
      ? Number(data.DefaultSalesTypeRef)
      : ("" as "" | number),
  DeliveryLocationRef:
    data?.ShowDeliveryLocations && data?.DefaultDeliveryLocationRef != null && data.DefaultDeliveryLocationRef !== ""
      ? Number(data.DefaultDeliveryLocationRef)
      : ("" as "" | number),
  SettlementMethodRef:
    data?.ShowSettlementMethod && data?.DefaultSettlementMethodRef != null && data.DefaultSettlementMethodRef !== ""
      ? Number(data.DefaultSettlementMethodRef)
      : ("" as "" | number),
  SalesCenterRef:
    data?.ShowSalesCenter && data?.DefaultSalesCenterRef != null && data.DefaultSalesCenterRef !== ""
      ? Number(data.DefaultSalesCenterRef)
      : ("" as "" | number),
});

/** فرم «جدیدِ» دست‌نخورده: بدون رکورد لودشده و بدون انتخاب کاربر — فقط در این حالت پیش‌فرض‌ها اعمال می‌شوند */
const isPristineNewOrder = (prev: Record<string, any>): boolean =>
  !prev.SalesOrderID &&
  !prev.CustomerRef &&
  !prev.SalesTypeRef &&
  !prev.SalesCenterRef &&
  !prev.DeliveryLocationRef &&
  !prev.SettlementMethodRef;

// ---------------------------------------------------------------------------
// Task 67: کمک‌تابع‌های پارامترهای خرید و فروش (همانند فرم رسید انبار)
// ---------------------------------------------------------------------------
const normalizePersianText = (txt: string | null | undefined): string => {
  if (!txt) return "";
  return String(txt)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

const normalizeJalaliDate = (dStr: any): string => {
  if (!dStr) return "";
  const cleaned = String(dStr).trim().slice(0, 10).replace(/-/g, "/");
  const parts = cleaned.split("/");
  if (parts.length === 3) {
    const y = parts[0];
    const m = parts[1].padStart(2, "0");
    const d = parts[2].padStart(2, "0");
    return `${y}/${m}/${d}`;
  }
  return cleaned;
};

const isDateInRange = (docDate: string, startDate?: string, endDate?: string): boolean => {
  const normDoc = normalizeJalaliDate(docDate);
  const normStart = normalizeJalaliDate(startDate);
  const normEnd = normalizeJalaliDate(endDate);

  if (!normDoc) return false;
  if (normStart && normDoc < normStart) return false;
  if (normEnd && normDoc > normEnd) return false;
  return true;
};

const getFactorVatRate = (paramObj: any, factor: any, dateStr: string): number => {
  const cat = Number(paramObj?.CategoryOther ?? factor?.CategoryOther ?? 0);
  const titleNorm = normalizePersianText(paramObj?.Title || factor?.FactorTitle);

  const isMunicipal = cat === 2 || titleNorm.includes("عوارض");
  const isVat = cat === 1 || titleNorm.includes("مالیات") || (titleNorm.includes("ارزش افزوده") && !isMunicipal);

  if (!isVat && !isMunicipal) return 0;

  const valuesList = Array.isArray(paramObj?.ParameterValues)
    ? paramObj.ParameterValues
    : Array.isArray(paramObj?.parameterValues)
    ? paramObj.parameterValues
    : Array.isArray(paramObj?.dates)
    ? paramObj.dates
    : [];

  let rate = 0;

  if (dateStr && valuesList.length > 0) {
    const match = valuesList.find((v: any) =>
      isDateInRange(dateStr, v.StartDate || v.startDate, v.EndDate || v.endDate)
    );
    if (match) {
      const rawVal = Number(match.ParameterValue ?? match.parameterValue ?? match.Value ?? match.ValuePercentage ?? 0);
      if (rawVal > 0) {
        rate = rawVal > 1 ? rawVal / 100 : rawVal;
      }
    }
  }

  if (rate === 0 && valuesList.length > 0) {
    for (let i = valuesList.length - 1; i >= 0; i--) {
      const rawVal = Number(valuesList[i].ParameterValue ?? valuesList[i].parameterValue ?? valuesList[i].Value ?? valuesList[i].ValuePercentage ?? 0);
      if (rawVal > 0) {
        rate = rawVal > 1 ? rawVal / 100 : rawVal;
        break;
      }
    }
  }

  if (rate === 0) {
    if (isMunicipal) {
      rate = 0.03;
    } else if (isVat) {
      const normDate = normalizeJalaliDate(dateStr);
      if (normDate && normDate < "1403/01/01") {
        rate = 0.06;
      } else {
        rate = 0.07;
      }
    }
  }

  return rate;
};

const getParameterValueForDate = (paramObj: any, dateStr: string): number => {
  if (!paramObj) return 0;
  const valuesList = Array.isArray(paramObj?.ParameterValues)
    ? paramObj.ParameterValues
    : Array.isArray(paramObj?.parameterValues)
    ? paramObj.parameterValues
    : Array.isArray(paramObj?.dates)
    ? paramObj.dates
    : [];

  if (dateStr && valuesList.length > 0) {
    const match = valuesList.find((v: any) =>
      isDateInRange(dateStr, v.StartDate || v.startDate, v.EndDate || v.endDate)
    );
    if (match) {
      return Number(match.ParameterValue ?? match.parameterValue ?? match.Value ?? match.ValuePercentage ?? match.Amount ?? 0);
    }
  }

  if (valuesList.length > 0) {
    for (let i = valuesList.length - 1; i >= 0; i--) {
      const val = Number(valuesList[i].ParameterValue ?? valuesList[i].parameterValue ?? valuesList[i].Value ?? valuesList[i].ValuePercentage ?? valuesList[i].Amount ?? 0);
      if (val > 0) return val;
    }
  }

  return Number(paramObj?.DefaultAmount || paramObj?.DefaultValue || paramObj?.DefaultPercentage || 0);
};

export function SalesOrder({ id, tabId }: SalesOrderProps) {
  const { removeTab } = useTabs();
  const { showToast } = useToast();
  // Task 62: زبان انتخاب‌شده کاربر برای نمایش اعداد (فی/مقدار/مبلغ کل) در همان زبان
  const { language } = useLanguage();
  const { activeId, setActiveId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("SalesOrders", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    SalesOrderID: "",
    OrderNumber: "",
    OrderDate: getTodayJalali(),
    DeliveryDate: "",
    CustomerRef: "",
    CustomerName: "",
    SalesTypeRef: "",
    SalesCenterRef: "",
    DeliveryLocationRef: "",
    SettlementMethodRef: "",
    Status: DocumentState.InitialRegistration,
    Description: "",
    items: [emptyRow()],
    factors: [],
  });

  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [salesTypeOptions, setSalesTypeOptions] = useState<any[]>([]);
  const [salesCenterOptions, setSalesCenterOptions] = useState<any[]>([]);
  const [settlementMethodOptions, setSettlementMethodOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Task 67: تنظیمات سند فروش — تیک «نمایش پارامترهای خرید و فروش» تعیین می‌کند فوتر سه‌باکسه یا دو‌باکسه باشد
  // Task 71: مقداردهی اولیه همزمان از کش مشترک — تا باکس «عوامل سفارش» هماهنگ با بقیه باکس‌های فوتر
  // (بدون پرش چیدمان از ۲ ستون به ۳ ستون) باز شود؛ settingsReady فقط وقتی false است که کش خالی باشد
  // (اولین باز شدن پس از لود صفحه) و در این حالت کل فوتر تا رسیدن پاسخ یکجا رندر می‌شود.
  const [showPurchaseSales, setShowPurchaseSales] = useState<boolean>(
    () => !!getCachedSalesDocumentSettings(1)?.ShowPurchaseSalesParameters
  );
  const [defaultWarehouseRef, setDefaultWarehouseRef] = useState<number | null>(() => {
    const ref = getCachedSalesDocumentSettings(1)?.DefaultWarehouseRef;
    return ref != null && ref !== "" ? Number(ref) : null;
  });
  const [settingsReady, setSettingsReady] = useState<boolean>(() => getCachedSalesDocumentSettings(1) != null);
  const [parametersList, setParametersList] = useState<any[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [selectedFactorIndex, setSelectedFactorIndex] = useState<number | null>(null);
  const [isFooterCollapsed, setIsFooterCollapsed] = useState(false);

  // Task 61: مودال واحدهای سنجش فرعی (مشابه فرم رسید انبار)
  const [subUnitModalState, setSubUnitModalState] = useState<{
    isOpen: boolean;
    rowIndex: number;
    itemId?: number | string;
    itemCode?: string | number;
    itemTitle?: string;
    primaryUnitName?: string;
    subUnits: any[];
    selectedSubUnitId?: any;
    initialSubQuantity?: number | string;
    initialMainQuantity?: number | string;
  }>({
    isOpen: false,
    rowIndex: -1,
    subUnits: [],
  });

  // ---------------------------------------------------------------------------
  // Task 74: عامل ردیابی — اگر در تنظیمات پایه (تب فروش) گزینه «سفارش فروش» فعال باشد،
  // ستون «مقدار» همانند فرم حواله انبار رفتار می‌کند: برای کالاهای دارای عامل ردیابی،
  // مودال «ثبت / انتخاب اطلاعات عوامل ردیابی» باز می‌شود تا کاربر اطلاعات ردیابی را تکمیل کند.
  // ---------------------------------------------------------------------------
  const [isTrackingFactorEnabled, setIsTrackingFactorEnabled] = useState(false);
  const [allTrackingFactors, setAllTrackingFactors] = useState<any[]>([]);
  const [tfModalState, setTfModalState] = useState<{
    isOpen: boolean;
    rowIndex: number | null;
    itemName: string;
    itemCode: string;
    trackingFactors: any[];
    initialValues: any;
    initialQuantity: any;
  }>({
    isOpen: false,
    rowIndex: null,
    itemName: "",
    itemCode: "",
    trackingFactors: [],
    initialValues: {},
    initialQuantity: "",
  });

  const getItemRef = (row: any): number | null => {
    if (!row) return null;
    const raw = row.ItemRef ?? row.ItemID ?? row.itemRef;
    if (raw === null || raw === undefined || raw === "") return null;
    if (typeof raw === "object") {
      const innerId = raw.ItemID ?? raw.id ?? raw.value;
      const num = Number(innerId);
      return !isNaN(num) && num > 0 ? num : null;
    }
    const num = Number(raw);
    return !isNaN(num) && num > 0 ? num : null;
  };

  const getItemTrackingFactors = (itemRef: any) => {
    if (!itemRef || !allTrackingFactors || allTrackingFactors.length === 0) return [];
    const matchedItem = availableItems.find((i) => String(i.ItemID || i.id) === String(itemRef));
    if (matchedItem && matchedItem.trackingFactors && matchedItem.trackingFactors.length > 0) {
      return matchedItem.trackingFactors;
    }
    return allTrackingFactors
      .filter((tf: any) => {
        const related = tf.relatedItems || tf.Items || tf.items || [];
        return related.some(
          (rel: any) => Number(rel.ItemRef || rel.item?.ItemID || rel.ItemID || rel.id) === Number(itemRef)
        );
      })
      .sort((a, b) => (a.DisplayPriority || 1) - (b.DisplayPriority || 1));
  };

  const customerColumns: SingleSelectColumn[] = [
    { key: "code", label: "کد", width: 100 },
    { key: "title", label: "عنوان مشتری", width: 260 },
  ];

  // renderItem با fallback به فیلدهای PascalCase (ردیف‌های خام listApiUrl مثل مکان تحویل)
  const refColumns: SingleSelectColumn[] = [
    {
      key: "code",
      label: "کد",
      width: 70,
      renderItem: (item: any) => String(item?.code ?? item?.Code ?? ""),
      exportValue: (item: any) => String(item?.code ?? item?.Code ?? ""),
    },
    {
      key: "title",
      label: "عنوان",
      width: 220,
      renderItem: (item: any) => String(item?.title ?? item?.Title ?? ""),
      exportValue: (item: any) => String(item?.title ?? item?.Title ?? ""),
    },
  ];

  // Fetch dropdown data: items (کالا) and customers (مشتریان)
  useEffect(() => {
    apiFetch("/api/inv/items/dropdown?type=1")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setAvailableItems(
          list
            .filter((item: any) => Number(item.ItemType) === 1)
            .map((item: any) => ({
              id: item.ItemID || item.id,
              ItemID: item.ItemID || item.id,
              ItemCode: item.ItemCode || item.code || "",
              ItemName: item.ItemName || item.title || item.name || "",
              UnitName: item.MeasurementUnit?.MeasurementUnitTitle || item.MeasurementUnit?.MeasurementUnitName || item.UnitName || item.unit || item.MeasurementUnitName || "عدد",
              ItemType: Number(item.ItemType),
              // Task 61: اطلاعات واحدهای سنجش فرعی (مشابه فرم رسید انبار)
              mainUnit: item.mainUnit || null,
              subUnits: item.subUnits || [],
              allUnits: item.allUnits || [],
              // Task 74: عوامل ردیابی مرتبط با کالا (در صورت وجود)
              trackingFactors: item.trackingFactors || [],
            }))
        );
      })
      .catch((err) => console.error("Error fetching items:", err));

    apiFetch("/api/sle/customers")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setCustomerOptions(
          list.map((c: any) => {
            const party = c.party || c.Party || {};
            const name =
              party.title ||
              [party.firstName, party.lastName].filter(Boolean).join(" ") ||
              c.Title ||
              c.title ||
              "";
            return {
              id: c.CustomerID || c.customerId || c.id,
              code: c.Code || c.code || "",
              title: name,
              title2: party.title2 || "",
            };
          })
        );
      })
      .catch((err) => console.error("Error fetching customers:", err));

    // انواع فروش (از فرم نوع فروش جدید)
    apiFetch("/api/sle/sales-types")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setSalesTypeOptions(
          list.map((s: any) => ({
            id: s.SalesTypeID || s.id,
            code: s.Code || s.code || "",
            title: s.Title || s.title || "",
          }))
        );
      })
      .catch((err) => console.error("Error fetching sales types:", err));

    // مراکز فروش (از فرم مرکز فروش جدید)
    apiFetch("/api/sle/sales-centers")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setSalesCenterOptions(
          list.map((s: any) => ({
            id: s.SalesCenterID || s.id,
            code: s.Code || s.code || "",
            title: s.Title || s.title || "",
          }))
        );
      })
      .catch((err) => console.error("Error fetching sales centers:", err));

    // مکان های تحویل (از فرم مکان های تحویل): دراپ‌داون با listApiUrl هر بار هنگام باز شدن
    // داده‌ها را تازه واکشی می‌کند تا مکان‌های تحویل فعالِ جدید (حتی اگر بعد از باز شدن
    // این فرم ثبت شده باشند) هم نمایش داده شوند؛ فقط رکوردهای IsActive=true.

    // روش های تسویه (از فرم روش تسویه جدید)
    apiFetch("/api/sle/settlement-methods")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setSettlementMethodOptions(
          list.map((s: any) => ({
            id: s.SettlementMethodID || s.id,
            code: s.Code || s.code || "",
            title: s.Title || s.title || "",
          }))
        );
      })
      .catch((err) => console.error("Error fetching settlement methods:", err));

    // Task 67 + 71: تنظیمات سند سفارش فروش (SalesDocumentType = 1) — تیک نمایش پارامترهای خرید و فروش
    // واکشی از طریق کش مشترک: نتیجه در کش ذخیره می‌شود تا mountهای بعدی فوراً از کش بخوانند
    fetchSalesDocumentSettings(1).then((data) => {
      if (data) {
        setShowPurchaseSales(!!data.ShowPurchaseSalesParameters);
        if (data.DefaultWarehouseRef != null && data.DefaultWarehouseRef !== "") {
          setDefaultWarehouseRef(Number(data.DefaultWarehouseRef));
        }
        // Task 82: پیش‌فرض‌گذاری فیلدهای هدر (نوع فروش/محل تحویل/روش تسویه/مرکز فروش)
        // فقط روی فرم جدیدِ دست‌نخورده — رکورد لودشده یا انتخاب کاربر بازنویسی نمی‌شود
        setValues((prev) =>
          isPristineNewOrder(prev) ? { ...prev, ...extractHeaderDefaults(data) } : prev
        );
      }
      setSettingsReady(true);
    });

    // Task 67: فهرست پارامترهای خرید و فروش (برای محاسبه خودکار مبلغ عوامل)
    apiFetch("/api/inv/purchase-sales-parameters")
      .then((res) => (res.ok ? res.json() : []))
      .then((resData) => {
        const list = Array.isArray(resData) ? resData : Array.isArray(resData?.data) ? resData.data : [];
        setParametersList(list);
      })
      .catch((err) => console.error("Error fetching purchase sales parameters:", err));

    // ---------------------------------------------------------------------------
    // Task 74: تنظیمات پایه (تب فروش) — کلید showTrackingFactorInSalesOrder تعیین می‌کند
    // مودال عامل ردیابی (مشابه حواله انبار) در ستون مقدار فعال باشد یا خیر
    // ---------------------------------------------------------------------------
    Promise.all([
      apiFetch("/api/common/base-settings/tab/4").then((res) => (res.ok ? res.json() : null)).catch(() => null),
      apiFetch("/api/common/base-settings").then((res) => (res.ok ? res.json() : null)).catch(() => null),
    ]).then(([tab4Data, baseData]) => {
      const checkSetting = (data: any, keyName: string) => {
        if (!data) return false;
        const target = keyName.toLowerCase();
        if (Array.isArray(data)) {
          return data.some(
            (s: any) =>
              (s.key?.toLowerCase() === target || s.SettingKey?.toLowerCase() === target) &&
              (s.value === "true" || s.value === true || s.SettingValue === "true" || s.SettingValue === true)
          );
        }
        if (Array.isArray(data.data)) {
          return data.data.some(
            (s: any) =>
              (s.key?.toLowerCase() === target || s.SettingKey?.toLowerCase() === target) &&
              (s.value === "true" || s.value === true || s.SettingValue === "true" || s.SettingValue === true)
          );
        }
        const obj = data.data || data;
        if (typeof obj === "object" && obj !== null) {
          const matchingKey = Object.keys(obj).find((k) => k.toLowerCase() === target);
          if (matchingKey) {
            const val = obj[matchingKey];
            return val === "true" || val === true || val === 1 || val === "1";
          }
        }
        return false;
      };

      // فقط تیک «سفارش فروش» — بدون fallback پیش‌فرض true (برخلاف حواله انبار که فعال‌فرض می‌شود)
      const soActive =
        checkSetting(tab4Data, "showTrackingFactorInSalesOrder") ||
        checkSetting(baseData, "showTrackingFactorInSalesOrder");
      setIsTrackingFactorEnabled(soActive);
    }).catch(() => {
      setIsTrackingFactorEnabled(false);
    });

    // Task 74: فهرست عوامل ردیابی فعال (برای تشخیص کالاهای دارای عامل ردیابی)
    apiFetch("/api/inv/tracking-factors")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setAllTrackingFactors(list);
      })
      .catch((err) => console.error("Error fetching tracking factors:", err));
  }, []);

  // Fetch Next Order Number on new form
  const fetchNextNumber = () => {
    apiFetch("/api/sle/sales-orders/next-number")
      .then((res) => res.json())
      .then((data) => {
        const num = data?.documentNumber || data?.data?.documentNumber;
        if (num) {
          setValues((prev) => ({ ...prev, OrderNumber: num }));
        }
      })
      .catch((err) => console.error("Error fetching next order number:", err));
  };

  // Fetch existing record if activeId is set
  useEffect(() => {
    if (activeId) {
      setIsLoading(true);
      apiFetch(`/api/sle/sales-orders/${activeId}`)
        .then((res) => res.json())
        .then((resData) => {
          const data = resData?.data || resData;
          if (data && data.SalesOrderID) {
            setValues({
              SalesOrderID: data.SalesOrderID,
              OrderNumber: data.OrderNumber || "",
              OrderDate: data.OrderDate ? gregorianToJalaliDisplay(data.OrderDate) : getTodayJalali(),
              DeliveryDate: data.DeliveryDate ? gregorianToJalaliDisplay(data.DeliveryDate) : "",
              CustomerRef: data.CustomerRef ? Number(data.CustomerRef) : "",
              CustomerName: data.CustomerName || "",
              SalesTypeRef: data.SalesTypeRef ? Number(data.SalesTypeRef) : "",
              SalesCenterRef: data.SalesCenterRef ? Number(data.SalesCenterRef) : "",
              DeliveryLocationRef: data.DeliveryLocationRef ? Number(data.DeliveryLocationRef) : "",
              SettlementMethodRef: data.SettlementMethodRef ? Number(data.SettlementMethodRef) : "",
              Status: data.Status || DocumentState.InitialRegistration,
              Description: data.Description || "",
              items:
                Array.isArray(data.items) && data.items.length > 0
                  ? data.items.map((d: any, idx: number) => ({
                      id: (idx + 1).toString(),
                      RowNo: idx + 1,
                      ItemRef: d.ItemRef,
                      ItemCode: d.ItemCode || "",
                      ItemName: d.ItemName || "",
                      UnitName: d.UnitName || "عدد",
                      // Task 64: نرمال‌سازی اعداد بارگذاری‌شده — فی و مبلغ کل بدون اعشار نمایش داده شوند
                      Quantity: Number(d.Quantity) || 1,
                      UnitPrice: d.UnitPrice !== "" && d.UnitPrice !== undefined && d.UnitPrice !== null ? Math.round(Number(d.UnitPrice)) : "",
                      TotalPrice: d.TotalPrice !== "" && d.TotalPrice !== undefined && d.TotalPrice !== null ? Math.round(Number(d.TotalPrice)) : "",
                      Description: d.Description || "",
                      // Task 74: مقادیر عوامل ردیابی ذخیره‌شده ردیف (برای بازخوانی در مودال)
                      trackingFactorValues: d.TrackingFactorValues || d.trackingFactorValues || null,
                    }))
                  : [emptyRow()],
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching sales order:", err);
          showToast("خطا در واکشی اطلاعات سفارش فروش", "error");
        })
        .finally(() => setIsLoading(false));
    } else {
      fetchNextNumber();
    }
  }, [activeId]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleNew = () => {
    setActiveId(undefined);
    // Task 82: فیلدهای نوع فروش/محل تحویل/روش تسویه/مرکز فروش بر اساس تنظیمات پیش‌فرض
    // ثبت‌شده در فرم تنظیمات اسناد فروش (برای نوع سفارش فروش) تکمیل می‌شوند
    const settings = getCachedSalesDocumentSettings(1);
    const defaults = extractHeaderDefaults(settings);
    setValues({
      SalesOrderID: "",
      OrderNumber: "",
      OrderDate: getTodayJalali(),
      DeliveryDate: "",
      CustomerRef: "",
      CustomerName: "",
      SalesTypeRef: defaults.SalesTypeRef,
      SalesCenterRef: defaults.SalesCenterRef,
      DeliveryLocationRef: defaults.DeliveryLocationRef,
      SettlementMethodRef: defaults.SettlementMethodRef,
      Status: DocumentState.InitialRegistration,
      Description: "",
      items: [emptyRow()],
      factors: [],
    });
    fetchNextNumber();
    // Task 82: اگر کش تنظیمات هنوز خالی است، پس از واکشی (در صورت دست‌نخورده ماندن فرم جدید) اعمال شود
    if (!settings) {
      fetchSalesDocumentSettings(1).then((data) => {
        setValues((prev) =>
          data && isPristineNewOrder(prev) ? { ...prev, ...extractHeaderDefaults(data) } : prev
        );
      });
    }
  };

  const handleSave = async (): Promise<boolean> => {
    if (!values.OrderNumber) {
      showToast("لطفاً شماره سفارش را وارد کنید *", "error");
      return false;
    }
    if (!values.OrderDate) {
      showToast("لطفاً تاریخ سفارش را وارد کنید *", "error");
      return false;
    }
    // Task 63: کنترل صحت تاریخ‌ها — روز/ماه نامعتبر (مثل ۴۵) اجازه ذخیره ندارد
    if (!isValidJalaliDate(values.OrderDate)) {
      showToast("تاریخ سفارش وارد شده معتبر نیست *", "error");
      return false;
    }
    if (values.DeliveryDate && !isValidJalaliDate(values.DeliveryDate)) {
      showToast("تاریخ تحویل وارد شده معتبر نیست *", "error");
      return false;
    }
    if (!values.CustomerRef) {
      showToast("لطفاً مشتری را انتخاب کنید *", "error");
      return false;
    }
    if (!values.SalesTypeRef) {
      showToast("لطفاً نوع فروش را انتخاب کنید *", "error");
      return false;
    }
    if (!values.SalesCenterRef) {
      showToast("لطفاً مرکز فروش را انتخاب کنید *", "error");
      return false;
    }
    if (!values.DeliveryLocationRef) {
      showToast("لطفاً محل تحویل را انتخاب کنید *", "error");
      return false;
    }
    if (!values.SettlementMethodRef) {
      showToast("لطفاً روش تسویه را انتخاب کنید *", "error");
      return false;
    }

    const validItems = (values.items || []).filter(
      (item: any) => item.ItemRef && Number(item.Quantity) > 0
    );
    if (validItems.length === 0) {
      showToast("لطفاً حداقل یک کالا با مقدار معتبر در جدول اقلام سفارش وارد کنید *", "error");
      return false;
    }

    const selectedCustomer = customerOptions.find(
      (c) => Number(c.id) === Number(values.CustomerRef)
    );
    const customerName = selectedCustomer?.title || values.CustomerName || "";

    const payload = {
      OrderNumber: Number(values.OrderNumber),
      OrderDate: jalaliToGregorianISO(values.OrderDate || getTodayJalali()),
      DeliveryDate: values.DeliveryDate ? jalaliToGregorianISO(values.DeliveryDate) : null,
      CustomerRef: Number(values.CustomerRef),
      CustomerName: customerName,
      SalesTypeRef: Number(values.SalesTypeRef),
      SalesCenterRef: Number(values.SalesCenterRef),
      DeliveryLocationRef: Number(values.DeliveryLocationRef),
      SettlementMethodRef: Number(values.SettlementMethodRef),
      Status: values.Status || DocumentState.InitialRegistration,
      Description: values.Description || "",
      items: validItems.map((item: any, idx: number) => ({
        RowNo: idx + 1,
        ItemRef: Number(item.ItemRef),
        ItemCode: item.ItemCode || "",
        ItemName: item.ItemName || "",
        UnitName: item.UnitName || "",
        Quantity: Number(item.Quantity),
        UnitPrice: Math.round(Number(item.UnitPrice || 0)),
        TotalPrice:
          item.TotalPrice !== "" && item.TotalPrice !== undefined && item.TotalPrice !== null
            ? Math.round(Number(item.TotalPrice))
            : Math.round(Number(item.Quantity || 0) * Number(item.UnitPrice || 0)),
        Description: item.Description || "",
        // Task 74: مقادیر عوامل ردیابی ردیف (ذخیره در ستون TrackingFactorValues)
        trackingFactorValues: item.trackingFactorValues || null,
      })),
    };

    try {
      const res = await apiFetch(getUrl("/api/sle/sales-orders"), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "خطا در ذخیره‌سازی سفارش فروش", "error");
        return false;
      }

      const savedData = await res.json();
      const saved = savedData?.data || savedData;
      showToast("سفارش فروش با موفقیت ذخیره شد", "success");
      if (saved && saved.SalesOrderID) {
        handleResponse(saved, "SalesOrderID");
        setActiveId(Number(saved.SalesOrderID));
        setValues((prev) => ({ ...prev, SalesOrderID: saved.SalesOrderID }));
      }
      return true;
    } catch (err: any) {
      console.error("Save error:", err);
      showToast("خطا در اتصال به سرور", "error");
      return false;
    }
  };

  const handleSaveNew = async () => {
    const success = await handleSave();
    if (success) {
      handleNew();
    }
  };

  const handleDelete = async () => {
    if (!activeId) return;
    try {
      const res = await apiFetch(`/api/sle/sales-orders/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "خطا در حذف سفارش فروش", "error");
        throw new Error(errData.message || "خطا در حذف سفارش فروش");
      }
    } catch (err: any) {
      if (err?.message !== "خطا در حذف سفارش فروش") {
        showToast("خطا در ارسال درخواست حذف", "error");
      }
      throw err;
    }
  };

  const handleListSelect = (item: any) => {
    if (!item) return;
    const selectedId = item.SalesOrderID || item.id;
    if (selectedId) {
      setActiveId(Number(selectedId));
    }
  };

  // Task 67: محاسبات مالی فوتر (جمع اقلام + اضافات/کسورات عوامل) — همانند فرم رسید انبار
  const totalItemsGross = (values.items || []).reduce((sum: number, item: any) => sum + (Number(item.TotalPrice) || 0), 0);
  const totalFactorAdditions = (values.factors || [])
    .filter((f: any) => Number(f.FactorType) === 1)
    .reduce((sum: number, f: any) => sum + (Number(f.Amount) || 0), 0);
  const totalFactorDeductions = (values.factors || [])
    .filter((f: any) => Number(f.FactorType) === 2)
    .reduce((sum: number, f: any) => sum + (Number(f.Amount) || 0), 0);
  const displayAdditions = totalFactorAdditions;
  const displayDeductions = totalFactorDeductions;
  const finalNetTotal = totalItemsGross + displayAdditions - displayDeductions;

  // Task 67: انتخاب پارامتر برای ردیف عامل — تعیین نوع (اضافه/کسر) و محاسبه خودکار مبلغ اولیه
  const handleFactorParamSelect = (selectedParam: any, idx: number) => {
    const titleVal = typeof selectedParam === "object" ? selectedParam?.Title || "" : String(selectedParam || "");
    let paramObj = typeof selectedParam === "object" ? selectedParam : null;

    // اگر آبجکت انتخابی مقادیر تاریخ‌دار (ParameterValues) نداشت، از فهرست پارامترها تکمیل شود
    if (paramObj && !Array.isArray(paramObj?.ParameterValues) && !Array.isArray(paramObj?.parameterValues)) {
      const found = (parametersList || []).find(
        (p: any) => Number(p.PurchaseSalesParameterID || p.id) === Number(paramObj?.PurchaseSalesParameterID || paramObj?.id)
      );
      if (found) paramObj = found;
    }

    const cat = Number(paramObj?.CategoryOther ?? 0);
    const opType = Number(paramObj?.OperationType ?? 1);
    const titleNorm = normalizePersianText(titleVal);

    const isVat = cat === 1 || cat === 2 || titleNorm.includes("مالیات") || titleNorm.includes("ارزش افزوده") || titleNorm.includes("عوارض");
    const isDiscount = cat === 3 || titleNorm.includes("تخفیف");
    const factorTypeVal = isDiscount ? 2 : 1;

    const totalGrossSum = (values.items || []).reduce((acc: number, row: any) => acc + (Number(row.TotalPrice) || 0), 0);
    const totalItemsQuantity = (values.items || []).reduce((acc: number, row: any) => acc + (Number(row.Quantity) || 0), 0);

    let initialAmount = 0;
    if (isVat) {
      const rate = getFactorVatRate(paramObj, { FactorTitle: titleVal }, values.OrderDate);
      initialAmount = Math.round(totalGrossSum * rate);
    } else if (opType === 3) {
      const rawVal = getParameterValueForDate(paramObj, values.OrderDate);
      if (rawVal > 0) {
        const rate = rawVal > 1 ? rawVal / 100 : rawVal;
        initialAmount = Math.round(totalGrossSum * rate);
      }
    } else if (opType === 4) {
      const unitVal = getParameterValueForDate(paramObj, values.OrderDate);
      if (unitVal > 0) {
        initialAmount = Math.round(totalItemsQuantity * unitVal);
      }
    } else if (opType === 1) {
      const fixedVal = getParameterValueForDate(paramObj, values.OrderDate);
      if (fixedVal > 0) {
        initialAmount = Math.round(fixedVal);
      }
    }

    const updatedFactors = [...(values.factors || [])];
    updatedFactors[idx] = {
      ...updatedFactors[idx],
      FactorTitle: titleVal || paramObj?.Title || "",
      paramObj: paramObj || undefined,
      PurchaseSalesParameterRef: paramObj?.PurchaseSalesParameterID || updatedFactors[idx]?.PurchaseSalesParameterRef,
      CategoryOther: cat,
      FactorType: factorTypeVal,
      Amount: initialAmount > 0 ? initialAmount : updatedFactors[idx]?.Amount || 0,
    };

    setValues((prev) => ({ ...prev, factors: updatedFactors }));
  };

  // Header fields
  const fields: FieldConfig[] = [
    {
      name: "Customer",
      label: "مشتری *",
      type: "custom",
      required: true,
      render: ({ disabled }) => (
        <SingleSelectDropDown
          options={customerOptions}
          columns={customerColumns}
          value={values.CustomerRef || ""}
          valueKey="id"
          displayKey="title"
          onChange={(sel: any) => {
            if (!sel) {
              setValues((prev) => ({ ...prev, CustomerRef: "", CustomerName: "" }));
              return;
            }
            if (typeof sel === "object") {
              setValues((prev) => ({
                ...prev,
                CustomerRef: sel.id ? Number(sel.id) : "",
                CustomerName: sel.title || "",
              }));
            } else {
              const found = customerOptions.find((c) => Number(c.id) === Number(sel));
              setValues((prev) => ({
                ...prev,
                CustomerRef: sel ? Number(sel) : "",
                CustomerName: found?.title || "",
              }));
            }
          }}
          placeholder="انتخاب مشتری..."
          disabled={disabled || isUsed}
          addFormOptions={[
            { title: "تعریف مشتری جدید", componentName: "CustomerForm", groupId: "sales" },
          ]}
        />
      ),
    },
    {
      name: "OrderNumberAndDate",
      type: "custom",
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <NumberInput
            label="شماره :"
            required
            value={values.OrderNumber}
            localizeDigits
            onChange={(val) => handleChange("OrderNumber", val)}
            disabled={disabled || isUsed}
            placeholder="شماره سفارش"
            labelWidth="45px"
          />
          <DateInput
            label="تاریخ :"
            required
            value={values.OrderDate}
            onChange={(val) => handleChange("OrderDate", val)}
            disabled={disabled || isUsed}
            labelWidth="40px"
          />
        </div>
      ),
    },
    {
      name: "DeliveryDateAndSalesType",
      type: "custom",
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <DateInput
            label="تاریخ تحویل :"
            value={values.DeliveryDate || ""}
            onChange={(val) => handleChange("DeliveryDate", val)}
            disabled={disabled || isUsed}
            labelWidth="62px"
          />
          <SingleSelectDropDown
            options={salesTypeOptions}
            columns={refColumns}
            value={values.SalesTypeRef || ""}
            valueKey="id"
            displayKey="title"
            onChange={(sel: any) => {
              if (!sel) {
                setValues((prev) => ({ ...prev, SalesTypeRef: "" }));
                return;
              }
              const refId = typeof sel === "object" ? sel.id : sel;
              setValues((prev) => ({ ...prev, SalesTypeRef: refId ? Number(refId) : "" }));
            }}
            placeholder="انتخاب نوع فروش..."
            label="نوع فروش :"
            required
            labelWidth="55px"
            disabled={disabled || isUsed}
          />
        </div>
      ),
    },
    {
      name: "DeliveryLocationAndSettlementMethod",
      type: "custom",
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <SingleSelectDropDown
            listApiUrl="/api/sle/delivery-locations?activeOnly=true"
            filterItem={(d: any) => d.IsActive !== false && d.IsActive !== 0}
            addFormOptions={{ title: "تعریف مکان تحویل جدید", componentName: "DeliveryLocationForm", groupId: "sle" }}
            columns={refColumns}
            value={values.DeliveryLocationRef || ""}
            valueKey="DeliveryLocationID"
            displayKey="title"
            searchKeys={["code", "title", "Title", "Title2"]}
            onChange={(sel: any, selVal: any) => {
              const refId =
                selVal ??
                (typeof sel === "object" ? sel?.DeliveryLocationID ?? sel?.id : sel);
              setValues((prev) => ({ ...prev, DeliveryLocationRef: refId ? Number(refId) : "" }));
            }}
            placeholder="انتخاب محل تحویل..."
            label="محل تحویل :"
            required
            labelWidth="58px"
            disabled={disabled || isUsed}
          />
          <SingleSelectDropDown
            options={settlementMethodOptions}
            columns={refColumns}
            value={values.SettlementMethodRef || ""}
            valueKey="id"
            displayKey="title"
            onChange={(sel: any) => {
              if (!sel) {
                setValues((prev) => ({ ...prev, SettlementMethodRef: "" }));
                return;
              }
              const refId = typeof sel === "object" ? sel.id : sel;
              setValues((prev) => ({ ...prev, SettlementMethodRef: refId ? Number(refId) : "" }));
            }}
            placeholder="انتخاب روش تسویه..."
            label="روش تسویه :"
            required
            labelWidth="58px"
            disabled={disabled || isUsed}
          />
        </div>
      ),
    },
    {
      // Task 80: «مرکز فروش» در هدر — همانند «نوع فروش»: دراپ‌داون تک‌انتخابی با اعتبارسنجی اجباری
      name: "SalesCenter",
      label: "مرکز فروش *",
      type: "custom",
      required: true,
      render: ({ disabled }) => (
        <SingleSelectDropDown
          options={salesCenterOptions}
          columns={refColumns}
          value={values.SalesCenterRef || ""}
          valueKey="id"
          displayKey="title"
          onChange={(sel: any) => {
            if (!sel) {
              setValues((prev) => ({ ...prev, SalesCenterRef: "" }));
              return;
            }
            const refId = typeof sel === "object" ? sel.id : sel;
            setValues((prev) => ({ ...prev, SalesCenterRef: refId ? Number(refId) : "" }));
          }}
          placeholder="انتخاب مرکز فروش..."
          disabled={disabled || isUsed}
        />
      ),
    },
    {
      // Task 81: «وضعیت» کنار «مرکز فروش» — همان سطر گرید دوستونه
      name: "Status",
      type: "custom",
      noWrapper: true,
      render: ({ disabled }) => (
        <StateListInput
          label="وضعیت :"
          required
          value={values.Status}
          onChange={(val) => handleChange("Status", val || DocumentState.InitialRegistration)}
          allowedStates={[
            DocumentState.InitialRegistration,
            DocumentState.Approved,
            DocumentState.Cancelled,
          ]}
          disabled={disabled || isUsed}
          labelWidth="45px"
        />
      ),
    },
    {
      // Task 81: «توضیحات» در ردیف آخر و تمام‌عرض (col-span-2)
      name: "Description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات تکمیلی سفارش فروش...",
      rows: 1,
      colSpan: 2,
    },
  ];

  // Items table columns
  const itemDropdownColumns: Column[] = [
    { key: "ItemCode", label: "کد کالا", width: 120 },
    { key: "ItemName", label: "عنوان کالا", width: 220 },
    { key: "UnitName", label: "واحد سنجش", width: 120 },
  ];

  const detailTabConfig: TabCellConfig[] = [
    {
      name: "RowNo",
      label: "ردیف",
      type: "text",
      width: "60px",
      render: (_row, rowIndex) => (
        <span className="flex items-center justify-center w-full h-[25px] text-xs font-semibold text-center select-none tabular-nums">
          {/* Task 83: ردیف با ارقام بومی زبان کاربر (فارسی) و فونت یکسان */}
          {formatLocalizedNumber(rowIndex + 1, language)}
        </span>
      ),
    },
    {
      name: "ItemRef",
      label: "کد کالا *",
      type: "custom",
      width: "240px",
      render: (row, rowIndex) => {
        const val = row?.ItemRef;
        const selectedObj =
          availableItems.find(
            (i) => Number(i.id) === Number(val) || (row?.ItemCode && i.ItemCode === row.ItemCode)
          ) || null;

        return (
          <MultiColumnDropDown
            data={availableItems}
            columns={itemDropdownColumns}
            value={selectedObj}
            displayKey="ItemCode"
            placeholder="انتخاب کالا..."
            disabled={isUsed}
            enableMultiSelection={true}
            addFormOptions={[
              { title: "افزودن کالای جدید", componentName: "ProductServiceForm", groupId: "inv" },
            ]}
            onChange={(selected) => {
              if (!selected) return;
              const selectedList = Array.isArray(selected) ? selected : [selected];
              if (selectedList.length === 0) return;

              const firstItem = selectedList[0];
              const firstId = firstItem.ItemID || firstItem.id;

              const updatedItems = [...(values.items || [])];
              updatedItems[rowIndex] = {
                ...updatedItems[rowIndex],
                ItemRef: firstId,
                ItemCode: firstItem.ItemCode || "",
                ItemName: firstItem.ItemName || "",
                UnitName: firstItem.UnitName || "عدد",
                // Task 61: با تغییر کالا، انتخاب واحد فرعی قبلی بازنشانی می‌شود
                UnitType: "اصلی",
                SubQuantity: undefined,
                MainToSubRatio: undefined,
                IsVariableRatio: false,
                // Task 74: با تغییر کالا، مقادیر عوامل ردیابی کالای قبلی باطل می‌شود
                trackingFactorValues: undefined,
              };

              for (let i = 1; i < selectedList.length; i++) {
                const extraItem = selectedList[i];
                updatedItems.push({
                  id: (Date.now() + i).toString(),
                  RowNo: updatedItems.length + 1,
                  ItemRef: extraItem.ItemID || extraItem.id,
                  ItemCode: extraItem.ItemCode || "",
                  ItemName: extraItem.ItemName || "",
                  UnitName: extraItem.UnitName || "عدد",
                  Quantity: 1,
                  UnitPrice: "",
                  TotalPrice: "",
                  Description: "",
                });
              }

              setValues((prev) => ({
                ...prev,
                items: updatedItems.map((item, index) => ({ ...item, RowNo: index + 1 })),
              }));
            }}
          />
        );
      },
    },
    {
      name: "ItemName",
      label: "عنوان کالا",
      type: "text",
      width: "200px",
      render: (row) => (
        <span className="flex items-center w-full h-[25px] px-2 text-xs text-gray-800 dark:text-gray-200 truncate select-none">
          {row?.ItemName || "-"}
        </span>
      ),
    },
    {
      // Task 61: ستون واحد سنجش با دکمه پلاس برای کالاهای دارای واحد سنجش فرعی (مشابه فرم رسید انبار)
      name: "UnitName",
      label: "واحد سنجش",
      type: "custom",
      width: "120px",
      render: (row, rowIndex) => {
        const matchedItem =
          availableItems.find(
            (i) =>
              (row?.ItemRef !== null && row?.ItemRef !== undefined && Number(i.ItemID) === Number(row.ItemRef)) ||
              (row?.ItemCode && String(i.ItemCode || i.code) === String(row.ItemCode))
          ) || null;

        const allUnits = (matchedItem?.allUnits && matchedItem.allUnits.length > 0)
          ? matchedItem.allUnits
          : (row?.allUnits && row.allUnits.length > 0)
          ? row.allUnits
          : [];

        const rawSubUnits = matchedItem?.subUnits || row?.subUnits || [];
        const subUnitsList = rawSubUnits.length > 0
          ? rawSubUnits
          : allUnits.filter((u: any) => u.UnitType === "فرعی" || u.UnitType === 2 || u.SubUnitName || u.MeasurementUnitName);

        const hasSubUnits = subUnitsList.length > 0 || allUnits.length > 1;

        const primaryUnit = matchedItem?.UnitName || matchedItem?.mainUnit?.MeasurementUnitName || row?.UnitName || "عدد";
        const currentUnitDisplay = row?.UnitName || primaryUnit;

        if (!hasSubUnits) {
          return (
            <span className="flex items-center justify-center w-full h-[25px] px-1 text-xs text-gray-600 dark:text-gray-300 text-center select-none font-medium">
              {currentUnitDisplay}
            </span>
          );
        }

        return (
          <div className="flex items-center justify-between w-full h-[25px] px-1 gap-1">
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate" title={currentUnitDisplay}>
              {currentUnitDisplay}
            </span>
            <button
              type="button"
              disabled={isUsed}
              onClick={() => {
                const subUnitsForModal = subUnitsList.map((u: any, idx: number) => ({
                  ItemSubUnitID: u.ItemSubUnitID || u.id || u.MeasurementUnitID || (idx + 1),
                  SubUnitRef: u.SubUnitRef || u.subUnitRef || u.id || (idx + 1),
                  SubUnitName: u.MeasurementUnitName || u.SubUnitName || u.title || "فرعی",
                  MainToSubRatio: Number(u.MainToSubRatio || u.ConversionFactor || u.ratio || 1),
                  IsVariableRatio: u.IsVariableRatio ?? u.isVariable ?? false,
                  TolerancePercent: Number(u.TolerancePercent || u.tolerance || 0),
                }));

                setSubUnitModalState({
                  isOpen: true,
                  rowIndex,
                  itemId: row?.ItemRef || matchedItem?.ItemID || matchedItem?.id,
                  itemCode: row?.ItemCode || matchedItem?.ItemCode || "-",
                  itemTitle: row?.ItemName || matchedItem?.ItemName || "-",
                  primaryUnitName: primaryUnit,
                  subUnits: subUnitsForModal,
                  selectedSubUnitId: row?.UnitName,
                  initialSubQuantity: row?.SubQuantity || row?.Quantity || 1,
                  initialMainQuantity: row?.Quantity,
                });
              }}
              className="p-1 flex items-center justify-center rounded bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 cursor-pointer h-[22px] px-1.5 shrink-0 gap-0.5 text-[10px] font-bold shadow-2xs"
              title="انتخاب واحد فرعی / ضریب تبدیل"
            >
              <Plus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        );
      },
    },
    {
      // Task 74: ستون مقدار — برای کالاهای دارای عامل ردیابی (وقتی تنظیم فعال باشد) همانند
      // حواله انبار: ورود مستقیم مقدار مسدود و مودال «ثبت / انتخاب اطلاعات عوامل ردیابی» باز می‌شود
      name: "Quantity",
      label: "مقدار *",
      type: "custom",
      width: "110px",
      render: (row, rowIndex) => {
        const itemRef = getItemRef(row);
        const itemTfs = getItemTrackingFactors(itemRef);
        const showPlusBtn = isTrackingFactorEnabled && itemTfs.length > 0;
        const hasEnteredTf =
          row?.trackingFactorValues &&
          (Array.isArray(row.trackingFactorValues)
            ? row.trackingFactorValues.some((r: any) =>
                Object.keys(r).some(
                  (k) =>
                    k !== "_id" &&
                    k !== "Quantity" &&
                    r[k] !== "" &&
                    r[k] !== null &&
                    r[k] !== undefined
                )
              )
            : Object.keys(row.trackingFactorValues).some(
                (k) =>
                  row.trackingFactorValues[k] !== "" &&
                  row.trackingFactorValues[k] !== null &&
                  row.trackingFactorValues[k] !== undefined
              ));

        const openTfModal = () => {
          setTfModalState({
            isOpen: true,
            rowIndex,
            itemName: row?.ItemName || "کالا",
            itemCode: row?.ItemCode || "",
            trackingFactors: itemTfs,
            initialValues: row?.trackingFactorValues || {},
            initialQuantity: row?.Quantity || "",
          });
        };

        return (
          <div className="flex items-center gap-1 w-full">
            <div
              className="flex-1"
              onClick={() => {
                if (showPlusBtn) {
                  openTfModal();
                }
              }}
            >
              <NumberInput
                value={row?.Quantity || ""}
                localizeDigits
                onChange={(newVal) => {
                  if (showPlusBtn) {
                    openTfModal();
                    return;
                  }
                  const updatedItems = [...(values.items || [])];
                  updatedItems[rowIndex] = {
                    ...updatedItems[rowIndex],
                    Quantity: newVal,
                    TotalPrice:
                      updatedItems[rowIndex].UnitPrice !== "" && updatedItems[rowIndex].UnitPrice !== undefined
                        ? Math.round(Number(newVal || 0) * Number(updatedItems[rowIndex].UnitPrice))
                        : updatedItems[rowIndex].TotalPrice,
                  };
                  setValues((prev) => ({ ...prev, items: updatedItems }));
                }}
                disabled={isUsed}
                readOnly={showPlusBtn}
              />
            </div>
            {showPlusBtn && (
              <button
                type="button"
                title="ثبت / انتخاب عوامل ردیابی"
                onClick={openTfModal}
                disabled={isUsed}
                className={`p-1 flex items-center justify-center rounded border transition-colors shrink-0 h-[26px] w-[26px] ${
                  hasEnteredTf
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700 font-bold"
                    : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
    {
      name: "UnitPrice",
      label: "فی",
      type: "custom",
      width: "130px",
      render: (row, rowIndex) => (
        <NumberInput
          value={row?.UnitPrice || ""}
          localizeDigits
          thousandsSeparator
          integerOnly
          onChange={(newVal) => {
            const updatedItems = [...(values.items || [])];
            updatedItems[rowIndex] = {
              ...updatedItems[rowIndex],
              UnitPrice: newVal,
              TotalPrice:
                updatedItems[rowIndex].Quantity !== "" && updatedItems[rowIndex].Quantity !== undefined
                  ? Math.round(Number(updatedItems[rowIndex].Quantity || 0) * Number(newVal || 0))
                  : updatedItems[rowIndex].TotalPrice,
            };
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "TotalPrice",
      label: "مبلغ کل",
      type: "custom",
      width: "130px",
      render: (row, rowIndex) => (
        <span className="flex items-center justify-center w-full h-[25px] px-2 text-xs font-semibold text-gray-800 dark:text-gray-200 text-center select-none">
          {row?.TotalPrice !== "" && row?.TotalPrice !== undefined && row?.TotalPrice !== null
            ? formatLocalizedNumber(Math.round(Number(row.TotalPrice)), language)
            : "-"}
        </span>
      ),
    },
    {
      name: "Description",
      label: "توضیحات",
      type: "custom",
      width: "180px",
      render: (row, rowIndex) => (
        <TextInput
          value={row?.Description || ""}
          onChange={(e: any) => {
            const newVal = e?.target?.value !== undefined ? e.target.value : e;
            const updatedItems = [...(values.items || [])];
            updatedItems[rowIndex] = { ...updatedItems[rowIndex], Description: newVal };
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }}
          disabled={isUsed}
        />
      ),
    },
  ];

  return (
    <>
      <SimpleFormTwoRowTabbed
        title={activeId ? "ویرایش سفارش فروش" : "سفارش فروش جدید"}
        fields={fields}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        onSaveNew={handleSaveNew}
        onNew={handleNew}
        onDelete={handleDelete}
        onListSelect={handleListSelect}
        listApiUrl="/api/sle/sales-orders"
        listDisplayKey="OrderNumber"
        listColumns={[
          { key: "OrderNumber", label: "شماره", title: "شماره" },
          {
            key: "OrderDate",
            label: "تاریخ",
            title: "تاریخ",
            render: (val: string) => (val ? gregorianToJalaliDisplay(val) : ""),
          },
          { key: "CustomerName", label: "مشتری", title: "مشتری" },
          {
            key: "Status",
            label: "وضعیت",
            title: "وضعیت",
            render: (val: number) => DocumentStateLabels[val as DocumentState] || val,
          },
        ]}
        targetForm="SalesOrder"
        isReadonly={isUsed}
        bottomTabs={[
          {
            id: "items_tab",
            label: "اقلام سفارش فروش",
            content: (
              <div className="flex flex-col h-full flex-1 min-h-0 w-full p-0 gap-0 overflow-hidden">
                {/* 1. جدول اقلام */}
                <div className="flex-1 min-h-[150px] overflow-hidden border border-slate-200 dark:border-slate-700/80 rounded-t-md shadow-2xs bg-white dark:bg-slate-900 flex flex-col">
                  <TabCellRow
                    tabs={detailTabConfig}
                    value={values.items || []}
                    onChange={(newItems) =>
                      setValues((prev) => ({
                        ...prev,
                        items: newItems.map((item: any, idx: number) => ({ ...item, RowNo: idx + 1 })),
                      }))
                    }
                    hideHeader={false}
                    hideAddButton={isUsed}
                    hideDeleteButton={isUsed}
                    onActiveRowChange={(_tabId, rowIndex) => {
                      if (rowIndex !== null && rowIndex !== undefined) {
                        setSelectedItemIndex(rowIndex);
                      }
                    }}
                  />
                </div>

                {/* دستگیره جمع/باز کردن فوتر */}
                <div
                  onClick={() => setIsFooterCollapsed(!isFooterCollapsed)}
                  className="group relative flex items-center justify-center h-2.5 bg-slate-100 hover:bg-blue-500/80 dark:bg-slate-800/80 dark:hover:bg-blue-600/80 cursor-pointer select-none border-y border-slate-200 dark:border-slate-700/60 transition-colors shrink-0 my-0"
                  title={isFooterCollapsed ? "نمایش خلاصه مبالغ و گردش" : "مخفی‌سازی خلاصه مبالغ جهت بزرگ‌نمایی جدول اقلام"}
                >
                  <div className="w-16 h-1 rounded-full bg-slate-300 dark:bg-slate-500 group-hover:bg-white group-hover:w-24 transition-all flex items-center justify-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white/80"></span>
                    <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white/80"></span>
                  </div>
                </div>

                {/* 2. فوتر: باکس‌های زیر جدول اقلام — Task 67
                    با تیک «نمایش پارامترهای خرید و فروش» در تنظیمات اسناد فروش: ۳ باکس (عوامل + گردش + مبالغ)
                    بدون تیک: ۲ باکس (گردش + مبالغ) */}
                {/* Task 71: فوتر تا آماده شدن تنظیمات (کش یا پاسخ شبکه) یکجا رندر می‌شود تا هر ۳ باکس
                    (عوامل سفارش + خلاصه گردش + مبالغ) هماهنگ با هم باز شوند و باکس عوامل دیرتر نپرد */}
                {!isFooterCollapsed && settingsReady && (
                  <div className={`grid grid-cols-1 ${showPurchaseSales ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-2 w-full shrink-0 transition-all pt-0`}>
                    {/* ستون راست: عوامل سفارش (فقط با تیک نمایش پارامترهای خرید و فروش) */}
                    {showPurchaseSales && (
                      <div className="bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700/80 p-2 pr-8 flex flex-col justify-between shadow-2xs relative h-[150px] max-h-[150px] overflow-hidden">
                        <div className="absolute top-2 right-0 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-r-0 border-indigo-200 dark:border-indigo-800 text-[11px] font-bold px-1 py-2.5 rounded-l-md shadow-2xs flex items-center justify-center z-10 select-none">
                          <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap tracking-wide">
                            عوامل سفارش
                          </span>
                        </div>

                        <div className="overflow-y-auto overflow-x-auto w-full flex-1 max-h-[105px] border border-slate-100 dark:border-slate-800/60 rounded">
                          <table className="w-full text-xs text-right border-collapse table-fixed">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-2xs">
                              <tr className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                                <th className="p-1 text-center w-7">انتخاب</th>
                                <th className="p-1 text-right w-[60%]">عنوان عامل</th>
                                <th className="p-1 text-left w-[40%]">مبلغ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(values.factors || []).length === 0 ? (
                                <tr>
                                  <td colSpan={3} className="p-2 text-center text-slate-400 text-xs">
                                    هیچ عاملی ثبت نشده است
                                  </td>
                                </tr>
                              ) : (
                                (values.factors || []).map((f: any, idx: number) => (
                                  <tr
                                    key={f.id || idx}
                                    className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${
                                      selectedFactorIndex === idx ? "bg-indigo-50/50 dark:bg-indigo-900/20" : "hover:bg-slate-50/60 dark:hover:bg-slate-800/60"
                                    }`}
                                  >
                                    <td className="p-1 text-center">
                                      <input
                                        type="checkbox"
                                        checked={selectedFactorIndex === idx}
                                        onChange={() => setSelectedFactorIndex(selectedFactorIndex === idx ? null : idx)}
                                        disabled={isUsed}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3 cursor-pointer disabled:cursor-not-allowed"
                                      />
                                    </td>
                                    <td className="p-1">
                                      <PurchaseSalesParameterDropDown
                                        value={f.FactorTitle || ""}
                                        onChange={(selectedParam) => handleFactorParamSelect(selectedParam, idx)}
                                        placeholder="عنوان عامل..."
                                        disabled={isUsed}
                                        noWrapper
                                      />
                                    </td>
                                    <td className="p-1 dir-ltr">
                                      <NumberInput
                                        value={f.Amount ?? 0}
                                        thousandsSeparator={true}
                                        localizeDigits
                                        onChange={(newVal) => {
                                          const updated = [...(values.factors || [])];
                                          updated[idx] = { ...updated[idx], Amount: Number(newVal) || 0 };
                                          setValues((prev) => ({ ...prev, factors: updated }));
                                        }}
                                        disabled={isUsed}
                                        className="w-full bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-left"
                                      />
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex items-center justify-start gap-1 pt-1 pb-0.5 border-t border-slate-100 dark:border-slate-800 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const newFactor = {
                                id: String(Date.now()),
                                RowNo: (values.factors?.length || 0) + 1,
                                FactorTitle: "",
                                FactorType: 1,
                                Amount: 0,
                                Description: "",
                              };
                              setValues((prev) => ({ ...prev, factors: [...(prev.factors || []), newFactor] }));
                              setSelectedFactorIndex(values.factors?.length || 0);
                            }}
                            disabled={isUsed}
                            className="p-1 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 disabled:opacity-30 transition-colors drop-shadow-2xs"
                            title="افزودن ردیف"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedFactorIndex !== null && selectedFactorIndex >= 0) {
                                const updated = (values.factors || []).filter((_: any, i: number) => i !== selectedFactorIndex);
                                setValues((prev) => ({ ...prev, factors: updated }));
                                setSelectedFactorIndex(null);
                              } else if ((values.factors || []).length > 0) {
                                const updated = (values.factors || []).slice(0, -1);
                                setValues((prev) => ({ ...prev, factors: updated }));
                              }
                            }}
                            disabled={isUsed || (values.factors || []).length === 0}
                            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-30 transition-colors drop-shadow-2xs"
                            title="حذف ردیف"
                          >
                            <X className="w-4 h-4 stroke-[3]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              showToast("ردیف عامل انتخاب شده آماده ویرایش است", "info");
                            }}
                            disabled={isUsed || selectedFactorIndex === null}
                            className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-30 transition-colors drop-shadow-2xs"
                            title="ویرایش ردیف"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ستون میانی: خلاصه گردش (موجودی و گردش لحظه‌ای) */}
                    <div className="bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700/80 p-2 pr-8 flex flex-col justify-between shadow-2xs relative h-[150px] max-h-[150px] overflow-hidden">
                      <div className="absolute top-2 right-0 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-r-0 border-indigo-200 dark:border-indigo-800 text-[11px] font-bold px-1 py-2.5 rounded-l-md shadow-2xs flex items-center justify-center z-10 select-none">
                        <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap tracking-wide">
                          خلاصه گردش
                        </span>
                      </div>

                      {(() => {
                        const activeIdx = selectedItemIndex !== null && selectedItemIndex >= 0 && selectedItemIndex < (values.items?.length || 0) ? selectedItemIndex : 0;
                        const selItem = values.items?.[activeIdx];
                        const pendingQty = (values.items || [])
                          .filter((it: any) => Number(it.ItemRef) === Number(selItem?.ItemRef))
                          .reduce((acc: number, it: any) => acc + (Number(it.Quantity) || 0), 0);

                        return (
                          <div className="overflow-y-auto w-full flex-1 max-h-[135px]">
                            <StockSummaryBox
                              itemId={selItem?.ItemRef || null}
                              warehouseId={defaultWarehouseRef}
                              mainUnitName={selItem?.UnitName}
                              pendingQuantity={pendingQty}
                              documentType="sales_order"
                              documentDate={values.OrderDate}
                              partyId={values.CustomerRef || undefined}
                              excludeVoucherId={values.SalesOrderID || undefined}
                            />
                          </div>
                        );
                      })()}
                    </div>

                    {/* ستون چپ: مبالغ */}
                    <div className="bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700/80 p-2 pr-8 flex flex-col justify-between shadow-2xs relative h-[150px] max-h-[150px] overflow-hidden">
                      <div className="absolute top-2 right-0 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-r-0 border-indigo-200 dark:border-indigo-800 text-[11px] font-bold px-1 py-2.5 rounded-l-md shadow-2xs flex items-center justify-center z-10 select-none">
                        <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap tracking-wide">
                          مبالغ
                        </span>
                      </div>

                      {/* Task 84: فاصله ردیف‌ها کم شد تا هر ۴ ردیف (تا جمع کل) بدون اسکرول دیده شوند */}
                      <div className="overflow-y-auto overflow-x-auto w-full flex-1 max-h-[132px]">
                        <table className="w-full text-xs text-right border-collapse">
                          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-2xs">
                            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                              <th className="px-2 py-0.5 text-right">عنوان</th>
                              <th className="px-2 py-0.5 text-left w-36">مبلغ</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                              <td className="px-2 py-0.5 text-slate-700 dark:text-slate-300 font-semibold text-xs">جمع</td>
                              <td className="px-2 py-0.5 text-left font-bold text-slate-900 dark:text-slate-100 dir-ltr text-base leading-5 tabular-nums">
                                {formatLocalizedNumber(totalItemsGross, language)}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                              <td className="px-2 py-0.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">اضافات</td>
                              <td className="px-2 py-0.5 text-left font-bold text-emerald-600 dark:text-emerald-400 dir-ltr text-base leading-5 tabular-nums">
                                {formatLocalizedNumber(displayAdditions, language)}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                              <td className="px-2 py-0.5 text-rose-600 dark:text-rose-400 font-semibold text-xs">کسورات</td>
                              <td className="px-2 py-0.5 text-left font-bold text-rose-600 dark:text-rose-400 dir-ltr text-base leading-5 tabular-nums">
                                {formatLocalizedNumber(displayDeductions, language)}
                              </td>
                            </tr>
                            <tr className="bg-indigo-50/60 dark:bg-indigo-950/40">
                              <td className="px-2 py-0.5 text-indigo-900 dark:text-indigo-200 font-extrabold text-base leading-6">جمع کل</td>
                              <td className="px-2 py-0.5 text-left font-extrabold text-indigo-900 dark:text-indigo-200 text-lg leading-6 dir-ltr tabular-nums">
                                {formatLocalizedNumber(finalNetTotal, language)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
      {/* Task 61: مودال واحدهای سنجش فرعی (مشابه فرم رسید انبار) */}
      <SubUnitModal
        isOpen={subUnitModalState.isOpen}
        onClose={() => setSubUnitModalState((prev) => ({ ...prev, isOpen: false }))}
        itemId={subUnitModalState.itemId}
        itemCode={subUnitModalState.itemCode}
        itemTitle={subUnitModalState.itemTitle}
        primaryUnitName={subUnitModalState.primaryUnitName}
        subUnits={subUnitModalState.subUnits}
        selectedSubUnitId={subUnitModalState.selectedSubUnitId}
        initialSubQuantity={subUnitModalState.initialSubQuantity}
        initialMainQuantity={subUnitModalState.initialMainQuantity}
        isReadonly={isUsed}
        onConfirm={(result) => {
          const idx = subUnitModalState.rowIndex;
          if (idx < 0 || idx >= (values.items || []).length) return;
          const updatedItems = [...(values.items || [])];
          const targetRow = updatedItems[idx];
          const subQty = result.subQuantity;
          const priceVal = Number(targetRow?.UnitPrice) || 0;

          updatedItems[idx] = {
            ...targetRow,
            UnitName: result.subUnit.SubUnitName,
            UnitType: "فرعی",
            SubQuantity: subQty,
            Quantity: subQty,
            MainToSubRatio: result.ratioUsed,
            IsVariableRatio: result.isVariable,
            TotalPrice: subQty * priceVal,
          };

          setValues((prev) => ({ ...prev, items: updatedItems }));
        }}
        onSelectPrimaryUnit={(result) => {
          const idx = subUnitModalState.rowIndex;
          if (idx < 0 || idx >= (values.items || []).length) return;
          const updatedItems = [...(values.items || [])];
          const targetRow = updatedItems[idx];
          const fixedQty = result ? result.fixedMainQuantity : 0;
          const priceVal = Number(targetRow?.UnitPrice) || 0;

          updatedItems[idx] = {
            ...targetRow,
            UnitName: result?.primaryUnitName || subUnitModalState.primaryUnitName,
            UnitType: "اصلی",
            SubQuantity: undefined,
            Quantity: fixedQty,
            MainToSubRatio: 1,
            IsVariableRatio: false,
            TotalPrice: fixedQty * priceVal,
          };

          setValues((prev) => ({ ...prev, items: updatedItems }));
        }}
      />
      {/* Task 74: مودال عوامل ردیابی (مشابه حواله انبار) — برای تکمیل اطلاعات ردیابی هر ردیف سفارش */}
      <TrackingFactorModal
        isOpen={tfModalState.isOpen}
        onClose={() => setTfModalState((prev) => ({ ...prev, isOpen: false }))}
        itemName={tfModalState.itemName}
        itemCode={tfModalState.itemCode}
        trackingFactors={tfModalState.trackingFactors}
        initialValues={tfModalState.initialValues}
        initialQuantity={tfModalState.initialQuantity}
        isReadonly={isUsed}
        isWarehouseIssue={false}
        itemRef={getItemRef(values.items?.[tfModalState.rowIndex ?? -1])}
        warehouseRef={defaultWarehouseRef}
        formName="سفارش فروش"
        documentId={values.SalesOrderID || activeId}
        documentDate={values.OrderDate}
        onSave={(tfValues, totalQty) => {
          const idx = tfModalState.rowIndex;
          if (idx !== null && idx >= 0 && idx < (values.items || []).length) {
            const updatedItems = [...(values.items || [])];
            const targetRow = updatedItems[idx];
            const priceVal = Number(targetRow?.UnitPrice) || 0;
            const newQty = totalQty > 0 ? totalQty : targetRow?.Quantity;

            updatedItems[idx] = {
              ...targetRow,
              trackingFactorValues: tfValues,
              ...(totalQty > 0 ? { Quantity: totalQty } : {}),
              TotalPrice:
                targetRow?.UnitPrice !== "" && targetRow?.UnitPrice !== undefined
                  ? Math.round(Number(newQty || 0) * priceVal)
                  : targetRow?.TotalPrice,
            };
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }
          setTfModalState((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </>
  );
}

export function SalesOrderForm(props: any) {
  return <SalesOrder {...props} />;
}

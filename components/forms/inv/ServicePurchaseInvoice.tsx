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
import { Select } from "@/components/inputs/Select";
import { PurchaseSalesParameterDropDown } from "@/components/inputs/PurchaseSalesParameterDropDown";
import { StateListInput, DocumentState, DocumentStateLabels, isStatusApprovedOrReviewed } from "@/components/inputs/StateListInput";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { useLanguage } from "@/lib/stores/languageStore";
import { localizeNumericString } from "@/lib/digitLocale"; // Task 102: نمایش ارقام فارسی در سراسر فرم
import { apiFetch, normalizePersianText } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFooterPanelResize } from "@/hooks/useFooterPanelResize"; // Task 87: دستگیره ارتفاع فوتر
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import momentJalaali from "moment-jalaali";
import { Calculator, FileText, DollarSign, TrendingUp, ShoppingBag, Layers, Plus, X, Pencil } from "lucide-react";
import { RapInsertButton } from "@/components/buttons/RapInsertButton";
import { RapEditButton } from "@/components/buttons/RapEditButton";
import { RapDeleteButton } from "@/components/buttons/RapDeleteButton";

interface ServicePurchaseInvoiceProps {
  id?: number;
  tabId?: string;
}

export enum ServicePurchaseInvoiceBaseType {
  None = 1,
  SupplyRequest = 2,
}

export const BASE_TYPE_OPTIONS = [
  { id: ServicePurchaseInvoiceBaseType.None, title: "بدون مبنا", value: ServicePurchaseInvoiceBaseType.None, label: "بدون مبنا" },
  { id: ServicePurchaseInvoiceBaseType.SupplyRequest, title: "درخواست تامین خدمت", value: ServicePurchaseInvoiceBaseType.SupplyRequest, label: "درخواست تامین خدمت" },
];

export const CURRENCY_OPTIONS = [
  { id: 1, title: "ریال", value: 1, label: "ریال" },
  { id: 2, title: "دلار", value: 2, label: "دلار" },
  { id: 3, title: "یورو", value: 3, label: "یورو" },
];

export const UNIT_TYPE_OPTIONS = [
  { id: 1, title: "اصلی", value: 1, label: "اصلی" },
  { id: 2, title: "فرعی", value: 2, label: "فرعی" },
];

export const FACTOR_TYPE_OPTIONS = [
  { id: 1, title: "اضافات (+)", value: 1, label: "اضافات (+)" },
  { id: 2, title: "کسورات (-)", value: 2, label: "کسورات (-)" },
];

function getTodayJalali() {
  try {
    return momentJalaali().format("jYYYY/jMM/jDD");
  } catch (e) {
    return "";
  }
}

function formatCurrency(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === "") return "0";
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ""));
  if (isNaN(num)) return "0";
  return num.toLocaleString("fa-IR");
}

export function ServicePurchaseInvoice({ id, tabId }: ServicePurchaseInvoiceProps) {
  const { removeTab } = useTabs();
  const { showToast } = useToast();
  const { language } = useLanguage();
  // Task 102: تبدیل ارقام لاتین به ارقام زبان جاری (فارسی) برای نمایش ردیف‌ها و شمارنده‌ها
  const faNum = React.useCallback(
    (v: number | string) => localizeNumericString(String(v), language),
    [language]
  );
  const { activeId, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("ServicePurchaseInvoice", activeId);
  const [selectedFactorIndex, setSelectedFactorIndex] = useState<number | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(0);
  const [isRapRegistered, setIsRapRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Task 87: دستگیره فوتر — درگ موس برای کم/زیاد کردن ارتفاع + دبل‌کلیک برای جمع شدن کامل و بازگشت
  const { isCollapsed: isFooterCollapsed, footerHeight, isDragging: footerDragging, handleProps: footerHandleProps } = useFooterPanelResize(150);

  // Form Header Values
  const [values, setValues] = useState<Record<string, any>>({
    ServicePurchaseInvoiceID: activeId || "",
    BaseType: ServicePurchaseInvoiceBaseType.None,
    SupplyRequestRef: "",
    SupplierRef: "",
    SupplierName: "",
    InvoiceNumber: "",
    InvoiceDate: getTodayJalali(),
    BaseDocumentNumber: "",
    Status: DocumentState.InitialRegistration,
    CurrencyRef: 1,
    Description: "",
    items: [
      {
        id: "1",
        RowNo: 1,
        ItemRef: null,
        ItemCode: "",
        ItemName: "",
        UnitName: "عدد",
        UnitType: 1,
        Quantity: 1,
        UnitPrice: 0,
        TotalPrice: 0,
        Discount: 0,
        PriceAfterDiscount: 0,
        VatTax: 0,
        NetPrice: 0,
        Currency: "ریال",
      },
    ],
    factors: [
      {
        id: "1",
        RowNo: 1,
        FactorTitle: "",
        FactorType: 1,
        Amount: 0,
        Description: "",
      },
    ],
  });

  // Dropdown options
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [parametersList, setParametersList] = useState<any[]>([]);

  const supplierColumns: SingleSelectColumn[] = [
    {
      key: "code",
      label: "کد",
      width: 90,
      renderItem: (item: any) => item.code || item.detailedAccount?.code || String(item.partyId || item.PartyID || item.id || ""),
      exportValue: (item: any) => item.code || item.detailedAccount?.code || String(item.partyId || item.PartyID || item.id || ""),
    },
    {
      key: "title",
      label: "عنوان تامین‌کننده",
      width: 220,
      renderItem: (item: any) =>
        item.title ||
        item.Title ||
        (item.firstName || item.lastName ? `${item.firstName || ''} ${item.lastName || ''}`.trim() : '') ||
        item.Name ||
        "",
      exportValue: (item: any) =>
        item.title ||
        item.Title ||
        (item.firstName || item.lastName ? `${item.firstName || ''} ${item.lastName || ''}`.trim() : '') ||
        item.Name ||
        "",
    },
    {
      key: "title2",
      label: "کد ملی/شناسه",
      width: 140,
      renderItem: (item: any) => item.title2 || item.nationalCode || item.nationalId || item.NationalCode || "",
      exportValue: (item: any) => item.title2 || item.nationalCode || item.nationalId || item.NationalCode || "",
    },
  ];

  const supplyRequestColumns: SingleSelectColumn[] = [
    { key: "code", label: "شماره درخواست", width: 120 },
    { key: "title", label: "عنوان/تاریخ", width: 220 },
  ];

  const itemDropdownColumns: Column[] = [
    { key: "ItemCode", label: "کد خدمت", width: 120 },
    { key: "ItemName", label: "عنوان خدمت", width: 220 },
    { key: "UnitName", label: "واحد سنجش", width: 120 },
  ];

  // Fetch initial record or next invoice number
  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/inv/service-purchase-invoices/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setValues({
              ServicePurchaseInvoiceID: data.ServicePurchaseInvoiceID || activeId,
              BaseType: data.BaseType ? Number(data.BaseType) : ServicePurchaseInvoiceBaseType.None,
              SupplyRequestRef: data.SupplyRequestRef ? Number(data.SupplyRequestRef) : "",
              SupplierRef: data.SupplierRef ? Number(data.SupplierRef) : "",
              SupplierName: data.SupplierName || data.supplierParty?.title || "",
              InvoiceNumber: data.InvoiceNumber || "",
              InvoiceDate: data.InvoiceDate ? momentJalaali(data.InvoiceDate).format("jYYYY/jMM/jDD") : getTodayJalali(),
              BaseDocumentNumber: data.BaseDocumentNumber || "",
              Status: data.Status ? Number(data.Status) : DocumentState.InitialRegistration,
              CurrencyRef: data.CurrencyRef ? Number(data.CurrencyRef) : 1,
              Description: data.Description || "",
              items:
                Array.isArray(data.details) && data.details.length > 0
                  ? data.details.map((d: any, idx: number) => {
                      const qty = Number(d.Quantity || d.quantity || 1);
                      const price = Number(d.UnitPrice || d.unitPrice || 0);
                      const discount = Number(d.Discount || d.discount || 0);
                      const total = qty * price;
                      const afterDiscount = Math.max(0, total - discount);
                      const vat = Math.round(afterDiscount * 0.09);
                      const net = afterDiscount + vat;
                      return {
                        id: String(d.ServicePurchaseInvoiceDetailID || idx + 1),
                        RowNo: d.RowNo || idx + 1,
                        ItemRef: d.ItemRef,
                        ItemCode: d.item?.ItemCode || d.ItemCode || "",
                        ItemName: d.item?.ItemName || d.ItemName || "",
                        UnitName: d.item?.MeasurementUnit?.MeasurementUnitTitle || d.UnitName || "عدد",
                        UnitType: d.UnitType ? Number(d.UnitType) : 1,
                        Quantity: qty,
                        UnitPrice: price,
                        TotalPrice: total,
                        Discount: discount,
                        PriceAfterDiscount: afterDiscount,
                        VatTax: vat,
                        NetPrice: net,
                        Currency: "ریال",
                      };
                    })
                  : [
                      {
                        id: "1",
                        RowNo: 1,
                        ItemRef: null,
                        ItemCode: "",
                        ItemName: "",
                        UnitName: "عدد",
                        UnitType: 1,
                        Quantity: 1,
                        UnitPrice: 0,
                        TotalPrice: 0,
                        Discount: 0,
                        PriceAfterDiscount: 0,
                        VatTax: 0,
                        NetPrice: 0,
                        Currency: "ریال",
                      },
                    ],
              factors:
                Array.isArray(data.factors) && data.factors.length > 0
                  ? data.factors.map((f: any, idx: number) => ({
                      id: String(f.ServicePurchaseInvoiceFactorID || idx + 1),
                      RowNo: f.RowNo || idx + 1,
                      FactorTitle: f.FactorTitle || "",
                      FactorType: f.FactorType ? Number(f.FactorType) : 1,
                      Amount: Number(f.Amount || 0),
                      Description: f.Description || "",
                    }))
                  : [
                      {
                        id: "1",
                        RowNo: 1,
                        FactorTitle: "",
                        FactorType: 1,
                        Amount: 0,
                        Description: "",
                      },
                    ],
            });
          }
        })
        .catch((err) => console.error("Error loading service purchase invoice:", err));
    } else {
      apiFetch("/api/inv/service-purchase-invoices/next-number")
        .then((res) => res.json())
        .then((data) => {
          if (data?.documentNumber) {
            setValues((prev) => ({ ...prev, InvoiceNumber: data.documentNumber }));
          }
        })
        .catch((err) => console.error("Error fetching next invoice number:", err));
    }
  }, [activeId]);

  // Fetch dropdown data
  useEffect(() => {
    // Fetch suppliers / parties
    apiFetch("/api/common/parties?isActive=true&isSupplier=true")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data?.items || data?.data || [];
        setSuppliers(
          list.map((p: any) => {
            const partyTitle = p.title || p.Title || (p.firstName || p.lastName ? `${p.firstName || ''} ${p.lastName || ''}`.trim() : '') || p.Name || "";
            return {
              id: Number(p.partyId || p.PartyID || p.id),
              code: p.detailedAccount?.code || p.code || p.Code || String(p.partyId || p.PartyID || p.id),
              title: partyTitle,
              title2: p.nationalCode || p.nationalId || p.NationalCode || p.national_code || "",
            };
          })
        );
      })
      .catch((err) => console.error("Error fetching suppliers:", err));

    // Fetch service supply requests
    apiFetch("/api/inv/service-supply-requests")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setSupplyRequests(
          list
            .filter((r: any) => isStatusApprovedOrReviewed(r.Status || r.status))
            .map((r: any) => ({
              id: Number(r.ServiceSupplyRequestID || r.id),
              code: String(r.RequestNumber || r.code || r.ServiceSupplyRequestID || r.id),
              title: `درخواست ${r.RequestNumber || ""} - ${r.Requester || r.RequestDate || ""}`,
            }))
        );
      })
      .catch((err) => console.error("Error fetching service supply requests:", err));

    // Fetch items / services
    apiFetch("/api/inv/items/dropdown")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setAvailableItems(
          list.map((item: any) => ({
            id: item.ItemID || item.id,
            ItemID: item.ItemID || item.id,
            ItemCode: item.ItemCode || item.code || "",
            ItemName: item.ItemName || item.title || item.name || "",
            UnitName: item.MeasurementUnit?.MeasurementUnitTitle || item.UnitName || item.unit || "عدد",
            title: `${item.ItemCode ? item.ItemCode + " - " : ""}${item.ItemName || item.title || item.name || ""}`,
          }))
        );
      })
      .catch((err) => console.error("Error fetching items:", err));

    // Fetch purchase sales parameters
    apiFetch("/api/inv/purchase-sales-parameters")
      .then((res) => (res.ok ? res.json() : []))
      .then((resData) => {
        const list = Array.isArray(resData) ? resData : Array.isArray(resData?.data) ? resData.data : [];
        setParametersList(list);
      })
      .catch((err) => console.error("Error fetching purchase sales parameters:", err));
  }, []);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const calculateRowFields = (row: any, vatRate: number = 0) => {
    const qty = Number(row.Quantity) || 0;
    const price = Number(row.UnitPrice) || 0;
    const discount = Number(row.Discount) || 0;
    const total = qty * price;
    const afterDiscount = Math.max(0, total - discount);
    const hasManualVat = row.ManualVatTax !== undefined && row.ManualVatTax !== null;
    // نگه‌داشت مالیات موجود/دستی وقتی نرخ محاسبه‌ای وجود ندارد
    const vat = vatRate > 0
      ? Math.round(afterDiscount * vatRate)
      : hasManualVat
      ? Number(row.ManualVatTax) || 0
      : Number(row.VatTax) || 0;
    const net = afterDiscount + vat;

    return {
      ...row,
      TotalPrice: total,
      PriceAfterDiscount: afterDiscount,
      VatTax: vat,
      NetPrice: net,
    };
  };

  function normalizeJalaliDate(dStr: string | null | undefined): string {
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
  }

  function isDateInRange(invoiceDate: string, startDate: string, endDate: string): boolean {
    const normInvoice = normalizeJalaliDate(invoiceDate);
    const normStart = normalizeJalaliDate(startDate);
    const normEnd = normalizeJalaliDate(endDate);

    if (!normInvoice) return false;
    if (normStart && normInvoice < normStart) return false;
    if (normEnd && normInvoice > normEnd) return false;
    return true;
  }

  function findParamObj(factor: any, paramsList: any[]) {
    if (factor?.paramObj) return factor.paramObj;
    if (!paramsList || paramsList.length === 0) return null;

    if (factor?.PurchaseSalesParameterRef) {
      const match = paramsList.find(
        (p) => Number(p.PurchaseSalesParameterID) === Number(factor.PurchaseSalesParameterRef)
      );
      if (match) return match;
    }

    const titleNorm = normalizePersianText(factor?.FactorTitle);
    if (titleNorm) {
      const exactMatch = paramsList.find(
        (p) => normalizePersianText(p.Title) === titleNorm
      );
      if (exactMatch) return exactMatch;
    }

    if (factor?.CategoryOther) {
      const catMatch = paramsList.find(
        (p) => Number(p.CategoryOther) === Number(factor.CategoryOther)
      );
      if (catMatch) return catMatch;
    }

    if (titleNorm) {
      if (titleNorm.includes("عوارض")) {
        const municipalMatch = paramsList.find((p) => {
          const pNorm = normalizePersianText(p.Title);
          const cat = Number(p.CategoryOther);
          return cat === 2 || pNorm.includes("عوارض");
        });
        if (municipalMatch) return municipalMatch;
      }

      if (titleNorm.includes("مالیات") || titleNorm.includes("ارزش افزوده")) {
        const vatMatch = paramsList.find((p) => {
          const pNorm = normalizePersianText(p.Title);
          const cat = Number(p.CategoryOther);
          return cat === 1 || pNorm.includes("مالیات") || (pNorm.includes("ارزش افزوده") && !pNorm.includes("عوارض"));
        });
        if (vatMatch) return vatMatch;
      }
    }

    return null;
  }

  function getFactorVatRate(paramObj: any, factor: any, invoiceDate: string): number {
    const cat = Number(paramObj?.CategoryOther ?? factor?.CategoryOther ?? 0);
    const titleNorm = normalizePersianText(paramObj?.Title || factor?.FactorTitle);

    const isMunicipal = cat === 2 || titleNorm.includes("عوارض");
    const isVat = cat === 1 || titleNorm.includes("مالیات") || (titleNorm.includes("ارزش افزوده") && !isMunicipal);

    if (!isVat && !isMunicipal) return 0;

    const valuesList = Array.isArray(paramObj?.ParameterValues)
      ? paramObj.ParameterValues
      : Array.isArray(paramObj?.parameterValues)
      ? paramObj.parameterValues
      : [];

    let rate = 0;

    if (invoiceDate && valuesList.length > 0) {
      const match = valuesList.find((v: any) =>
        isDateInRange(invoiceDate, v.StartDate || v.startDate, v.EndDate || v.endDate)
      );
      if (match) {
        const rawVal = Number(match.ParameterValue ?? match.parameterValue ?? 0);
        if (rawVal > 0) {
          rate = rawVal > 1 ? rawVal / 100 : rawVal;
        }
      }
    }

    if (rate === 0 && valuesList.length > 0) {
      for (let i = valuesList.length - 1; i >= 0; i--) {
        const rawVal = Number(valuesList[i].ParameterValue ?? valuesList[i].parameterValue ?? 0);
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
        const normDate = normalizeJalaliDate(invoiceDate);
        if (normDate && normDate < "1403/01/01") {
          rate = 0.06;
        } else {
          rate = 0.07;
        }
      }
    }

    return rate;
  }

  function getParameterValueForDate(paramObj: any, invoiceDate: string): number {
    if (!paramObj) return 0;
    const valuesList = Array.isArray(paramObj?.ParameterValues)
      ? paramObj.ParameterValues
      : Array.isArray(paramObj?.parameterValues)
      ? paramObj.parameterValues
      : [];

    if (invoiceDate && valuesList.length > 0) {
      const match = valuesList.find((v: any) =>
        isDateInRange(invoiceDate, v.StartDate || v.startDate, v.EndDate || v.endDate)
      );
      if (match) {
        return Number(match.ParameterValue ?? match.parameterValue ?? 0);
      }
    }

    if (valuesList.length > 0) {
      for (let i = valuesList.length - 1; i >= 0; i--) {
        const val = Number(valuesList[i].ParameterValue ?? valuesList[i].parameterValue ?? 0);
        if (val > 0) return val;
      }
    }

    return 0;
  }

  const handleFactorParamSelect = (selectedParam: any, idx: number) => {
    const titleVal = typeof selectedParam === 'object' ? (selectedParam?.Title || "") : String(selectedParam || "");
    const foundObj = typeof selectedParam === 'object' ? selectedParam : findParamObj({ FactorTitle: titleVal }, parametersList);
    const paramType = foundObj?.ParameterType ?? selectedParam?.ParameterType;
    const factorTypeVal = paramType === 2 ? 2 : 1;
    const opType = Number(foundObj?.OperationType ?? selectedParam?.OperationType ?? 1);
    const cat = Number(foundObj?.CategoryOther ?? selectedParam?.CategoryOther ?? 0);

    const totalAfterDiscountSum = (values.items || []).reduce((acc: number, row: any) => acc + (Number(row.PriceAfterDiscount) || 0), 0);
    const totalItemsQuantity = (values.items || []).reduce((acc: number, row: any) => acc + (Number(row.Quantity) || 0), 0);

    let initialAmount = 0;
    const titleNorm = normalizePersianText(titleVal);
    const isVat = cat === 1 || cat === 2 || titleNorm.includes("مالیات") || titleNorm.includes("ارزش افزوده") || titleNorm.includes("عوارض");

    if (isVat) {
      const rate = getFactorVatRate(foundObj, { FactorTitle: titleVal }, values.InvoiceDate);
      initialAmount = Math.round(totalAfterDiscountSum * rate);
    } else if (opType === 3) {
      const rawVal = getParameterValueForDate(foundObj, values.InvoiceDate);
      if (rawVal > 0) {
        const rate = rawVal > 1 ? rawVal / 100 : rawVal;
        initialAmount = Math.round(totalAfterDiscountSum * rate);
      }
    } else if (opType === 4) {
      const unitVal = getParameterValueForDate(foundObj, values.InvoiceDate);
      if (unitVal > 0) {
        initialAmount = Math.round(totalItemsQuantity * unitVal);
      }
    } else if (opType === 1) {
      const fixedVal = getParameterValueForDate(foundObj, values.InvoiceDate);
      if (fixedVal > 0) {
        initialAmount = Math.round(fixedVal);
      }
    }

    const updatedFactors = [...(values.factors || [])];
    updatedFactors[idx] = {
      ...updatedFactors[idx],
      FactorTitle: titleVal || foundObj?.Title || "",
      paramObj: foundObj || undefined,
      PurchaseSalesParameterRef: foundObj?.PurchaseSalesParameterID || selectedParam?.PurchaseSalesParameterID || updatedFactors[idx]?.PurchaseSalesParameterRef,
      CategoryOther: cat,
      FactorType: isVat ? 1 : factorTypeVal,
      Amount: initialAmount > 0 ? initialAmount : (updatedFactors[idx]?.Amount || 0),
    };

    setValues((prev) => ({ ...prev, factors: updatedFactors }));
  };

  const getFactorAmountForRow = (
    factor: any,
    selItem: any,
    allItems: any[],
    docDate: string,
    paramsList: any[]
  ): number => {
    if (!selItem) return 0;

    const paramObj = findParamObj(factor, paramsList);
    const cat = Number(paramObj?.CategoryOther ?? factor.CategoryOther ?? 0);
    const opType = Number(paramObj?.OperationType ?? 1);
    const titleNorm = normalizePersianText(paramObj?.Title || factor.FactorTitle);

    const isVat = cat === 1 || cat === 2 || titleNorm.includes("مالیات") || titleNorm.includes("ارزش افزوده") || titleNorm.includes("عوارض");
    const isDiscount = cat === 3 || titleNorm.includes("تخفیف") || factor.CategoryOther === 3;

    const totalGrossSum = (allItems || []).reduce(
      (acc, row) => acc + (Number(row.TotalPrice) || 0),
      0
    );

    const rowGross = Number(selItem.TotalPrice) || 0;
    const rowQty = Number(selItem.Quantity) || 0;
    const rowManualDisc = Number(selItem.Discount) || 0;

    if (isVat) {
      const rate = getFactorVatRate(paramObj, factor, docDate);
      if (rate > 0) {
        const priceAfterManualDisc = Math.max(0, rowGross - rowManualDisc);
        return Math.round(priceAfterManualDisc * rate);
      }
      if (selItem.VatTax !== undefined && selItem.VatTax !== null && Number(selItem.VatTax) > 0) {
        return Number(selItem.VatTax);
      }
    }

    if (isDiscount && opType === 3) {
      const rawVal = getParameterValueForDate(paramObj, docDate);
      if (rawVal > 0) {
        const rate = rawVal > 1 ? rawVal / 100 : rawVal;
        return Math.round(rowGross * rate);
      }
    }

    if (opType === 3) {
      const rawVal = getParameterValueForDate(paramObj, docDate);
      if (rawVal > 0) {
        const rate = rawVal > 1 ? rawVal / 100 : rawVal;
        return Math.round(rowGross * rate);
      }
    }

    if (opType === 4) {
      const unitVal = getParameterValueForDate(paramObj, docDate);
      if (unitVal > 0) {
        return Math.round(rowQty * unitVal);
      }
    }

    const totalFactorAmount = Number(factor.Amount) || 0;
    if (totalGrossSum > 0 && totalFactorAmount > 0) {
      return Math.round((rowGross / totalGrossSum) * totalFactorAmount);
    } else if (allItems && allItems.length > 0 && totalFactorAmount > 0) {
      return Math.round(totalFactorAmount / allItems.length);
    }

    return 0;
  };

  // Service Detail Items Tab Config
  const detailTabConfig: TabCellConfig[] = [
    {
      name: "RowNo",
      label: "ردیف",
      type: "text",
      width: "55px",
      render: (_row, rowIndex) => (
        <span className="flex items-center justify-center w-full h-[25px] text-xs font-semibold text-center select-none text-slate-600 dark:text-slate-400">
          {faNum(rowIndex + 1)}
        </span>
      ),
    },
    {
      name: "ItemRef",
      label: "کد / عنوان خدمت *",
      type: "custom",
      width: "230px",
      render: (row, rowIndex) => {
        const val = row?.ItemRef;
        const selectedObj = availableItems.find(
          (i) => Number(i.id) === Number(val) || Number(i.ItemID) === Number(val) || (row?.ItemCode && String(i.ItemCode) === String(row.ItemCode))
        ) || null;

        return (
          <MultiColumnDropDown
            data={availableItems}
            columns={itemDropdownColumns}
            value={selectedObj}
            displayKey="ItemCode"
            placeholder="انتخاب خدمت..."
            disabled={isUsed}
            enableMultiSelection={true}
            addFormOptions={[
              { title: "افزودن کالا/خدمت جدید", componentName: "ProductServiceForm", groupId: "inv" }
            ]}
            onChange={(selected) => {
              if (!selected) return;
              const selectedList = Array.isArray(selected) ? selected : [selected];
              if (selectedList.length === 0) return;

              const firstItem = selectedList[0];
              const firstId = firstItem.ItemID || firstItem.id;

              const updatedItems = [...(values.items || [])];
              updatedItems[rowIndex] = calculateRowFields({
                ...updatedItems[rowIndex],
                ItemRef: Number(firstId),
                ItemCode: firstItem.ItemCode || "",
                ItemName: firstItem.ItemName || "",
                UnitName: firstItem.UnitName || "عدد",
              });

              for (let i = 1; i < selectedList.length; i++) {
                const extraItem = selectedList[i];
                const extraId = extraItem.ItemID || extraItem.id;
                updatedItems.push(
                  calculateRowFields({
                    id: (Date.now() + i).toString(),
                    RowNo: updatedItems.length + 1,
                    ItemRef: Number(extraId),
                    ItemCode: extraItem.ItemCode || "",
                    ItemName: extraItem.ItemName || "",
                    UnitName: extraItem.UnitName || "عدد",
                    UnitType: 1,
                    Quantity: 1,
                    UnitPrice: 0,
                    Discount: 0,
                    Currency: "ریال",
                  })
                );
              }

              setValues((prev) => ({
                ...prev,
                items: updatedItems.map((item, index) => ({
                  ...item,
                  RowNo: index + 1,
                })),
              }));
            }}
          />
        );
      },
    },
    {
      name: "ItemName",
      label: "عنوان خدمت",
      type: "text",
      width: "200px",
      render: (row) => (
        <span className="flex items-center w-full h-[25px] px-2 text-xs text-slate-800 dark:text-slate-200 truncate select-none">
          {row?.ItemName || "-"}
        </span>
      ),
    },
    {
      name: "UnitName",
      label: "واحد سنجش",
      type: "text",
      width: "90px",
      render: (row) => (
        <span className="flex items-center justify-center w-full h-[25px] px-1 text-xs text-slate-600 dark:text-slate-300 text-center select-none">
          {row?.UnitName || "عدد"}
        </span>
      ),
    },
    {
      name: "UnitType",
      label: "نوع واحد",
      type: "custom",
      width: "90px",
      render: (row, rowIndex) => (
        <Select
          value={row?.UnitType || 1}
          options={UNIT_TYPE_OPTIONS}
          onChange={(val) => {
            const updatedItems = [...(values.items || [])];
            updatedItems[rowIndex] = { ...updatedItems[rowIndex], UnitType: Number(val) };
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "Quantity",
      label: "مقدار *",
      type: "custom",
      width: "90px",
      render: (row, rowIndex) => (
        <NumberInput
          value={row?.Quantity ?? 1}
          thousandsSeparator={true}
          localizeDigits={true}
          onChange={(newVal) => {
            const updatedItems = [...(values.items || [])];
            updatedItems[rowIndex] = calculateRowFields({
              ...updatedItems[rowIndex],
              Quantity: Number(newVal) || 0,
            });
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "UnitPrice",
      label: "فی (ریال) *",
      type: "custom",
      width: "120px",
      render: (row, rowIndex) => (
        <NumberInput
          value={row?.UnitPrice ?? 0}
          thousandsSeparator={true}
          localizeDigits={true}
          onChange={(newVal) => {
            const updatedItems = [...(values.items || [])];
            updatedItems[rowIndex] = calculateRowFields({
              ...updatedItems[rowIndex],
              UnitPrice: Number(newVal) || 0,
            });
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "TotalPrice",
      label: "مبلغ کل (ریال)",
      type: "text",
      width: "130px",
      render: (row) => (
        <span className="flex items-center justify-end w-full h-[25px] px-2 text-xs font-semibold text-slate-800 dark:text-slate-100 select-none dir-ltr">
          {formatCurrency(row?.TotalPrice)}
        </span>
      ),
    },
    {
      name: "Discount",
      label: "تخفیف (ریال)",
      type: "custom",
      width: "110px",
      render: (row, rowIndex) => (
        <NumberInput
          value={row?.Discount ?? 0}
          thousandsSeparator={true}
          localizeDigits={true}
          onChange={(newVal) => {
            const updatedItems = [...(values.items || [])];
            updatedItems[rowIndex] = calculateRowFields({
              ...updatedItems[rowIndex],
              Discount: Number(newVal) || 0,
            });
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "PriceAfterDiscount",
      label: "بعد از تخفیف",
      type: "text",
      width: "130px",
      render: (row) => (
        <span className="flex items-center justify-end w-full h-[25px] px-2 text-xs font-semibold text-slate-700 dark:text-slate-200 select-none dir-ltr">
          {formatCurrency(row?.PriceAfterDiscount)}
        </span>
      ),
    },
    {
      name: "VatTax",
      label: "ارزش افزوده",
      type: "custom",
      width: "110px",
      render: (row, rowIndex) => (
        <NumberInput
          value={row?.VatTax ?? 0}
          thousandsSeparator={true}
          localizeDigits={true}
          onChange={(newVal) => {
            const updatedItems = [...(values.items || [])];
            const manualVat = Number(newVal) || 0;
            const r = updatedItems[rowIndex];
            const afterDiscount = Math.max(0, (Number(r?.TotalPrice) || 0) - (Number(r?.Discount) || 0));
            updatedItems[rowIndex] = {
              ...r,
              ManualVatTax: manualVat,
              VatTax: manualVat,
              NetPrice: afterDiscount + manualVat,
            };
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "NetPrice",
      label: "خالص (ریال)",
      type: "text",
      width: "140px",
      render: (row) => (
        <span className="flex items-center justify-end w-full h-[25px] px-2 text-xs font-bold text-blue-700 dark:text-blue-400 select-none dir-ltr">
          {formatCurrency(row?.NetPrice)}
        </span>
      ),
    },
  ];

  // Factors Tab Config
  const factorsTabConfig: TabCellConfig[] = [
    {
      name: "RowNo",
      label: "ردیف",
      type: "text",
      width: "60px",
      render: (_row, rowIndex) => (
        <span className="flex items-center justify-center w-full h-[25px] text-xs font-semibold text-center select-none text-slate-600 dark:text-slate-400">
          {faNum(rowIndex + 1)}
        </span>
      ),
    },
    {
      name: "FactorTitle",
      label: "عنوان عامل *",
      type: "custom",
      width: "223px",
      render: (row, rowIndex) => (
        <PurchaseSalesParameterDropDown
          value={row?.FactorTitle || ""}
          onChange={(selectedParam) => handleFactorParamSelect(selectedParam, rowIndex)}
          placeholder="انتخاب عنوان عامل..."
          disabled={isUsed}
          noWrapper
        />
      ),
    },
    {
      name: "FactorType",
      label: "نوع عامل *",
      type: "custom",
      width: "140px",
      render: (row, rowIndex) => (
        <Select
          value={row?.FactorType || 1}
          options={FACTOR_TYPE_OPTIONS}
          onChange={(val) => {
            const updatedFactors = [...(values.factors || [])];
            updatedFactors[rowIndex] = { ...updatedFactors[rowIndex], FactorType: Number(val) };
            setValues((prev) => ({ ...prev, factors: updatedFactors }));
          }}
          disabled={true}
        />
      ),
    },
    {
      name: "Amount",
      label: "مبلغ (ریال) *",
      type: "custom",
      width: "187px",
      render: (row, rowIndex) => (
        <NumberInput
          value={row?.Amount ?? 0}
          thousandsSeparator={true}
          localizeDigits={true}
          onChange={(newVal) => {
            const updatedFactors = [...(values.factors || [])];
            updatedFactors[rowIndex] = { ...updatedFactors[rowIndex], Amount: Number(newVal) || 0 };
            setValues((prev) => ({ ...prev, factors: updatedFactors }));
          }}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "Description",
      label: "توضیحات",
      type: "custom",
      width: "250px",
      render: (row, rowIndex) => (
        <TextInput
          value={row?.Description || ""}
          onChange={(e: any) => {
            const newVal = e?.target?.value !== undefined ? e.target.value : e;
            const updatedFactors = [...(values.factors || [])];
            updatedFactors[rowIndex] = { ...updatedFactors[rowIndex], Description: newVal };
            setValues((prev) => ({ ...prev, factors: updatedFactors }));
          }}
          placeholder="توضیحات عامل..."
          disabled={isUsed}
        />
      ),
    },
  ];

  // Form Fields Structure
  const fields: FieldConfig[] = [
    {
      name: "BaseAndSupplyRequestGroup",
      type: "custom",
      colSpan: 1,
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="flex items-center gap-2 w-full">
          <div className={Number(values.BaseType) === ServicePurchaseInvoiceBaseType.SupplyRequest ? "w-1/2" : "w-full"}>
            <Select
              label="مبنا :"
              required
              value={values.BaseType || ServicePurchaseInvoiceBaseType.None}
              onChange={(val) => handleChange("BaseType", Number(val))}
              disabled={disabled || isUsed}
              options={BASE_TYPE_OPTIONS}
              labelWidth="80px"
            />
          </div>
          {Number(values.BaseType) === ServicePurchaseInvoiceBaseType.SupplyRequest && (
            <div className="w-1/2 flex items-center gap-1">
              <span className="text-slate-700 dark:text-slate-300 min-w-[85px] text-xs whitespace-nowrap">درخواست تامین:</span>
              <div className="flex-1">
                <SingleSelectDropDown
                  noWrapper={true}
                  options={supplyRequests}
                  data={supplyRequests}
                  columns={supplyRequestColumns}
                  value={values.SupplyRequestRef}
                  selectedValue={values.SupplyRequestRef}
                  valueKey="id"
                  displayKey="title"
                  searchKeys={["code", "title"]}
                  placeholder="انتخاب درخواست..."
                  onChange={(selected: any) => {
                    const refId = typeof selected === "object" ? selected?.id : selected;
                    setValues((prev) => ({ ...prev, SupplyRequestRef: refId ? Number(refId) : "" }));
                  }}
                  disabled={disabled || isUsed}
                />
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      name: "InvoiceNumberAndDate",
      type: "custom",
      colSpan: 1,
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <NumberInput
            label="شماره فاکتور :"
            required
            value={values.InvoiceNumber}
            onChange={(val) => handleChange("InvoiceNumber", val)}
            disabled={disabled || isUsed}
            placeholder="شماره فاکتور"
            labelWidth="75px"
            integerOnly={true}
          />
          <DateInput
            label="تاریخ فاکتور :"
            required
            value={values.InvoiceDate}
            onChange={(val) => handleChange("InvoiceDate", val)}
            disabled={disabled || isUsed}
            labelWidth="65px"
          />
        </div>
      ),
    },
    {
      name: "SupplierRef",
      type: "custom",
      colSpan: 1,
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="flex items-center gap-2 w-full">
          <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[80px] text-xs">
            تامین‌کننده <span className="text-red-500">*</span>:
          </span>
          <div className="flex-1">
            <SingleSelectDropDown
              noWrapper={true}
              options={suppliers}
              data={suppliers}
              listApiUrl="/api/common/parties?isActive=true&isSupplier=true"
              columns={supplierColumns}
              value={values.SupplierRef}
              selectedValue={values.SupplierRef}
              valueKey="id"
              displayKey="title"
              searchKeys={["code", "title", "title2"]}
              placeholder="انتخاب تامین‌کننده..."
              renderSelection={(item: any) =>
                item?.title ||
                item?.Title ||
                (item?.firstName || item?.lastName ? `${item.firstName || ''} ${item.lastName || ''}`.trim() : '') ||
                item?.Name ||
                ""
              }
              onChange={(selected: any) => {
                if (!selected) {
                  setValues((prev) => ({ ...prev, SupplierRef: "", SupplierName: "" }));
                  return;
                }
                if (typeof selected === "object") {
                  const sId = Number(selected.id || selected.partyId || selected.PartyID);
                  const sName =
                    selected.title ||
                    selected.Title ||
                    (selected.firstName || selected.lastName ? `${selected.firstName || ''} ${selected.lastName || ''}`.trim() : '') ||
                    selected.Name ||
                    "";
                  setValues((prev) => ({
                    ...prev,
                    SupplierRef: sId,
                    SupplierName: sName,
                  }));
                } else {
                  setValues((prev) => ({ ...prev, SupplierRef: Number(selected) }));
                }
              }}
              disabled={disabled || isUsed}
              addFormOptions={[
                { title: "تعریف طرف حساب/تامین‌کننده جدید", componentName: "PartyForm", groupId: "common" },
              ]}
            />
          </div>
        </div>
      ),
    },
    {
      name: "StatusAndCurrency",
      type: "custom",
      colSpan: 1,
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <StateListInput
            label="وضعیت :"
            value={values.Status || DocumentState.InitialRegistration}
            onChange={(val) => handleChange("Status", Number(val))}
            disabled={disabled || isUsed}
            labelWidth="75px"
          />
          <Select
            label="نوع ارز :"
            value={values.CurrencyRef || 1}
            onChange={(val) => handleChange("CurrencyRef", Number(val))}
            disabled={disabled || isUsed}
            options={CURRENCY_OPTIONS}
            labelWidth="65px"
          />
        </div>
      ),
    },
    {
      name: "Description",
      label: "توضیحات",
      type: "text",
      colSpan: 2,
      disabled: isUsed,
      placeholder: "توضیحات فاکتور خرید خدمت...",
    },
  ];

  // Financial calculations
  const totalItemsGross = (values.items || []).reduce((sum: number, item: any) => sum + (Number(item.TotalPrice) || 0), 0);
  const totalItemsDiscount = (values.items || []).reduce((sum: number, item: any) => sum + (Number(item.Discount) || 0), 0);
  const totalItemsAfterDiscount = Math.max(0, totalItemsGross - totalItemsDiscount);
  const totalItemsVat = (values.items || []).reduce((sum: number, item: any) => sum + (Number(item.VatTax) || 0), 0);

  let displayAdditions = 0;
  let displayDeductions = 0;

  (values.factors || []).forEach((f: any) => {
    const amt = Number(f.Amount) || 0;
    if (Number(f.FactorType) === 1) {
      displayAdditions += amt;
    } else {
      displayDeductions += amt;
    }
  });

  const finalNetTotal = Math.max(0, totalItemsAfterDiscount + totalItemsVat + displayAdditions - displayDeductions);
  const hasValidItem = (values.items || []).some((item: any) => item.ItemRef && Number(item.Quantity) > 0);

  const handleSave = async () => {
    if (!values.SupplierRef) {
      showToast("لطفاً تامین‌کننده فاکتور خرید خدمت را انتخاب کنید.", "error");
      return;
    }
    if (!values.InvoiceNumber) {
      showToast("لطفاً شماره فاکتور را وارد نمایید.", "error");
      return;
    }
    if (!hasValidItem) {
      showToast("حداقل یک خدمت با مقدار معتبر باید وارد شود.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...values,
        ServicePurchaseInvoiceID: activeId || undefined,
        BaseType: Number(values.BaseType) || ServicePurchaseInvoiceBaseType.None,
        SupplyRequestRef: values.SupplyRequestRef ? Number(values.SupplyRequestRef) : null,
        SupplierRef: Number(values.SupplierRef),
        InvoiceNumber: String(values.InvoiceNumber),
        InvoiceDate: values.InvoiceDate,
        Status: Number(values.Status) || DocumentState.InitialRegistration,
        CurrencyRef: Number(values.CurrencyRef) || 1,
        Description: values.Description || "",
        details: (values.items || []).map((item: any, index: number) => ({
          RowNo: index + 1,
          ItemRef: Number(item.ItemRef),
          Quantity: Number(item.Quantity) || 1,
          UnitPrice: Number(item.UnitPrice) || 0,
          Discount: Number(item.Discount) || 0,
          UnitType: Number(item.UnitType) || 1,
        })),
        factors: (values.factors || [])
          .filter((f: any) => f.FactorTitle)
          .map((f: any, index: number) => ({
            RowNo: index + 1,
            FactorTitle: f.FactorTitle,
            FactorType: Number(f.FactorType) || 1,
            Amount: Number(f.Amount) || 0,
            Description: f.Description || "",
            PurchaseSalesParameterRef: f.PurchaseSalesParameterRef ? Number(f.PurchaseSalesParameterRef) : null,
          })),
      };

      const url = activeId ? `/api/inv/service-purchase-invoices/${activeId}` : "/api/inv/service-purchase-invoices";
      const method = activeId ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "خطا در ثبت فاکتور خرید خدمت", "error");
        return;
      }

      const resultData = await res.json();
      const newId = resultData.ServicePurchaseInvoiceID || resultData.id || activeId;
      if (newId) {
        setActiveId(Number(newId));
      }
      showToast("فاکتور خرید خدمت با موفقیت ذخیره شد.", "success");
    } catch (err) {
      console.error("Error saving service purchase invoice:", err);
      showToast("خطای غیرمنتظره در ثبت فاکتور خرید خدمت", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNew = async () => {
    await handleSave();
    handleNew();
  };

  const handleNew = () => {
    setActiveId(undefined);
    setValues({
      ServicePurchaseInvoiceID: "",
      BaseType: ServicePurchaseInvoiceBaseType.None,
      SupplyRequestRef: "",
      SupplierRef: "",
      SupplierName: "",
      InvoiceNumber: "",
      InvoiceDate: getTodayJalali(),
      BaseDocumentNumber: "",
      Status: DocumentState.InitialRegistration,
      CurrencyRef: 1,
      Description: "",
      items: [
        {
          id: "1",
          RowNo: 1,
          ItemRef: null,
          ItemCode: "",
          ItemName: "",
          UnitName: "عدد",
          UnitType: 1,
          Quantity: 1,
          UnitPrice: 0,
          TotalPrice: 0,
          Discount: 0,
          PriceAfterDiscount: 0,
          VatTax: 0,
          NetPrice: 0,
          Currency: "ریال",
        },
      ],
      factors: [
        {
          id: "1",
          RowNo: 1,
          FactorTitle: "",
          FactorType: 1,
          Amount: 0,
          Description: "",
        },
      ],
    });
    setSelectedFactorIndex(null);
    setSelectedItemIndex(0);
    setIsRapRegistered(false);

    apiFetch("/api/inv/service-purchase-invoices/next-number")
      .then((res) => res.json())
      .then((data) => {
        if (data?.documentNumber) {
          setValues((prev) => ({ ...prev, InvoiceNumber: data.documentNumber }));
        }
      })
      .catch((err) => console.error("Error fetching next invoice number:", err));
  };

  const handleDelete = async () => {
    if (!activeId) return;
    try {
      const res = await apiFetch(`/api/inv/service-purchase-invoices/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "خطا در حذف فاکتور خرید خدمت", "error");
        throw new Error(errData.message || "خطا در حذف فاکتور خرید خدمت");
      }
      showToast("فاکتور خرید خدمت با موفقیت حذف شد.", "success");
      handleNew();
    } catch (err: any) {
      if (err?.message !== "خطا در حذف فاکتور خرید خدمت") {
        showToast("خطا در ارسال درخواست حذف", "error");
      }
      throw err;
    }
  };

  const handleListSelect = (item: any) => {
    if (!item) return;
    const selectedId = item.ServicePurchaseInvoiceID || item.id;
    if (selectedId) {
      setActiveId(Number(selectedId));
    }
  };

  const handleClose = () => {
    if (tabId) {
      removeTab(tabId);
    }
  };

  const handleRapInsert = () => {
    if (!values.SupplierRef) {
      showToast("لطفاً ابتدا تامین‌کننده فاکتور را انتخاب کنید.", "error");
      return;
    }
    setIsRapRegistered(true);
    showToast("اطلاعات فاکتور خرید خدمت بر اساس فرم جاری با موفقیت در سیستم دریافت و پرداخت ثبت شد.", "success");
  };

  const handleRapEdit = () => {
    if (!isRapRegistered) {
      showToast("ابتدا باید اطلاعات فاکتور در سیستم دریافت و پرداخت ثبت شود.", "warning");
      return;
    }
    showToast("اطلاعات ثبت شده فاکتور خرید خدمت در سیستم دریافت و پرداخت با موفقیت ویرایش گردید.", "info");
  };

  const handleRapDelete = () => {
    if (!isRapRegistered) {
      showToast("اطلاعاتی در سیستم دریافت و پرداخت برای حذف وجود ندارد.", "warning");
      return;
    }
    setIsRapRegistered(false);
    showToast("اطلاعات ثبت شده فاکتور خرید خدمت با موفقیت از سیستم دریافت و پرداخت حذف گردید.", "success");
  };

  return (
    <SimpleFormTwoRowTabbed
      title={activeId ? "ویرایش فاکتور خرید خدمت" : "فاکتور خرید خدمت جدید"}
      fields={fields}
      values={values}
      onChange={handleChange}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onNew={handleNew}
      onDelete={handleDelete}
      onListSelect={handleListSelect}
      onClose={handleClose}
      actionbar={
        <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-700 pr-2 mr-1">
          <RapInsertButton
            onClick={handleRapInsert}
            disabled={isUsed || isRapRegistered}
            hideLabel={true}
          />
          <RapEditButton
            onClick={handleRapEdit}
            disabled={isUsed || !isRapRegistered}
            hideLabel={true}
          />
          <RapDeleteButton
            onClick={handleRapDelete}
            disabled={isUsed || !isRapRegistered}
            hideLabel={true}
          />
        </div>
      }
      listApiUrl="/api/inv/service-purchase-invoices"
      listDisplayKey="InvoiceNumber"
      listColumns={[
        { key: "InvoiceNumber", label: "شماره فاکتور", title: "شماره فاکتور" },
        { key: "InvoiceDate", label: "تاریخ فاکتور", title: "تاریخ فاکتور" },
        {
          key: "SupplierName",
          label: "تامین‌کننده",
          title: "تامین‌کننده",
          render: (val: any, row: any) => val || row?.supplierParty?.title || "نامشخص",
        },
        {
          key: "BaseType",
          label: "مبنا",
          title: "مبنا",
          render: (val: number) => BASE_TYPE_OPTIONS.find((b) => b.id === Number(val))?.title || "بدون مبنا",
        },
        {
          key: "Status",
          label: "وضعیت",
          title: "وضعیت",
          render: (val: number) => DocumentStateLabels[val as DocumentState] || val,
        },
      ]}
      targetForm="ServicePurchaseInvoice"
      isReadonly={isUsed}
      bottomTabs={[
        {
          id: "items_tab",
          label: "اقلام فاکتور خرید خدمت",
          content: (
            <div className="flex flex-col h-full flex-1 min-h-0 w-full p-0 gap-0 overflow-hidden">
              {/* 1. Items Grid */}
              <div className="flex-1 min-h-[150px] overflow-hidden border border-slate-200 dark:border-slate-700/80 rounded-t-md shadow-2xs bg-white dark:bg-slate-900 flex flex-col">
                <TabCellRow
                  tabs={detailTabConfig}
                  value={values.items || []}
                  onChange={(newItems) =>
                    setValues((prev) => ({
                      ...prev,
                      items: newItems.map((item, idx) => calculateRowFields({ ...item, RowNo: idx + 1 })),
                    }))
                  }
                  onActiveRowChange={(tabId, rowIndex) => {
                    if (rowIndex !== null && rowIndex !== undefined) {
                      setSelectedItemIndex(rowIndex);
                    }
                  }}
                  hideHeader={false}
                  hideAddButton={isUsed}
                  disableAddButton={isUsed || !Boolean(values.SupplierRef)}
                  hideDeleteButton={isUsed}
                />
              </div>

              {/* Splitter handle between Items Grid and Footer Summary Layout */}
              <div 
                {...footerHandleProps}
                className={`group relative flex items-center justify-center h-2.5 bg-slate-100 hover:bg-blue-500/80 dark:bg-slate-800/80 dark:hover:bg-blue-600/80 cursor-row-resize select-none border-y border-slate-200 dark:border-slate-700/60 transition-colors shrink-0 my-0 ${footerDragging ? "bg-blue-500/80 dark:bg-blue-600/80" : ""}`}
                title={isFooterCollapsed ? "دابل‌کلیک: نمایش فوتر" : "درگ موس: تغییر ارتفاع فوتر — دابل‌کلیک: مخفی‌سازی فوتر"}
              >
                <div className="w-16 h-1 rounded-full bg-slate-300 dark:bg-slate-500 group-hover:bg-white group-hover:w-24 transition-all flex items-center justify-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white/80"></span>
                  <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white/80"></span>
                </div>
              </div>

              {/* 2. 3 Columns below Items Table */}
              {!isFooterCollapsed && (
              <div
                style={{ "--footer-h": `${footerHeight}px` } as React.CSSProperties}
                className={`grid grid-cols-1 lg:grid-cols-3 gap-2 w-full shrink-0 pt-0 lg:h-[var(--footer-h)] ${!hasValidItem ? "opacity-50 pointer-events-none select-none" : ""}`}
              >
                {/* Column 1 (RTL Right): عوامل خرید خدمت */}
                <div className="bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700/80 p-2 pr-8 flex flex-col justify-between shadow-2xs relative h-[150px] max-h-[150px] lg:h-full lg:max-h-full overflow-hidden">
                  <div className="absolute top-2 right-0 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-r-0 border-indigo-200 dark:border-indigo-800 text-[11px] font-bold px-1 py-2.5 rounded-l-md shadow-2xs flex items-center justify-center z-10 select-none">
                    <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap tracking-wide">
                      عوامل خرید
                    </span>
                  </div>

                  <div className="overflow-y-auto overflow-x-auto w-full flex-1 min-h-0 max-h-[105px] lg:max-h-none border border-slate-100 dark:border-slate-800/60 rounded">
                    <table className="w-full text-xs text-right border-collapse table-fixed">
                      <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-2xs">
                        <tr className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                          <th className="p-1 text-center w-8">انتخاب</th>
                          <th className="p-1 text-right w-[47%]">عنوان عامل</th>
                          <th className="p-1 text-left w-[43%]">مبلغ</th>
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
                          (() => {
                            const activeIdx = (selectedItemIndex !== null && selectedItemIndex >= 0 && selectedItemIndex < (values.items?.length || 0)) ? selectedItemIndex : 0;
                            const selItem = values.items?.[activeIdx];
                            return (values.factors || []).map((f: any, idx: number) => {
                              const rowFactorAmount = getFactorAmountForRow(f, selItem, values.items, values.InvoiceDate, parametersList);
                              return (
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
                                      disabled={isUsed || !hasValidItem}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                  </td>
                                  <td className="p-1">
                                    <PurchaseSalesParameterDropDown
                                      value={f.FactorTitle || ""}
                                      onChange={(selectedParam) => handleFactorParamSelect(selectedParam, idx)}
                                      placeholder="عنوان عامل..."
                                      disabled={isUsed || !hasValidItem}
                                      noWrapper
                                    />
                                  </td>
                                  <td className="p-1 dir-ltr">
                                    <NumberInput
                                      value={rowFactorAmount ?? 0}
                                      thousandsSeparator={true}
                                      localizeDigits={true}
                                      onChange={(newVal) => {
                                        const numVal = Number(newVal) || 0;
                                        const oldRowAmount = getFactorAmountForRow(f, selItem, values.items, values.InvoiceDate, parametersList);
                                        const diff = numVal - oldRowAmount;
                                        const newTotal = Math.max(0, Number(f.Amount || 0) + diff);
                                        const updated = [...(values.factors || [])];
                                        updated[idx] = { ...updated[idx], Amount: newTotal };
                                        setValues((prev) => ({ ...prev, factors: updated }));
                                      }}
                                      disabled={isUsed || !hasValidItem}
                                      className="w-full bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-left"
                                    />
                                  </td>
                                </tr>
                              );
                            });
                          })()
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
                        setSelectedFactorIndex((values.factors?.length || 0));
                      }}
                      disabled={isUsed || !hasValidItem}
                      className="p-1 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 disabled:opacity-30 transition-colors drop-shadow-2xs"
                      title="افزودن ردیف"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedFactorIndex !== null && selectedFactorIndex >= 0) {
                          const updated = (values.factors || []).filter((_, i) => i !== selectedFactorIndex);
                          setValues((prev) => ({ ...prev, factors: updated }));
                          setSelectedFactorIndex(null);
                        } else if ((values.factors || []).length > 0) {
                          const updated = (values.factors || []).slice(0, -1);
                          setValues((prev) => ({ ...prev, factors: updated }));
                        }
                      }}
                      disabled={isUsed || !hasValidItem || (values.factors || []).length === 0}
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
                      disabled={isUsed || !hasValidItem || selectedFactorIndex === null}
                      className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-30 transition-colors drop-shadow-2xs"
                      title="ویرایش ردیف"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Column 2 (RTL Middle): خلاصه گزارش */}
                <div className="bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700/80 p-2 pr-8 flex flex-col justify-between shadow-2xs relative h-[150px] max-h-[150px] lg:h-full lg:max-h-full overflow-hidden">
                  <div className="absolute top-2 right-0 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-r-0 border-indigo-200 dark:border-indigo-800 text-[11px] font-bold px-1 py-2.5 rounded-l-md shadow-2xs flex items-center justify-center z-10 select-none">
                    <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap tracking-wide">
                      خلاصه گزارش
                    </span>
                  </div>

                  <div className="overflow-y-auto overflow-x-auto w-full flex-1 min-h-0 max-h-[135px] lg:max-h-none">
                    <table className="w-full text-xs text-right border-collapse">
                      <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-2xs">
                        <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                          <th className="p-1 text-right">عنوان</th>
                          <th className="p-1 text-center w-16">تاریخ</th>
                          <th className="p-1 text-center w-12">مقدار</th>
                          <th className="p-1 text-left w-20">مبلغ خرید</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                          <td className="p-1 font-medium text-slate-800 dark:text-slate-200 text-[11px]">آخرین خرید خدمت</td>
                          <td className="p-1 text-center text-slate-500 dark:text-slate-400 text-[11px]">{values.InvoiceDate || "-"}</td>
                          <td className="p-1 text-center text-slate-700 dark:text-slate-300 text-[11px]">{values.items?.[0]?.Quantity ? formatCurrency(values.items?.[0]?.Quantity) : "-"}</td>
                          <td className="p-1 text-left font-semibold text-slate-800 dark:text-slate-200 dir-ltr text-[11px]">
                            {formatCurrency(values.items?.[0]?.UnitPrice || 0)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                          <td className="p-1 font-medium text-slate-800 dark:text-slate-200 text-[11px]">آخرین خرید خدمت از تامین کننده</td>
                          <td className="p-1 text-center text-slate-500 dark:text-slate-400 text-[11px]">{values.InvoiceDate || "-"}</td>
                          <td className="p-1 text-center text-slate-700 dark:text-slate-300 text-[11px]">{values.items?.[0]?.Quantity ? formatCurrency(values.items?.[0]?.Quantity) : "-"}</td>
                          <td className="p-1 text-left font-semibold text-slate-800 dark:text-slate-200 dir-ltr text-[11px]">
                            {formatCurrency(values.items?.[0]?.UnitPrice || 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Column 3 (RTL Left): مبالغ */}
                <div className="bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700/80 p-2 pr-8 flex flex-col justify-between shadow-2xs relative h-[150px] max-h-[150px] lg:h-full lg:max-h-full overflow-hidden">
                  <div className="absolute top-2 right-0 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-r-0 border-indigo-200 dark:border-indigo-800 text-[11px] font-bold px-1 py-2.5 rounded-l-md shadow-2xs flex items-center justify-center z-10 select-none">
                    <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap tracking-wide">
                      مبالغ
                    </span>
                  </div>

                  <div className="overflow-y-auto overflow-x-auto w-full flex-1 min-h-0 max-h-[115px] lg:max-h-none">
                    <table className="w-full text-xs text-right border-collapse">
                      <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-2xs">
                        <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                          <th className="p-1 text-right">عنوان</th>
                          <th className="p-1 text-left w-28">مبلغ</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          <td className="p-1 text-slate-700 dark:text-slate-300 font-medium text-[11px]">جمع</td>
                          <td className="p-1 text-left font-semibold text-slate-900 dark:text-slate-100 dir-ltr text-[11px]">
                            {formatCurrency(totalItemsGross)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          <td className="p-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">اضافات</td>
                          <td className="p-1 text-left font-semibold text-emerald-600 dark:text-emerald-400 dir-ltr text-[11px]">
                            {formatCurrency(displayAdditions)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          <td className="p-1 text-rose-600 dark:text-rose-400 font-medium text-[11px]">کسورات</td>
                          <td className="p-1 text-left font-semibold text-rose-600 dark:text-rose-400 dir-ltr text-[11px]">
                            {formatCurrency(displayDeductions)}
                          </td>
                        </tr>
                        <tr className="bg-indigo-50/60 dark:bg-indigo-950/40">
                          <td className="p-1 text-indigo-900 dark:text-indigo-200 font-extrabold text-[11px]">جمع کل</td>
                          <td className="p-1 text-left font-extrabold text-indigo-900 dark:text-indigo-200 text-xs dir-ltr">
                            {formatCurrency(finalNetTotal)}
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
        {
          id: "factors_tab",
          label: "عوامل خرید",
          content: (
            <TabCellRow
              tabs={factorsTabConfig}
              value={values.factors || []}
              onChange={(newFactors) =>
                setValues((prev) => ({
                  ...prev,
                  factors: newFactors.map((f, idx) => ({ ...f, RowNo: idx + 1 })),
                }))
              }
              hideHeader={false}
              hideAddButton={isUsed || !hasValidItem}
              disableAddButton={isUsed || !hasValidItem}
              hideDeleteButton={isUsed || !hasValidItem}
              isReadonly={isUsed || !hasValidItem}
            />
          ),
        },
        {
          id: "summary_tab",
          label: "خلاصه مبالغ و محاسبات",
          content: (
            <div className={`p-4 bg-slate-50 dark:bg-slate-900/50 min-h-[220px] overflow-auto ${!hasValidItem ? "opacity-50 pointer-events-none select-none" : ""}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      خلاصه محاسبات مالی فاکتور خرید خدمت
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-md border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium block">
                        جمع کل اقلام
                      </span>
                      <span className="text-slate-900 dark:text-slate-100 font-bold text-sm dir-ltr block text-left mt-1">
                        {formatCurrency(totalItemsGross)} <span className="text-[10px] text-slate-500 font-normal">ریال</span>
                      </span>
                    </div>

                    <div className="bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-md border border-rose-100 dark:border-rose-900/30">
                      <span className="text-rose-600 dark:text-rose-400 text-[11px] font-medium block">
                        جمع تخفیفات اقلام
                      </span>
                      <span className="text-rose-700 dark:text-rose-300 font-bold text-sm dir-ltr block text-left mt-1">
                        - {formatCurrency(totalItemsDiscount)} <span className="text-[10px] font-normal">ریال</span>
                      </span>
                    </div>

                    <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-100 dark:border-amber-900/30">
                      <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium block">
                        ارزش افزوده (۹٪)
                      </span>
                      <span className="text-amber-700 dark:text-amber-300 font-bold text-sm dir-ltr block text-left mt-1">
                        + {formatCurrency(totalItemsVat)} <span className="text-[10px] font-normal">ریال</span>
                      </span>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-md border border-emerald-100 dark:border-emerald-900/30">
                      <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium block">
                        جمع اضافات عوامل
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm dir-ltr block text-left mt-1">
                        + {formatCurrency(displayAdditions)} <span className="text-[10px] font-normal">ریال</span>
                      </span>
                    </div>

                    <div className="bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-md border border-rose-100 dark:border-rose-900/30">
                      <span className="text-rose-600 dark:text-rose-400 text-[11px] font-medium block">
                        جمع کسورات عوامل
                      </span>
                      <span className="text-rose-700 dark:text-rose-300 font-bold text-sm dir-ltr block text-left mt-1">
                        - {formatCurrency(displayDeductions)} <span className="text-[10px] font-normal">ریال</span>
                      </span>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                      <span className="text-blue-700 dark:text-blue-300 text-[11px] font-semibold block">
                        تعداد خدمات فاکتور
                      </span>
                      <span className="text-blue-900 dark:text-blue-200 font-extrabold text-sm block mt-1">
                        {values.items?.length || 0} خدمت
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-lg p-5 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span>مبلغ خالص قابل پرداخت فاکتور خدمت</span>
                    </div>
                    <div className="text-2xl font-black mt-3 dir-ltr text-left tracking-tight">
                      {formatCurrency(finalNetTotal)} <span className="text-xs font-normal text-blue-200">ریال</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-blue-500/40 flex items-center justify-between text-[11px] text-blue-100">
                    <span>تامین‌کننده: {values.SupplierName || "انتخاب نشده"}</span>
                    <span>وضعیت: {DocumentStateLabels[values.Status as DocumentState] || "ثبت اولیه"}</span>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}

export default ServicePurchaseInvoice;

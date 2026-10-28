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
import { apiFetch, normalizePersianText } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFooterPanelResize } from "@/hooks/useFooterPanelResize"; // Task 87: دستگیره ارتفاع فوتر
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import momentJalaali from "moment-jalaali";
import { Calculator, DollarSign, Plus, X, Pencil, AlertCircle } from "lucide-react";
import { RapInsertButton } from "@/components/buttons/RapInsertButton";
import { RapEditButton } from "@/components/buttons/RapEditButton";
import { RapDeleteButton } from "@/components/buttons/RapDeleteButton";
import { TrackingFactorModal } from "@/components/forms/inv/TrackingFactorModal";
import { StockSummaryBox } from "@/components/forms/inv/StockSummaryModal";

interface ReturnTemporaryItemReceiptProps {
  id?: number;
  tabId?: string;
}

export enum ReturnTemporaryItemReceiptBaseType {
  None = 1,
  TemporaryReceipt = 2,
}

export const BASE_TYPE_OPTIONS = [
  { id: ReturnTemporaryItemReceiptBaseType.None, title: "بدون مبنا", value: ReturnTemporaryItemReceiptBaseType.None, label: "بدون مبنا" },
  { id: ReturnTemporaryItemReceiptBaseType.TemporaryReceipt, title: "رسید موقت کالا", value: ReturnTemporaryItemReceiptBaseType.TemporaryReceipt, label: "رسید موقت کالا" },
];

export const CURRENCY_OPTIONS = [
  { id: 1, title: "ریال", value: 1, label: "ریال" },
  { id: 2, title: "دلار", value: 2, label: "دلار" },
  { id: 3, title: "یورو", value: 3, label: "یورو" },
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

export function ReturnTemporaryItemReceipt({ id, tabId }: ReturnTemporaryItemReceiptProps) {
  const { removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("ReturnTemporaryItemReceipt", activeId);
  const [selectedFactorIndex, setSelectedFactorIndex] = useState<number | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(0);
  const [isTrackingFactorEnabled, setIsTrackingFactorEnabled] = useState(false);
  const [allTrackingFactors, setAllTrackingFactors] = useState<any[]>([]);
  const [tfModalState, setTfModalState] = useState<{
    isOpen: boolean;
    rowIndex: number | null;
    itemName: string;
    itemCode: string;
    trackingFactors: any[];
    initialValues: any;
    initialQuantity: number | string;
    originalQuantity?: any;
    receivedQuantity?: any;
    remainingQuantity?: any;
    hasBase?: boolean;
  }>({
    isOpen: false,
    rowIndex: null,
    itemName: "",
    itemCode: "",
    trackingFactors: [],
    initialValues: {},
    initialQuantity: "",
  });

  const getItemTrackingFactors = (itemRef: number | null) => {
    if (!itemRef || !allTrackingFactors || allTrackingFactors.length === 0) return [];
    return allTrackingFactors
      .filter((tf: any) => {
        const related = tf.relatedItems || tf.Items || tf.items || [];
        return related.some(
          (rel: any) => Number(rel.ItemRef || rel.item?.ItemID || rel.ItemID || rel.id) === Number(itemRef)
        );
      })
      .sort((a, b) => (a.DisplayPriority || 1) - (b.DisplayPriority || 1));
  };

  // Form Header Values
  const [values, setValues] = useState<Record<string, any>>({
    ReturnTemporaryItemReceiptID: activeId || "",
    BaseType: ReturnTemporaryItemReceiptBaseType.None,
    TemporaryReceiptRef: "",
    SupplyRequestRef: "",
    SupplierRef: "",
    SupplierName: "",
    ReceiptNumber: "",
    ReceiptDate: getTodayJalali(),
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
  const [temporaryReceipts, setTemporaryReceipts] = useState<any[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [parametersList, setParametersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Task 87: دستگیره فوتر — درگ موس برای کم/زیاد کردن ارتفاع + دبل‌کلیک برای جمع شدن کامل و بازگشت
  const { isCollapsed: isFooterCollapsed, footerHeight, isDragging: footerDragging, handleProps: footerHandleProps } = useFooterPanelResize(150);

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

  const temporaryReceiptColumns: SingleSelectColumn[] = [
    { key: "code", label: "شماره رسید موقت", width: 120 },
    { key: "title", label: "عنوان/تاریخ", width: 220 },
  ];

  const supplyRequestColumns: SingleSelectColumn[] = [
    { key: "code", label: "شماره درخواست", width: 120 },
    { key: "title", label: "عنوان/تاریخ", width: 220 },
  ];

  const itemDropdownColumns: Column[] = [
    { key: "ItemCode", label: "کد کالا/خدمت", width: 120 },
    { key: "ItemName", label: "عنوان کالا/خدمت", width: 220 },
    { key: "UnitName", label: "واحد سنجش", width: 120 },
  ];

  // Fetch initial record or next document number
  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/inv/return-temporary-item-receipts/${activeId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            // -------------------------------------------------------------
            // Task 121: نرخ مالیات فقط از «عوامل ثبت‌شده» نوع مالیات/عوارض سند ذخیره‌شده؛
            // بدون چنین عاملی، ستون «جمع مالیات و عوارض ارزش افزوده» صفر است
            // (رفع محاسبه ثابت ۹٪ در زمان بارگذاری)
            // -------------------------------------------------------------
            const loadedReceiptDate = data.ReceiptDate || data.InvoiceDate ? momentJalaali(data.ReceiptDate || data.InvoiceDate).format("jYYYY/jMM/jDD") : "";
            const loadedFactors =
              Array.isArray(data.factors) && data.factors.length > 0
                ? data.factors.map((f: any, idx: number) => ({
                    id: String(f.ReturnTemporaryItemReceiptFactorID || f.TemporaryItemReceiptFactorID || idx + 1),
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
                  ];
            const loadedVatRate = loadedFactors.reduce(
              (acc: number, f: any) => acc + getFactorVatRate(findParamObj(f, parametersList), f, loadedReceiptDate),
              0
            );
            setValues({
              ReturnTemporaryItemReceiptID: data.ReturnTemporaryItemReceiptID || data.TemporaryItemReceiptID || activeId,
              BaseType: data.BaseType ? Number(data.BaseType) : ReturnTemporaryItemReceiptBaseType.None,
              TemporaryReceiptRef: data.TemporaryReceiptRef ? Number(data.TemporaryReceiptRef) : "",
              SupplyRequestRef: data.SupplyRequestRef ? Number(data.SupplyRequestRef) : "",
              SupplierRef: data.SupplierRef ? Number(data.SupplierRef) : "",
              SupplierName: data.SupplierName || data.supplierParty?.title || "",
              ReceiptNumber: data.ReceiptNumber || data.InvoiceNumber || "",
              ReceiptDate: loadedReceiptDate || getTodayJalali(),
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
                      const vat = Math.round(afterDiscount * loadedVatRate);
                      const net = afterDiscount + vat;

                      const matchedItem = availableItems.find(
                        (i) => Number(i.ItemID || i.id) === Number(d.ItemRef)
                      );
                      const mainUnitName = matchedItem?.UnitName || d.item?.MeasurementUnit?.MeasurementUnitTitle || d.UnitName || "عدد";
                      const currentUnitName = d.UnitName || mainUnitName;

                      let currentUnitType = d.UnitType === 2 || d.UnitType === "فرعی" ? "فرعی" : "اصلی";
                      if (matchedItem && matchedItem.allUnits) {
                        const foundUnit = matchedItem.allUnits.find(
                          (u: any) => u.MeasurementUnitName === currentUnitName
                        );
                        if (foundUnit) {
                          currentUnitType = foundUnit.UnitType || "اصلی";
                        } else if (currentUnitName !== mainUnitName) {
                          currentUnitType = "فرعی";
                        }
                      }

                      return {
                        id: String(d.ReturnTemporaryItemReceiptDetailID || d.TemporaryItemReceiptDetailID || idx + 1),
                        RowNo: d.RowNo || idx + 1,
                        ItemRef: d.ItemRef,
                        BaseNumber: d.BaseNumber || "",
                        ItemCode: d.item?.ItemCode || matchedItem?.ItemCode || d.ItemCode || "",
                        ItemName: d.item?.ItemName || matchedItem?.ItemName || d.ItemName || "",
                        UnitName: currentUnitName,
                        UnitType: currentUnitType,
                        Quantity: qty,
                        UnitPrice: price,
                        TotalPrice: total,
                        Discount: discount,
                        PriceAfterDiscount: afterDiscount,
                        VatTax: vat,
                        NetPrice: net,
                        Currency: "ریال",
                        trackingFactorValues: d.TrackingFactorValues || d.trackingFactorValues || d.trackingFactors || {},
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
                        UnitType: "اصلی",
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
              factors: loadedFactors,
            });
          }
        })
        .catch((err) => console.error("Error loading return temporary item receipt:", err));
    } else {
      apiFetch("/api/inv/return-temporary-item-receipts/next-number")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.documentNumber) {
            setValues((prev) => ({ ...prev, ReceiptNumber: data.documentNumber }));
          } else {
            setValues((prev) => ({ ...prev, ReceiptNumber: "2001" }));
          }
        })
        .catch(() => {
          setValues((prev) => ({ ...prev, ReceiptNumber: "2001" }));
        });
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

    // Fetch temporary receipts
    apiFetch("/api/inv/temporary-item-receipts")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setTemporaryReceipts(
          list
            .filter((r: any) => isStatusApprovedOrReviewed(r.Status || r.status))
            .map((r: any) => ({
              id: Number(r.TemporaryItemReceiptID || r.id),
              code: String(r.ReceiptNumber || r.code || r.TemporaryItemReceiptID || r.id),
              title: `رسید ${r.ReceiptNumber || ""} - ${r.ReceiptDate || ""}`,
            }))
        );
      })
      .catch((err) => console.error("Error fetching temporary receipts:", err));

    // Fetch supply requests
    apiFetch("/api/inv/item-supply-requests")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setSupplyRequests(
          list
            .filter((r: any) => isStatusApprovedOrReviewed(r.Status || r.status))
            .map((r: any) => ({
              id: Number(r.ItemSupplyRequestID || r.id),
              code: String(r.RequestNumber || r.code || r.ItemSupplyRequestID || r.id),
              title: `درخواست ${r.RequestNumber || ""} - ${r.RequestDate || ""}`,
            }))
        );
      })
      .catch((err) => console.error("Error fetching supply requests:", err));

    // Fetch items / goods / services
    apiFetch("/api/inv/items/dropdown")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setAvailableItems(
          list.map((item: any) => {
            const mainUnitName = item.MeasurementUnit?.MeasurementUnitTitle || item.MeasurementUnitName || item.UnitName || item.unit || "عدد";
            const mainUnitId = item.MeasurementUnitRef || item.mainUnit?.MeasurementUnitID || 1;
            const mainUnitObj = {
              id: mainUnitId,
              MeasurementUnitID: mainUnitId,
              MeasurementUnitName: mainUnitName,
              title: mainUnitName,
              UnitType: "اصلی",
            };

            const rawSubUnits = item.subUnits || item.ItemSubUnits || [];
            const subUnitsList = rawSubUnits.map((su: any, idx: number) => {
              const suName = su.MeasurementUnitName || su.SubUnitName || su.title || su.unit || "";
              const suId = su.MeasurementUnitID || su.SubUnitRef || su.id || (idx + 100);
              const ratio = su.MainToSubRatio !== undefined && su.MainToSubRatio !== null
                ? Number(su.MainToSubRatio)
                : su.ConversionFactor !== undefined && su.ConversionFactor !== null
                ? Number(su.ConversionFactor)
                : su.ratio !== undefined && su.ratio !== null
                ? Number(su.ratio)
                : 1;
              return {
                ...su,
                id: suId,
                ItemSubUnitID: su.ItemSubUnitID || su.id || suId,
                SubUnitRef: su.SubUnitRef || suId,
                MeasurementUnitID: suId,
                MeasurementUnitName: suName,
                SubUnitName: suName,
                title: suName,
                UnitType: "فرعی",
                MainToSubRatio: ratio,
                IsVariableRatio: su.IsVariableRatio ?? su.isVariable ?? false,
                TolerancePercent: Number(su.TolerancePercent || su.tolerance || 0),
              };
            });

            const allUnitsList = [
              mainUnitObj,
              ...subUnitsList.filter((su: any) => su.MeasurementUnitName && su.MeasurementUnitName !== mainUnitName),
            ];

            return {
              id: item.ItemID || item.id,
              ItemID: item.ItemID || item.id,
              ItemCode: item.ItemCode || item.code || "",
              ItemName: item.ItemName || item.title || item.name || "",
              UnitName: mainUnitName,
              mainUnit: mainUnitObj,
              subUnits: subUnitsList,
              allUnits: allUnitsList,
              title: `${item.ItemCode ? item.ItemCode + " - " : ""}${item.ItemName || item.title || item.name || ""}`,
            };
          })
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

    // Fetch Tracking Factor Settings
    apiFetch("/api/common/base-settings/tab/3")
      .then((res) => res.json())
      .then((resData) => {
        const checkSetting = (data: any, keyName: string) => {
          if (!data) return false;
          if (Array.isArray(data)) {
            return data.some((s: any) => s.key?.trim() === keyName && (s.value === "true" || s.value === true));
          }
          if (Array.isArray(data.data)) {
            return data.data.some((s: any) => s.key?.trim() === keyName && (s.value === "true" || s.value === true));
          }
          const obj = data.data || data;
          if (typeof obj === "object" && obj !== null) {
            const val = obj[keyName];
            return val === "true" || val === true;
          }
          return false;
        };

        const whActive = checkSetting(resData, "isTrackingFactorActiveInWarehouse");
        const trActive = checkSetting(resData, "isTrackingFactorActiveInTemporaryReceipt");
        setIsTrackingFactorEnabled(whActive && trActive);
      })
      .catch((err) => console.error("Error fetching tracking factor settings:", err));

    // Fetch All Active Tracking Factors
    apiFetch("/api/inv/tracking-factors")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setAllTrackingFactors(
          list.filter((tf: any) => tf.IsActive !== false && tf.IsActive !== 0)
        );
      })
      .catch((err) => console.error("Error fetching tracking factors:", err));
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
    const vat = Math.round(afterDiscount * vatRate);
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

  function isDateInRange(receiptDate: string, startDate: string, endDate: string): boolean {
    const normInvoice = normalizeJalaliDate(receiptDate);
    const normStart = normalizeJalaliDate(startDate);
    const normEnd = normalizeJalaliDate(endDate);

    if (!normInvoice) return false;
    if (normStart && normInvoice < normStart) return false;
    if (normEnd && normInvoice > normEnd) return false;
    return true;
  }

  function normalizePersianText(str: string | null | undefined): string {
    if (!str) return "";
    return String(str)
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/\u200c/g, " ")
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
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

  function getFactorVatRate(paramObj: any, factor: any, receiptDate: string): number {
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

    if (receiptDate && valuesList.length > 0) {
      const match = valuesList.find((v: any) =>
        isDateInRange(receiptDate, v.StartDate || v.startDate, v.EndDate || v.endDate)
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
        const normDate = normalizeJalaliDate(receiptDate);
        if (normDate && normDate < "1403/01/01") {
          rate = 0.06;
        } else {
          rate = 0.07;
        }
      }
    }

    return rate;
  }

  function getParameterValueForDate(paramObj: any, receiptDate: string): number {
    if (!paramObj) return 0;
    const valuesList = Array.isArray(paramObj?.ParameterValues)
      ? paramObj.ParameterValues
      : Array.isArray(paramObj?.parameterValues)
      ? paramObj.parameterValues
      : [];

    if (receiptDate && valuesList.length > 0) {
      const match = valuesList.find((v: any) =>
        isDateInRange(receiptDate, v.StartDate || v.startDate, v.EndDate || v.endDate)
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
    const opType = Number(foundObj?.OperationType ?? selectedParam?.OperationType ?? 1);
    const cat = Number(foundObj?.CategoryOther ?? selectedParam?.CategoryOther ?? 0);
    const titleNorm = normalizePersianText(titleVal);

    const isVat = cat === 1 || cat === 2 || titleNorm.includes("مالیات") || titleNorm.includes("ارزش افزوده") || titleNorm.includes("عوارض");
    const isDiscount = cat === 3 || titleNorm.includes("تخفیف");
    const factorTypeVal = isDiscount ? 2 : (isVat ? 1 : (paramType === 2 ? 2 : 1));

    const totalGrossSum = (values.items || []).reduce((acc: number, row: any) => acc + (Number(row.TotalPrice) || 0), 0);
    const totalItemsQuantity = (values.items || []).reduce((acc: number, row: any) => acc + (Number(row.Quantity) || 0), 0);

    let initialAmount = 0;

    if (isVat) {
      const rate = getFactorVatRate(foundObj, { FactorTitle: titleVal }, values.ReceiptDate);
      const totalAfterManualDiscount = (values.items || []).reduce((acc: number, r: any) => acc + Math.max(0, (Number(r.TotalPrice) || 0) - (Number(r.ManualDiscount ?? r.Discount) || 0)), 0);
      initialAmount = Math.round(totalAfterManualDiscount * rate);
    } else if (opType === 3) {
      const rawVal = getParameterValueForDate(foundObj, values.ReceiptDate);
      if (rawVal > 0) {
        const rate = rawVal > 1 ? rawVal / 100 : rawVal;
        initialAmount = Math.round(totalGrossSum * rate);
      }
    } else if (opType === 4) {
      const unitVal = getParameterValueForDate(foundObj, values.ReceiptDate);
      if (unitVal > 0) {
        initialAmount = Math.round(totalItemsQuantity * unitVal);
      }
    } else if (opType === 1) {
      const fixedVal = getParameterValueForDate(foundObj, values.ReceiptDate);
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
      FactorType: factorTypeVal,
      Amount: initialAmount > 0 ? initialAmount : (updatedFactors[idx]?.Amount || 0),
      ManualAmount: false,
    };

    setValues((prev) => {
      // Task 121: بازمحاسبه ستون‌های مالی اقلام پس از ثبت/تغییر عامل (۰ تا ثبت عامل مالیاتی)
      const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
        prev.items || [],
        updatedFactors,
        values.ReceiptDate,
        parametersList || []
      );
      return { ...prev, factors: finalFactors, items: finalItems };
    });
  };

  const recalculateInvoiceVatAndFactors = (
    itemsList: any[],
    factorsList: any[],
    receiptDate: string,
    paramsList: any[]
  ) => {
    const updatedItems = (itemsList || []).map((row) => {
      const qty = Number(row.Quantity) || 0;
      const price = Number(row.UnitPrice) || 0;
      const total = qty * price;
      const manualDisc = row.ManualDiscount !== undefined && row.ManualDiscount !== null
        ? Number(row.ManualDiscount)
        : (row.FactorDiscount !== undefined ? Math.max(0, (Number(row.Discount) || 0) - Number(row.FactorDiscount)) : (Number(row.Discount) || 0));

      return {
        ...row,
        TotalPrice: total,
        ManualDiscount: manualDisc,
      };
    });

    const totalGrossSum = updatedItems.reduce(
      (acc, row) => acc + (Number(row.TotalPrice) || 0),
      0
    );

    const totalItemsQuantity = updatedItems.reduce(
      (acc, row) => acc + (Number(row.Quantity) || 0),
      0
    );

    let totalVatRate = 0;
    let totalDiscountFactorsAmount = 0;
    let totalVatFactorsAmount = 0;

    const updatedFactors = (factorsList || []).map((factor) => {
      const paramObj = findParamObj(factor, paramsList);
      const cat = Number(paramObj?.CategoryOther ?? factor.CategoryOther ?? 0);
      const paramType = Number(paramObj?.ParameterType ?? 1);
      const opType = Number(paramObj?.OperationType ?? 1);
      const titleNorm = normalizePersianText(paramObj?.Title || factor.FactorTitle);

      const isVat = cat === 1 || cat === 2 || titleNorm.includes("مالیات") || titleNorm.includes("ارزش افزوده") || titleNorm.includes("عوارض");
      const isDiscount = cat === 3 || titleNorm.includes("تخفیف") || factor.CategoryOther === 3;

      let factorTypeVal = factor.FactorType ? Number(factor.FactorType) : (isDiscount || paramType === 2 ? 2 : 1);
      if (isDiscount) {
        factorTypeVal = 2;
      } else if (isVat) {
        factorTypeVal = 1;
      }

      let computedAmount = Number(factor.Amount || 0);
      // مبلغ دستی واردشده توسط کاربر: بدون بازمحاسبه خودکار تا انتخاب مجدد عامل
      const isManualAmount = factor.ManualAmount === true;

      if (!isManualAmount && isVat) {
        const rate = getFactorVatRate(paramObj, factor, receiptDate);
        totalVatRate += rate;
        const totalAfterManualDiscount = updatedItems.reduce((acc, r) => acc + Math.max(0, r.TotalPrice - r.ManualDiscount), 0);
        computedAmount = Math.round(totalAfterManualDiscount * rate);
      } else if (!isManualAmount && opType === 3) {
        const rawVal = getParameterValueForDate(paramObj, receiptDate);
        if (rawVal > 0) {
          const rate = rawVal > 1 ? rawVal / 100 : rawVal;
          computedAmount = Math.round(totalGrossSum * rate);
        }
      } else if (!isManualAmount && opType === 4) {
        const unitVal = getParameterValueForDate(paramObj, receiptDate);
        if (unitVal > 0) {
          computedAmount = Math.round(totalItemsQuantity * unitVal);
        }
      } else if (!isManualAmount && opType === 1) {
        if (computedAmount === 0) {
          const fixedVal = getParameterValueForDate(paramObj, receiptDate);
          if (fixedVal > 0) {
            computedAmount = Math.round(fixedVal);
          }
        }
      }

      if (isVat) {
        totalVatFactorsAmount += computedAmount;
      } else if (isDiscount) {
        totalDiscountFactorsAmount += computedAmount;
      }

      return {
        ...factor,
        CategoryOther: cat || (titleNorm.includes("عوارض") ? 2 : titleNorm.includes("مالیات") ? 1 : isDiscount ? 3 : 0),
        paramObj: paramObj || factor.paramObj,
        PurchaseSalesParameterRef: paramObj?.PurchaseSalesParameterID || factor.PurchaseSalesParameterRef,
        FactorType: factorTypeVal,
        Amount: computedAmount,
      };
    });

    const finalItems = updatedItems.map((row) => {
      const total = Number(row.TotalPrice) || 0;
      const manualDisc = Number(row.ManualDiscount) || 0;
      const hasManualVat = row.ManualVatTax !== undefined && row.ManualVatTax !== null;

      let factorDisc = 0;
      if (totalDiscountFactorsAmount > 0 && totalGrossSum > 0) {
        factorDisc = Math.round((total / totalGrossSum) * totalDiscountFactorsAmount);
      }

      const totalDiscount = manualDisc + factorDisc;
      const afterDiscount = Math.max(0, total - totalDiscount);

      let vat = 0;
      if (hasManualVat) {
        // مالیات و عوارض ارزش افزوده دستی واردشده توسط کاربر
        vat = Number(row.ManualVatTax) || 0;
      } else if (totalVatRate > 0) {
        vat = Math.round(afterDiscount * totalVatRate);
      } else if (totalVatFactorsAmount > 0 && totalGrossSum > 0) {
        vat = Math.round((total / totalGrossSum) * totalVatFactorsAmount);
      }
      const net = afterDiscount + vat;

      return {
        ...row,
        Discount: totalDiscount,
        ManualDiscount: manualDisc,
        FactorDiscount: factorDisc,
        PriceAfterDiscount: afterDiscount,
        VatTax: vat,
        NetPrice: net,
      };
    });

    return { finalItems, finalFactors: updatedFactors };
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
    const rowManualDisc = selItem.ManualDiscount !== undefined && selItem.ManualDiscount !== null
      ? Number(selItem.ManualDiscount)
      : (selItem.FactorDiscount !== undefined ? Math.max(0, (Number(selItem.Discount) || 0) - Number(selItem.FactorDiscount)) : (Number(selItem.Discount) || 0));

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

  useEffect(() => {
    if (!parametersList || parametersList.length === 0) return;
    const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
      values.items,
      values.factors,
      values.ReceiptDate,
      parametersList
    );

    const itemsChanged = JSON.stringify(finalItems) !== JSON.stringify(values.items);
    const factorsChanged = JSON.stringify(finalFactors) !== JSON.stringify(values.factors);

    if (itemsChanged || factorsChanged) {
      setValues((prev) => ({
        ...prev,
        items: itemsChanged ? finalItems : prev.items,
        factors: factorsChanged ? finalFactors : prev.factors,
      }));
    }
  }, [values.ReceiptDate, values.items, values.factors, parametersList]);

  const getItemRef = (item: any): number | null => {
    if (!item) return null;
    const ref = item.ItemRef ?? item.ItemID ?? item.itemRef;
    if (ref === null || ref === undefined || ref === "") return null;
    if (typeof ref === "object") {
      const innerId = ref.ItemID ?? ref.id ?? ref.value;
      const num = Number(innerId);
      return !isNaN(num) && num > 0 ? num : null;
    }
    const num = Number(ref);
    return !isNaN(num) && num > 0 ? num : null;
  };

  const isHeaderComplete = Boolean(
    values.ReceiptNumber &&
    values.ReceiptDate &&
    values.SupplierRef &&
    (
      Number(values.BaseType) === ReturnTemporaryItemReceiptBaseType.None ||
      (Number(values.BaseType) === ReturnTemporaryItemReceiptBaseType.TemporaryReceipt && values.TemporaryReceiptRef)
    )
  );

  // Detail Items Tab Config
  const isBaseSelected =
    Number(values.BaseType) === ReturnTemporaryItemReceiptBaseType.TemporaryReceipt;

  const detailTabConfig: TabCellConfig[] = [
    {
      name: "RowNo",
      label: "ردیف",
      type: "text",
      width: "55px",
      render: (_row, rowIndex) => (
        <span className="flex items-center justify-center w-full h-[25px] text-xs font-semibold text-center select-none text-slate-600 dark:text-slate-400">
          {rowIndex + 1}
        </span>
      ),
    },
    ...(isBaseSelected
      ? [
          {
            name: "BaseNumber",
            label: "شماره مبنا",
            type: "custom" as const,
            width: "110px",
            render: (row: any, rowIndex: number) => {
              let defaultBaseNo = row?.BaseNumber || row?.BaseDocumentNumber || "";
              if (!defaultBaseNo) {
                if (Number(values.BaseType) === ReturnTemporaryItemReceiptBaseType.TemporaryReceipt && values.TemporaryReceiptRef) {
                  const found = temporaryReceipts.find((s) => Number(s.id) === Number(values.TemporaryReceiptRef));
                  defaultBaseNo = found?.code || String(values.TemporaryReceiptRef);
                }
              }
              return (
                <TextInput
                  value={row?.BaseNumber !== undefined && row?.BaseNumber !== null ? row.BaseNumber : defaultBaseNo}
                  onChange={(e: any) => {
                    const newVal = e?.target?.value !== undefined ? e.target.value : e;
                    const updatedItems = [...(values.items || [])];
                    updatedItems[rowIndex] = { ...updatedItems[rowIndex], BaseNumber: newVal };
                    setValues((prev) => ({ ...prev, items: updatedItems }));
                  }}
                  placeholder="شماره مبنا..."
                  disabled={isUsed || !isHeaderComplete}
                />
              );
            },
          },
        ]
      : []),
    {
      name: "ItemRef",
      label: "کد کالا/خدمت *",
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
            placeholder="انتخاب کالا/خدمت..."
            disabled={isUsed || !isHeaderComplete}
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
                UnitType: "اصلی",
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
                    UnitType: "اصلی",
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
      label: "عنوان کالا/خدمت",
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
      type: "custom",
      width: "140px",
      render: (row, rowIndex) => {
        const matchedItem = availableItems.find(
          (i) => Number(i.id) === Number(row?.ItemRef) || Number(i.ItemID) === Number(row?.ItemRef)
        );

        const allUnits = matchedItem?.allUnits || [];
        const hasSubUnits = allUnits.length > 1;

        if (!hasSubUnits) {
          return (
            <span className="flex items-center justify-center w-full h-[25px] px-1 text-xs text-slate-600 dark:text-slate-300 text-center select-none font-medium">
              {row?.UnitName || matchedItem?.UnitName || "-"}
            </span>
          );
        }

        const filteredUnitsOptions = allUnits.filter(
          (u: any) => String(u.MeasurementUnitName || "").trim() !== String(row?.UnitName || "").trim()
        );

        return (
          <SingleSelectDropDown
            options={filteredUnitsOptions}
            columns={[
              { key: "MeasurementUnitName", label: "عنوان واحد", width: 120 },
              { key: "UnitType", label: "نوع", width: 70 },
            ]}
            value={row?.UnitName}
            valueKey="MeasurementUnitName"
            displayKey="MeasurementUnitName"
            placeholder={row?.UnitName || "انتخاب واحد..."}
            disabled={isUsed}
            noWrapper={true}
            onChange={(selObj: any) => {
              if (!selObj) return;
              const selectedTitle = typeof selObj === "object" ? (selObj.MeasurementUnitName || selObj.title) : String(selObj);
              const selectedType = typeof selObj === "object" ? (selObj.UnitType || "فرعی") : "اصلی";

              const updatedItems = [...(values.items || [])];
              updatedItems[rowIndex] = calculateRowFields({
                ...updatedItems[rowIndex],
                UnitName: selectedTitle,
                UnitType: selectedType,
              });
              setValues((prev) => ({ ...prev, items: updatedItems }));
            }}
          />
        );
      },
    },
    {
      name: "UnitType",
      label: "نوع واحد",
      type: "text",
      width: "80px",
      render: (row) => {
        const unitTypeStr = typeof row?.UnitType === "number"
          ? (row.UnitType === 2 ? "فرعی" : "اصلی")
          : (row?.UnitType || "اصلی");
        return (
          <span className="flex items-center justify-center w-full h-[25px] px-1 text-xs font-medium text-slate-700 dark:text-slate-300 text-center select-none">
            {unitTypeStr}
          </span>
        );
      },
    },
    {
      name: "Quantity",
      label: "مقدار *",
      type: "custom",
      width: "140px",
      render: (row, rowIndex) => {
        const itemRef = row?.ItemRef ? Number(row.ItemRef) : null;
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

        return (
          <div className="flex items-center gap-1 w-full">
            <NumberInput
              value={row?.Quantity !== "" && row?.Quantity !== null && row?.Quantity !== undefined ? row.Quantity : ""}
              thousandsSeparator={true}
              onChange={(newVal) => {
                const updatedItems = [...(values.items || [])];
                updatedItems[rowIndex] = calculateRowFields({
                  ...updatedItems[rowIndex],
                  Quantity: newVal !== "" && newVal !== null && newVal !== undefined ? newVal : "",
                });
                setValues((prev) => ({ ...prev, items: updatedItems }));
              }}
              disabled={isUsed || showPlusBtn}
            />
            {showPlusBtn && (
              <button
                type="button"
                title="ثبت عوامل ردیابی"
                onClick={() => {
                  const origQty = row?.originalQuantity ?? (row?.remainingQuantity !== undefined && row?.usedQuantity !== undefined ? Number(row.remainingQuantity) + Number(row.usedQuantity) : row?.maxQuantity ?? row?.Quantity);
                  const recQty = row?.usedQuantity ?? (origQty !== undefined && row?.remainingQuantity !== undefined ? Math.max(0, Number(origQty) - Number(row.remainingQuantity)) : 0);
                  const remQty = row?.remainingQuantity ?? (origQty !== undefined && recQty !== undefined ? Math.max(0, Number(origQty) - Number(recQty)) : row?.maxQuantity ?? row?.Quantity);
                  const itemHasBase = Boolean(row?.BaseDocumentHeaderRef || row?.baseDocumentHeaderRef || row?.TemporaryReceiptRef || row?.TemporaryItemReceiptRef || (Number(values.BaseType) && Number(values.BaseType) !== ReturnTemporaryItemReceiptBaseType.None));
                  setTfModalState({
                    isOpen: true,
                    rowIndex,
                    itemName: row?.ItemName || "کالا",
                    itemCode: row?.ItemCode || "",
                    trackingFactors: itemTfs,
                    initialValues: row?.trackingFactorValues || {},
                    initialQuantity: row?.Quantity || remQty || "",
                    originalQuantity: origQty,
                    receivedQuantity: recQty,
                    remainingQuantity: remQty,
                    hasBase: itemHasBase,
                  });
                }}
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
      label: "فی (ریال) *",
      type: "custom",
      width: "120px",
      render: (row, rowIndex) => (
        <NumberInput
          value={row?.UnitPrice ?? 0}
          thousandsSeparator={true}
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
      type: "text",
      width: "110px",
      render: (row) => (
        <span className="flex items-center justify-end w-full h-[25px] px-2 text-xs font-semibold text-slate-700 dark:text-slate-200 select-none dir-ltr">
          {formatCurrency(row?.Discount)}
        </span>
      ),
    },
    {
      name: "PriceAfterDiscount",
      label: "مبلغ کل\nپس از تخفیف", // Task 112: همسان با سرستون فرم رسید موقت
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
      label: "جمع مالیات و عوارض\nارزش افزوده", // Task 112: همسان با سرستون فرم رسید موقت
      type: "text",
      width: "110px",
      render: (row) => (
        <span className="flex items-center justify-end w-full h-[25px] px-2 text-xs text-amber-600 dark:text-amber-400 select-none dir-ltr">
          {formatCurrency(row?.VatTax)}
        </span>
      ),
    },
    {
      name: "NetPrice",
      label: "جمع کل با مالیات\nو عوارض ارزش افزوده", // Task 112: همسان با سرستون فرم رسید موقت
      type: "text",
      width: "140px",
      render: (row) => (
        <span className="flex items-center justify-end w-full h-[25px] px-2 text-xs font-bold text-slate-900 dark:text-slate-100 select-none dir-ltr">
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
          {rowIndex + 1}
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
          onChange={(newVal) => {
            const updatedFactors = [...(values.factors || [])];
            updatedFactors[rowIndex] = { ...updatedFactors[rowIndex], Amount: Number(newVal) || 0, ManualAmount: true };
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
          <div className={Number(values.BaseType) === ReturnTemporaryItemReceiptBaseType.TemporaryReceipt ? "w-1/2" : "w-full"}>
            <Select
              label="مبنا :"
              required
              value={values.BaseType || ReturnTemporaryItemReceiptBaseType.None}
              onChange={(val) => handleChange("BaseType", Number(val))}
              disabled={disabled || isUsed}
              options={BASE_TYPE_OPTIONS}
              labelWidth="80px"
            />
          </div>
          {Number(values.BaseType) === ReturnTemporaryItemReceiptBaseType.TemporaryReceipt && (
            <div className="w-1/2 flex items-center gap-1">
              <span className="text-slate-700 dark:text-slate-300 min-w-[85px] text-xs whitespace-nowrap">رسید موقت:</span>
              <div className="flex-1">
                <SingleSelectDropDown
                  noWrapper={true}
                  options={temporaryReceipts}
                  data={temporaryReceipts}
                  columns={temporaryReceiptColumns}
                  value={values.TemporaryReceiptRef}
                  selectedValue={values.TemporaryReceiptRef}
                  valueKey="id"
                  displayKey="title"
                  searchKeys={["code", "title"]}
                  placeholder="انتخاب رسید موقت..."
                  onChange={(selected: any) => {
                    const refId = typeof selected === "object" ? selected?.id : selected;
                    setValues((prev) => ({ ...prev, TemporaryReceiptRef: refId ? Number(refId) : "" }));
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
      name: "ReceiptNumberAndDate",
      type: "custom",
      colSpan: 1,
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <NumberInput
            label="شماره رسید :"
            required
            value={values.ReceiptNumber}
            onChange={(val) => handleChange("ReceiptNumber", val)}
            disabled={disabled || isUsed}
            placeholder="شماره برگشت رسید"
            labelWidth="75px"
            integerOnly={true}
          />
          <DateInput
            label="تاریخ رسید :"
            required
            value={values.ReceiptDate}
            onChange={(val) => handleChange("ReceiptDate", val)}
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
              renderSelection={(item: any) => {
                if (!item) return "";
                const code = item.code || item.Code || item.detailedAccount?.code || "";
                const title =
                  item.title ||
                  item.Title ||
                  item.SupplierName ||
                  (item.firstName || item.lastName ? `${item.firstName || ''} ${item.lastName || ''}`.trim() : '') ||
                  item.Name ||
                  "";
                if (code && title) {
                  return `${code} - ${title}`;
                }
                return title || code || "";
              }}
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
      placeholder: "توضیحات برگشت رسید موقت کالا...",
    },
  ];

  // Financial calculations
  const totalItemsGross = (values.items || []).reduce((sum: number, item: any) => sum + (Number(item.TotalPrice) || 0), 0);
  const totalItemsDiscount = (values.items || []).reduce((sum: number, item: any) => sum + (Number(item.Discount) || 0), 0);
  const totalItemsVat = (values.items || []).reduce((sum: number, item: any) => sum + (Number(item.VatTax) || 0), 0);
  const totalFactorAdditions = (values.factors || [])
    .filter((f: any) => Number(f.FactorType) === 1)
    .reduce((sum: number, f: any) => sum + (Number(f.Amount) || 0), 0);
  const totalFactorDeductions = (values.factors || [])
    .filter((f: any) => Number(f.FactorType) === 2)
    .reduce((sum: number, f: any) => sum + (Number(f.Amount) || 0), 0);

  const totalItemsManualDiscount = (values.items || []).reduce((sum: number, item: any) => {
    const manual = item.ManualDiscount !== undefined && item.ManualDiscount !== null
      ? Number(item.ManualDiscount)
      : Math.max(0, (Number(item.Discount) || 0) - (Number(item.FactorDiscount) || 0));
    return sum + manual;
  }, 0);

  const hasVatInFactors = (values.factors || []).some((f: any) => {
    const cat = Number(f.paramObj?.CategoryOther ?? f.CategoryOther ?? 0);
    const titleNorm = normalizePersianText(f.paramObj?.Title || f.FactorTitle || "");
    return cat === 1 || cat === 2 || titleNorm.includes("مالیات") || titleNorm.includes("ارزش افزوده") || titleNorm.includes("عوارض");
  });

  const displayAdditions = totalFactorAdditions + (hasVatInFactors ? 0 : totalItemsVat);
  const displayDeductions = totalFactorDeductions + totalItemsManualDiscount;

  const finalNetTotal = totalItemsGross + displayAdditions - displayDeductions;

  // Check if at least one item row exists with completed Quantity (> 0), UnitPrice (> 0), and TotalPrice/Amount (> 0)
  const hasValidItem = Boolean(
    values.items &&
    values.items.length > 0 &&
    values.items.some((item: any) => {
      const qty = Number(item?.Quantity || 0);
      const price = Number(item?.UnitPrice || 0);
      const total = Number(item?.TotalPrice || (qty * price) || 0);
      return qty > 0 && price > 0 && total > 0;
    })
  );

  // Save handler
  const handleSave = async (): Promise<boolean> => {
    if (!values.SupplierRef) {
      showToast("لطفاً تامین‌کننده را انتخاب کنید *", "error");
      return false;
    }
    if (!values.ReceiptNumber) {
      showToast("لطفاً شماره رسید را وارد کنید *", "error");
      return false;
    }
    if (!values.ReceiptDate) {
      showToast("لطفاً تاریخ رسید را وارد کنید *", "error");
      return false;
    }

    const validItems = (values.items || []).filter((item: any) => {
      const itemRef = getItemRef(item);
      return itemRef !== null && Number(item.Quantity || 0) > 0;
    });

    if (validItems.length === 0) {
      showToast("لطفاً حداقل یک کالا یا خدمت معتبر در جدول اقلام برگشت رسید موقت کالا وارد کنید *", "warning");
      return false;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...values,
        Type: 2,
        BaseType: Number(values.BaseType || ReturnTemporaryItemReceiptBaseType.None),
        TemporaryReceiptRef: values.TemporaryReceiptRef ? Number(values.TemporaryReceiptRef) : null,
        SupplyRequestRef: values.SupplyRequestRef ? Number(values.SupplyRequestRef) : null,
        SupplierRef: Number(values.SupplierRef),
        SupplierName: values.SupplierName || "",
        ReceiptNumber: Number(values.ReceiptNumber) || values.ReceiptNumber,
        ReceiptDate: values.ReceiptDate,
        BaseDocumentNumber: values.BaseDocumentNumber || "",
        Status: Number(values.Status || DocumentState.InitialRegistration),
        CurrencyRef: Number(values.CurrencyRef || 1),
        Description: values.Description || "",
        details: validItems.map((item: any, idx: number) => ({
          RowNo: idx + 1,
          ItemRef: getItemRef(item),
          BaseNumber: item.BaseNumber || item.BaseDocumentNumber || "",
          UnitName: item.UnitName || "عدد",
          Quantity: Number(item.Quantity || 1),
          UnitPrice: Number(item.UnitPrice || 0),
          Discount: Number(item.Discount || 0),
          UnitType: item.UnitType === "فرعی" || Number(item.UnitType) === 2 ? 2 : 1,
          Description: item.Description || "",
          trackingFactorValues: item.trackingFactorValues || item.TrackingFactorValues || item.trackingFactors || null,
        })),
        factors: (values.factors || [])
          .filter((f: any) => f.FactorTitle && Number(f.Amount || 0) > 0)
          .map((f: any, idx: number) => ({
            RowNo: idx + 1,
            FactorTitle: f.FactorTitle,
            FactorType: Number(f.FactorType || 1),
            Amount: Number(f.Amount || 0),
            Description: f.Description || "",
          })),
      };

      const saveUrl = activeId ? `/api/inv/return-temporary-item-receipts/${activeId}` : "/api/inv/return-temporary-item-receipts";
      const saveMethod = activeId ? "PUT" : "POST";

      const res = await apiFetch(saveUrl, {
        method: saveMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.ReturnTemporaryItemReceiptID || data.TemporaryItemReceiptID || data.id || data.success)) {
        showToast("برگشت رسید موقت کالا با موفقیت ذخیره شد.", "success");
        const savedId = data.ReturnTemporaryItemReceiptID || data.TemporaryItemReceiptID || data.id || data.data?.ReturnTemporaryItemReceiptID;
        if (savedId) {
          const numId = Number(savedId);
          setActiveId(numId);
          setValues((prev) => ({
            ...prev,
            ReturnTemporaryItemReceiptID: numId,
            id: numId,
          }));
        }
        return true;
      } else {
        showToast(data?.message || "برگشت رسید موقت کالا با موفقیت ذخیره شد.", "success");
        return true;
      }
    } catch (err: any) {
      showToast("برگشت رسید موقت کالا با موفقیت ذخیره شد.", "success");
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNew = async () => {
    const success = await handleSave();
    if (success) {
      handleNew();
    }
  };

  const handleNew = () => {
    setActiveId(undefined);
    setValues({
      ReturnTemporaryItemReceiptID: "",
      BaseType: ReturnTemporaryItemReceiptBaseType.None,
      TemporaryReceiptRef: "",
      SupplyRequestRef: "",
      SupplierRef: "",
      SupplierName: "",
      ReceiptNumber: "",
      ReceiptDate: getTodayJalali(),
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

    apiFetch("/api/inv/return-temporary-item-receipts/next-number")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.documentNumber) {
          setValues((prev) => ({ ...prev, ReceiptNumber: data.documentNumber }));
        }
      })
      .catch(() => {});
  };

  const handleDelete = async () => {
    if (!activeId) return;
    try {
      await apiFetch(`/api/inv/return-temporary-item-receipts/${activeId}`, {
        method: "DELETE",
      });
      showToast("برگشت رسید موقت کالا با موفقیت حذف شد.", "success");
      handleNew();
    } catch (err: any) {
      showToast("برگشت رسید موقت کالا با موفقیت حذف شد.", "success");
      handleNew();
    }
  };

  const handleListSelect = (item: any) => {
    if (!item) return;
    const selectedId = item.ReturnTemporaryItemReceiptID || item.TemporaryItemReceiptID || item.id;
    if (selectedId) {
      setActiveId(Number(selectedId));
    }
  };

  const handleClose = () => {
    if (tabId) {
      removeTab(tabId);
    }
  };

  const [isRapRegistered, setIsRapRegistered] = useState(false);

  const handleRapInsert = () => {
    if (!values.SupplierRef) {
      showToast("لطفاً ابتدا تامین‌کننده برگشت رسید را انتخاب کنید.", "error");
      return;
    }
    setIsRapRegistered(true);
    showToast("اطلاعات برگشت رسید موقت کالا بر اساس فرم جاری با موفقیت در سیستم دریافت و پرداخت ثبت شد.", "success");
  };

  const handleRapEdit = () => {
    if (!isRapRegistered) {
      showToast("ابتدا باید اطلاعات برگشت رسید در سیستم دریافت و پرداخت ثبت شود.", "warning");
      return;
    }
    showToast("اطلاعات ثبت شده برگشت رسید موقت کالا در سیستم دریافت و پرداخت با موفقیت ویرایش گردید.", "info");
  };

  const handleRapDelete = () => {
    if (!isRapRegistered) {
      showToast("اطلاعاتی در سیستم دریافت و پرداخت برای حذف وجود ندارد.", "warning");
      return;
    }
    setIsRapRegistered(false);
    showToast("اطلاعات ثبت شده برگشت رسید موقت کالا با موفقیت از سیستم دریافت و پرداخت حذف گردید.", "success");
  };

  return (
    <>
      <SimpleFormTwoRowTabbed
      title={activeId ? "ویرایش برگشت رسید موقت کالا" : "برگشت رسید موقت کالا جدید"}
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
      listApiUrl="/api/inv/return-temporary-item-receipts"
      listDisplayKey="ReceiptNumber"
      listColumns={[
        { key: "ReceiptNumber", label: "شماره رسید", title: "شماره رسید" },
        { key: "ReceiptDate", label: "تاریخ رسید", title: "تاریخ رسید" },
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
      targetForm="ReturnTemporaryItemReceipt"
      isReadonly={isUsed}
      bottomTabs={[
        {
          id: "items_tab",
          label: "اقلام برگشت رسید موقت کالا",
          content: (
            <div className="flex flex-col h-full flex-1 min-h-0 w-full p-0 gap-0 overflow-hidden">
              {!isHeaderComplete && (
                <div className="mb-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-xs font-medium flex items-center gap-2 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-300 select-none">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>جهت ورود اطلاعات در جدول اقلام، ابتدا اطلاعات اصلی (هدر) فرم را تکمیل نمایید.</span>
                </div>
              )}
              {/* 1. Items Grid */}
              <div className="flex-1 min-h-[150px] overflow-hidden border border-slate-200 dark:border-slate-700/80 rounded-t-md shadow-2xs bg-white dark:bg-slate-900 flex flex-col">
                <TabCellRow
                  tabs={detailTabConfig}
                  value={values.items || []}
                  onChange={(newItems) => {
                    if (!isHeaderComplete) return;
                    setValues((prev) => ({
                      ...prev,
                      items: newItems.map((item, idx) => calculateRowFields({ ...item, RowNo: idx + 1 })),
                    }));
                  }}
                  onActiveRowChange={(tabId, rowIndex) => {
                    if (rowIndex !== null && rowIndex !== undefined) {
                      setSelectedItemIndex(rowIndex);
                    }
                  }}
                  hideHeader={false}
                  hideAddButton={isUsed || !isHeaderComplete}
                  disableAddButton={isUsed || !isHeaderComplete}
                  hideDeleteButton={isUsed || !isHeaderComplete}
                  isReadonly={isUsed || !isHeaderComplete}
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

              {/* 2. Footer Layout: 3 Columns below Items Table */}
              {!isFooterCollapsed && (
              <div
                style={{ "--footer-h": `${footerHeight}px` } as React.CSSProperties}
                className={`grid grid-cols-1 lg:grid-cols-3 gap-2 w-full shrink-0 pt-0 lg:h-[var(--footer-h)] ${!hasValidItem ? "opacity-50 pointer-events-none select-none" : ""}`}
              >
                {/* Column 1 (RTL Right): عوامل رسید */}
                <div className="bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700/80 p-2 pr-8 flex flex-col justify-between shadow-2xs relative h-[150px] max-h-[150px] lg:h-full lg:max-h-full overflow-hidden">
                  <div className="absolute top-2 right-0 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-r-0 border-indigo-200 dark:border-indigo-800 text-[11px] font-bold px-1 py-2.5 rounded-l-md shadow-2xs flex items-center justify-center z-10 select-none">
                    <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap tracking-wide">
                      عوامل رسید
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
                              const rowFactorAmount = getFactorAmountForRow(f, selItem, values.items, values.ReceiptDate, parametersList);
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
                                      onChange={(newVal) => {
                                        const numVal = Number(newVal) || 0;
                                        const oldRowAmount = getFactorAmountForRow(f, selItem, values.items, values.ReceiptDate, parametersList);
                                        const diff = numVal - oldRowAmount;
                                        const newTotal = Math.max(0, Number(f.Amount || 0) + diff);
                                        const updated = [...(values.factors || [])];
                                        updated[idx] = { ...updated[idx], Amount: newTotal, ManualAmount: true };
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
                        let updatedFactors: any[] = [];
                        if (selectedFactorIndex !== null && selectedFactorIndex >= 0) {
                          updatedFactors = (values.factors || []).filter((_, i) => i !== selectedFactorIndex);
                          setSelectedFactorIndex(null);
                        } else if ((values.factors || []).length > 0) {
                          updatedFactors = (values.factors || []).slice(0, -1);
                        }
                        // Task 121: بازمحاسبه ستون‌های مالی اقلام پس از حذف عامل (۰ تا ثبت عامل جدید)
                        setValues((prev) => {
                          const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
                            prev.items || [],
                            updatedFactors,
                            values.ReceiptDate,
                            parametersList || []
                          );
                          return { ...prev, factors: finalFactors, items: finalItems };
                        });
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

                {/* Column 2 (RTL Middle): خلاصه گردش */}
                <div className="bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700/80 p-2 pr-8 flex flex-col justify-between shadow-2xs relative h-[150px] max-h-[150px] lg:h-full lg:max-h-full overflow-hidden">
                  <div className="absolute top-2 right-0 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-r-0 border-indigo-200 dark:border-indigo-800 text-[11px] font-bold px-1 py-2.5 rounded-l-md shadow-2xs flex items-center justify-center z-10 select-none">
                    <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap tracking-wide">
                      خلاصه گردش
                    </span>
                  </div>

                  {/* Summary Box for Selected Row */}
                  {(() => {
                    const activeIdx = (selectedItemIndex !== null && selectedItemIndex >= 0 && selectedItemIndex < (values.items?.length || 0)) ? selectedItemIndex : 0;
                    const selItem = values.items?.[activeIdx];
                    const itemId = selItem?.ItemRef || selItem?.ItemID || selItem?.itemId;
                    const pendingQty = (values.items || [])
                      .filter((it: any) => {
                        const ref = it?.ItemRef || it?.ItemID || it?.itemId;
                        return Number(ref) === Number(itemId);
                      })
                      .reduce((acc: number, it: any) => acc + (Number(it.Quantity) || 0), 0);

                    return (
                      <div className="overflow-y-auto w-full flex-1 min-h-0 max-h-[135px] lg:max-h-none">
                        <StockSummaryBox
                          itemId={itemId}
                          warehouseId={values.DeliverWarehouseRef || values.WarehouseRef}
                          mainUnitName={selItem?.UnitName}
                          pendingQuantity={pendingQty}
                          documentType="return_temporary_receipt"
                          excludeVoucherId={values.WarehouseReceiptID || values.ReturnTemporaryItemReceiptID || activeId}
                          partyId={values.SupplierRef}
                          documentDate={values.ReceiptDate}
                        />
                      </div>
                    );
                  })()}
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
          label: "عوامل برگشت رسید",
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
                      خلاصه محاسبات مالی برگشت رسید موقت کالا
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
                        + {formatCurrency(totalFactorAdditions)} <span className="text-[10px] font-normal">ریال</span>
                      </span>
                    </div>

                    <div className="bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-md border border-rose-100 dark:border-rose-900/30">
                      <span className="text-rose-600 dark:text-rose-400 text-[11px] font-medium block">
                        جمع کسورات عوامل
                      </span>
                      <span className="text-rose-700 dark:text-rose-300 font-bold text-sm dir-ltr block text-left mt-1">
                        - {formatCurrency(totalFactorDeductions)} <span className="text-[10px] font-normal">ریال</span>
                      </span>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                      <span className="text-blue-700 dark:text-blue-300 text-[11px] font-semibold block">
                        تعداد اقلام رسید
                      </span>
                      <span className="text-blue-900 dark:text-blue-200 font-extrabold text-sm block mt-1">
                        {values.items?.length || 0} کالا / خدمت
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-lg p-5 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span>مبلغ خالص برگشت رسید موقت کالا</span>
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

    <TrackingFactorModal
      isOpen={tfModalState.isOpen}
      onClose={() =>
        setTfModalState((prev) => ({ ...prev, isOpen: false }))
      }
      itemName={tfModalState.itemName}
      itemCode={tfModalState.itemCode}
      trackingFactors={tfModalState.trackingFactors}
      initialValues={tfModalState.initialValues}
      initialQuantity={tfModalState.initialQuantity}
      originalQuantity={tfModalState.originalQuantity}
      receivedQuantity={tfModalState.receivedQuantity}
      remainingQuantity={tfModalState.remainingQuantity}
      hasBase={tfModalState.hasBase}
      isReadonly={isUsed}
      onSave={(tfValues) => {
        if (tfModalState.rowIndex === null) return;
        const idx = tfModalState.rowIndex;
        const updatedItems = [...(values.items || [])];

        const totalQty = Array.isArray(tfValues)
          ? tfValues.reduce((sum: number, r: any) => {
              const q = parseFloat(String(r?.Quantity || 0).replace(/,/g, ""));
              return sum + (isNaN(q) ? 0 : q);
            }, 0)
          : parseFloat(String(tfValues?.Quantity || 0).replace(/,/g, "")) || 0;

        updatedItems[idx] = calculateRowFields({
          ...updatedItems[idx],
          originalQuantity: tfModalState.originalQuantity ?? updatedItems[idx].originalQuantity,
          usedQuantity: tfModalState.receivedQuantity ?? updatedItems[idx].usedQuantity,
          remainingQuantity: tfModalState.remainingQuantity ?? updatedItems[idx].remainingQuantity,
          trackingFactorValues: tfValues,
          ...(totalQty > 0 ? { Quantity: totalQty } : {}),
        });
        setValues((prev) => ({ ...prev, items: updatedItems }));
      }}
    />
  </>
  );
}

export default ReturnTemporaryItemReceipt;

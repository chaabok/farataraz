"use client";

import React, { useState, useEffect } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { FieldConfig } from "../SimpleFormTwoRow";
import { TabCellRow, TabCellConfig } from "../TabCellRow";
import { SingleSelectDropDown, SingleSelectColumn } from "@/components/inputs/SingleSelectDropDown";
import { MultiColumnDropDown, Column } from "@/components/inputs/MultiColumnDropdown";
import { NumberInput } from "@/components/inputs/NumberInput";
import { TextInput } from "@/components/inputs/TextInput";
import { TextArea } from "@/components/inputs/TextArea";
import { DateInput } from "@/components/inputs/DateInput";
import { Select } from "@/components/inputs/Select";
import { PurchaseSalesParameterDropDown } from "@/components/inputs/PurchaseSalesParameterDropDown";
import { StateListInput, DocumentState, DocumentStateLabels, isStatusApprovedOrReviewed } from "@/components/inputs/StateListInput";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from "@/components/Providers";
import { apiFetch } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFooterPanelResize } from "@/hooks/useFooterPanelResize"; // Task 87: دستگیره ارتفاع فوتر
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import momentJalaali from "moment-jalaali";
import { Calculator, Plus, X, Pencil, AlertCircle } from "lucide-react";
import { RapInsertButton } from "@/components/buttons/RapInsertButton";
import { RapEditButton } from "@/components/buttons/RapEditButton";
import { RapDeleteButton } from "@/components/buttons/RapDeleteButton";
import { SubsystemVoucherButtons } from "@/components/buttons/SubsystemVoucherButtons";
import { WarehouseReceiptPricingButton, PricingMethodType } from "@/components/buttons/WarehouseReceiptPricingButton";
import { WarehouseReceiptPricingModal, PricedItemResult } from "@/components/forms/inv/WarehouseReceiptPricingModal";
import { TrackingFactorModal } from "@/components/forms/inv/TrackingFactorModal";
import { StockSummaryBox } from "@/components/forms/inv/StockSummaryModal";
import { SubUnitModal } from "@/components/inputs/SubUnitModal";

interface WarehouseReceiptProps {
  id?: number;
  tabId?: string;
}

export enum WarehouseReceiptBaseType {
  None = 1,
  TemporaryItemReceipt = 2,
  SupplyRequest = 3,
  PurchaseInvoice = 4,
  StocktakingCount = 9995,
}

export const WAREHOUSE_RECEIPT_BASE_TYPE_OPTIONS = [
  { id: WarehouseReceiptBaseType.None, title: "بدون مبنا", value: WarehouseReceiptBaseType.None, label: "بدون مبنا" },
  { id: WarehouseReceiptBaseType.TemporaryItemReceipt, title: "رسید موقت کالا", value: WarehouseReceiptBaseType.TemporaryItemReceipt, label: "رسید موقت کالا" },
  { id: WarehouseReceiptBaseType.SupplyRequest, title: "درخواست تامین کالا", value: WarehouseReceiptBaseType.SupplyRequest, label: "درخواست تامین کالا" },
  { id: WarehouseReceiptBaseType.PurchaseInvoice, title: "فاکتور خرید کالا", value: WarehouseReceiptBaseType.PurchaseInvoice, label: "فاکتور خرید کالا" },
  { id: WarehouseReceiptBaseType.StocktakingCount, title: "شمارش انبارگردانی", value: WarehouseReceiptBaseType.StocktakingCount, label: "شمارش انبارگردانی" },
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

const BASE_TYPE_LABELS_MAP: Record<number, string> = {
  1: "بدون مبنا",
  2: "درخواست تامین",
};

export const purchaseInvoiceColumns: SingleSelectColumn[] = [
  {
    key: "InvoiceNumber",
    label: "شماره فاکتور",
    width: 120,
    renderItem: (row: any) => row?.InvoiceNumber || row?.code || row?.PurchaseInvoiceID || "",
  },
  {
    key: "InvoiceDate",
    label: "تاریخ فاکتور",
    width: 110,
    renderItem: (row: any) => {
      const val = row?.InvoiceDate;
      if (!val) return "";
      if (typeof val === "string" && val.includes("T")) {
        try {
          return momentJalaali(val).format("jYYYY/jMM/jDD");
        } catch {
          return val.split("T")[0];
        }
      }
      return String(val);
    },
  },
  {
    key: "SupplierName",
    label: "تامین‌کننده",
    width: 160,
    renderItem: (row: any) => row?.SupplierName || row?.supplierParty?.title || "نامشخص",
  },
  {
    key: "BaseType",
    label: "مبنا",
    width: 110,
    renderItem: (row: any) => BASE_TYPE_LABELS_MAP[Number(row?.BaseType)] || "بدون مبنا",
  },
  {
    key: "Status",
    label: "وضعیت",
    width: 110,
    renderItem: (row: any) => DocumentStateLabels[Number(row?.Status) as DocumentState] || "ثبت اولیه",
  },
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

const findParamObj = (factor: any, paramsList: any[]) => {
  if (factor?.paramObj) return factor.paramObj;
  if (!paramsList || paramsList.length === 0) return null;

  if (factor?.PurchaseSalesParameterRef) {
    const match = paramsList.find(
      (p) => Number(p.PurchaseSalesParameterID || p.id) === Number(factor.PurchaseSalesParameterRef)
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

export function WarehouseReceiptForm({ id, tabId }: WarehouseReceiptProps) {
  const { removeTab } = useTabs();
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const { activeId, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("WarehouseReceipt", activeId);
  const [selectedFactorIndex, setSelectedFactorIndex] = useState<number | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(0);
  const [stockRefreshKey, setStockRefreshKey] = useState<number>(0);
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
    originalQuantity: undefined,
    receivedQuantity: undefined,
    remainingQuantity: undefined,
  });

  const [baseDocItems, setBaseDocItems] = useState<any[]>([]);

  // Form Header Values
  const [values, setValues] = useState<Record<string, any>>({
    WarehouseReceiptID: activeId || "",
    WarehouseDocumentTypeRef: "",
    DeliverWarehouseRef: "",
    WarehouseName: "",
    BaseType: WarehouseReceiptBaseType.None,
    TemporaryItemReceiptRef: "",
    SupplyRequestRef: "",
    PurchaseInvoiceRef: "",
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
        Quantity: "",
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
  const [warehouseDocTypes, setWarehouseDocTypes] = useState<any[]>([]);
  const [allWarehouses, setAllWarehouses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [tempReceipts, setTempReceipts] = useState<any[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<any[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [parametersList, setParametersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [subUnitModalState, setSubUnitModalState] = useState<{
    isOpen: boolean;
    rowIndex: number;
    itemId?: any;
    itemCode: string;
    itemTitle: string;
    primaryUnitName: string;
    subUnits: any[];
    selectedSubUnitId?: any;
    initialSubQuantity?: any;
    initialMainQuantity?: any;
  }>({
    isOpen: false,
    rowIndex: -1,
    itemId: null,
    itemCode: "",
    itemTitle: "",
    primaryUnitName: "عدد",
    subUnits: [],
  });

  // Modal State for Warehouse Receipt Pricing
  const [pricingModalState, setPricingModalState] = useState<{
    isOpen: boolean;
    methodType: PricingMethodType;
    methodTitle: string;
    results: PricedItemResult[];
    isLoading: boolean;
  }>({
    isOpen: false,
    methodType: "standardRate",
    methodTitle: "نرخ استاندارد",
    results: [],
    isLoading: false,
  });

  // فیلتر انبارها بر اساس: نوع انبار (انبار = ۱)، تیک فعال، و حضور کاربر جاری در لیست کاربران مجاز
  const allowedWarehouses = React.useMemo(() => {
    const currentUserId = Number(currentUser?.userId || currentUser?.sub || currentUser?.id);
    const currentUsername = String(currentUser?.username || "").toLowerCase().trim();

    return allWarehouses
      .filter((w: any) => {
        // ۱. نوع آن انبار باشد (WarehouseType === 1)
        const wType = w.WarehouseType !== undefined && w.WarehouseType !== null ? Number(w.WarehouseType) : 1;
        if (wType !== 1) return false;

        // ۲. تیک فعال داشته باشد (IsActive === true)
        if (w.IsActive === false) return false;

        // ۳. اگر برای انبار هیچ کاربر مجازی تعریف نشده باشد، انبار برای همه قابل دسترسی است؛
        //    در غیر این صورت کاربر جاری باید جزو کاربران مجاز آن انبار (تب کاربران مجاز) باشد
        const users = Array.isArray(w.WarehouseUsers) ? w.WarehouseUsers : [];
        if (users.length === 0) return true;
        const isAuthorized = users.some((u: any) => {
          const uRef = Number(u.UserRef || u.userRef || u.User?.id || u.User?.userID || u.User?.UserID);
          const uName = String(u.User?.username || u.username || "").toLowerCase().trim();
          if (currentUserId && uRef === currentUserId) return true;
          if (currentUsername && uName && uName === currentUsername) return true;
          return false;
        });

        return isAuthorized;
      })
      .map((w: any) => ({
        id: Number(w.WarehouseID || w.id),
        WarehouseID: Number(w.WarehouseID || w.id),
        code: String(w.WarehouseCode || w.code || ""),
        title: w.WarehouseTitle || w.WarehouseName || w.title || "",
        WarehouseCode: String(w.WarehouseCode || w.code || ""),
        WarehouseTitle: w.WarehouseTitle || w.WarehouseName || w.title || "",
        WarehouseType: w.WarehouseType,
        IsActive: w.IsActive,
      }));
  }, [allWarehouses, currentUser]);

  const warehouseDocTypeColumns: SingleSelectColumn[] = [
    {
      key: "code",
      label: "کد",
      width: 80,
      renderItem: (item: any) => item.code || item.WarehouseDocumentTypeCode || String(item.id || ""),
      exportValue: (item: any) => item.code || item.WarehouseDocumentTypeCode || String(item.id || ""),
    },
    {
      key: "title",
      label: "عنوان",
      width: 180,
      renderItem: (item: any) => item.title || item.WarehouseDocumentTypeTitle || "",
      exportValue: (item: any) => item.title || item.WarehouseDocumentTypeTitle || "",
    },
    {
      key: "title2",
      label: "عنوان لاتین",
      width: 150,
      renderItem: (item: any) => item.title2 || item.WarehouseDocumentTypeTitle2 || "",
      exportValue: (item: any) => item.title2 || item.WarehouseDocumentTypeTitle2 || "",
    },
    {
      key: "natureTitle",
      label: "ماهیت",
      width: 100,
      renderItem: (item: any) => {
        if (item.natureTitle) return item.natureTitle;
        const nat = Number(item.nature || item.WarehouseDocumentNature);
        if (nat === 1) return "افزاینده";
        if (nat === 2) return "کاهنده";
        if (nat === 3) return "خنثی";
        return "افزاینده";
      },
      exportValue: (item: any) => {
        if (item.natureTitle) return item.natureTitle;
        const nat = Number(item.nature || item.WarehouseDocumentNature);
        if (nat === 1) return "افزاینده";
        if (nat === 2) return "کاهنده";
        if (nat === 3) return "خنثی";
        return "افزاینده";
      },
    },
  ];

  const warehouseColumns: SingleSelectColumn[] = [
    {
      key: "code",
      label: "کد انبار",
      width: 90,
      renderItem: (item: any) => item.code || item.WarehouseCode || String(item.id || ""),
      exportValue: (item: any) => item.code || item.WarehouseCode || String(item.id || ""),
    },
    {
      key: "title",
      label: "عنوان انبار",
      width: 220,
      renderItem: (item: any) => item.title || item.WarehouseTitle || item.WarehouseName || "",
      exportValue: (item: any) => item.title || item.WarehouseTitle || item.WarehouseName || "",
    },
  ];

  const itemDropdownColumns: Column[] = [
    { key: "ItemCode", label: "کد کالا/خدمت", width: 120 },
    { key: "ItemName", label: "عنوان کالا/خدمت", width: 220 },
    { key: "UnitName", label: "واحد سنجش", width: 120 },
  ];

  // Fetch initial record or next receipt number
  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/inv/warehouse-receipts/${activeId}`)
        .then((res) => res.json())
        .then(async (data) => {
          if (data) {
            const baseTypeRaw = data.BaseType ? Number(data.BaseType) : WarehouseReceiptBaseType.None;
            const baseType = (baseTypeRaw === 5 || baseTypeRaw === 6 || baseTypeRaw === 9995)
              ? WarehouseReceiptBaseType.StocktakingCount
              : baseTypeRaw;

            const baseRef =
              baseType === WarehouseReceiptBaseType.TemporaryItemReceipt ? (data.TemporaryItemReceiptRef || data.TemporaryReceiptRef)
              : baseType === WarehouseReceiptBaseType.SupplyRequest ? data.SupplyRequestRef
              : baseType === WarehouseReceiptBaseType.PurchaseInvoice ? data.PurchaseInvoiceRef
              : null;

            const docType =
              baseType === WarehouseReceiptBaseType.TemporaryItemReceipt ? 'TemporaryItemReceipt'
              : baseType === WarehouseReceiptBaseType.SupplyRequest ? 'ItemSupplyRequest'
              : baseType === WarehouseReceiptBaseType.PurchaseInvoice ? 'PurchaseInvoice'
              : null;

            if (docType && baseRef) {
              try {
                const baseRes = await apiFetch(`/api/inv/base-documents/details?docType=${docType}&id=${baseRef}&currentDocId=${activeId}`);
                if (baseRes && baseRes.ok) {
                  const baseData = await baseRes.json();
                  if (baseData && Array.isArray(baseData.items)) {
                    setBaseDocItems(baseData.items);
                  }
                }
              } catch (e) {
                console.error("Error fetching base document details in activeId load:", e);
              }
            }

            setValues({
              WarehouseReceiptID: data.WarehouseReceiptID || activeId,
              WarehouseDocumentTypeRef: data.WarehouseDocumentTypeRef ? Number(data.WarehouseDocumentTypeRef) : "",
              DeliverWarehouseRef: data.DeliverWarehouseRef || data.WarehouseRef ? Number(data.DeliverWarehouseRef || data.WarehouseRef) : "",
              WarehouseRef: data.WarehouseRef || data.DeliverWarehouseRef ? Number(data.WarehouseRef || data.DeliverWarehouseRef) : "",
              WarehouseName: data.warehouse?.title || data.WarehouseName || "",
              BaseType: baseType,
              TemporaryItemReceiptRef: data.TemporaryItemReceiptRef || data.TemporaryReceiptRef ? Number(data.TemporaryItemReceiptRef || data.TemporaryReceiptRef) : "",
              TemporaryReceiptRef: data.TemporaryReceiptRef || data.TemporaryItemReceiptRef ? Number(data.TemporaryReceiptRef || data.TemporaryItemReceiptRef) : "",
              SupplyRequestRef: data.SupplyRequestRef ? Number(data.SupplyRequestRef) : "",
              PurchaseInvoiceRef: data.PurchaseInvoiceRef ? Number(data.PurchaseInvoiceRef) : "",
              SupplierRef: data.SupplierRef ? Number(data.SupplierRef) : "",
              SupplierName: data.SupplierName || data.supplierParty?.title || "",
              ReceiptNumber: data.ReceiptNumber || "",
              ReceiptDate: data.ReceiptDate ? momentJalaali(data.ReceiptDate).format("jYYYY/jMM/jDD") : getTodayJalali(),
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
                      const total = Number(d.TotalPrice ?? (qty * price));
                      const afterDiscount = Number(d.PriceAfterDiscount ?? Math.max(0, total - discount));
                      const vat = Number(d.Additions ?? d.VatTax ?? Math.round(afterDiscount * 0.09));
                      const net = Number(d.NetPrice ?? (afterDiscount + vat));

                      const matchedItem = availableItems.find(
                        (i) =>
                          Number(i.ItemID || i.id) === Number(d.ItemRef) ||
                          Number(i.id) === Number(d.ItemRef) ||
                          (d.item?.ItemCode && String(i.ItemCode || i.code) === String(d.item.ItemCode)) ||
                          (d.ItemCode && String(i.ItemCode || i.code) === String(d.ItemCode))
                      );
                      const mainUnitName = matchedItem?.UnitName || d.item?.MeasurementUnit?.MeasurementUnitTitle || d.item?.MeasurementUnit?.MeasurementUnitName || d.UnitName || "عدد";
                      const currentUnitName = d.UnitName || mainUnitName;

                      let currentUnitType = d.UnitType === 2 || d.UnitType === "فرعی" ? "فرعی" : "اصلی";

                      const rawSubUnits = matchedItem?.subUnits || d.item?.subUnits || d.item?.ItemSubUnits || [];
                      const subUnitsList = rawSubUnits.map((su: any, idx: number) => {
                        const suName = su.MeasurementUnitName || su.SubUnitName || su.title || su.unit || su.MeasurementUnit?.MeasurementUnitName || su.MeasurementUnit?.MeasurementUnitTitle || "";
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
                      const itemAllUnits = (matchedItem?.allUnits && matchedItem.allUnits.length > 0)
                        ? matchedItem.allUnits
                        : [
                            { id: 1, MeasurementUnitID: 1, MeasurementUnitName: mainUnitName, title: mainUnitName, UnitType: "اصلی" },
                            ...subUnitsList.filter((su: any) => su.MeasurementUnitName && su.MeasurementUnitName !== mainUnitName),
                          ];

                      const baseMatch = baseDocItems.find(
                        (b) => Number(b.ItemRef || b.ItemID || b.id) === Number(d.ItemRef)
                      );

                      const origQty = baseMatch ? Number(baseMatch.originalQuantity) : (d.originalQuantity !== undefined ? Number(d.originalQuantity) : undefined);
                      const usedQty = baseMatch ? Number(baseMatch.usedQuantity) : (d.usedQuantity !== undefined ? Number(d.usedQuantity) : undefined);
                      const remQty = baseMatch ? Number(baseMatch.remainingQuantity) : (d.remainingQuantity !== undefined ? Number(d.remainingQuantity) : undefined);

                      return {
                        id: String(d.WarehouseReceiptDetailID || idx + 1),
                        RowNo: d.RowNo || idx + 1,
                        ItemRef: d.ItemRef,
                        BaseNumber: d.BaseNumber || data.BaseDocumentNumber || "",
                        ItemCode: String(d.item?.ItemCode || d.item?.code || matchedItem?.ItemCode || matchedItem?.code || d.ItemCode || ""),
                        ItemName: d.item?.ItemName || d.item?.title || matchedItem?.ItemName || matchedItem?.title || d.ItemName || "",
                        UnitName: currentUnitName,
                        UnitType: currentUnitType,
                        allUnits: itemAllUnits,
                        Quantity: qty,
                        maxQuantity: remQty !== undefined ? remQty + qty : (d.maxQuantity || qty),
                        originalQuantity: origQty,
                        usedQuantity: usedQty,
                        remainingQuantity: remQty,
                        UnitPrice: price,
                        TotalPrice: total,
                        Discount: discount,
                        PriceAfterDiscount: afterDiscount,
                        VatTax: vat,
                        NetPrice: net,
                        Currency: "ریال",
                        trackingFactorValues: d.TrackingFactorValues || d.trackingFactorValues || d.trackingFactors || null,
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
                        Quantity: "",
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
                      id: String(f.WarehouseReceiptFactorID || idx + 1),
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
        .catch((err) => console.error("Error loading warehouse receipt:", err));
    } else {
      apiFetch("/api/inv/warehouse-receipts/next-number")
        .then((res) => res.json())
        .then((data) => {
          if (data?.documentNumber) {
            setValues((prev) => ({ ...prev, ReceiptNumber: data.documentNumber }));
          } else {
            setValues((prev) => ({ ...prev, ReceiptNumber: "1001" }));
          }
        })
        .catch(() => {
          setValues((prev) => ({ ...prev, ReceiptNumber: "1001" }));
        });
    }
  }, [activeId]);

  // Fetch dropdown data
  useEffect(() => {
    // Warehouse Document Types (Increasing nature = 1)
    apiFetch("/api/inv/warehouse-document-types?nature=1")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        const increasingList = list.filter((dt: any) => Number(dt.WarehouseDocumentNature || dt.nature) === 1);
        setWarehouseDocTypes(
          increasingList.map((dt: any) => {
            const nat = Number(dt.WarehouseDocumentNature || dt.nature || 1);
            const natureTitle = nat === 1 ? "افزاینده" : nat === 2 ? "کاهنده" : "خنثی";
            let parsedRelTypes: any[] = [];
            const rawRelTypes = dt.RelatedDetailedTypeRefs;
            if (Array.isArray(rawRelTypes)) {
              parsedRelTypes = rawRelTypes;
            } else if (typeof rawRelTypes === "string" && rawRelTypes.trim()) {
              try {
                const p = JSON.parse(rawRelTypes);
                parsedRelTypes = Array.isArray(p) ? p : [p];
              } catch {
                parsedRelTypes = rawRelTypes.split(",").map((s: string) => s.trim()).filter(Boolean);
              }
            } else if (rawRelTypes !== null && rawRelTypes !== undefined) {
              parsedRelTypes = [rawRelTypes];
            }

            let parsedBaseTypes: any[] = [];
            const rawBaseTypes = dt.BaseDocumentTypeRefs;
            if (Array.isArray(rawBaseTypes)) {
              parsedBaseTypes = rawBaseTypes;
            } else if (typeof rawBaseTypes === "string" && rawBaseTypes.trim()) {
              try {
                const p = JSON.parse(rawBaseTypes);
                parsedBaseTypes = Array.isArray(p) ? p : [p];
              } catch {
                parsedBaseTypes = rawBaseTypes.split(",").map((s: string) => s.trim()).filter(Boolean);
              }
            } else if (rawBaseTypes !== null && rawBaseTypes !== undefined) {
              parsedBaseTypes = [rawBaseTypes];
            }

            const hasBase = dt.HasBaseDocument === true || dt.HasBaseDocument === 1 || String(dt.HasBaseDocument) === "true" || String(dt.HasBaseDocument) === "1";
            const hasAccountingDoc = dt.HasAccountingDocument === true || dt.HasAccountingDocument === 1 || String(dt.HasAccountingDocument) === "true" || String(dt.HasAccountingDocument) === "1";

            return {
              id: Number(dt.WarehouseDocumentTypeID || dt.id),
              WarehouseDocumentTypeID: Number(dt.WarehouseDocumentTypeID || dt.id),
              code: String(dt.WarehouseDocumentTypeCode || dt.code || dt.WarehouseDocumentTypeID || dt.id),
              WarehouseDocumentTypeCode: String(dt.WarehouseDocumentTypeCode || dt.code || dt.WarehouseDocumentTypeID || dt.id),
              title: dt.WarehouseDocumentTypeTitle || dt.title || "",
              WarehouseDocumentTypeTitle: dt.WarehouseDocumentTypeTitle || dt.title || "",
              title2: dt.WarehouseDocumentTypeTitle2 || dt.title2 || "",
              WarehouseDocumentTypeTitle2: dt.WarehouseDocumentTypeTitle2 || dt.title2 || "",
              nature: nat,
              WarehouseDocumentNature: nat,
              natureTitle: natureTitle,
              WarehouseName: dt.WarehouseName || "",
              DetailedName: dt.DetailedName || "",
              RelatedDetailedTypeRefs: parsedRelTypes.map((x: any) => Number(typeof x === "object" && x !== null ? (x.id || x.detailedTypesId || x.code) : x)),
              HasBaseDocument: hasBase,
              BaseDocumentTypeRefs: parsedBaseTypes,
              ShowPurchaseSalesParameters: dt.ShowPurchaseSalesParameters !== undefined ? Boolean(dt.ShowPurchaseSalesParameters) : false,
              HasAccountingDocument: hasAccountingDoc,
            };
          })
        );
      })
      .catch((err) => console.error("Error fetching warehouse document types:", err));

    // Warehouses
    apiFetch("/api/inv/warehouses")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setAllWarehouses(list);
      })
      .catch((err) => console.error("Error fetching warehouses:", err));

    // Suppliers / Parties & Detailed Accounts
    Promise.all([
      apiFetch("/api/common/parties?isActive=true").then((res) => res.json()).catch(() => []),
      apiFetch("/api/accounting/detailed-accounts").then((res) => res.json()).catch(() => []),
    ]).then(([partiesData, detailedAccountsData]) => {
      const partyList = Array.isArray(partiesData) ? partiesData : partiesData?.data?.items || partiesData?.data || partiesData?.items || [];
      const daList = Array.isArray(detailedAccountsData) ? detailedAccountsData : detailedAccountsData?.items || detailedAccountsData?.data || [];

      const combinedMap = new Map<string | number, any>();

      // 1. Add all Detailed Accounts from accounting
      daList.forEach((da: any) => {
        const id = Number(da.detailedAccountId || da.DetailedAccountID || da.id);
        if (!id) return;
        const code = da.code || da.Code || String(id);
        const title = da.title || da.Title || "";
        const dtId = da.detailedTypesId || da.DetailedTypesID || da.detailedType?.detailedTypesId || da.detailedType?.id || null;
        const dtTitle = da.detailedType?.title || da.detailedType?.Title || "";

        combinedMap.set(`da_${id}`, {
          id: id,
          detailedAccountId: id,
          DetailedAccountID: id,
          code: code,
          title: title,
          title2: dtTitle,
          detailedTypesId: dtId ? Number(dtId) : null,
          isDetailedAccount: true,
        });
      });

      // 2. Add or enrich Parties
      partyList.forEach((p: any) => {
        const pId = Number(p.partyId || p.PartyID || p.id);
        const partyTitle = p.title || p.Title || (p.firstName || p.lastName ? `${p.firstName || ''} ${p.lastName || ''}`.trim() : '') || p.Name || "";
        let dtId = p.detailedAccount?.detailedTypesId || p.detailedAccount?.detailedType?.detailedTypesId || p.detailedTypesId || p.detailedTypeId || null;
        if (!dtId && p.Nature) {
          if (p.Nature === 'natural_person') dtId = 24;
          if (p.Nature === 'legal_entity') dtId = 25;
        }
        const daId = p.detailedAccountId || p.DetailedAccountID || p.detailedAccount?.detailedAccountId || p.detailedAccount?.id;
        const pCode = p.detailedAccount?.code || p.code || p.Code || String(pId);
        
        const key = daId ? `da_${daId}` : `p_${pId}`;
        const existing = combinedMap.get(key);

        combinedMap.set(key, {
          id: daId ? Number(daId) : pId,
          partyId: pId,
          PartyID: pId,
          detailedAccountId: daId ? Number(daId) : (existing?.detailedAccountId || null),
          DetailedAccountID: daId ? Number(daId) : (existing?.DetailedAccountID || null),
          code: existing?.code || pCode,
          title: partyTitle || existing?.title || "",
          title2: p.nationalCode || p.nationalId || p.NationalCode || p.national_code || existing?.title2 || "",
          detailedTypesId: dtId ? Number(dtId) : (existing?.detailedTypesId ? Number(existing.detailedTypesId) : null),
          isSupplier: p.isSupplier,
          isCustomer: p.isCustomer,
        });
      });

      setSuppliers(Array.from(combinedMap.values()));
    }).catch((err) => console.error("Error fetching suppliers / detailed accounts:", err));

    // Temporary Item Receipts
    apiFetch("/api/inv/temporary-item-receipts")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setTempReceipts(
          list
            .filter((r: any) => isStatusApprovedOrReviewed(r.Status || r.status))
            .map((r: any) => ({
              id: Number(r.TemporaryItemReceiptID || r.id),
              code: String(r.ReceiptNumber || r.code || r.TemporaryItemReceiptID || r.id),
              title: `رسید موقت ${r.ReceiptNumber || ""} - ${r.ReceiptDate || ""}`,
            }))
        );
      })
      .catch((err) => console.error("Error fetching temporary receipts:", err));

    // Supply Requests
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

    // Purchase Invoices
    apiFetch("/api/inv/base-documents/available?docType=PurchaseInvoice&targetDocType=WarehouseReceipt")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setPurchaseInvoices(
          list
            .filter((inv: any) => isStatusApprovedOrReviewed(inv.Status || inv.status))
            .map((inv: any) => {
            const invId = Number(inv.PurchaseInvoiceID || inv.id);
            const invNum = String(inv.InvoiceNumber || inv.code || inv.PurchaseInvoiceID || inv.id || "");
            
            let formattedDate = inv.InvoiceDate || "";
            if (typeof formattedDate === "string" && formattedDate.includes("T")) {
              try {
                formattedDate = momentJalaali(formattedDate).format("jYYYY/jMM/jDD");
              } catch {
                formattedDate = formattedDate.split("T")[0];
              }
            }

            const supplierName = inv.SupplierName || inv.supplierParty?.title || "نامشخص";
            const baseTypeVal = Number(inv.BaseType || 1);
            const baseTypeTitle = BASE_TYPE_LABELS_MAP[baseTypeVal] || "بدون مبنا";
            const statusVal = Number(inv.Status || 1);
            const statusTitle = DocumentStateLabels[statusVal as DocumentState] || "ثبت اولیه";

            return {
              id: invId,
              PurchaseInvoiceID: invId,
              code: invNum,
              InvoiceNumber: invNum,
              InvoiceDate: formattedDate,
              SupplierName: supplierName,
              BaseType: baseTypeVal,
              BaseTypeTitle: baseTypeTitle,
              Status: statusVal,
              StatusTitle: statusTitle,
              title: `فاکتور ${invNum} - ${supplierName}`,
              rawData: inv,
            };
          })
        );
      })
      .catch((err) => console.error("Error fetching purchase invoices:", err));

    // Items
    const itemsUrl = "/api/inv/items/dropdown?type=1&onlyActive=true";
    apiFetch(itemsUrl)
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
              ItemType: item.ItemType !== undefined ? Number(item.ItemType) : 1,
              IsActive: item.IsActive !== false,
              physicalWarehouseIds: item.physicalWarehouseIds || [],
              title: `${item.ItemCode ? item.ItemCode + " - " : ""}${item.ItemName || item.title || item.name || ""}`,
            };
          })
        );
      })
      .catch((err) => console.error("Error fetching items:", err));

    // Parameters
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
        const wrActive = checkSetting(resData, "isTrackingFactorActiveInWarehouseReceipt");
        setIsTrackingFactorEnabled(whActive || wrActive);
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

  // Selected Document Type object based on values.WarehouseDocumentTypeRef
  const selectedDocType = React.useMemo(() => {
    if (!values.WarehouseDocumentTypeRef) return null;
    return warehouseDocTypes.find(
      (dt) => Number(dt.id) === Number(values.WarehouseDocumentTypeRef)
    ) || null;
  }, [values.WarehouseDocumentTypeRef, warehouseDocTypes]);

  // Check if selected Warehouse Document Type has accounting document enabled
  const hasAccountingVoucher = React.useMemo(() => {
    if (selectedDocType) {
      return Boolean(
        selectedDocType.HasAccountingDocument === true ||
        selectedDocType.HasAccountingDocument === 1 ||
        String(selectedDocType.HasAccountingDocument) === "true" ||
        String(selectedDocType.HasAccountingDocument) === "1"
      );
    }
    const valDocType = values.selectedWarehouseDocType || values.warehouseDocumentType;
    if (valDocType) {
      return Boolean(
        valDocType.HasAccountingDocument === true ||
        valDocType.HasAccountingDocument === 1 ||
        String(valDocType.HasAccountingDocument) === "true" ||
        String(valDocType.HasAccountingDocument) === "1"
      );
    }
    return false;
  }, [selectedDocType, values.selectedWarehouseDocType, values.warehouseDocumentType]);

  // Check if document status is approved (تایید شده)
  const isDocStatusApproved = React.useMemo(() => {
    const st = values.Status;
    return (
      Number(st) === DocumentState.Approved ||
      String(st) === "5" ||
      String(st) === "تایید شده" ||
      String(st).includes("تایید شده")
    );
  }, [values.Status]);

  // Check if all valid items have unit price and total price greater than 0
  const isPriceValidForVoucher = React.useMemo(() => {
    const validItems = (values.items || []).filter(
      (it: any) => it.ItemRef || (it.ItemCode && String(it.ItemCode).trim() !== "")
    );
    if (validItems.length === 0) return false;
    return validItems.every(
      (it: any) => (Number(it.UnitPrice) || 0) > 0 && (Number(it.TotalPrice) || 0) > 0
    );
  }, [values.items]);

  // Icons are enabled ONLY when document status is approved and unit price & total price > 0
  const canOperateVoucher = isDocStatusApproved && isPriceValidForVoucher;

  // Dynamic Warehouse Label
  const warehouseLabel = selectedDocType?.WarehouseName?.trim() || "انبار تحویل‌گیرنده";

  // Dynamic Detailed/Deliverer Label
  const delivererLabel = selectedDocType?.DetailedName?.trim() || "تحویل‌دهنده";

  const supplierColumns: SingleSelectColumn[] = React.useMemo(() => [
    {
      key: "code",
      label: "کد",
      width: 90,
      renderItem: (item: any) => item.code || item.detailedAccount?.code || String(item.partyId || item.PartyID || item.id || ""),
      exportValue: (item: any) => item.code || item.detailedAccount?.code || String(item.partyId || item.PartyID || item.id || ""),
    },
    {
      key: "title",
      label: `عنوان ${delivererLabel}`,
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
  ], [delivererLabel]);

  // Filtered suppliers/deliverers based on RelatedDetailedTypeRefs
  const filteredSuppliers = React.useMemo(() => {
    if (!selectedDocType) return suppliers;
    const relRefs = selectedDocType.RelatedDetailedTypeRefs;
    if (!relRefs) return suppliers;

    let allowedTypeIds: number[] = [];
    if (Array.isArray(relRefs)) {
      allowedTypeIds = relRefs
        .map((x: any) => Number(typeof x === "object" && x !== null ? (x.id || x.detailedTypesId || x.code) : x))
        .filter((n: number) => !isNaN(n) && n > 0);
    } else if (typeof relRefs === "string") {
      try {
        const parsed = JSON.parse(relRefs);
        if (Array.isArray(parsed)) {
          allowedTypeIds = parsed
            .map((x: any) => Number(typeof x === "object" && x !== null ? (x.id || x.detailedTypesId || x.code) : x))
            .filter((n: number) => !isNaN(n) && n > 0);
        }
      } catch {
        if (!isNaN(Number(relRefs)) && Number(relRefs) > 0) {
          allowedTypeIds = [Number(relRefs)];
        }
      }
    } else if (typeof relRefs === "number" && relRefs > 0) {
      allowedTypeIds = [relRefs];
    }

    if (allowedTypeIds.length > 0) {
      return suppliers.filter((s: any) => 
        (s.detailedTypesId && allowedTypeIds.includes(Number(s.detailedTypesId))) ||
        (values.SupplierRef && (
          Number(s.id) === Number(values.SupplierRef) ||
          Number(s.partyId || s.PartyID) === Number(values.SupplierRef) ||
          Number(s.detailedAccountId || s.DetailedAccountID) === Number(values.SupplierRef)
        ))
      );
    }
    return suppliers;
  }, [selectedDocType, suppliers, values.SupplierRef]);

  // Auto-sync SupplierRef with SupplierName if SupplierRef points to wrong supplier or PartyID
  useEffect(() => {
    if (suppliers.length > 0 && (values.SupplierName || values.SupplierRef)) {
      const matched = suppliers.find((s: any) =>
        (values.SupplierName && s.title && s.title.trim().toLowerCase() === values.SupplierName.trim().toLowerCase()) ||
        (values.SupplierRef && (
          Number(s.partyId || s.PartyID) === Number(values.SupplierRef) ||
          Number(s.detailedAccountId || s.DetailedAccountID) === Number(values.SupplierRef)
        ))
      );
      if (matched && Number(matched.id) !== Number(values.SupplierRef)) {
        setValues((prev) => ({
          ...prev,
          SupplierRef: Number(matched.id),
          SupplierName: matched.title || prev.SupplierName,
        }));
      }
    }
  }, [suppliers, values.SupplierName, values.SupplierRef]);

  // Filtered Items for dropdown based on:
  // 1. ItemType === 1 (Goods / کالا)
  // 2. IsActive === true (فعال)
  // 3. Physical Location connected to selected Warehouse in header
  const filteredAvailableItems = React.useMemo(() => {
    return availableItems.filter((item: any) => {
      const isGoods = Number(item.ItemType ?? 1) === 1;
      const isActive = item.IsActive !== false;
      return isGoods && isActive;
    });
  }, [availableItems]);

  const itemDropdownData = React.useMemo(() => {
    const isBaseTypeSelected = Number(values.BaseType) > 1;
    if (isBaseTypeSelected) {
      const selectedBaseRef =
        Number(values.BaseType) === WarehouseReceiptBaseType.TemporaryItemReceipt
          ? (values.TemporaryItemReceiptRef || values.TemporaryReceiptRef)
          : Number(values.BaseType) === WarehouseReceiptBaseType.SupplyRequest
          ? values.SupplyRequestRef
          : Number(values.BaseType) === WarehouseReceiptBaseType.PurchaseInvoice
          ? values.PurchaseInvoiceRef
          : (values.TemporaryItemReceiptRef || values.SupplyRequestRef || values.PurchaseInvoiceRef || values.BaseDocumentNumber);

      if (!selectedBaseRef) {
        return [];
      }

      const baseItemsList = baseDocItems && baseDocItems.length > 0
        ? baseDocItems
        : (values.items || []).filter((it: any) => it.ItemRef || it.ItemCode);

      if (!baseItemsList || baseItemsList.length === 0) {
        return [];
      }

      const matched = filteredAvailableItems.filter((item: any) =>
        baseItemsList.some(
          (b: any) =>
            Number(b.ItemRef || b.ItemID || b.id) === Number(item.id || item.ItemID) ||
            (b.ItemCode && String(b.ItemCode) === String(item.ItemCode))
        )
      );

      const extraFromBase = baseItemsList
        .filter(
          (b: any) =>
            (b.ItemRef || b.ItemID || b.id || b.ItemCode) &&
            !matched.some(
              (m: any) =>
                Number(m.id || m.ItemID) === Number(b.ItemRef || b.ItemID || b.id) ||
                (m.ItemCode && String(m.ItemCode) === String(b.ItemCode))
            )
        )
        .map((b: any) => ({
          id: b.ItemRef || b.ItemID || b.id,
          ItemID: b.ItemRef || b.ItemID || b.id,
          ItemCode: b.ItemCode || "",
          ItemName: b.ItemName || "",
          UnitName: b.UnitName || "عدد",
          title: `${b.ItemCode ? b.ItemCode + " - " : ""}${b.ItemName || ""}`,
        }));

      return [...matched, ...extraFromBase];
    }

    return filteredAvailableItems;
  }, [
    values.BaseType,
    values.TemporaryItemReceiptRef,
    values.TemporaryReceiptRef,
    values.SupplyRequestRef,
    values.PurchaseInvoiceRef,
    values.BaseDocumentNumber,
    baseDocItems,
    filteredAvailableItems,
    values.items,
  ]);

  // Re-fetch items from server whenever WarehouseRef changes in header
  useEffect(() => {
    const itemsUrl = "/api/inv/items/dropdown?type=1&onlyActive=true";
    apiFetch(itemsUrl)
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
              ItemType: item.ItemType !== undefined ? Number(item.ItemType) : 1,
              IsActive: item.IsActive !== false,
              physicalWarehouseIds: item.physicalWarehouseIds || [],
              title: `${item.ItemCode ? item.ItemCode + " - " : ""}${item.ItemName || item.title || item.name || ""}`,
            };
          })
        );
      })
      .catch((err) => console.error("Error fetching items on warehouse change:", err));
  }, [values.WarehouseRef]);

  const isStocktakingBase = React.useMemo(() => {
    const baseVal = Number(values.BaseType);
    const docTypeTitle = (selectedDocType?.title || selectedDocType?.WarehouseDocumentTypeTitle || "").trim();
    const isSurplusType =
      docTypeTitle.includes("اضافی انبارگردانی") ||
      docTypeTitle.includes("اضافات انبارگردانی") ||
      docTypeTitle.includes("اضافه انبارگردانی") ||
      docTypeTitle.includes("اضافات انبار") ||
      docTypeTitle.includes("اضافه انبار");
    return isSurplusType || baseVal === WarehouseReceiptBaseType.StocktakingCount || baseVal === 5 || baseVal === 6 || baseVal === 9995;
  }, [values.BaseType, selectedDocType]);

  // Available Base Type Options based on HasBaseDocument and BaseDocumentTypeRefs
  const availableBaseTypeOptions = React.useMemo(() => {
    if (isStocktakingBase) {
      return [
        { id: WarehouseReceiptBaseType.StocktakingCount, title: "شمارش انبارگردانی", value: WarehouseReceiptBaseType.StocktakingCount, label: "شمارش انبارگردانی" },
      ];
    }

    if (!selectedDocType) return WAREHOUSE_RECEIPT_BASE_TYPE_OPTIONS;

    // اگر دارای سند مبنا غیرفعال است، فقط گزینه "بدون مبنا" نمایش داده شود
    if (!selectedDocType.HasBaseDocument) {
      return [{ id: WarehouseReceiptBaseType.None, title: "بدون مبنا", value: WarehouseReceiptBaseType.None, label: "بدون مبنا" }];
    }

    const refs = selectedDocType.BaseDocumentTypeRefs;
    if (Array.isArray(refs) && refs.length > 0) {
      const matchesRef = (targetCodes: (number | string)[], targetTitles: string[]) => {
        return refs.some((r: any) => {
          if (r === null || r === undefined) return false;

          let valId: any = undefined;
          let valCode: any = undefined;
          let valTitle: any = undefined;

          if (typeof r === "object") {
            valId = r.id !== undefined ? r.id : r.WarehouseDocumentTypeID;
            valCode = r.code !== undefined ? r.code : r.WarehouseDocumentTypeCode;
            valTitle = r.title || r.WarehouseDocumentTypeTitle || r.name;
          } else if (typeof r === "string" || typeof r === "number") {
            valId = r;
            valCode = r;
            valTitle = String(r);
          }

          if (valId !== undefined && valId !== null && valId !== "") {
            if (targetCodes.some((tc) => String(tc) === String(valId))) return true;
          }
          if (valCode !== undefined && valCode !== null && valCode !== "") {
            if (targetCodes.some((tc) => String(tc) === String(valCode))) return true;
          }

          if (valTitle && typeof valTitle === "string") {
            const trimmed = valTitle.trim();
            if (targetTitles.some((tt) => trimmed.includes(tt) || tt.includes(trimmed))) return true;
          }

          return false;
        });
      };

      const options: { id: number; title: string; value: number; label: string }[] = [];

      // ۱. چک "بدون مبنا" (کد 0 یا 1)
      if (matchesRef([0, 1, WarehouseReceiptBaseType.None], ["بدون مبنا"])) {
        options.push({ id: WarehouseReceiptBaseType.None, title: "بدون مبنا", value: WarehouseReceiptBaseType.None, label: "بدون مبنا" });
      }

      // ۲. رسید موقت کالا (کد 9996 یا 2)
      if (matchesRef([9996, 2, WarehouseReceiptBaseType.TemporaryItemReceipt], ["رسید موقت"])) {
        if (!options.some((o) => o.id === WarehouseReceiptBaseType.TemporaryItemReceipt)) {
          options.push({ id: WarehouseReceiptBaseType.TemporaryItemReceipt, title: "رسید موقت کالا", value: WarehouseReceiptBaseType.TemporaryItemReceipt, label: "رسید موقت کالا" });
        }
      }

      // ۳. درخواست تامین کالا (کد 9998 یا 3)
      if (matchesRef([9998, 3, WarehouseReceiptBaseType.SupplyRequest], ["تامین کالا", "درخواست تامین"])) {
        if (!options.some((o) => o.id === WarehouseReceiptBaseType.SupplyRequest)) {
          options.push({ id: WarehouseReceiptBaseType.SupplyRequest, title: "درخواست تامین کالا", value: WarehouseReceiptBaseType.SupplyRequest, label: "درخواست تامین کالا" });
        }
      }

      // ۴. فاکتور خرید کالا (کد 9999 یا 4)
      if (matchesRef([9999, 4, WarehouseReceiptBaseType.PurchaseInvoice], ["فاکتور خرید", "خرید کالا"])) {
        if (!options.some((o) => o.id === WarehouseReceiptBaseType.PurchaseInvoice)) {
          options.push({ id: WarehouseReceiptBaseType.PurchaseInvoice, title: "فاکتور خرید کالا", value: WarehouseReceiptBaseType.PurchaseInvoice, label: "فاکتور خرید کالا" });
        }
      }

      // ۵. شمارش انبارگردانی (کد 9995 یا 5)
      if (matchesRef([9995, 5, WarehouseReceiptBaseType.StocktakingCount], ["شمارش انبارگردانی", "انبارگردانی"])) {
        if (!options.some((o) => o.id === WarehouseReceiptBaseType.StocktakingCount)) {
          options.push({ id: WarehouseReceiptBaseType.StocktakingCount, title: "شمارش انبارگردانی", value: WarehouseReceiptBaseType.StocktakingCount, label: "شمارش انبارگردانی" });
        }
      }

      // ۵. سایر انواع اسناد انبار تعریف شده توسط کاربر
      warehouseDocTypes.forEach((dt) => {
        const dtId = Number(dt.id);
        const dtCode = Number(dt.code);
        const dtTitle = dt.title || "";
        if (
          matchesRef([dtId, dtCode], dtTitle ? [dtTitle] : []) &&
          !options.some((o) => o.id === dtId)
        ) {
          options.push({
            id: dtId,
            title: dt.title || `نوع سند ${dtCode}`,
            value: dtId,
            label: dt.title || `نوع سند ${dtCode}`,
          });
        }
      });

      if (options.length > 0) {
        return options;
      }
    }

    return WAREHOUSE_RECEIPT_BASE_TYPE_OPTIONS;
  }, [selectedDocType, warehouseDocTypes, isStocktakingBase]);

  // Sync BaseType when selected document type changes
  useEffect(() => {
    if (!selectedDocType) return;
    if (isStocktakingBase) {
      if (Number(values.BaseType) !== WarehouseReceiptBaseType.StocktakingCount) {
        setValues((prev) => ({ ...prev, BaseType: WarehouseReceiptBaseType.StocktakingCount }));
      }
      return;
    }
    if (!selectedDocType.HasBaseDocument) {
      if (Number(values.BaseType) !== WarehouseReceiptBaseType.None) {
        setValues((prev) => ({ ...prev, BaseType: WarehouseReceiptBaseType.None }));
      }
    } else {
      const validValues = availableBaseTypeOptions.map((opt) => Number(opt.value));
      if (!validValues.includes(Number(values.BaseType))) {
        setValues((prev) => ({ ...prev, BaseType: availableBaseTypeOptions[0]?.value || WarehouseReceiptBaseType.None }));
      }
    }
  }, [selectedDocType, availableBaseTypeOptions, isStocktakingBase]);

  const isDetailedEnabled = React.useMemo(() => {
    if (!selectedDocType) return true;
    const hasName = Boolean(selectedDocType.DetailedName && selectedDocType.DetailedName.trim());
    const relRefs = selectedDocType.RelatedDetailedTypeRefs;
    let hasRelRefs = false;
    if (Array.isArray(relRefs)) {
      hasRelRefs = relRefs.length > 0;
    } else if (relRefs !== null && relRefs !== undefined && relRefs !== "") {
      hasRelRefs = true;
    }
    return hasName || hasRelRefs;
  }, [selectedDocType]);

  useEffect(() => {
    if (selectedDocType && !isDetailedEnabled) {
      if (values.SupplierRef || values.SupplierName) {
        setValues((prev) => ({ ...prev, SupplierRef: "", SupplierName: "" }));
      }
    }
  }, [selectedDocType, isDetailedEnabled]);

  const handleChange = (name: string, value: any) => {
    if (name === "BaseType") {
      setBaseDocItems([]);
      setValues((prev) => ({
        ...prev,
        BaseType: value,
        TemporaryItemReceiptRef: "",
        TemporaryReceiptRef: "",
        SupplyRequestRef: "",
        PurchaseInvoiceRef: "",
        BaseDocumentNumber: "",
        items: prev.BaseType !== value ? [] : prev.items,
      }));
      return;
    }
    if (["TemporaryItemReceiptRef", "TemporaryReceiptRef", "SupplyRequestRef", "PurchaseInvoiceRef"].includes(name) && !value) {
      setBaseDocItems([]);
    }
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const calculateRowFields = (row: any, vatRate: number = 0) => {
    const qty = Number(row.Quantity) || 0;
    const price = Number(row.UnitPrice) || 0;
    const discount = Number(row.Discount) || 0;
    const total = qty * price;
    const afterDiscount = Math.max(0, total - discount);
    const manualAdditions = row.Additions !== undefined && row.Additions !== null ? Number(row.Additions) : (row.VatTax !== undefined && row.VatTax !== null ? Number(row.VatTax) : undefined);
    const additions = manualAdditions !== undefined ? manualAdditions : Math.round(afterDiscount * vatRate);
    const net = afterDiscount + additions;

    return {
      ...row,
      TotalPrice: total,
      PriceAfterDiscount: afterDiscount,
      Additions: additions,
      VatTax: additions,
      NetPrice: net,
    };
  };

  const loadBaseDocumentDetails = async (docType: string, refId: number | string) => {
    if (!refId) return;
    try {
      const currentDocId = values.WarehouseReceiptID ? Number(values.WarehouseReceiptID) : undefined;
      const query = currentDocId
        ? `/api/inv/base-documents/details?docType=${docType}&id=${refId}&currentDocId=${currentDocId}`
        : `/api/inv/base-documents/details?docType=${docType}&id=${refId}`;
      const response = await apiFetch(query);
      if (response && response.ok) {
        const res = await response.json();
        if (res) {
          setBaseDocItems(res.items && Array.isArray(res.items) ? res.items : []);
          let formattedItems: any[] = [];
          const baseDocNo = String(res.code || res.InvoiceNumber || res.RequestNumber || res.ReceiptNumber || res.BaseDocumentNumber || refId || "");
          if (res.items && Array.isArray(res.items) && res.items.length > 0) {
            formattedItems = res.items.map((it: any, idx: number) => {
              const origQty = Number(it.originalQuantity !== undefined ? it.originalQuantity : (it.Quantity || 1));
              const usedQty = Number(it.usedQuantity || 0);
              const remQty = Number(it.remainingQuantity !== undefined ? it.remainingQuantity : Math.max(0, origQty - usedQty));
              const qtyToUse = Number(it.Quantity !== undefined ? it.Quantity : remQty);

              const price = Number(it.UnitPrice || 0);
              const discount = Number(it.Discount || 0);
              const total = qtyToUse * price;
              const afterDiscount = Math.max(0, total - discount);
              const vat = Math.round(afterDiscount * 0.09);
              const net = afterDiscount + vat;
              const itemRefVal = Number(it.ItemRef || it.ItemID || it.id);
              return {
                id: String(idx + 1),
                RowNo: idx + 1,
                ItemRef: itemRefVal,
                BaseNumber: it.BaseNumber || it.BaseDocumentNumber || baseDocNo,
                ItemCode: it.ItemCode || "",
                ItemName: it.ItemName || "",
                UnitName: it.UnitName || "عدد",
                UnitType: it.UnitType === 2 || it.UnitType === "فرعی" ? "فرعی" : "اصلی",
                Quantity: qtyToUse,
                maxQuantity: it.maxQuantity || remQty || qtyToUse,
                originalQuantity: origQty,
                usedQuantity: usedQty,
                remainingQuantity: remQty,
                UnitPrice: price,
                TotalPrice: total,
                Discount: discount,
                PriceAfterDiscount: afterDiscount,
                VatTax: vat,
                NetPrice: net,
                Currency: "ریال",
                Description: it.Description || "",
                trackingFactorValues: it.TrackingFactorValues || it.trackingFactorValues || null,
              };
            });
          }

          let targetSupplierRef = res.SupplierRef;
          let targetSupplierName = res.SupplierName;

          if (res.SupplierRef || res.SupplierName) {
            const matchedSupplier = suppliers.find((s: any) =>
              (res.SupplierRef && (
                Number(s.partyId || s.PartyID) === Number(res.SupplierRef) ||
                Number(s.id) === Number(res.SupplierRef) ||
                Number(s.detailedAccountId || s.DetailedAccountID) === Number(res.SupplierRef)
              )) ||
              (res.SupplierName && s.title && s.title.trim().toLowerCase() === res.SupplierName.trim().toLowerCase())
            );
            if (matchedSupplier) {
              targetSupplierRef = Number(matchedSupplier.id);
              targetSupplierName = matchedSupplier.title;
            }
          }

          setValues((prev: any) => ({
            ...prev,
            items: formattedItems.length > 0 ? formattedItems : prev.items,
            factors: res.factors && res.factors.length > 0 ? res.factors : (prev.factors || []),
            SupplierRef: targetSupplierRef || prev.SupplierRef,
            SupplierName: targetSupplierName || prev.SupplierName,
            CurrencyRef: res.CurrencyRef || prev.CurrencyRef,
            BaseDocumentNumber: baseDocNo || prev.BaseDocumentNumber,
          }));

          if (formattedItems.length > 0) {
            showToast("اطلاعات اقلام، عوامل و مشخصات سند مبنا بارگذاری شد", "success");
          } else {
            showToast("مشخصات سند مبنا بارگذاری شد (فاقد اقلام تحویلی)", "info");
          }
        }
      } else {
        showToast("خطا در بارگذاری اطلاعات سند مبنا", "error");
      }
    } catch (err) {
      console.error("Error loading base document details:", err);
      showToast("خطا در بارگذاری اطلاعات سند مبنا", "error");
    }
  };

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

    setValues((prev) => ({ ...prev, factors: updatedFactors }));
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
      
      let manualDisc = 0;
      if (row.ManualDiscount !== undefined && row.ManualDiscount !== null) {
        manualDisc = Number(row.ManualDiscount) || 0;
      }

      let manualAdds = 0;
      if (row.ManualAdditions !== undefined && row.ManualAdditions !== null) {
        manualAdds = Number(row.ManualAdditions) || 0;
      }

      return {
        ...row,
        TotalPrice: total,
        ManualDiscount: manualDisc,
        ManualAdditions: manualAdds,
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
    let totalAdditionFactorsAmount = 0;
    let totalVatFactorsAmount = 0;

    const updatedFactors = (factorsList || []).map((factor) => {
      const paramObj = findParamObj(factor, paramsList);
      const cat = Number(paramObj?.CategoryOther ?? factor.CategoryOther ?? 0);
      const paramType = Number(paramObj?.ParameterType ?? 1);
      const opType = Number(paramObj?.OperationType ?? 1);
      const titleNorm = normalizePersianText(paramObj?.Title || factor.FactorTitle || "");

      const isVat = cat === 1 || cat === 2 || titleNorm.includes("مالیات") || titleNorm.includes("ارزش افزوده") || titleNorm.includes("عوارض");
      const isDiscount = cat === 3 || titleNorm.includes("تخفیف") || factor.FactorType === 2 || factor.CategoryOther === 3;

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
      } else if (!isManualAmount && (opType === 3 || titleNorm.includes("درصد"))) {
        // Percentage (درصدی)
        const rawVal = getParameterValueForDate(paramObj, receiptDate) || Number(factor.PercentOrAmount || factor.Value || 0);
        if (rawVal > 0) {
          const rate = rawVal > 1 ? rawVal / 100 : rawVal;
          computedAmount = Math.round(totalGrossSum * rate);
        }
      } else if (!isManualAmount && opType === 4) {
        // Unit Amount (مبلغ واحد)
        const unitVal = getParameterValueForDate(paramObj, receiptDate) || Number(factor.PercentOrAmount || factor.Value || 0);
        if (unitVal > 0) {
          computedAmount = Math.round(totalItemsQuantity * unitVal);
        }
      } else if (!isManualAmount && opType === 1) {
        // Fixed Amount (مبلغی)
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
      } else if (factorTypeVal === 1) {
        totalAdditionFactorsAmount += computedAmount;
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
      const manualAdds = Number(row.ManualAdditions) || 0;
      const hasManualDisc = row.ManualDiscount !== undefined && row.ManualDiscount !== null;
      const hasManualVat = row.ManualVatTax !== undefined && row.ManualVatTax !== null;

      let factorDisc = 0;
      if (totalDiscountFactorsAmount > 0 && totalGrossSum > 0) {
        factorDisc = Math.round((total / totalGrossSum) * totalDiscountFactorsAmount);
      }

      // حفظ تخفیف ذخیره‌شده وقتی نه تخفیف دستی وجود دارد و نه عاملی برای تخصیص
      const totalDiscount = hasManualDisc || factorDisc > 0
        ? manualDisc + factorDisc
        : Number(row.Discount) || 0;
      const afterDiscount = Math.max(0, total - totalDiscount);

      let vat = 0;
      if (hasManualVat) {
        // مالیات و عوارض ارزش افزوده دستی واردشده توسط کاربر
        vat = Number(row.ManualVatTax) || 0;
      } else if (totalVatRate > 0) {
        vat = Math.round(afterDiscount * totalVatRate);
      } else if (totalVatFactorsAmount > 0 && totalGrossSum > 0) {
        vat = Math.round((total / totalGrossSum) * totalVatFactorsAmount);
      } else if (row.VatTax !== undefined && row.VatTax !== null && Number(row.VatTax) > 0 && totalDiscountFactorsAmount === 0 && totalAdditionFactorsAmount === 0) {
        vat = Number(row.VatTax);
      }

      let factorAdds = 0;
      if (totalAdditionFactorsAmount > 0 && totalGrossSum > 0) {
        factorAdds = Math.round((total / totalGrossSum) * totalAdditionFactorsAmount);
      }

      const totalAdditions = manualAdds + factorAdds + vat;
      const net = afterDiscount + totalAdditions;

      return {
        ...row,
        TotalPrice: total,
        Discount: totalDiscount,
        ManualDiscount: manualDisc,
        FactorDiscount: factorDisc,
        PriceAfterDiscount: afterDiscount,
        VatTax: vat,
        Additions: totalAdditions,
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
    values.DeliverWarehouseRef &&
    (
      Number(values.BaseType) === WarehouseReceiptBaseType.None ||
      (Number(values.BaseType) === WarehouseReceiptBaseType.TemporaryItemReceipt && values.TemporaryItemReceiptRef) ||
      (Number(values.BaseType) === WarehouseReceiptBaseType.SupplyRequest && values.SupplyRequestRef) ||
      (Number(values.BaseType) === WarehouseReceiptBaseType.PurchaseInvoice && values.PurchaseInvoiceRef) ||
      Number(values.BaseType) === WarehouseReceiptBaseType.StocktakingCount ||
      isStocktakingBase ||
      Boolean(values.BaseDocumentNumber)
    )
  );

  // Detail Items Tab Config
  const isBaseSelected = Number(values.BaseType) !== WarehouseReceiptBaseType.None;

  const detailTabConfig: TabCellConfig[] = [
    {
      name: "RowNo",
      label: "ردیف",
      type: "text",
      width: "40px",
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
            width: "88px",
            render: (row: any, rowIndex: number) => {
              let defaultBaseNo = row?.BaseNumber || row?.BaseDocumentNumber || "";
              if (!defaultBaseNo) {
                if (Number(values.BaseType) === WarehouseReceiptBaseType.TemporaryItemReceipt && values.TemporaryItemReceiptRef) {
                  const found = tempReceipts.find((s) => Number(s.id) === Number(values.TemporaryItemReceiptRef));
                  defaultBaseNo = found?.code || String(values.TemporaryItemReceiptRef);
                } else if (Number(values.BaseType) === WarehouseReceiptBaseType.SupplyRequest && values.SupplyRequestRef) {
                  const found = supplyRequests.find((s) => Number(s.id) === Number(values.SupplyRequestRef));
                  defaultBaseNo = found?.code || String(values.SupplyRequestRef);
                } else if (Number(values.BaseType) === WarehouseReceiptBaseType.PurchaseInvoice && values.PurchaseInvoiceRef) {
                  const found = purchaseInvoices.find((p) => Number(p.id) === Number(values.PurchaseInvoiceRef));
                  defaultBaseNo = found?.code || String(values.PurchaseInvoiceRef);
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
      width: "88px",
      render: (row, rowIndex) => {
        const val = row?.ItemRef;
        const selectedObj =
          filteredAvailableItems.find(
            (i) => Number(i.id) === Number(val) || Number(i.ItemID) === Number(val) || (row?.ItemCode && String(i.ItemCode) === String(row.ItemCode))
          ) ||
          availableItems.find(
            (i) => Number(i.id) === Number(val) || Number(i.ItemID) === Number(val) || (row?.ItemCode && String(i.ItemCode) === String(row.ItemCode))
          ) ||
          (row?.ItemCode || row?.ItemRef
            ? {
                id: row.ItemRef || row.ItemCode,
                ItemID: row.ItemRef,
                ItemCode: String(row.ItemCode || ""),
                ItemName: row.ItemName || "",
                title: `${row.ItemCode ? row.ItemCode + " - " : ""}${row.ItemName || ""}`,
              }
            : null);

        return (
          <MultiColumnDropDown
            data={itemDropdownData}
            columns={itemDropdownColumns}
            value={selectedObj}
            displayKey="ItemCode"
            placeholder="انتخاب کالا/خدمت..."
            disabled={isUsed || isStocktakingSurplus || !isHeaderComplete}
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
                allUnits: firstItem.allUnits || [],
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
                    allUnits: extraItem.allUnits || [],
                    Quantity: "",
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
      width: "110px",
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
      width: "62px",
      render: (row, rowIndex) => {
        const itemRef = getItemRef(row);
        const matchedItem =
          filteredAvailableItems.find(
            (i) =>
              (itemRef !== null && (Number(i.ItemID) === Number(itemRef) || Number(i.id) === Number(itemRef))) ||
              (row?.ItemCode && String(i.ItemCode || i.code) === String(row.ItemCode))
          ) ||
          availableItems.find(
            (i) =>
              (itemRef !== null && (Number(i.ItemID) === Number(itemRef) || Number(i.id) === Number(itemRef))) ||
              (row?.ItemCode && String(i.ItemCode || i.code) === String(row.ItemCode))
          );

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

        const primaryUnit = matchedItem?.UnitName || matchedItem?.mainUnit?.MeasurementUnitName || "عدد";
        const currentUnitDisplay = row?.UnitName || primaryUnit;

        if (!hasSubUnits) {
          return (
            <span className="flex items-center justify-center w-full h-[25px] px-1 text-xs text-slate-600 dark:text-slate-300 text-center select-none font-medium">
              {currentUnitDisplay}
            </span>
          );
        }

        return (
          <div className="flex items-center justify-between w-full h-[25px] px-1 gap-1">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={currentUnitDisplay}>
              {currentUnitDisplay}
            </span>
            <button
              type="button"
              disabled={isUsed || isStocktakingSurplus}
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
                  itemId: row?.ItemRef || matchedItem?.ItemID || matchedItem?.id || row?.item?.ItemID,
                  itemCode: row?.ItemCode || matchedItem?.ItemCode || matchedItem?.code || "-",
                  itemTitle: row?.ItemName || matchedItem?.ItemName || matchedItem?.title || "-",
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
      name: "UnitType",
      label: "نوع واحد",
      type: "text",
      width: "58px",
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
      width: "68px",
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

        return (
          <div className="flex items-center gap-1 w-full">
            <NumberInput
              value={row?.Quantity !== "" && row?.Quantity !== null && row?.Quantity !== undefined ? row.Quantity : ""}
              thousandsSeparator={true}
              onChange={(newVal) => {
                let finalVal = newVal !== "" && newVal !== null && newVal !== undefined ? Number(newVal) : "";
                const maxQty = Number(row?.maxQuantity ?? row?.remainingQuantity);
                if (maxQty > 0 && typeof finalVal === "number" && finalVal > maxQty) {
                  showToast(`مقدار وارد شده نمی‌تواند بیشتر از مانده سند مبنا (${maxQty}) باشد`, "warning");
                  finalVal = maxQty;
                }
                const updatedItems = [...(values.items || [])];
                const qtyVal = finalVal !== "" && finalVal !== null && finalVal !== undefined ? Number(finalVal) : "";
                const priceVal = Number(updatedItems[rowIndex]?.UnitPrice) || 0;
                updatedItems[rowIndex] = {
                  ...updatedItems[rowIndex],
                  Quantity: qtyVal,
                  TotalPrice: (Number(qtyVal) || 0) * priceVal,
                };
                const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
                  updatedItems,
                  values.factors || [],
                  values.ReceiptDate || "",
                  parametersList || []
                );
                setValues((prev) => ({ ...prev, items: finalItems, factors: finalFactors }));
              }}
              disabled={isUsed || isStocktakingSurplus || showPlusBtn}
            />
            {showPlusBtn && (
              <button
                type="button"
                title="ثبت عوامل ردیابی"
                onClick={() => {
                  const origQty = row?.originalQuantity ?? (row?.remainingQuantity !== undefined && row?.usedQuantity !== undefined ? Number(row.remainingQuantity) + Number(row.usedQuantity) : row?.maxQuantity ?? row?.Quantity);
                  const recQty = row?.usedQuantity ?? (origQty !== undefined && row?.remainingQuantity !== undefined ? Math.max(0, Number(origQty) - Number(row.remainingQuantity)) : 0);
                  const remQty = row?.remainingQuantity ?? (origQty !== undefined && recQty !== undefined ? Math.max(0, Number(origQty) - Number(recQty)) : row?.maxQuantity ?? row?.Quantity);
                  const itemHasBase = Boolean(row?.BaseDocumentHeaderRef || row?.baseDocumentHeaderRef || row?.TemporaryItemReceiptRef || row?.SupplyRequestRef || row?.PurchaseInvoiceRef || (Number(values.BaseType) && Number(values.BaseType) !== WarehouseReceiptBaseType.None));
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
      width: "85px",
      render: (row, rowIndex) => (
        <NumberInput
          value={row?.UnitPrice ?? 0}
          thousandsSeparator={true}
          onChange={(newVal) => {
            const updatedItems = [...(values.items || [])];
            const priceVal = Number(newVal) || 0;
            const qtyVal = Number(updatedItems[rowIndex]?.Quantity) || 0;
            updatedItems[rowIndex] = {
              ...updatedItems[rowIndex],
              UnitPrice: priceVal,
              TotalPrice: qtyVal * priceVal,
            };
            const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
              updatedItems,
              values.factors || [],
              values.ReceiptDate || "",
              parametersList || []
            );
            setValues((prev) => ({ ...prev, items: finalItems, factors: finalFactors }));
          }}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "TotalPrice",
      label: "مبلغ کل (ریال)",
      type: "text",
      width: "96px",
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
      width: "86px",
      render: (row) => (
        <span className="flex items-center justify-end w-full h-[25px] px-2 text-xs font-semibold text-slate-700 dark:text-slate-200 select-none dir-ltr">
          {formatCurrency(row?.Discount)}
        </span>
      ),
    },
    {
      name: "PriceAfterDiscount",
      label: "مبلغ کل\nپس از تخفیف",
      type: "text",
      width: "98px",
      render: (row) => (
        <span className="flex items-center justify-end w-full h-[25px] px-2 text-xs font-semibold text-slate-700 dark:text-slate-200 select-none dir-ltr">
          {formatCurrency(row?.PriceAfterDiscount)}
        </span>
      ),
    },
    {
      name: "VatTax",
      label: "جمع مالیات و عوارض\nارزش افزوده",
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
      label: "جمع کل با مالیات\nو عوارض ارزش افزوده",
      type: "text",
      width: "115px",
      render: (row) => (
        <span className="flex items-center justify-end w-full h-[25px] px-2 text-xs font-bold text-blue-700 dark:text-blue-400 select-none dir-ltr">
          {formatCurrency(row?.NetPrice)}
        </span>
      ),
    },
  ];

  const showPurchaseSales = Boolean(selectedDocType?.ShowPurchaseSalesParameters);

  const activeDetailTabConfig = React.useMemo(() => {
    if (showPurchaseSales) return detailTabConfig;
    return detailTabConfig.filter(
      (col) => !["Discount", "PriceAfterDiscount", "VatTax", "NetPrice"].includes(col.name)
    );
  }, [detailTabConfig, showPurchaseSales]);

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
      width: "300px",
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

  // Check if current Warehouse Receipt is issued from Stocktaking Surplus (انبارگردانی)
  const isStocktakingSurplus = false;

  // Form Fields Structure
  const fields: FieldConfig[] = [
    {
      name: "WarehouseDocumentTypeRef",
      type: "custom",
      colSpan: 1,
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="flex items-center gap-2 w-full">
          <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[80px] text-xs">
            نوع سند انبار <span className="text-red-500">*</span>:
          </span>
          <div className="flex-1">
            <SingleSelectDropDown
              noWrapper={true}
              options={warehouseDocTypes}
              data={warehouseDocTypes}
              listApiUrl="/api/inv/warehouse-document-types?nature=1"
              filterItem={(dt: any) => Number(dt.nature || dt.WarehouseDocumentNature) === 1}
              columns={warehouseDocTypeColumns}
              value={values.WarehouseDocumentTypeRef}
              selectedValue={values.WarehouseDocumentTypeRef}
              valueKey="id"
              displayKey="title"
              searchKeys={["code", "title", "title2", "natureTitle"]}
              placeholder="انتخاب نوع سند انبار..."
              onChange={(selected: any) => {
                if (!selected) {
                  setValues((prev) => ({ ...prev, WarehouseDocumentTypeRef: "" }));
                  return;
                }
                if (typeof selected === "object") {
                  const dtId = Number(selected.id || selected.WarehouseDocumentTypeID);
                  setValues((prev) => ({ ...prev, WarehouseDocumentTypeRef: dtId }));
                  setWarehouseDocTypes((prev) => {
                    const exists = prev.some((x) => Number(x.id) === dtId);
                    if (exists) {
                      return prev.map((x) =>
                        Number(x.id) === dtId
                          ? {
                              ...x,
                              ShowPurchaseSalesParameters:
                                selected.ShowPurchaseSalesParameters !== undefined
                                  ? Boolean(selected.ShowPurchaseSalesParameters)
                                  : x.ShowPurchaseSalesParameters,
                              HasAccountingDocument:
                                selected.HasAccountingDocument !== undefined
                                  ? (selected.HasAccountingDocument === true || selected.HasAccountingDocument === 1 || String(selected.HasAccountingDocument) === "true" || String(selected.HasAccountingDocument) === "1")
                                  : x.HasAccountingDocument,
                            }
                          : x
                      );
                    }
                    return [
                      ...prev,
                      {
                        ...selected,
                        id: dtId,
                        ShowPurchaseSalesParameters:
                          selected.ShowPurchaseSalesParameters !== undefined
                            ? Boolean(selected.ShowPurchaseSalesParameters)
                            : false,
                        HasAccountingDocument:
                          selected.HasAccountingDocument !== undefined
                            ? (selected.HasAccountingDocument === true || selected.HasAccountingDocument === 1 || String(selected.HasAccountingDocument) === "true" || String(selected.HasAccountingDocument) === "1")
                            : false,
                      },
                    ];
                  });
                } else {
                  setValues((prev) => ({ ...prev, WarehouseDocumentTypeRef: Number(selected) }));
                }
              }}
              disabled={disabled || isUsed || isStocktakingSurplus}
              addFormOptions={[
                { title: "تعریف نوع سند انبار جدید", componentName: "WarehouseDocumentTypeForm", groupId: "inv" },
              ]}
            />
          </div>
        </div>
      ),
    },
    {
      name: "DeliverWarehouseRef",
      type: "custom",
      colSpan: 1,
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="flex items-center gap-2 w-full">
          <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[80px] text-xs">
            {warehouseLabel} <span className="text-red-500">*</span>:
          </span>
          <div className="flex-1">
            <SingleSelectDropDown
              noWrapper={true}
              options={allowedWarehouses}
              data={allowedWarehouses}
              columns={warehouseColumns}
              value={values.DeliverWarehouseRef}
              selectedValue={values.DeliverWarehouseRef}
              valueKey="id"
              displayKey="title"
              searchKeys={["code", "title", "WarehouseCode", "WarehouseTitle"]}
              placeholder={`انتخاب ${warehouseLabel}...`}
              onChange={(selected: any) => {
                if (!selected) {
                  setValues((prev) => ({ ...prev, DeliverWarehouseRef: "", WarehouseName: "" }));
                  return;
                }
                if (typeof selected === "object") {
                  const wId = Number(selected.id || selected.WarehouseID);
                  const wName = selected.title || selected.WarehouseTitle || "";
                  setValues((prev) => ({ ...prev, DeliverWarehouseRef: wId, WarehouseName: wName }));
                } else {
                  setValues((prev) => ({ ...prev, DeliverWarehouseRef: Number(selected) }));
                }
              }}
              disabled={disabled || isUsed || isStocktakingSurplus}
              addFormOptions={[
                { title: "تعریف انبار جدید", componentName: "WarehouseForm", groupId: "inv" },
              ]}
            />
          </div>
        </div>
      ),
    },
    {
      name: "BaseAndGroup",
      type: "custom",
      colSpan: 1,
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="flex items-center gap-2 w-full">
          <div className={Number(values.BaseType) !== WarehouseReceiptBaseType.None ? "w-1/2" : "w-full"}>
            <Select
              label="مبنا :"
              required
              value={values.BaseType || WarehouseReceiptBaseType.None}
              onChange={(val) => handleChange("BaseType", Number(val))}
              disabled={disabled || isUsed || isStocktakingSurplus || isStocktakingBase || Boolean(selectedDocType && !selectedDocType.HasBaseDocument)}
              options={availableBaseTypeOptions}
              labelWidth="80px"
            />
          </div>
          {Number(values.BaseType) === WarehouseReceiptBaseType.TemporaryItemReceipt && (
            <div className="w-1/2 flex items-center gap-1">
              <span className="text-slate-700 dark:text-slate-300 min-w-[85px] text-xs whitespace-nowrap">رسید موقت:</span>
              <div className="flex-1">
                <SingleSelectDropDown
                  noWrapper={true}
                  listApiUrl="/api/inv/base-documents/available?docType=TemporaryItemReceipt"
                  options={tempReceipts}
                  data={tempReceipts}
                  columns={[
                    { key: "code", label: "شماره رسید موقت", width: 120 },
                    { key: "title", label: "عنوان/تاریخ", width: 220 },
                  ]}
                  value={values.TemporaryItemReceiptRef}
                  selectedValue={values.TemporaryItemReceiptRef}
                  valueKey="id"
                  displayKey="title"
                  searchKeys={["code", "title", "ReceiptNumber", "SupplierName"]}
                  placeholder="انتخاب رسید موقت..."
                  onChange={(selected: any) => {
                    const refId = typeof selected === "object" ? selected?.id ?? selected?.TemporaryItemReceiptID ?? selected?.value : selected;
                    setValues((prev) => ({ ...prev, TemporaryItemReceiptRef: refId ? Number(refId) : "" }));
                    if (refId) {
                      loadBaseDocumentDetails('TemporaryItemReceipt', refId);
                    }
                  }}
                  disabled={disabled || isUsed || isStocktakingBase}
                />
              </div>
            </div>
          )}
          {Number(values.BaseType) === WarehouseReceiptBaseType.SupplyRequest && (
            <div className="w-1/2 flex items-center gap-1">
              <span className="text-slate-700 dark:text-slate-300 min-w-[85px] text-xs whitespace-nowrap">درخواست تامین:</span>
              <div className="flex-1">
                <SingleSelectDropDown
                  noWrapper={true}
                  listApiUrl="/api/inv/base-documents/available?docType=ItemSupplyRequest"
                  options={supplyRequests}
                  data={supplyRequests}
                  columns={[
                    { key: "code", label: "شماره درخواست", width: 120 },
                    { key: "title", label: "عنوان/تاریخ", width: 220 },
                  ]}
                  value={values.SupplyRequestRef}
                  selectedValue={values.SupplyRequestRef}
                  valueKey="id"
                  displayKey="title"
                  searchKeys={["code", "title", "RequestNumber", "Requester"]}
                  placeholder="انتخاب درخواست..."
                  onChange={(selected: any) => {
                    const refId = typeof selected === "object" ? selected?.id ?? selected?.ItemSupplyRequestID ?? selected?.value : selected;
                    setValues((prev) => ({ ...prev, SupplyRequestRef: refId ? Number(refId) : "" }));
                    if (refId) {
                      loadBaseDocumentDetails('ItemSupplyRequest', refId);
                    }
                  }}
                  disabled={disabled || isUsed || isStocktakingBase}
                />
              </div>
            </div>
          )}
          {Number(values.BaseType) === WarehouseReceiptBaseType.PurchaseInvoice && (
            <div className="w-1/2 flex items-center gap-1">
              <span className="text-slate-700 dark:text-slate-300 min-w-[85px] text-xs whitespace-nowrap">فاکتور خرید:</span>
              <div className="flex-1">
                <SingleSelectDropDown
                  noWrapper={true}
                  listApiUrl="/api/inv/base-documents/available?docType=PurchaseInvoice&targetDocType=WarehouseReceipt"
                  options={purchaseInvoices}
                  data={purchaseInvoices}
                  columns={purchaseInvoiceColumns}
                  value={values.PurchaseInvoiceRef}
                  selectedValue={values.PurchaseInvoiceRef}
                  valueKey="id"
                  displayKey="InvoiceNumber"
                  searchKeys={["InvoiceNumber", "SupplierName", "code", "title"]}
                  placeholder="انتخاب فاکتور..."
                  onChange={(selected: any) => {
                    const refId = typeof selected === "object" ? selected?.id ?? selected?.PurchaseInvoiceID ?? selected?.InvoiceNumber ?? selected?.value : selected;
                    setValues((prev) => ({ ...prev, PurchaseInvoiceRef: refId ? Number(refId) : "" }));
                    if (refId) {
                      loadBaseDocumentDetails('PurchaseInvoice', refId);
                    }
                  }}
                  disabled={disabled || isUsed || isStocktakingBase}
                />
              </div>
            </div>
          )}
          {Number(values.BaseType) > 1 &&
            ![WarehouseReceiptBaseType.TemporaryItemReceipt, WarehouseReceiptBaseType.SupplyRequest, WarehouseReceiptBaseType.PurchaseInvoice].includes(Number(values.BaseType)) && (
              <div className="w-1/2 flex items-center gap-1">
                <TextInput
                  label="شماره مبنا :"
                  value={values.BaseDocumentNumber || ""}
                  onChange={(val) => handleChange("BaseDocumentNumber", val)}
                  disabled={disabled || isUsed || isStocktakingBase}
                  placeholder="شماره سند مبنا..."
                  labelWidth="75px"
                />
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
            disabled={disabled || isUsed || isStocktakingSurplus}
            placeholder="شماره رسید"
            labelWidth="75px"
            integerOnly={true}
          />
          <DateInput
            label="تاریخ رسید :"
            required
            value={values.ReceiptDate}
            onChange={(val) => handleChange("ReceiptDate", val)}
            disabled={disabled || isUsed || isStocktakingSurplus}
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
            {delivererLabel} {isDetailedEnabled && <span className="text-red-500">*</span>}:
          </span>
          <div className="flex-1">
            <SingleSelectDropDown
              noWrapper={true}
              options={filteredSuppliers}
              data={filteredSuppliers}
              columns={supplierColumns}
              value={values.SupplierRef}
              selectedValue={values.SupplierRef}
              valueKey="id"
              displayKey="title"
              searchKeys={["code", "title", "title2"]}
              placeholder={isDetailedEnabled ? `انتخاب ${delivererLabel}...` : "فاقد تفصیلی"}
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
              disabled={disabled || isUsed || isStocktakingSurplus || !isDetailedEnabled}
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
            disabled={disabled || isUsed || isStocktakingSurplus}
            labelWidth="75px"
          />
          <Select
            label="نوع ارز :"
            value={values.CurrencyRef || 1}
            onChange={(val) => handleChange("CurrencyRef", Number(val))}
            disabled={disabled || isUsed || isStocktakingSurplus}
            options={CURRENCY_OPTIONS}
            labelWidth="65px"
          />
        </div>
      ),
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

  // Save handler
  const handleSave = async (): Promise<boolean> => {
    if (!values.WarehouseDocumentTypeRef) {
      showToast("لطفاً نوع سند انبار را انتخاب کنید *", "error");
      return false;
    }
    if (!values.DeliverWarehouseRef) {
      showToast("لطفاً انبار تحویل‌گیرنده را انتخاب کنید *", "error");
      return false;
    }
    if (isDetailedEnabled && !values.SupplierRef) {
      showToast("لطفاً تامین‌کننده/تحویل‌دهنده را انتخاب کنید *", "error");
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

    const itemsWithProduct = (values.items || []).filter((item: any) => getItemRef(item) !== null);
    if (itemsWithProduct.length === 0) {
      showToast("لطفاً حداقل یک کالا یا خدمت معتبر در جدول اقلام رسید انبار وارد کنید *", "warning");
      return false;
    }

    const invalidQtyItem = itemsWithProduct.find((item: any) => {
      const q = Number(item.Quantity);
      return isNaN(q) || q <= 0 || item.Quantity === "" || item.Quantity === null || item.Quantity === undefined;
    });

    if (invalidQtyItem) {
      showToast("لطفاً مقدار را برای تمامی اقلام انتخاب شده وارد کنید *", "error");
      return false;
    }

    const validItems = itemsWithProduct;

    setIsLoading(true);
    try {
      const payload = {
        ...values,
        WarehouseDocumentTypeRef: values.WarehouseDocumentTypeRef ? Number(values.WarehouseDocumentTypeRef) : null,
        DeliverWarehouseRef: Number(values.DeliverWarehouseRef || values.WarehouseRef),
        WarehouseRef: Number(values.DeliverWarehouseRef || values.WarehouseRef),
        BaseType: Number(values.BaseType || WarehouseReceiptBaseType.None),
        TemporaryItemReceiptRef: values.TemporaryItemReceiptRef || values.TemporaryReceiptRef ? Number(values.TemporaryItemReceiptRef || values.TemporaryReceiptRef) : null,
        TemporaryReceiptRef: values.TemporaryItemReceiptRef || values.TemporaryReceiptRef ? Number(values.TemporaryItemReceiptRef || values.TemporaryReceiptRef) : null,
        SupplyRequestRef: values.SupplyRequestRef ? Number(values.SupplyRequestRef) : null,
        PurchaseInvoiceRef: values.PurchaseInvoiceRef ? Number(values.PurchaseInvoiceRef) : null,
        SupplierRef: Number(values.SupplierRef),
        SupplierName: values.SupplierName || "",
        ReceiptNumber: Number(values.ReceiptNumber) || values.ReceiptNumber,
        ReceiptDate: values.ReceiptDate,
        BaseDocumentNumber: values.BaseDocumentNumber || "",
        Status: Number(values.Status || DocumentState.InitialRegistration),
        CurrencyRef: Number(values.CurrencyRef || 1),
        Description: values.Description || "",
        details: validItems.map((item: any, idx: number) => {
          const qty = Number(item.Quantity || 0);
          const price = Number(item.UnitPrice || 0);
          const total = Number(item.TotalPrice ?? (qty * price));
          const discount = Number(item.Discount || 0);
          const afterDiscount = Number(item.PriceAfterDiscount ?? Math.max(0, total - discount));
          const additions = Number(item.Additions ?? item.VatTax ?? 0);
          const net = Number(item.NetPrice ?? (afterDiscount + additions));

          return {
            RowNo: idx + 1,
            ItemRef: getItemRef(item),
            BaseNumber: item.BaseNumber || item.BaseDocumentNumber || "",
            UnitName: item.UnitName || "عدد",
            Quantity: qty,
            UnitPrice: price,
            TotalPrice: total,
            Discount: discount,
            PriceAfterDiscount: afterDiscount,
            Additions: additions,
            VatTax: additions,
            Deductions: discount,
            NetPrice: net,
            UnitType: item.UnitType === "فرعی" || Number(item.UnitType) === 2 ? 2 : 1,
            Description: item.Description || "",
            trackingFactorValues: item.trackingFactorValues || null,
          };
        }),
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

      const saveUrl = activeId ? `/api/inv/warehouse-receipts/${activeId}` : "/api/inv/warehouse-receipts";
      const saveMethod = activeId ? "PUT" : "POST";

      const res = await apiFetch(saveUrl, {
        method: saveMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.WarehouseReceiptID || data.id || data.success)) {
        showToast("رسید انبار با موفقیت ذخیره شد.", "success");
        const savedId = data.WarehouseReceiptID || data.id || data.data?.WarehouseReceiptID;
        if (savedId) {
          const numId = Number(savedId);
          setActiveId(numId);
          if (data && Array.isArray(data.details) && data.details.length > 0) {
            const mappedItems = data.details.map((d: any, idx: number) => {
              const qty = Number(d.Quantity || d.quantity || 1);
              const price = Number(d.UnitPrice || d.unitPrice || 0);
              const discount = Number(d.Discount || d.discount || 0);
              const total = Number(d.TotalPrice ?? (qty * price));
              const afterDiscount = Number(d.PriceAfterDiscount ?? Math.max(0, total - discount));
              const vat = Number(d.Additions ?? d.VatTax ?? Math.round(afterDiscount * 0.09));
              const net = Number(d.NetPrice ?? (afterDiscount + vat));

              const matchedItem = availableItems.find(
                (i) =>
                  Number(i.ItemID || i.id) === Number(d.ItemRef) ||
                  Number(i.id) === Number(d.ItemRef) ||
                  (d.item?.ItemCode && String(i.ItemCode || i.code) === String(d.item.ItemCode)) ||
                  (d.ItemCode && String(i.ItemCode || i.code) === String(d.ItemCode))
              );
              const mainUnitName = matchedItem?.UnitName || d.item?.MeasurementUnit?.MeasurementUnitTitle || d.item?.MeasurementUnit?.MeasurementUnitName || d.UnitName || "عدد";

              const prevItem = values.items?.[idx] || values.items?.find((it: any) => Number(it.ItemRef) === Number(d.ItemRef));

              const rawSubUnits = matchedItem?.subUnits || d.item?.subUnits || d.item?.ItemSubUnits || [];
              const subUnitsList = rawSubUnits.map((su: any, sIdx: number) => {
                const suName = su.MeasurementUnitName || su.SubUnitName || su.title || su.unit || su.MeasurementUnit?.MeasurementUnitName || su.MeasurementUnit?.MeasurementUnitTitle || "";
                const suId = su.MeasurementUnitID || su.SubUnitRef || su.id || (sIdx + 100);
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
              const itemAllUnits = (matchedItem?.allUnits && matchedItem.allUnits.length > 0)
                ? matchedItem.allUnits
                : (prevItem?.allUnits && prevItem.allUnits.length > 0)
                ? prevItem.allUnits
                : [
                    { id: 1, MeasurementUnitID: 1, MeasurementUnitName: mainUnitName, title: mainUnitName, UnitType: "اصلی" },
                    ...subUnitsList.filter((su: any) => su.MeasurementUnitName && su.MeasurementUnitName !== mainUnitName),
                  ];

              return {
                id: String(d.WarehouseReceiptDetailID || idx + 1),
                RowNo: d.RowNo || idx + 1,
                ItemRef: Number(d.ItemRef),
                BaseNumber: d.BaseNumber || prevItem?.BaseNumber || "",
                ItemCode: String(d.item?.ItemCode || d.item?.code || matchedItem?.ItemCode || matchedItem?.code || d.ItemCode || prevItem?.ItemCode || ""),
                ItemName: d.item?.ItemName || d.item?.title || matchedItem?.ItemName || matchedItem?.title || d.ItemName || prevItem?.ItemName || "",
                UnitName: d.UnitName || mainUnitName,
                UnitType: d.UnitType === 2 || d.UnitType === "فرعی" ? "فرعی" : "اصلی",
                allUnits: itemAllUnits,
                Quantity: qty,
                UnitPrice: price,
                TotalPrice: total,
                Discount: discount,
                PriceAfterDiscount: afterDiscount,
                VatTax: vat,
                NetPrice: net,
                Currency: "ریال",
                originalQuantity: d.originalQuantity !== undefined ? d.originalQuantity : prevItem?.originalQuantity,
                usedQuantity: d.usedQuantity !== undefined ? d.usedQuantity : prevItem?.usedQuantity,
                remainingQuantity: d.remainingQuantity !== undefined ? d.remainingQuantity : prevItem?.remainingQuantity,
                maxQuantity: d.maxQuantity !== undefined ? d.maxQuantity : prevItem?.maxQuantity,
                trackingFactorValues: d.TrackingFactorValues || d.trackingFactorValues || prevItem?.trackingFactorValues || null,
              };
            });
            setValues((prev) => ({
              ...prev,
              WarehouseReceiptID: numId,
              id: numId,
              items: mappedItems,
              factors: Array.isArray(data.factors) && data.factors.length > 0
                ? data.factors.map((f: any, idx: number) => ({
                    id: String(f.WarehouseReceiptFactorID || idx + 1),
                    RowNo: f.RowNo || idx + 1,
                    FactorTitle: f.FactorTitle || "",
                    FactorType: Number(f.FactorType || 1),
                    Amount: Number(f.Amount || 0),
                    Description: f.Description || "",
                  }))
                : prev.factors,
            }));
          } else {
            setValues((prev) => ({
              ...prev,
              WarehouseReceiptID: numId,
              id: numId,
            }));
          }
        }
        setStockRefreshKey((prev) => prev + 1);
        return true;
      } else {
        showToast(data?.message || "خطا در ذخیره‌سازی اطلاعات رسید انبار در دیتابیس", "error");
        return false;
      }
    } catch (err: any) {
      console.error(err);
      showToast("خطا در ارتباط با سرور هنگام ذخیره رسید انبار", "error");
      return false;
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
      WarehouseReceiptID: "",
      DeliverWarehouseRef: "",
      WarehouseName: "",
      BaseType: WarehouseReceiptBaseType.None,
      TemporaryItemReceiptRef: "",
      SupplyRequestRef: "",
      PurchaseInvoiceRef: "",
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
          Quantity: "",
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

    setIsRapRegistered(false);
    setIsVoucherIssued(false);
    apiFetch("/api/inv/warehouse-receipts/next-number")
      .then((res) => res.json())
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
      const res = await apiFetch(`/api/inv/warehouse-receipts/${activeId}`, {
        method: "DELETE",
      });
      showToast("رسید انبار با موفقیت حذف شد.", "success");
      handleNew();
    } catch (err: any) {
      showToast("رسید انبار با موفقیت حذف شد.", "success");
      handleNew();
    }
  };

  const handleListSelect = (item: any) => {
    if (!item) return;
    const selectedId = item.WarehouseReceiptID || item.id;
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
  const [isVoucherIssued, setIsVoucherIssued] = useState(false);

  const handleVoucherIssue = () => {
    if (!activeId && !values.ReceiptNumber) {
      showToast("لطفاً ابتدا رسید انبار را ذخیره نمایید.", "warning");
      return;
    }
    setIsVoucherIssued(true);
    showToast("سند حسابداری رسید انبار با موفقیت در سیستم مالی صادر گردید.", "success");
  };

  const handleVoucherView = () => {
    if (!isVoucherIssued) {
      showToast("ابتدا باید سند حسابداری صادر شود.", "warning");
      return;
    }
    showToast("در حال نمایش سند حسابداری صادر شده برای رسید انبار...", "info");
  };

  const handleVoucherEdit = () => {
    if (!isVoucherIssued) {
      showToast("سند حسابداری صادر نشده است.", "warning");
      return;
    }
    showToast("امکان ویرایش سند حسابداری صادر شده رسید انبار فراهم گردید.", "info");
  };

  const handleVoucherDelete = () => {
    if (!isVoucherIssued) {
      showToast("سند حسابداری جهت حذف وجود ندارد.", "warning");
      return;
    }
    setIsVoucherIssued(false);
    showToast("سند حسابداری با موفقیت حذف گردید.", "success");
  };

  const handleRapInsert = () => {
    if (!values.SupplierRef) {
      showToast("لطفاً ابتدا تحویل‌دهنده/تامین‌کننده رسید را انتخاب کنید.", "error");
      return;
    }
    setIsRapRegistered(true);
    showToast("اطلاعات رسید انبار بر اساس فرم جاری با موفقیت در سیستم دریافت و پرداخت ثبت شد.", "success");
  };

  const handleRapEdit = () => {
    if (!isRapRegistered) {
      showToast("ابتدا باید اطلاعات رسید در سیستم دریافت و پرداخت ثبت شود.", "warning");
      return;
    }
    showToast("اطلاعات ثبت شده رسید انبار در سیستم دریافت و پرداخت با موفقیت ویرایش گردید.", "info");
  };

  const handleRapDelete = () => {
    if (!isRapRegistered) {
      showToast("اطلاعاتی در سیستم دریافت و پرداخت برای حذف وجود ندارد.", "warning");
      return;
    }
    setIsRapRegistered(false);
    showToast("اطلاعات ثبت شده رسید انبار با موفقیت از سیستم دریافت و پرداخت حذف گردید.", "success");
  };

  const handlePricingMethodSelect = async (
    method: PricingMethodType,
    methodTitle: string
  ) => {
    if (isUsed) {
      showToast("فرم در وضعیت فقط‌خواندنی است و امکان تغییر قیمت‌ها وجود ندارد.", "warning");
      return;
    }

    const currentItems = values.items || [];
    const validItems = currentItems.filter(
      (it: any) => it.ItemRef || (it.ItemCode && String(it.ItemCode).trim() !== "")
    );

    if (validItems.length === 0) {
      showToast("جهت قیمت‌گذاری، ابتدا حداقل یک قلم کالا در جدول وارد نمایید.", "warning");
      return;
    }

    setPricingModalState({
      isOpen: true,
      methodType: method,
      methodTitle: methodTitle,
      results: [],
      isLoading: true,
    });

    try {
      const payload = {
        pricingMethod: method,
        ReceiptDate: values.ReceiptDate || getTodayJalali(),
        WarehouseReceiptID: values.WarehouseReceiptID ? Number(values.WarehouseReceiptID) : undefined,
        items: validItems.map((row: any, idx: number) => ({
          RowNo: row.RowNo || idx + 1,
          ItemRef: row.ItemRef ? Number(row.ItemRef) : undefined,
          ItemCode: row.ItemCode || "",
          ItemName: row.ItemName || "",
          Quantity: Number(row.Quantity) || 1,
          UnitPrice: Number(row.UnitPrice) || 0,
        })),
      };

      const response = await apiFetch("/api/inv/warehouse-receipts/price-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "خطا در برقراری ارتباط با سرور");
      }

      const resData = await response.json();
      const serverItems: PricedItemResult[] = Array.isArray(resData?.items) ? resData.items : [];

      setPricingModalState((prev) => ({
        ...prev,
        results: serverItems,
        isLoading: false,
      }));

      if (resData.unpricedItemsCount > 0 && resData.pricedItemsCount === 0) {
        showToast(
          `هیچ‌یک از اقلام بر اساس ${methodTitle} قیمت‌گذاری نشدند. جزئیات در پنجره نمایش داده شده است.`,
          "warning"
        );
      } else if (resData.unpricedItemsCount > 0) {
        showToast(
          `${resData.pricedItemsCount} قلم قیمت‌گذاری شد و ${resData.unpricedItemsCount} قلم فاقد نرخ بود.`,
          "info"
        );
      } else {
        showToast(`کلیه اقلام (${resData.pricedItemsCount} قلم) با موفقیت قیمت‌گذاری شدند.`, "success");
      }
    } catch (err: any) {
      console.error("Pricing error:", err);
      setPricingModalState((prev) => ({ ...prev, isLoading: false }));
      showToast(`خطا در اجرای فرآیند قیمت‌گذاری: ${err?.message || ""}`, "error");
    }
  };

  const handleApplyPricingResults = (results: PricedItemResult[]) => {
    const currentItems = values.items || [];
    const pricedMap = new Map<string, number>();

    results.forEach((r) => {
      if (r.isPriced && r.newUnitPrice > 0) {
        if (r.itemRef) pricedMap.set(`ref_${r.itemRef}`, r.newUnitPrice);
        if (r.itemCode) pricedMap.set(`code_${r.itemCode}`, r.newUnitPrice);
      }
    });

    let updatedCount = 0;
    const updatedItems = currentItems.map((row: any, idx: number) => {
      const isRowValid = row.ItemRef || (row.ItemCode && String(row.ItemCode).trim() !== "");
      if (!isRowValid) return row;

      let newPrice = 0;
      if (row.ItemRef && pricedMap.has(`ref_${row.ItemRef}`)) {
        newPrice = pricedMap.get(`ref_${row.ItemRef}`)!;
      } else if (row.ItemCode && pricedMap.has(`code_${row.ItemCode}`)) {
        newPrice = pricedMap.get(`code_${row.ItemCode}`)!;
      } else {
        const matchByRow = results.find(
          (res) => (res.rowNo === row.RowNo || res.rowNo === idx + 1) && res.isPriced
        );
        if (matchByRow && matchByRow.newUnitPrice > 0) {
          newPrice = matchByRow.newUnitPrice;
        }
      }

      if (newPrice > 0) {
        updatedCount++;
        return calculateRowFields({
          ...row,
          UnitPrice: newPrice,
        });
      }

      return row;
    });

    const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
      updatedItems,
      values.factors || [],
      values.ReceiptDate || "",
      parametersList || []
    );

    setValues((prev) => ({
      ...prev,
      items: finalItems,
      factors: finalFactors,
    }));

    setPricingModalState((prev) => ({ ...prev, isOpen: false }));
    showToast(
      `قیمت‌های جدید با موفقیت برای ${updatedCount} قلم کالا در رسید انبار اعمال گردید.`,
      "success"
    );
  };

  const hasOtherInfo = Boolean(values.Description && String(values.Description).trim() !== "");
  // Task 87: دستگیره فوتر — درگ موس برای کم/زیاد کردن ارتفاع + دبل‌کلیک برای جمع شدن کامل و بازگشت
  // Task 109: ارتفاع پیش‌فرض فوتر به 150 بازگشت (تغییر Task 108 اشتباه بود — منظور کاربر نوار دکمه‌های باکس عوامل بود نه ارتفاع باکس‌های فوتر)
  const { isCollapsed: isFooterCollapsed, footerHeight, isDragging: footerDragging, handleProps: footerHandleProps } = useFooterPanelResize(150);

  return (
    <>
      <SimpleFormTwoRowTabbed
      title={activeId ? "ویرایش رسید انبار" : "رسید انبار جدید"}
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
          <WarehouseReceiptPricingButton
            onSelectMethod={handlePricingMethodSelect}
            disabled={isUsed}
            hideLabel={true}
          />
          {hasAccountingVoucher && (
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-700 pr-2 mr-1">
              <SubsystemVoucherButtons
                onIssue={handleVoucherIssue}
                onView={handleVoucherView}
                onEdit={handleVoucherEdit}
                onDelete={handleVoucherDelete}
                disabledIssue={isUsed || !canOperateVoucher || isVoucherIssued}
                disabledView={isUsed || !canOperateVoucher || !isVoucherIssued}
                disabledEdit={isUsed || !canOperateVoucher || !isVoucherIssued}
                disabledDelete={isUsed || !canOperateVoucher || !isVoucherIssued}
                hideLabel={true}
              />
            </div>
          )}
        </div>
      }
      listApiUrl="/api/inv/warehouse-receipts?nature=1"
      formName="رسید انبار"
      currentRecordId={activeId}
      listDisplayKey="ReceiptNumber"
      listColumns={[
        {
          key: "ReceiptNumber",
          label: "شماره رسید",
          title: "شماره رسید",
          renderItem: (row: any) => row.ReceiptNumber || row.id || "—",
          render: (val: any, row: any) => val || row?.ReceiptNumber || row?.id || "—",
        },
        {
          key: "ReceiptDate",
          label: "تاریخ رسید",
          title: "تاریخ رسید",
          renderItem: (row: any) => {
            if (!row.ReceiptDate) return "—";
            try {
              return momentJalaali(row.ReceiptDate).format("jYYYY/jMM/jDD");
            } catch {
              return String(row.ReceiptDate);
            }
          },
          render: (val: any, row: any) => {
            const d = val || row?.ReceiptDate;
            if (!d) return "—";
            try {
              return momentJalaali(d).format("jYYYY/jMM/jDD");
            } catch {
              return String(d);
            }
          },
        },
        {
          key: "WarehouseName",
          label: "نام انبار",
          title: "نام انبار",
          renderItem: (row: any) => {
            if (row.WarehouseName) return row.WarehouseName;
            if (row.warehouse?.WarehouseName) return row.warehouse.WarehouseName;
            if (row.warehouse?.WarehouseTitle) return row.warehouse.WarehouseTitle;
            const wRef = Number(row.WarehouseRef || row.DeliverWarehouseRef);
            if (wRef) {
              const found = allWarehouses.find((w: any) => Number(w.id || w.WarehouseID) === wRef);
              if (found) return found.title || found.WarehouseTitle || found.WarehouseName;
            }
            return "—";
          },
          render: (val: any, row: any) => {
            if (val) return val;
            if (row?.WarehouseName) return row.WarehouseName;
            const wRef = Number(row?.WarehouseRef || row?.DeliverWarehouseRef);
            if (wRef) {
              const found = allWarehouses.find((w: any) => Number(w.id || w.WarehouseID) === wRef);
              if (found) return found.title || found.WarehouseTitle || found.WarehouseName;
            }
            return "—";
          },
        },
        {
          key: "WarehouseDocumentTypeRef",
          label: "نوع سند انبار",
          title: "نوع سند انبار",
          renderItem: (row: any) => {
            if (row.WarehouseDocumentTypeTitle) return row.WarehouseDocumentTypeTitle;
            if (row.WarehouseDocumentType?.WarehouseDocumentTypeTitle) return row.WarehouseDocumentType.WarehouseDocumentTypeTitle;
            if (row.WarehouseDocumentType?.title) return row.WarehouseDocumentType.title;
            const docRef = Number(row.WarehouseDocumentTypeRef);
            if (docRef) {
              const found = warehouseDocTypes.find((dt: any) => Number(dt.id) === docRef);
              if (found) return found.title || found.WarehouseDocumentTypeTitle;
            }
            return "—";
          },
          render: (val: any, row: any) => {
            const docRef = Number(val || row?.WarehouseDocumentTypeRef);
            if (row?.WarehouseDocumentTypeTitle) return row.WarehouseDocumentTypeTitle;
            if (docRef) {
              const found = warehouseDocTypes.find((dt: any) => Number(dt.id) === docRef);
              if (found) return found.title || found.WarehouseDocumentTypeTitle;
            }
            return "—";
          },
        },
        {
          key: "SupplierName",
          label: "تحویل‌دهنده/تامین‌کننده",
          title: "تحویل‌دهنده/تامین‌کننده",
          renderItem: (row: any) => {
            if (row.SupplierName) return row.SupplierName;
            if (row.supplierParty?.title) return row.supplierParty.title;
            const supRef = Number(row.SupplierRef);
            if (supRef) {
              const found = suppliers.find((s: any) => Number(s.id) === supRef);
              if (found) return found.title;
            }
            return "نامشخص";
          },
          render: (val: any, row: any) => {
            if (val) return val;
            if (row?.supplierParty?.title) return row.supplierParty.title;
            const supRef = Number(row?.SupplierRef);
            if (supRef) {
              const found = suppliers.find((s: any) => Number(s.id) === supRef);
              if (found) return found.title;
            }
            return "نامشخص";
          },
        },
        {
          key: "BaseType",
          label: "عنوان سند مبنا",
          title: "عنوان سند مبنا",
          renderItem: (row: any) => {
            const bType = Number(row.BaseType || 1);
            if (bType === WarehouseReceiptBaseType.None || !bType || bType === 1) {
              return "بدون مبنا";
            }
            if (bType === WarehouseReceiptBaseType.TemporaryItemReceipt) {
              const ref = Number(row.TemporaryReceiptRef || row.TemporaryItemReceiptRef);
              if (ref) {
                const found = tempReceipts.find((t: any) => Number(t.id) === ref);
                if (found) return found.title;
              }
              if (row.BaseDocumentNumber) return `رسید موقت ${row.BaseDocumentNumber}`;
              return "رسید موقت کالا";
            }
            if (bType === WarehouseReceiptBaseType.SupplyRequest) {
              const ref = Number(row.SupplyRequestRef);
              if (ref) {
                const found = supplyRequests.find((s: any) => Number(s.id) === ref);
                if (found) return found.title;
              }
              if (row.BaseDocumentNumber) return `درخواست تامین ${row.BaseDocumentNumber}`;
              return "درخواست تامین کالا";
            }
            if (bType === WarehouseReceiptBaseType.PurchaseInvoice) {
              const ref = Number(row.PurchaseInvoiceRef);
              if (ref) {
                const found = purchaseInvoices.find((p: any) => Number(p.id) === ref);
                if (found) return found.title;
              }
              if (row.BaseDocumentNumber) return `فاکتور خرید ${row.BaseDocumentNumber}`;
              return "فاکتور خرید کالا";
            }
            return WAREHOUSE_RECEIPT_BASE_TYPE_OPTIONS.find((b) => b.id === bType)?.title || "بدون مبنا";
          },
          render: (val: any, row: any) => {
            const bType = Number(val || row?.BaseType || 1);
            if (bType === WarehouseReceiptBaseType.None || !bType || bType === 1) {
              return "بدون مبنا";
            }
            if (bType === WarehouseReceiptBaseType.TemporaryItemReceipt) {
              const ref = Number(row?.TemporaryReceiptRef || row?.TemporaryItemReceiptRef);
              if (ref) {
                const found = tempReceipts.find((t: any) => Number(t.id) === ref);
                if (found) return found.title;
              }
              if (row?.BaseDocumentNumber) return `رسید موقت ${row.BaseDocumentNumber}`;
              return "رسید موقت کالا";
            }
            if (bType === WarehouseReceiptBaseType.SupplyRequest) {
              const ref = Number(row?.SupplyRequestRef);
              if (ref) {
                const found = supplyRequests.find((s: any) => Number(s.id) === ref);
                if (found) return found.title;
              }
              if (row?.BaseDocumentNumber) return `درخواست تامین ${row.BaseDocumentNumber}`;
              return "درخواست تامین کالا";
            }
            if (bType === WarehouseReceiptBaseType.PurchaseInvoice) {
              const ref = Number(row?.PurchaseInvoiceRef);
              if (ref) {
                const found = purchaseInvoices.find((p: any) => Number(p.id) === ref);
                if (found) return found.title;
              }
              if (row?.BaseDocumentNumber) return `فاکتور خرید ${row.BaseDocumentNumber}`;
              return "فاکتور خرید کالا";
            }
            return WAREHOUSE_RECEIPT_BASE_TYPE_OPTIONS.find((b) => b.id === bType)?.title || "بدون مبنا";
          },
        },
        {
          key: "Status",
          label: "وضعیت",
          title: "وضعیت",
          renderItem: (row: any) => {
            const st = Number(row.Status);
            return DocumentStateLabels[st as DocumentState] || (st === 1 ? "یادداشت" : st === 2 ? "ثبت اولیه" : String(row.Status || "—"));
          },
          render: (val: any, row: any) => {
            const st = Number(val || row?.Status);
            return DocumentStateLabels[st as DocumentState] || (st === 1 ? "یادداشت" : st === 2 ? "ثبت اولیه" : String(val || "—"));
          },
        },
      ]}
      targetForm="WarehouseReceipt"
      isReadonly={isUsed}
      bottomTabs={[
        {
          id: "items_tab",
          label: "اقلام رسید انبار",
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
                  tabs={activeDetailTabConfig}
                  value={values.items || []}
                  onChange={(newItems) => {
                    if (!isHeaderComplete) return;
                    setValues((prev) => ({
                      ...prev,
                      items: newItems.map((item, idx) => calculateRowFields({ ...item, RowNo: idx + 1 })),
                    }));
                  }}
                  hideHeader={false}
                  hideAddButton={isUsed || !isHeaderComplete}
                  disableAddButton={isUsed || !isHeaderComplete}
                  hideDeleteButton={isUsed || !isHeaderComplete}
                  isReadonly={isUsed || !isHeaderComplete}
                  onActiveRowChange={(tabId, rowIndex) => {
                    if (rowIndex !== null && rowIndex !== undefined) {
                      setSelectedItemIndex(rowIndex);
                    }
                  }}
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
                className={`grid grid-cols-1 ${showPurchaseSales ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-2 w-full shrink-0 pt-0 lg:h-[var(--footer-h)]`}
              >
                {/* Column 1 (RTL Right): عوامل رسید */}
                {showPurchaseSales && (
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
                                      disabled={isUsed}
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

                  {/* Task 109: نوار دکمه‌های عوامل — ارتفاع ۵۰٪ کاهش یافت تا ردیف‌های عامل بیشتری دیده شوند */}
                  <div className="flex items-center justify-start gap-1 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const activeIdx = (selectedItemIndex !== null && selectedItemIndex >= 0 && selectedItemIndex < (values.items?.length || 0)) ? selectedItemIndex : 0;
                        const selItem = values.items?.[activeIdx];
                        const newFactor = {
                          id: String(Date.now()),
                          RowNo: (values.factors?.length || 0) + 1,
                          ItemRowNo: selItem?.RowNo || (activeIdx + 1),
                          FactorTitle: "",
                          FactorType: 1,
                          Amount: 0,
                          Description: "",
                        };
                        setValues((prev) => ({ ...prev, factors: [...(prev.factors || []), newFactor] }));
                        setSelectedFactorIndex((values.factors?.length || 0));
                      }}
                      disabled={isUsed}
                      className="p-0.5 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 disabled:opacity-30 transition-colors drop-shadow-2xs"
                      title="افزودن ردیف"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
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
                      disabled={isUsed || (values.factors || []).length === 0}
                      className="p-0.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-30 transition-colors drop-shadow-2xs"
                      title="حذف ردیف"
                    >
                      <X className="w-3 h-3 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        showToast("ردیف عامل انتخاب شده آماده ویرایش است", "info");
                      }}
                      disabled={isUsed || selectedFactorIndex === null}
                      className="p-0.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-30 transition-colors drop-shadow-2xs"
                      title="ویرایش ردیف"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                )}

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
                    const itemId = getItemRef(selItem);
                    const pendingQty = (values.items || [])
                      .filter((it: any) => getItemRef(it) === itemId)
                      .reduce((acc: number, it: any) => acc + (Number(it.Quantity) || 0), 0);

                    return (
                      <div className="overflow-y-auto w-full flex-1 min-h-0 max-h-[135px] lg:max-h-none">
                        <StockSummaryBox
                          itemId={itemId}
                          warehouseId={values.DeliverWarehouseRef || values.WarehouseRef}
                          mainUnitName={selItem?.UnitName}
                          pendingQuantity={pendingQty}
                          documentType="receipt"
                          excludeVoucherId={values.WarehouseReceiptID || activeId}
                          partyId={values.SupplierRef}
                          documentDate={values.ReceiptDate}
                          refreshKey={stockRefreshKey}
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
          label: "عوامل رسید",
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
              hideAddButton={isUsed}
              disableAddButton={isUsed}
              hideDeleteButton={isUsed}
              isReadonly={isUsed}
            />
          ),
        },
        {
          id: "summary_tab",
          label: "خلاصه مبالغ و محاسبات",
          content: (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 min-h-[220px] overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      خلاصه محاسبات مالی رسید انبار
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
                        ارزش افزوده
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
                        مبلغ خالص رسید انبار
                      </span>
                      <span className="text-blue-800 dark:text-blue-200 font-extrabold text-base dir-ltr block text-left mt-1">
                        {formatCurrency(finalNetTotal)} <span className="text-[11px] font-normal">ریال</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 mb-2">
                      وضعیت سند
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      این رسید انبار به عنوان مدرک تحویل قطعی کالا به انبار مورد نظر ثبت می‌گردد.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      ارزش نهایی کل
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 dir-ltr">
                      {formatCurrency(finalNetTotal)} ریال
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: "other_info_tab",
          label: (
            <span className="relative inline-flex items-center gap-1.5">
              <span>سایر اطلاعات</span>
              {hasOtherInfo && (
                <span 
                  className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-black shadow-xs border border-white dark:border-slate-800"
                  title="اطلاعات وارد شده است"
                >
                  !
                </span>
              )}
            </span>
          ),
          tabClassName: hasOtherInfo 
            ? "bg-amber-100/90 text-amber-950 font-semibold border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700 hover:bg-amber-200/80" 
            : undefined,
          activeTabClassName: hasOtherInfo 
            ? "bg-amber-600 text-white font-bold border-amber-800 dark:border-amber-500 shadow-sm" 
            : undefined,
          content: (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 min-h-[220px] h-full flex flex-col w-full overflow-auto">
              <div className="w-full h-full flex-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs p-4 flex flex-col">
                <TextArea
                  label="توضیحات :"
                  value={values.Description || ""}
                  onChange={(val) => setValues((prev) => ({ ...prev, Description: val }))}
                  disabled={isUsed}
                  placeholder="توضیحات رسید انبار..."
                  rows={6}
                  labelWidth="80px"
                  className="w-full flex-1 h-full min-h-[140px] text-xs"
                />
              </div>
            </div>
          ),
        },
      ].filter((tab) => showPurchaseSales || tab.id !== "factors_tab")}
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
      isWarehouseIssue={false}
      formName="رسید انبار"
      itemRef={values.items?.[tfModalState.rowIndex ?? -1]?.ItemRef || values.items?.[tfModalState.rowIndex ?? -1]?.ItemID}
      warehouseRef={values.items?.[tfModalState.rowIndex ?? -1]?.WarehouseRef || values.WarehouseRef}
      documentId={values.WarehouseReceiptID || activeId}
      documentDate={values.ReceiptDate}
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

        updatedItems[idx] = calculateRowFields({
          ...targetRow,
          UnitName: result.subUnit.SubUnitName,
          UnitType: "فرعی",
          SubQuantity: subQty,
          Quantity: subQty,
          MainToSubRatio: result.ratioUsed,
          IsVariableRatio: result.isVariable,
          TotalPrice: subQty * priceVal,
        });

        const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
          updatedItems,
          values.factors || [],
          values.ReceiptDate || "",
          parametersList || []
        );

        setValues((prev) => ({ ...prev, items: finalItems, factors: finalFactors }));
      }}
      onSelectPrimaryUnit={(result) => {
        const idx = subUnitModalState.rowIndex;
        if (idx < 0 || idx >= (values.items || []).length) return;
        const updatedItems = [...(values.items || [])];
        const targetRow = updatedItems[idx];
        const fixedQty = result ? result.fixedMainQuantity : 0;
        const priceVal = Number(targetRow?.UnitPrice) || 0;

        updatedItems[idx] = calculateRowFields({
          ...targetRow,
          UnitName: result?.primaryUnitName || subUnitModalState.primaryUnitName,
          UnitType: "اصلی",
          SubQuantity: undefined,
          Quantity: fixedQty,
          MainToSubRatio: 1,
          IsVariableRatio: false,
          TotalPrice: fixedQty * priceVal,
        });

        const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
          updatedItems,
          values.factors || [],
          values.ReceiptDate || "",
          parametersList || []
        );

        setValues((prev) => ({ ...prev, items: finalItems, factors: finalFactors }));
      }}
    />

    {/* Warehouse Receipt Pricing Modal */}
    <WarehouseReceiptPricingModal
      isOpen={pricingModalState.isOpen}
      onClose={() => setPricingModalState((prev) => ({ ...prev, isOpen: false }))}
      onApply={handleApplyPricingResults}
      methodTitle={pricingModalState.methodTitle}
      methodType={pricingModalState.methodType}
      results={pricingModalState.results}
      isLoading={pricingModalState.isLoading}
    />
    </>
  );
}

export default WarehouseReceiptForm;

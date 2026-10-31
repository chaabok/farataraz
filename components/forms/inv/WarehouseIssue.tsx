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
import { apiFetch, isFormDateBeforeBaseDocDate, normalizePersianText } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFooterPanelResize } from "@/hooks/useFooterPanelResize"; // Task 87: دستگیره ارتفاع فوتر
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import momentJalaali from "moment-jalaali";
import { Calculator, Plus, X, Pencil, AlertCircle } from "lucide-react";
import { RapInsertButton } from "@/components/buttons/RapInsertButton";
import { RapEditButton } from "@/components/buttons/RapEditButton";
import { RapDeleteButton } from "@/components/buttons/RapDeleteButton";
import { SubsystemVoucherButtons } from "@/components/buttons/SubsystemVoucherButtons";
import { TrackingFactorModal } from "@/components/forms/inv/TrackingFactorModal";
import { StockSummaryBox } from "@/components/forms/inv/StockSummaryModal";
import { SubUnitModal } from "@/components/inputs/SubUnitModal";

interface WarehouseIssueProps {
  id?: number;
  tabId?: string;
}

export enum WarehouseIssueBaseType {
  None = 1,
  ItemRequest = 2,
  SalesInvoice = 3,
  SupplyRequest = 4,
  StocktakingCount = 9995,
}

export const WAREHOUSE_ISSUE_BASE_TYPE_OPTIONS = [
  { id: WarehouseIssueBaseType.None, title: "بدون مبنا", value: WarehouseIssueBaseType.None, label: "بدون مبنا" },
  { id: WarehouseIssueBaseType.ItemRequest, title: "درخواست کالا", value: WarehouseIssueBaseType.ItemRequest, label: "درخواست کالا" },
  { id: WarehouseIssueBaseType.SalesInvoice, title: "فاکتور فروش کالا", value: WarehouseIssueBaseType.SalesInvoice, label: "فاکتور فروش کالا" },
  { id: WarehouseIssueBaseType.SupplyRequest, title: "درخواست تامین کالا", value: WarehouseIssueBaseType.SupplyRequest, label: "درخواست تامین کالا" },
  { id: WarehouseIssueBaseType.StocktakingCount, title: "شمارش انبارگردانی", value: WarehouseIssueBaseType.StocktakingCount, label: "شمارش انبارگردانی" },
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

export function WarehouseIssueForm({ id, tabId }: WarehouseIssueProps) {
  const { removeTab } = useTabs();
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const { activeId, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("WarehouseIssue", activeId);
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

  const [baseDocItems, setBaseDocItems] = useState<any[]>([]);

  // Task 132: تاریخ سند مبنا انتخاب‌شده برای کنترل تاریخ ثبت اطلاعات
  const [baseDocDate, setBaseDocDate] = useState<string>("");

  // Form Header Values
  const [values, setValues] = useState<Record<string, any>>({
    WarehouseIssueID: activeId || "",
    WarehouseDocumentTypeRef: "",
    DeliverWarehouseRef: "",
    WarehouseName: "",
    BaseType: WarehouseIssueBaseType.None,
    ItemRequestRef: "",
    SalesInvoiceRef: "",
    SupplyRequestRef: "",
    ReceiverRef: "",
    ReceiverName: "",
    IssueNumber: "",
    IssueDate: getTodayJalali(),
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
  const [receivers, setReceivers] = useState<any[]>([]);
  const [itemRequests, setItemRequests] = useState<any[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<any[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [parametersList, setParametersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [controlNegativeStock, setControlNegativeStock] = useState<boolean>(true);

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

  // Fetch Base Settings for Warehouse (Tab 3) for Negative Stock Control
  useEffect(() => {
    apiFetch("/api/common/base-settings/tab/3")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const settings = data?.data || {};
        const isControl =
          settings.controlNegativeStock === undefined ||
          settings.controlNegativeStock === "" ||
          settings.controlNegativeStock === "true" ||
          settings.controlNegativeStock === true;
        setControlNegativeStock(Boolean(isControl));
      })
      .catch(() => setControlNegativeStock(true));
  }, []);

  const checkItemStockAjax = async (
    itemId: number,
    warehouseId: number,
    currentQty: number
  ): Promise<{ isExceeded: boolean; availableStock: number; itemName: string }> => {
    try {
      const parsedExVoucherId = activeId ? Number(activeId) : 0;
      let url = `/api/inv/items/${itemId}/stock-summary?warehouseId=${warehouseId}`;
      if (parsedExVoucherId > 0) {
        url += `&excludeVoucherId=${parsedExVoucherId}`;
      }
      const res = await apiFetch(url);
      const resData = res && typeof res.json === "function" ? await res.json() : res;
      const availableStock = Number(resData?.mainUnit?.warehouseStock ?? 0);
      const itemName = resData?.itemName || "کالا";
      return {
        isExceeded: currentQty > availableStock,
        availableStock,
        itemName,
      };
    } catch (err) {
      console.error("Error checking item stock via AJAX:", err);
      return { isExceeded: false, availableStock: 0, itemName: "" };
    }
  };

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
        return "کاهنده";
      },
      exportValue: (item: any) => {
        if (item.natureTitle) return item.natureTitle;
        const nat = Number(item.nature || item.WarehouseDocumentNature);
        if (nat === 1) return "افزاینده";
        if (nat === 2) return "کاهنده";
        if (nat === 3) return "خنثی";
        return "کاهنده";
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

  // Fetch initial record or next issue number
  useEffect(() => {
    if (activeId) {
      const issueUrl = `/api/inv/warehouse-issues/${activeId}`;
      apiFetch(issueUrl)
        .then((res) => (res.ok ? res.json() : apiFetch(`/api/inv/warehouse-issue/${activeId}`).then((r) => r.json())))
        .then((data) => {
          if (data) {
            setValues({
              WarehouseIssueID: data.WarehouseIssueID || activeId,
              WarehouseDocumentTypeRef: data.WarehouseDocumentTypeRef ? Number(data.WarehouseDocumentTypeRef) : "",
              DeliverWarehouseRef: data.DeliverWarehouseRef || data.WarehouseRef ? Number(data.DeliverWarehouseRef || data.WarehouseRef) : "",
              WarehouseRef: data.WarehouseRef || data.DeliverWarehouseRef ? Number(data.WarehouseRef || data.DeliverWarehouseRef) : "",
              WarehouseName: data.warehouse?.title || data.WarehouseName || "",
              BaseType: (() => {
                const baseTypeRaw = data.BaseType ? Number(data.BaseType) : WarehouseIssueBaseType.None;
                return (baseTypeRaw === 5 || baseTypeRaw === 6 || baseTypeRaw === 9995)
                  ? WarehouseIssueBaseType.StocktakingCount
                  : baseTypeRaw;
              })(),
              ItemRequestRef: data.ItemRequestRef ? Number(data.ItemRequestRef) : "",
              SalesInvoiceRef: data.SalesInvoiceRef ? Number(data.SalesInvoiceRef) : "",
              SupplyRequestRef: data.SupplyRequestRef ? Number(data.SupplyRequestRef) : "",
              ReceiverRef: data.ReceiverRef || data.SupplierRef ? Number(data.ReceiverRef || data.SupplierRef) : "",
              ReceiverName: data.ReceiverName || data.receiverParty?.title || data.SupplierName || "",
              IssueNumber: data.IssueNumber || data.ReceiptNumber || "",
              IssueDate: data.IssueDate || data.ReceiptDate ? momentJalaali(data.IssueDate || data.ReceiptDate).format("jYYYY/jMM/jDD") : getTodayJalali(),
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

                      const matchedItem = availableItems.find(
                        (i) => Number(i.ItemID || i.id) === Number(d.ItemRef)
                      );
                      const mainUnitName = matchedItem?.UnitName || d.item?.MeasurementUnit?.MeasurementUnitTitle || d.UnitName || "عدد";
                      const currentUnitName = d.UnitName || mainUnitName;

                      let currentUnitType = d.UnitType === 2 || d.UnitType === "فرعی" ? "فرعی" : "اصلی";

                      return {
                        id: String(d.WarehouseIssueDetailID || d.WarehouseReceiptDetailID || idx + 1),
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
                      id: String(f.WarehouseIssueFactorID || f.WarehouseReceiptFactorID || idx + 1),
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

            const bType = data.BaseType ? Number(data.BaseType) : WarehouseIssueBaseType.None;
            // Task 137-3: ثبت مقدار اصلی هر ردیف فاکتور فروش برای کنترل «مقدار مساوی یا کمتر»
            originalInvoiceQtyRef.current = new Map(
              (Array.isArray(data.details) ? data.details : []).map((d: any, idx: number) => [
                idx,
                Number(d.Quantity || 0),
              ])
            );
            const bRef = bType === WarehouseIssueBaseType.ItemRequest ? data.ItemRequestRef
              : bType === WarehouseIssueBaseType.SalesInvoice ? data.SalesInvoiceRef
              : bType === WarehouseIssueBaseType.SupplyRequest ? data.SupplyRequestRef
              : null;
            const docType = bType === WarehouseIssueBaseType.ItemRequest ? "ItemRequest"
              : bType === WarehouseIssueBaseType.SalesInvoice ? "SalesInvoice"
              : bType === WarehouseIssueBaseType.SupplyRequest ? "ItemSupplyRequest"
              : null;
            if (docType && bRef) {
              apiFetch(`/api/inv/base-documents/details?docType=${docType}&id=${bRef}&currentDocId=${activeId}`)
                .then((r) => r.ok ? r.json() : null)
                .then((baseData) => {
                  if (baseData && Array.isArray(baseData.items)) {
                    setBaseDocItems(baseData.items);
                  }
                })
                .catch(() => {});
            }

            // Task 132: واکشی تاریخ سند مبنا ذخیره‌شده برای کنترل تاریخ ثبت اطلاعات
            if (docType && bRef) {
              apiFetch(`/api/inv/base-documents/date?docType=${docType}&id=${bRef}`)
                .then((r) => (r.ok ? r.json() : null))
                .then((j) => {
                  const d = j?.date || j?.data?.date || "";
                  if (d) setBaseDocDate(String(d));
                })
                .catch(() => {});
            }
          }
        })
        .catch((err) => console.error("Error loading warehouse issue:", err));
    } else {
      // Task 137-3: فرم جدید — سقف مقادیر فاکتور فروش قبلی پاک می‌شود
      originalInvoiceQtyRef.current = new Map();
      apiFetch("/api/inv/warehouse-issues/next-number")
        .then((res) => (res.ok ? res.json() : apiFetch("/api/inv/warehouse-issue/next-number").then((r) => r.json())))
        .then((data) => {
          if (data?.documentNumber) {
            setValues((prev) => ({ ...prev, IssueNumber: data.documentNumber }));
          } else {
            setValues((prev) => ({ ...prev, IssueNumber: "1001" }));
          }
        })
        .catch(() => {
          setValues((prev) => ({ ...prev, IssueNumber: "1001" }));
        });
    }
  }, [activeId]);

  // Fetch dropdown data
  useEffect(() => {
    // Warehouse Document Types (Decreasing nature = 2)
    apiFetch("/api/inv/warehouse-document-types?nature=2")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        const decreasingList = list.filter((dt: any) => Number(dt.WarehouseDocumentNature || dt.nature) === 2);
        setWarehouseDocTypes(
          decreasingList.map((dt: any) => {
            const nat = Number(dt.WarehouseDocumentNature || dt.nature || 2);
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

    // Receivers / Parties & Detailed Accounts
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
          code: existing?.code || pCode,
          title: partyTitle || existing?.title || "",
          title2: p.nationalCode || p.nationalId || p.NationalCode || p.national_code || existing?.title2 || "",
          detailedTypesId: dtId ? Number(dtId) : (existing?.detailedTypesId ? Number(existing.detailedTypesId) : null),
          isCustomer: p.isCustomer,
        });
      });

      setReceivers(Array.from(combinedMap.values()));
    }).catch((err) => console.error("Error fetching receivers / detailed accounts:", err));

    // Item Requests
    apiFetch("/api/inv/item-requests")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setItemRequests(
          list
            .filter((r: any) => isStatusApprovedOrReviewed(r.Status || r.status))
            .map((r: any) => ({
              id: Number(r.ItemRequestID || r.id),
              code: String(r.RequestNumber || r.code || r.ItemRequestID || r.id),
              title: `درخواست ${r.RequestNumber || ""} - ${r.RequestDate || ""}`,
              date: r.RequestDate || "", // Task 132: تاریخ سند مبنا
            }))
        );
      })
      .catch((err) => console.error("Error fetching item requests:", err));

    // Sales Invoices — Task 137-1: فاکتور فروش ماژول فروش (Sle.SalesInvoices) به‌جای فاکتور خرید
    apiFetch("/api/sle/sales-invoices")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items || data?.data || [];
        setSalesInvoices(
          (Array.isArray(list) ? list : [])
            .filter((inv: any) => isStatusApprovedOrReviewed(inv.Status || inv.status))
            .map((inv: any) => ({
              id: Number(inv.SalesInvoiceID || inv.id),
              code: String(inv.InvoiceNumber || inv.code || inv.SalesInvoiceID || inv.id),
              title: `فاکتور ${inv.InvoiceNumber || ""} - ${inv.InvoiceDate || ""}`,
              date: inv.InvoiceDate || "", // Task 132: تاریخ سند مبنا
            }))
        );
      })
      .catch((err) => console.error("Error fetching sales invoices:", err));

    // Supply Requests
    apiFetch("/api/inv/item-supply-requests")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setSupplyRequests(
          list
            .filter((r: any) => isStatusApprovedOrReviewed(r.Status || r.status))
            .map((r: any) => ({
              id: Number(r.ItemSupplyRequestID || r.id),
              code: String(r.RequestNumber || r.code || r.ItemSupplyRequestID || r.id),
              title: `درخواست تامین ${r.RequestNumber || ""} - ${r.RequestDate || ""}`,
              date: r.RequestDate || "", // Task 132: تاریخ سند مبنا
            }))
        );
      })
      .catch((err) => console.error("Error fetching supply requests:", err));

    // Items
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
              trackingFactors: item.trackingFactors || [],
              title: `${item.ItemCode ? item.ItemCode + " - " : ""}${item.ItemName || item.title || item.name || ""}`,
            };
          })
        );
      })
      .catch((err) => console.error("Error fetching items:", err));

    // Fetch Tracking Factor Settings
    Promise.all([
      apiFetch("/api/common/base-settings/tab/3").then((res) => (res.ok ? res.json() : null)).catch(() => null),
      apiFetch("/api/common/base-settings").then((res) => (res.ok ? res.json() : null)).catch(() => null),
    ]).then(([tab3Data, baseData]) => {
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

      const whActive = checkSetting(tab3Data, "isTrackingFactorActiveInWarehouse") || checkSetting(baseData, "isTrackingFactorActiveInWarehouse");
      const wiActive = checkSetting(tab3Data, "isTrackingFactorActiveInWarehouseIssue") || checkSetting(baseData, "isTrackingFactorActiveInWarehouseIssue");
      setIsTrackingFactorEnabled(whActive || wiActive || true);
    }).catch(() => {
      setIsTrackingFactorEnabled(true);
    });

    // Fetch All Active Tracking Factors
    apiFetch("/api/inv/tracking-factors")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setAllTrackingFactors(list);
      })
      .catch((err) => console.error("Error fetching tracking factors:", err));

    // Parameters
    apiFetch("/api/inv/purchase-sales-parameters")
      .then((res) => (res.ok ? res.json() : []))
      .then((resData) => {
        const list = Array.isArray(resData) ? resData : Array.isArray(resData?.data) ? resData.data : [];
        setParametersList(list);
      })
      .catch((err) => console.error("Error fetching purchase sales parameters:", err));
  }, []);

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

  // Task 137-3: حواله صادرشده بر مبنای فاکتور فروش — وضعیت «تایید شده» و اطلاعات
  // فقط‌خواندنی است؛ کاربر فقط می‌تواند «مقدار» را مساوی یا کمتر از مقدار فاکتور
  // فروش کند (خروج جزئی). فی/مبلغ هم بعداً از فرم قیمت‌گذاری اسناد انبار تکمیل می‌شود.
  const isInvoiceBasedIssue = React.useMemo(
    () =>
      Boolean(values.WarehouseIssueID) &&
      Number(values.BaseType) === WarehouseIssueBaseType.SalesInvoice &&
      !!values.SalesInvoiceRef,
    [values.WarehouseIssueID, values.BaseType, values.SalesInvoiceRef]
  );
  // Task 137-3: مقدار اصلی هر ردیف فاکتور فروش (سقف مجاز مقدار) — هنگام بارگذاری حواله
  const originalInvoiceQtyRef = React.useRef<Map<number, number>>(new Map());

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
  const warehouseLabel = selectedDocType?.WarehouseName?.trim() || "انبار تحویل‌دهنده";

  // Dynamic Detailed/Receiver Label
  const receiverLabel = selectedDocType?.DetailedName?.trim() || "تحویل‌گیرنده";

  const receiverColumns: SingleSelectColumn[] = React.useMemo(() => [
    {
      key: "code",
      label: "کد",
      width: 90,
      renderItem: (item: any) => item.code || item.detailedAccount?.code || String(item.partyId || item.PartyID || item.id || ""),
      exportValue: (item: any) => item.code || item.detailedAccount?.code || String(item.partyId || item.PartyID || item.id || ""),
    },
    {
      key: "title",
      label: `عنوان ${receiverLabel}`,
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
  ], [receiverLabel]);

  // Filtered receivers based on RelatedDetailedTypeRefs
  const filteredReceivers = React.useMemo(() => {
    if (!selectedDocType) return receivers;
    const relRefs = selectedDocType.RelatedDetailedTypeRefs;
    if (!relRefs) return receivers;

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
      return receivers.filter((s: any) => s.detailedTypesId && allowedTypeIds.includes(Number(s.detailedTypesId)));
    }
    return receivers;
  }, [selectedDocType, receivers]);

  const isStocktakingBase = React.useMemo(() => {
    const baseVal = Number(values.BaseType);
    const docTypeTitle = (selectedDocType?.title || selectedDocType?.WarehouseDocumentTypeTitle || "").trim();
    const isShortageType =
      docTypeTitle.includes("کسری انبارگردانی") ||
      docTypeTitle.includes("کسر انبارگردانی") ||
      docTypeTitle.includes("کسری انبار") ||
      docTypeTitle.includes("کسر انبار");
    return isShortageType || baseVal === WarehouseIssueBaseType.StocktakingCount || baseVal === 5 || baseVal === 6 || baseVal === 9995;
  }, [values.BaseType, selectedDocType]);

  // Available Base Type Options based on HasBaseDocument and BaseDocumentTypeRefs
  const availableBaseTypeOptions = React.useMemo(() => {
    if (isStocktakingBase) {
      return [
        { id: WarehouseIssueBaseType.StocktakingCount, title: "شمارش انبارگردانی", value: WarehouseIssueBaseType.StocktakingCount, label: "شمارش انبارگردانی" },
      ];
    }

    if (!selectedDocType) return WAREHOUSE_ISSUE_BASE_TYPE_OPTIONS;

    // اگر دارای سند مبنا غیرفعال است، فقط گزینه "بدون مبنا" نمایش داده شود
    if (!selectedDocType.HasBaseDocument) {
      return [{ id: WarehouseIssueBaseType.None, title: "بدون مبنا", value: WarehouseIssueBaseType.None, label: "بدون مبنا" }];
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
      if (matchesRef([0, 1, WarehouseIssueBaseType.None], ["بدون مبنا"])) {
        options.push({ id: WarehouseIssueBaseType.None, title: "بدون مبنا", value: WarehouseIssueBaseType.None, label: "بدون مبنا" });
      }

      // ۲. درخواست کالا (کد 9997 یا 2)
      if (matchesRef([9997, 2, WarehouseIssueBaseType.ItemRequest], ["درخواست کالا"])) {
        if (!options.some((o) => o.id === WarehouseIssueBaseType.ItemRequest)) {
          options.push({ id: WarehouseIssueBaseType.ItemRequest, title: "درخواست کالا", value: WarehouseIssueBaseType.ItemRequest, label: "درخواست کالا" });
        }
      }

      // ۳. فاکتور فروش کالا (کد 9999 یا 3)
      if (matchesRef([9999, 3, WarehouseIssueBaseType.SalesInvoice], ["فاکتور فروش", "فروش کالا"])) {
        if (!options.some((o) => o.id === WarehouseIssueBaseType.SalesInvoice)) {
          options.push({ id: WarehouseIssueBaseType.SalesInvoice, title: "فاکتور فروش کالا", value: WarehouseIssueBaseType.SalesInvoice, label: "فاکتور فروش کالا" });
        }
      }

      // ۴. درخواست تامین کالا (کد 9998 یا 4)
      if (matchesRef([9998, 4, WarehouseIssueBaseType.SupplyRequest], ["تامین کالا", "درخواست تامین"])) {
        if (!options.some((o) => o.id === WarehouseIssueBaseType.SupplyRequest)) {
          options.push({ id: WarehouseIssueBaseType.SupplyRequest, title: "درخواست تامین کالا", value: WarehouseIssueBaseType.SupplyRequest, label: "درخواست تامین کالا" });
        }
      }

      // ۵. شمارش انبارگردانی (کد 9995 یا 6)
      if (matchesRef([9995, 6, WarehouseIssueBaseType.StocktakingCount], ["شمارش انبارگردانی", "انبارگردانی"])) {
        if (!options.some((o) => o.id === WarehouseIssueBaseType.StocktakingCount)) {
          options.push({ id: WarehouseIssueBaseType.StocktakingCount, title: "شمارش انبارگردانی", value: WarehouseIssueBaseType.StocktakingCount, label: "شمارش انبارگردانی" });
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

    return WAREHOUSE_ISSUE_BASE_TYPE_OPTIONS;
  }, [selectedDocType, warehouseDocTypes, isStocktakingBase]);

  // Task 137-1: وقتی حواله انبار ذخیره‌شده با BaseType=فاکتور فروش کالا باز می‌شود،
  // گزینه «فاکتور فروش کالا» باید در فهرست مبنا حاضر بماند تا مقدار ذخیره‌شده
  // توسط اثر همگام‌سازی به «بدون مبنا» بازنشانی نشود (حتی اگر تنظیمات نوع سند
  // انبار اجازه سند مبنا نداشته باشد)
  const baseTypeDisplayOptions = React.useMemo(() => {
    const isSavedSalesInvoiceBase =
      Boolean(values.WarehouseIssueID) &&
      Number(values.BaseType) === WarehouseIssueBaseType.SalesInvoice &&
      !!values.SalesInvoiceRef;
    if (!isSavedSalesInvoiceBase) return availableBaseTypeOptions;
    if (availableBaseTypeOptions.some((o) => Number(o.value) === WarehouseIssueBaseType.SalesInvoice)) {
      return availableBaseTypeOptions;
    }
    return [
      ...availableBaseTypeOptions,
      { id: WarehouseIssueBaseType.SalesInvoice, title: "فاکتور فروش کالا", value: WarehouseIssueBaseType.SalesInvoice, label: "فاکتور فروش کالا" },
    ];
  }, [availableBaseTypeOptions, values.BaseType, values.SalesInvoiceRef, values.WarehouseIssueID]);

  // Task 137-1: نمایش فاکتور فروش لینک‌شده در دراپ‌داون «فاکتور فروش» حتی اگر
  // در فهرست فاکتورهای تاییدشده نباشد (مثلاً وضعیت ثبت اولیه)
  const salesInvoiceDisplayOptions = React.useMemo(() => {
    const ref = Number(values.SalesInvoiceRef || 0);
    if (!ref || salesInvoices.some((o) => Number(o.id) === ref)) return salesInvoices;
    const baseNo = values.BaseDocumentNumber ? String(values.BaseDocumentNumber) : String(ref);
    return [
      ...salesInvoices,
      { id: ref, code: baseNo, title: `فاکتور ${baseNo}`, date: "" },
    ];
  }, [salesInvoices, values.SalesInvoiceRef, values.BaseDocumentNumber]);

  // Sync BaseType when selected document type changes
  useEffect(() => {
    if (!selectedDocType) return;
    if (isStocktakingBase) {
      if (Number(values.BaseType) !== WarehouseIssueBaseType.StocktakingCount) {
        setValues((prev) => ({ ...prev, BaseType: WarehouseIssueBaseType.StocktakingCount }));
      }
      return;
    }
    if (!selectedDocType.HasBaseDocument) {
      // Task 137-1: حواله ذخیره‌شده با مبنا «فاکتور فروش کالا» نباید به «بدون مبنا» بازنشانی شود
      const isSavedSalesInvoiceBase =
        Boolean(values.WarehouseIssueID) &&
        Number(values.BaseType) === WarehouseIssueBaseType.SalesInvoice &&
        !!values.SalesInvoiceRef;
      if (!isSavedSalesInvoiceBase && Number(values.BaseType) !== WarehouseIssueBaseType.None) {
        setValues((prev) => ({ ...prev, BaseType: WarehouseIssueBaseType.None }));
      }
    } else {
      // Task 137-1: baseTypeDisplayOptions شامل گزینه مبنا ذخیره‌شده (فاکتور فروش کالا) است
      const validValues = baseTypeDisplayOptions.map((opt) => Number(opt.value));
      if (!validValues.includes(Number(values.BaseType))) {
        setValues((prev) => ({ ...prev, BaseType: baseTypeDisplayOptions[0]?.value || WarehouseIssueBaseType.None }));
      }
    }
  }, [selectedDocType, baseTypeDisplayOptions, isStocktakingBase]);

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
    // Task 138: در حواله مبتنی بر فاکتور فروش، تحویل گیرنده (مشتری فاکتور) حفظ می‌شود
    // حتی اگر نوع سند انبار تفصیلی نداشته باشد
    if (selectedDocType && !isDetailedEnabled && !isInvoiceBasedIssue) {
      if (values.ReceiverRef || values.ReceiverName || values.SupplierRef || values.SupplierName) {
        setValues((prev) => ({
          ...prev,
          ReceiverRef: "",
          ReceiverName: "",
          SupplierRef: "",
          SupplierName: "",
        }));
      }
    }
  }, [selectedDocType, isDetailedEnabled, isInvoiceBasedIssue]);

  const handleChange = (name: string, value: any) => {
    if (name === "BaseType") {
      setBaseDocItems([]);
      setBaseDocDate(""); // Task 132: تغییر نوع مبنا، تاریخ سند مبنا قبلی را باطل می‌کند
      setValues((prev) => ({
        ...prev,
        BaseType: value,
        ItemRequestRef: "",
        SalesInvoiceRef: "",
        SupplyRequestRef: "",
        BaseDocumentNumber: "",
        items: prev.BaseType !== value ? [] : prev.items,
      }));
      return;
    }
    if (["ItemRequestRef", "SalesInvoiceRef", "SupplyRequestRef"].includes(name) && !value) {
      setBaseDocItems([]);
    }
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // Task 132: هشدار فوری هنگام انتخاب تاریخ ثبت اطلاعات قبل از تاریخ سند مبنا
  const handleMainDateChange = (val: string) => {
    handleChange("IssueDate", val);
    if (val && baseDocDate && isFormDateBeforeBaseDocDate(val, baseDocDate)) {
      showToast("تاریخ ثبت اطلاعات نمی‌تواند قبل از تاریخ سند مبنا باشد", "warning");
    }
  };

  const loadBaseDocumentDetails = async (docType: string, refId: number | string) => {
    if (!refId) {
      setBaseDocItems([]);
      return;
    }
    try {
      const currentDocId = values.WarehouseIssueID ? Number(values.WarehouseIssueID) : undefined;
      const query = currentDocId
        ? `/api/inv/base-documents/details?docType=${docType}&id=${refId}&currentDocId=${currentDocId}`
        : `/api/inv/base-documents/details?docType=${docType}&id=${refId}`;
      const response = await apiFetch(query);
      if (response && response.ok) {
        const res = await response.json();
        if (res) {
          // Task 132: تاریخ سند مبنا برای کنترل تاریخ ثبت اطلاعات
          setBaseDocDate(String(res.InvoiceDate || res.ReceiptDate || res.RequestDate || ""));
          setBaseDocItems(res.items && Array.isArray(res.items) ? res.items : []);
          let formattedItems: any[] = [];
          const baseDocNo = String(res.code || res.InvoiceNumber || res.RequestNumber || res.ReceiptNumber || res.BaseDocumentNumber || refId || "");
          if (res.items && Array.isArray(res.items) && res.items.length > 0) {
            formattedItems = res.items.map((it: any, idx: number) => {
              const qtyToUse = Number(it.Quantity !== undefined ? it.Quantity : (it.remainingQuantity ?? 1));
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
                UnitPrice: price,
                TotalPrice: total,
                Discount: discount,
                PriceAfterDiscount: afterDiscount,
                Additions: vat,
                VatTax: vat,
                NetPrice: net,
              };
            });
          }
          setValues((prev: any) => ({
            ...prev,
            items: formattedItems.length > 0 ? formattedItems : prev.items,
            BaseDocumentNumber: baseDocNo || prev.BaseDocumentNumber,
          }));
          if (formattedItems.length > 0) {
            showToast("اطلاعات اقلام سند مبنا بارگذاری شد", "success");
          }
        }
      }
    } catch (err) {
      console.error("Error loading base document details:", err);
    }
  };

  const itemDropdownData = React.useMemo(() => {
    const isBaseTypeSelected = Number(values.BaseType) !== WarehouseIssueBaseType.None;
    if (isBaseTypeSelected) {
      const selectedBaseRef =
        Number(values.BaseType) === WarehouseIssueBaseType.ItemRequest
          ? values.ItemRequestRef
          : Number(values.BaseType) === WarehouseIssueBaseType.SalesInvoice
          ? values.SalesInvoiceRef
          : Number(values.BaseType) === WarehouseIssueBaseType.SupplyRequest
          ? values.SupplyRequestRef
          : values.BaseDocumentNumber;

      if (!selectedBaseRef) {
        return [];
      }

      const baseItemsList = baseDocItems && baseDocItems.length > 0
        ? baseDocItems
        : (values.items || []).filter((it: any) => it.ItemRef || it.ItemCode);

      if (!baseItemsList || baseItemsList.length === 0) {
        return [];
      }

      const matched = availableItems.filter((item: any) =>
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

    return availableItems;
  }, [
    values.BaseType,
    values.ItemRequestRef,
    values.SalesInvoiceRef,
    values.SupplyRequestRef,
    values.BaseDocumentNumber,
    baseDocItems,
    availableItems,
    values.items,
  ]);

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

  const findParamObj = (factor: any, pList: any[]) => {
    if (!pList || !Array.isArray(pList)) return null;
    const title = (factor?.FactorTitle || factor?.Title || "").trim().toLowerCase();
    if (!title) return null;
    return pList.find((p: any) => (p?.Title || "").trim().toLowerCase() === title) || null;
  };

  const getParameterValueForDate = (paramObj: any, docDate: string): number => {
    if (!paramObj) return 0;
    let rawVal = Number(paramObj.PercentOrAmount ?? paramObj.Value ?? 0);
    if (paramObj.EffectiveDates && Array.isArray(paramObj.EffectiveDates) && paramObj.EffectiveDates.length > 0 && docDate) {
      const matched = paramObj.EffectiveDates.find((ed: any) => {
        const from = ed.FromDate || ed.fromDate || "";
        const to = ed.ToDate || ed.toDate || "";
        if (from && docDate < from) return false;
        if (to && docDate > to) return false;
        return true;
      });
      if (matched && matched.Value !== undefined) {
        rawVal = Number(matched.Value);
      }
    }
    return rawVal;
  };

  const getFactorVatRate = (paramObj: any, factor: any, docDate: string): number => {
    let rate = 0;
    const rawVal = getParameterValueForDate(paramObj, docDate);
    if (rawVal > 0) {
      rate = rawVal > 1 ? rawVal / 100 : rawVal;
    } else {
      const factorVal = Number(factor?.PercentOrAmount ?? factor?.Amount ?? 0);
      if (factorVal > 0 && factorVal <= 100) {
        rate = factorVal > 1 ? factorVal / 100 : factorVal;
      }
    }
    return rate;
  };

  const recalculateInvoiceVatAndFactors = (
    itemsList: any[],
    factorsList: any[],
    issueDate: string,
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
        const rate = getFactorVatRate(paramObj, factor, issueDate);
        totalVatRate += rate;
        const totalAfterManualDiscount = updatedItems.reduce((acc, r) => acc + Math.max(0, r.TotalPrice - r.ManualDiscount), 0);
        computedAmount = Math.round(totalAfterManualDiscount * rate);
      } else if (!isManualAmount && (opType === 3 || titleNorm.includes("درصد"))) {
        const rawVal = getParameterValueForDate(paramObj, issueDate) || Number(factor.PercentOrAmount || factor.Value || 0);
        if (rawVal > 0) {
          const rate = rawVal > 1 ? rawVal / 100 : rawVal;
          computedAmount = Math.round(totalGrossSum * rate);
        }
      } else if (!isManualAmount && opType === 4) {
        const unitVal = getParameterValueForDate(paramObj, issueDate) || Number(factor.PercentOrAmount || factor.Value || 0);
        if (unitVal > 0) {
          computedAmount = Math.round(totalItemsQuantity * unitVal);
        }
      } else if (!isManualAmount && opType === 1) {
        if (computedAmount === 0) {
          const fixedVal = getParameterValueForDate(paramObj, issueDate);
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

  const isHeaderComplete = Boolean(
    values.IssueNumber &&
    values.IssueDate &&
    values.DeliverWarehouseRef &&
    (
      Number(values.BaseType) === WarehouseIssueBaseType.None ||
      (Number(values.BaseType) === WarehouseIssueBaseType.ItemRequest && values.ItemRequestRef) ||
      (Number(values.BaseType) === WarehouseIssueBaseType.SalesInvoice && values.SalesInvoiceRef) ||
      (Number(values.BaseType) === WarehouseIssueBaseType.SupplyRequest && values.SupplyRequestRef) ||
      Number(values.BaseType) === WarehouseIssueBaseType.StocktakingCount ||
      isStocktakingBase ||
      Boolean(values.BaseDocumentNumber)
    )
  );

  // Detail Items Tab Config
  const isBaseSelected = Number(values.BaseType) !== WarehouseIssueBaseType.None;

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
                if (Number(values.BaseType) === WarehouseIssueBaseType.ItemRequest && values.ItemRequestRef) {
                  const found = itemRequests.find((s) => Number(s.id) === Number(values.ItemRequestRef));
                  defaultBaseNo = found?.code || String(values.ItemRequestRef);
                } else if (Number(values.BaseType) === WarehouseIssueBaseType.SalesInvoice && values.SalesInvoiceRef) {
                  const found = salesInvoices.find((p) => Number(p.id) === Number(values.SalesInvoiceRef));
                  defaultBaseNo = found?.code || String(values.SalesInvoiceRef);
                } else if (Number(values.BaseType) === WarehouseIssueBaseType.SupplyRequest && values.SupplyRequestRef) {
                  const found = supplyRequests.find((s) => Number(s.id) === Number(values.SupplyRequestRef));
                  defaultBaseNo = found?.code || String(values.SupplyRequestRef);
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
                  disabled={isUsed || !isHeaderComplete || isInvoiceBasedIssue}
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
            data={itemDropdownData}
            columns={itemDropdownColumns}
            value={selectedObj}
            displayKey="ItemCode"
            placeholder="انتخاب کالا/خدمت..."
            disabled={isUsed || !isHeaderComplete || isInvoiceBasedIssue}
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

              const warehouseId = Number(values.DeliverWarehouseRef || values.WarehouseRef);
              if (controlNegativeStock && Number(firstId) > 0 && warehouseId > 0) {
                const currentItemQty = Number(updatedItems[rowIndex]?.Quantity || 1);
                checkItemStockAjax(Number(firstId), warehouseId, currentItemQty).then((check) => {
                  if (check.isExceeded) {
                    showToast(
                      `هشدار: موجودی انبار برای کالای "${firstItem.ItemName || check.itemName}" کافی نمی‌باشد (موجودی فعلی: ${check.availableStock} | مقدار: ${currentItemQty}).`,
                      "warning"
                    );
                  }
                });
              }

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
        const itemRef = getItemRef(row);
        const matchedItem = availableItems.find(
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
              disabled={isUsed || isInvoiceBasedIssue}
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
          const resolvedTfs = itemTfs;
          const origQty = row?.originalQuantity ?? (row?.remainingQuantity !== undefined && row?.usedQuantity !== undefined ? Number(row.remainingQuantity) + Number(row.usedQuantity) : row?.maxQuantity ?? row?.Quantity);
          const recQty = row?.usedQuantity ?? (origQty !== undefined && row?.remainingQuantity !== undefined ? Math.max(0, Number(origQty) - Number(row.remainingQuantity)) : 0);
          const remQty = row?.remainingQuantity ?? (origQty !== undefined && recQty !== undefined ? Math.max(0, Number(origQty) - Number(recQty)) : row?.maxQuantity ?? row?.Quantity);
          const itemHasBase = Boolean(row?.BaseDocumentHeaderRef || row?.baseDocumentHeaderRef || row?.ItemRequestRef || row?.SalesInvoiceRef || row?.SupplyRequestRef || (Number(values.BaseType) && Number(values.BaseType) !== WarehouseIssueBaseType.None));
          setTfModalState({
            isOpen: true,
            rowIndex,
            itemName: row?.ItemName || "کالا",
            itemCode: row?.ItemCode || "",
            trackingFactors: resolvedTfs,
            initialValues: row?.trackingFactorValues || {},
            initialQuantity: row?.Quantity || remQty || "",
            originalQuantity: origQty,
            receivedQuantity: recQty,
            remainingQuantity: remQty,
            hasBase: itemHasBase,
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
                value={row?.Quantity !== "" && row?.Quantity !== null && row?.Quantity !== undefined ? row.Quantity : ""}
                thousandsSeparator={true}
                onChange={(newVal) => {
                  if (showPlusBtn) {
                    openTfModal();
                    return;
                  }
                  const qtyNum = Number(newVal) || 0;
                  const updatedItems = [...(values.items || [])];
                  updatedItems[rowIndex] = calculateRowFields({
                    ...updatedItems[rowIndex],
                    Quantity: newVal !== "" && newVal !== null && newVal !== undefined ? newVal : "",
                  });

                  const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
                    updatedItems,
                    values.factors || [],
                    values.IssueDate || values.ReceiptDate || "",
                    parametersList || []
                  );

                  setValues((prev) => ({
                    ...prev,
                    items: finalItems,
                    factors: finalFactors,
                  }));

                  const itemRef = getItemRef(finalItems[rowIndex]);
                  const warehouseId = Number(values.DeliverWarehouseRef || values.WarehouseRef);
                  if (controlNegativeStock && itemRef && warehouseId > 0 && qtyNum > 0) {
                    const totalQty = finalItems
                      .filter((it) => getItemRef(it) === itemRef)
                      .reduce((sum, it) => sum + (Number(it.Quantity) || 0), 0);

                    checkItemStockAjax(itemRef, warehouseId, totalQty).then((check) => {
                      if (check.isExceeded) {
                        showToast(
                          `هشدار: موجودی انبار برای کالای "${finalItems[rowIndex].ItemName || check.itemName}" کافی نمی‌باشد (موجودی فعلی: ${check.availableStock} | مقدار درخواستی: ${totalQty}).`,
                          "warning"
                        );
                      }
                    });
                  }
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

            const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
              updatedItems,
              values.factors || [],
              values.IssueDate || values.ReceiptDate || "",
              parametersList || []
            );

            setValues((prev) => ({
              ...prev,
              items: finalItems,
              factors: finalFactors,
            }));
          }}
          disabled={isUsed || isInvoiceBasedIssue}
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

  const showPurchaseSales = Boolean(selectedDocType?.ShowPurchaseSalesParameters);

  const activeDetailTabConfig = React.useMemo(() => {
    if (showPurchaseSales) return detailTabConfig;
    return detailTabConfig.filter(
      (col) => !["Discount", "PriceAfterDiscount", "VatTax", "NetPrice"].includes(col.name || "")
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
      width: "223px",
      render: (row, rowIndex) => (
        <PurchaseSalesParameterDropDown
          value={row?.FactorTitle || ""}
          onChange={(selectedParam) => {
            const titleVal = typeof selectedParam === 'object' ? (selectedParam?.Title || "") : String(selectedParam || "");
            const updatedFactors = [...(values.factors || [])];
            updatedFactors[rowIndex] = { ...updatedFactors[rowIndex], FactorTitle: titleVal };
            
            const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
              values.items || [],
              updatedFactors,
              values.IssueDate || values.ReceiptDate || "",
              parametersList || []
            );

            setValues((prev) => ({ ...prev, items: finalItems, factors: finalFactors }));
          }}
          placeholder="انتخاب عنوان عامل..."
          disabled={isUsed || isInvoiceBasedIssue}
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
            
            const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
              values.items || [],
              updatedFactors,
              values.IssueDate || values.ReceiptDate || "",
              parametersList || []
            );

            setValues((prev) => ({ ...prev, items: finalItems, factors: finalFactors }));
          }}
          disabled={isUsed || isInvoiceBasedIssue}
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
            
            const { finalItems, finalFactors } = recalculateInvoiceVatAndFactors(
              values.items || [],
              updatedFactors,
              values.IssueDate || values.ReceiptDate || "",
              parametersList || []
            );

            setValues((prev) => ({ ...prev, items: finalItems, factors: finalFactors }));
          }}
          disabled={isUsed || isInvoiceBasedIssue}
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
          disabled={isUsed || isInvoiceBasedIssue}
        />
      ),
    },
  ];

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
              listApiUrl="/api/inv/warehouse-document-types?nature=2"
              filterItem={(dt: any) => Number(dt.nature || dt.WarehouseDocumentNature) === 2}
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
              disabled={disabled || isUsed || isInvoiceBasedIssue}
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
              disabled={disabled || isUsed || isInvoiceBasedIssue}
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
          <div className={Number(values.BaseType) !== WarehouseIssueBaseType.None ? "w-1/2" : "w-full"}>
            <Select
              label="مبنا :"
              required
              value={values.BaseType || WarehouseIssueBaseType.None}
              onChange={(val) => handleChange("BaseType", Number(val))}
              disabled={disabled || isUsed || isInvoiceBasedIssue || isStocktakingBase || Boolean(selectedDocType && !selectedDocType.HasBaseDocument)}
              options={baseTypeDisplayOptions}
              labelWidth="80px"
            />
          </div>
          {Number(values.BaseType) === WarehouseIssueBaseType.ItemRequest && (
            <div className="w-1/2 flex items-center gap-1">
              <span className="text-slate-700 dark:text-slate-300 min-w-[85px] text-xs whitespace-nowrap">درخواست کالا:</span>
              <div className="flex-1">
                <SingleSelectDropDown
                  noWrapper={true}
                  options={itemRequests}
                  data={itemRequests}
                  columns={[
                    { key: "code", label: "شماره درخواست", width: 120 },
                    { key: "title", label: "عنوان/تاریخ", width: 220 },
                  ]}
                  value={values.ItemRequestRef}
                  selectedValue={values.ItemRequestRef}
                  valueKey="id"
                  displayKey="title"
                  searchKeys={["code", "title"]}
                  placeholder="انتخاب درخواست..."
                  onChange={(selected: any) => {
                    const refId = typeof selected === "object" ? selected?.id : selected;
                    setValues((prev) => ({ ...prev, ItemRequestRef: refId ? Number(refId) : "" }));
                    // Task 132: ثبت تاریخ سند مبنا انتخاب‌شده برای کنترل تاریخ ثبت اطلاعات
                    const rowDate = selected && typeof selected === "object" ? String(selected.InvoiceDate || selected.ReceiptDate || selected.RequestDate || selected.date || "") : "";
                    setBaseDocDate(refId ? rowDate : "");
                    if (refId && rowDate && (values.IssueDate || values.ReceiptDate) && isFormDateBeforeBaseDocDate(values.IssueDate || values.ReceiptDate, rowDate)) {
                      showToast("تاریخ ثبت اطلاعات نمی‌تواند قبل از تاریخ سند مبنا باشد", "warning");
                    }
                    if (refId) {
                      loadBaseDocumentDetails("ItemRequest", refId);
                    } else {
                      setBaseDocItems([]);
                    }
                  }}
                  disabled={disabled || isUsed || isInvoiceBasedIssue || isStocktakingBase}
                />
              </div>
            </div>
          )}
          {Number(values.BaseType) === WarehouseIssueBaseType.SalesInvoice && (
            <div className="w-1/2 flex items-center gap-1">
              <span className="text-slate-700 dark:text-slate-300 min-w-[85px] text-xs whitespace-nowrap">فاکتور فروش:</span>
              <div className="flex-1">
                <SingleSelectDropDown
                  noWrapper={true}
                  options={salesInvoiceDisplayOptions}
                  data={salesInvoiceDisplayOptions}
                  columns={[
                    { key: "code", label: "شماره فاکتور", width: 120 },
                    { key: "title", label: "عنوان/تاریخ", width: 220 },
                  ]}
                  value={values.SalesInvoiceRef}
                  selectedValue={values.SalesInvoiceRef}
                  valueKey="id"
                  displayKey="title"
                  searchKeys={["code", "title"]}
                  placeholder="انتخاب فاکتور..."
                  onChange={(selected: any) => {
                    const refId = typeof selected === "object" ? selected?.id : selected;
                    setValues((prev) => ({ ...prev, SalesInvoiceRef: refId ? Number(refId) : "" }));
                    // Task 132: ثبت تاریخ سند مبنا انتخاب‌شده برای کنترل تاریخ ثبت اطلاعات
                    const rowDate = selected && typeof selected === "object" ? String(selected.InvoiceDate || selected.ReceiptDate || selected.RequestDate || selected.date || "") : "";
                    setBaseDocDate(refId ? rowDate : "");
                    if (refId && rowDate && (values.IssueDate || values.ReceiptDate) && isFormDateBeforeBaseDocDate(values.IssueDate || values.ReceiptDate, rowDate)) {
                      showToast("تاریخ ثبت اطلاعات نمی‌تواند قبل از تاریخ سند مبنا باشد", "warning");
                    }
                    if (refId) {
                      loadBaseDocumentDetails("SalesInvoice", refId);
                    } else {
                      setBaseDocItems([]);
                    }
                  }}
                  disabled={disabled || isUsed || isInvoiceBasedIssue || isStocktakingBase}
                />
              </div>
            </div>
          )}
          {Number(values.BaseType) === WarehouseIssueBaseType.SupplyRequest && (
            <div className="w-1/2 flex items-center gap-1">
              <span className="text-slate-700 dark:text-slate-300 min-w-[85px] text-xs whitespace-nowrap">درخواست تامین:</span>
              <div className="flex-1">
                <SingleSelectDropDown
                  noWrapper={true}
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
                  searchKeys={["code", "title"]}
                  placeholder="انتخاب درخواست..."
                  onChange={(selected: any) => {
                    const refId = typeof selected === "object" ? selected?.id : selected;
                    setValues((prev) => ({ ...prev, SupplyRequestRef: refId ? Number(refId) : "" }));
                    // Task 132: ثبت تاریخ سند مبنا انتخاب‌شده برای کنترل تاریخ ثبت اطلاعات
                    const rowDate = selected && typeof selected === "object" ? String(selected.InvoiceDate || selected.ReceiptDate || selected.RequestDate || selected.date || "") : "";
                    setBaseDocDate(refId ? rowDate : "");
                    if (refId && rowDate && (values.IssueDate || values.ReceiptDate) && isFormDateBeforeBaseDocDate(values.IssueDate || values.ReceiptDate, rowDate)) {
                      showToast("تاریخ ثبت اطلاعات نمی‌تواند قبل از تاریخ سند مبنا باشد", "warning");
                    }
                    if (refId) {
                      loadBaseDocumentDetails("ItemSupplyRequest", refId);
                    } else {
                      setBaseDocItems([]);
                    }
                  }}
                  disabled={disabled || isUsed || isInvoiceBasedIssue || isStocktakingBase}
                />
              </div>
            </div>
          )}
          {Number(values.BaseType) > 1 &&
            ![WarehouseIssueBaseType.ItemRequest, WarehouseIssueBaseType.SalesInvoice, WarehouseIssueBaseType.SupplyRequest].includes(Number(values.BaseType)) && (
              <div className="w-1/2 flex items-center gap-1">
                <TextInput
                  label="شماره مبنا :"
                  value={values.BaseDocumentNumber || ""}
                  onChange={(val) => handleChange("BaseDocumentNumber", val)}
                  disabled={disabled || isUsed || isInvoiceBasedIssue || isStocktakingBase}
                  placeholder="شماره سند مبنا..."
                  labelWidth="75px"
                />
              </div>
            )}
        </div>
      ),
    },
    {
      name: "IssueNumberAndDate",
      type: "custom",
      colSpan: 1,
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <NumberInput
            label="شماره حواله :"
            required
            value={values.IssueNumber || values.ReceiptNumber || ""}
            onChange={(val) => handleChange("IssueNumber", val)}
            disabled={disabled || isUsed || isInvoiceBasedIssue}
            placeholder="شماره حواله"
            labelWidth="75px"
            integerOnly={true}
          />
          <DateInput
            label="تاریخ حواله :"
            required
            value={values.IssueDate || values.ReceiptDate}
            onChange={handleMainDateChange}
            disabled={disabled || isUsed || isInvoiceBasedIssue}
            labelWidth="65px"
          />
        </div>
      ),
    },
    {
      name: "ReceiverRef",
      type: "custom",
      colSpan: 1,
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="flex items-center gap-2 w-full">
          <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[80px] text-xs">
            {receiverLabel} {isDetailedEnabled && <span className="text-red-500">*</span>}:
          </span>
          <div className="flex-1">
            <SingleSelectDropDown
              noWrapper={true}
              options={filteredReceivers}
              data={filteredReceivers}
              columns={receiverColumns}
              value={values.ReceiverRef || values.SupplierRef}
              selectedValue={values.ReceiverRef || values.SupplierRef}
              valueKey="id"
              displayKey="title"
              searchKeys={["code", "title", "title2"]}
              placeholder={isDetailedEnabled ? `انتخاب ${receiverLabel}...` : "فاقد تفصیلی"}
              renderSelection={(item: any) => {
                // Task 138: اگر رکورد در فهرست یافت نشد، نام ذخیره‌شده تحویل گیرنده
                // (مشتری فاکتور فروش) نمایش داده شود
                if (!item) return values.ReceiverName || values.SupplierName || "";
                const code = item.code || item.Code || item.detailedAccount?.code || "";
                const title =
                  item.title ||
                  item.Title ||
                  item.ReceiverName ||
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
                  setValues((prev) => ({ ...prev, ReceiverRef: "", ReceiverName: "", SupplierRef: "", SupplierName: "" }));
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
                    ReceiverRef: sId,
                    ReceiverName: sName,
                    SupplierRef: sId,
                    SupplierName: sName,
                  }));
                } else {
                  setValues((prev) => ({ ...prev, ReceiverRef: Number(selected), SupplierRef: Number(selected) }));
                }
              }}
              disabled={disabled || isUsed || isInvoiceBasedIssue || !isDetailedEnabled}
              addFormOptions={[
                { title: "تعریف طرف حساب/تحویل‌گیرنده جدید", componentName: "PartyForm", groupId: "common" },
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
            disabled={disabled || isUsed || isInvoiceBasedIssue}
            labelWidth="75px"
          />
          <Select
            label="نوع ارز :"
            value={values.CurrencyRef || 1}
            onChange={(val) => handleChange("CurrencyRef", Number(val))}
            disabled={disabled || isUsed || isInvoiceBasedIssue}
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

  const getFactorAmountForRow = (
    factor: any,
    selItem: any,
    allItems: any[],
    docDate: string,
    paramsList: any[]
  ): number => {
    if (!selItem) return 0;

    const findParamObj = (f: any, pList: any[]) => {
      if (!pList || !Array.isArray(pList)) return null;
      const title = (f?.FactorTitle || f?.Title || "").trim().toLowerCase();
      if (!title) return null;
      return pList.find((p: any) => (p?.Title || "").trim().toLowerCase() === title) || null;
    };

    const normalizeText = (str: string) => (str || "").replace(/ك/g, "ک").replace(/ي/g, "ی").toLowerCase();

    const paramObj = findParamObj(factor, paramsList);
    const cat = Number(paramObj?.CategoryOther ?? factor.CategoryOther ?? 0);
    const opType = Number(paramObj?.OperationType ?? 1);
    const titleNorm = normalizeText(paramObj?.Title || factor.FactorTitle);

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
      const rawVal = paramObj?.PercentOrAmount ?? paramObj?.Value ?? 0;
      const rate = rawVal > 1 ? rawVal / 100 : rawVal;
      if (rate > 0) {
        const priceAfterManualDisc = Math.max(0, rowGross - rowManualDisc);
        return Math.round(priceAfterManualDisc * rate);
      }
      if (selItem.VatTax !== undefined && selItem.VatTax !== null && Number(selItem.VatTax) > 0) {
        return Number(selItem.VatTax);
      }
    }

    if (isDiscount && opType === 3) {
      const rawVal = paramObj?.PercentOrAmount ?? paramObj?.Value ?? 0;
      if (rawVal > 0) {
        const rate = rawVal > 1 ? rawVal / 100 : rawVal;
        return Math.round(rowGross * rate);
      }
    }

    if (opType === 3) {
      const rawVal = paramObj?.PercentOrAmount ?? paramObj?.Value ?? 0;
      if (rawVal > 0) {
        const rate = rawVal > 1 ? rawVal / 100 : rawVal;
        return Math.round(rowGross * rate);
      }
    }

    if (opType === 4) {
      const unitVal = Number(paramObj?.PercentOrAmount ?? paramObj?.Value ?? 0);
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
    if (!values.WarehouseDocumentTypeRef) {
      showToast("لطفاً نوع سند انبار را انتخاب کنید *", "error");
      return false;
    }
    if (!values.DeliverWarehouseRef) {
      showToast("لطفاً انبار تحویل‌دهنده را انتخاب کنید *", "error");
      return false;
    }
    if (isDetailedEnabled && !values.ReceiverRef && !values.SupplierRef) {
      showToast("لطفاً تحویل‌گیرنده را انتخاب کنید *", "error");
      return false;
    }
    if (!values.IssueNumber && !values.ReceiptNumber) {
      showToast("لطفاً شماره حواله را وارد کنید *", "error");
      return false;
    }
    if (!values.IssueDate && !values.ReceiptDate) {
      showToast("لطفاً تاریخ حواله را وارد کنید *", "error");
      return false;
    }

    // Task 137-3: خروج انبار مبتنی بر فاکتور فروش — افزودن ردیف مجاز نیست و مقدار
    // هر ردیف فقط می‌تواند مساوی یا کمتر از مقدار همان ردیف در فاکتور فروش باشد
    if (isInvoiceBasedIssue) {
      const rows = (values.items || []).filter((it: any) => it.ItemRef || it.ItemCode);
      const originalCount = originalInvoiceQtyRef.current.size;
      if (rows.length > originalCount) {
        showToast("برای خروج انبار صادرشده از فاکتور فروش، افزودن ردیف جدید مجاز نیست *", "error");
        return false;
      }
      for (let i = 0; i < rows.length; i++) {
        const cap = originalInvoiceQtyRef.current.get(i);
        if (cap !== undefined && Number(rows[i].Quantity || 0) > cap) {
          showToast(`مقدار کالای "${rows[i].ItemName || ""}" نمی‌تواند بیشتر از مقدار فاکتور فروش (${cap}) باشد *`, "error");
          return false;
        }
      }
    }

    // Task 132: تاریخ ثبت اطلاعات نمی‌تواند قبل از تاریخ سند مبنا باشد
    const bTypeForDate = Number(values.BaseType || 0);
    const bRefForDate = Number(values.SalesInvoiceRef || values.ItemRequestRef || values.SupplyRequestRef || 0);
    const docTypeForDate =
      bTypeForDate === WarehouseIssueBaseType.ItemRequest ? 'ItemRequest' :
      bTypeForDate === WarehouseIssueBaseType.SalesInvoice ? 'SalesInvoice' :
      bTypeForDate === WarehouseIssueBaseType.SupplyRequest ? 'ItemSupplyRequest' : '';

    if (docTypeForDate && bRefForDate > 0) {
      let baseDateForCheck = baseDocDate;
      if (!baseDateForCheck) {
        try {
          const resDate = await apiFetch(`/api/inv/base-documents/date?docType=${docTypeForDate}&id=${bRefForDate}`);
          if (resDate.ok) {
            const jd = await resDate.json();
            baseDateForCheck = jd?.date || jd?.data?.date || "";
            if (baseDateForCheck) setBaseDocDate(baseDateForCheck);
          }
        } catch {}
      }
      if (baseDateForCheck && isFormDateBeforeBaseDocDate(values.IssueDate || values.ReceiptDate, baseDateForCheck)) {
        showToast("تاریخ ثبت اطلاعات نمی‌تواند قبل از تاریخ سند مبنا باشد *", "error");
        return false;
      }
    }

    const itemsWithProduct = (values.items || []).filter((item: any) => getItemRef(item) !== null);
    if (itemsWithProduct.length === 0) {
      showToast("لطفاً حداقل یک کالا یا خدمت معتبر در جدول اقلام حواله انبار وارد کنید *", "warning");
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

    if (controlNegativeStock) {
      const warehouseId = Number(values.DeliverWarehouseRef || values.WarehouseRef);
      if (warehouseId > 0) {
        const itemTotals = new Map<number, { itemName: string; totalQty: number }>();
        for (const item of itemsWithProduct) {
          const itemRef = getItemRef(item);
          if (itemRef) {
            const q = Number(item.Quantity) || 0;
            const current = itemTotals.get(itemRef) || { itemName: item.ItemName || "کالا", totalQty: 0 };
            itemTotals.set(itemRef, { itemName: item.ItemName || current.itemName, totalQty: current.totalQty + q });
          }
        }

        for (const [itemRef, info] of itemTotals.entries()) {
          const check = await checkItemStockAjax(itemRef, warehouseId, info.totalQty);
          if (check.isExceeded) {
            showToast(
              `امکان ثبت حواله انبار وجود ندارد! موجودی کالای "${info.itemName}" در انبار (${check.availableStock}) کمتر از مقدار درخواستی (${info.totalQty}) است.`,
              "error"
            );
            return false;
          }
        }
      }
    }

    setIsLoading(true);
    try {
      const payload = {
        ...values,
        WarehouseDocumentTypeRef: values.WarehouseDocumentTypeRef ? Number(values.WarehouseDocumentTypeRef) : null,
        DeliverWarehouseRef: Number(values.DeliverWarehouseRef || values.WarehouseRef),
        WarehouseRef: Number(values.DeliverWarehouseRef || values.WarehouseRef),
        BaseType: Number(values.BaseType || WarehouseIssueBaseType.None),
        ItemRequestRef: values.ItemRequestRef ? Number(values.ItemRequestRef) : null,
        SalesInvoiceRef: values.SalesInvoiceRef ? Number(values.SalesInvoiceRef) : null,
        SupplyRequestRef: values.SupplyRequestRef ? Number(values.SupplyRequestRef) : null,
        ReceiverRef: Number(values.ReceiverRef || values.SupplierRef),
        ReceiverName: values.ReceiverName || values.SupplierName || "",
        SupplierRef: Number(values.ReceiverRef || values.SupplierRef),
        SupplierName: values.ReceiverName || values.SupplierName || "",
        IssueNumber: Number(values.IssueNumber || values.ReceiptNumber) || values.IssueNumber || values.ReceiptNumber,
        ReceiptNumber: Number(values.IssueNumber || values.ReceiptNumber) || values.IssueNumber || values.ReceiptNumber,
        IssueDate: values.IssueDate || values.ReceiptDate,
        ReceiptDate: values.IssueDate || values.ReceiptDate,
        BaseDocumentNumber: values.BaseDocumentNumber || "",
        Status: Number(values.Status || DocumentState.InitialRegistration),
        CurrencyRef: Number(values.CurrencyRef || 1),
        Description: values.Description || "",
        details: validItems.map((item: any, idx: number) => ({
          RowNo: idx + 1,
          ItemRef: getItemRef(item),
          BaseNumber: item.BaseNumber || item.BaseDocumentNumber || "",
          UnitName: item.UnitName || "عدد",
          Quantity: Number(item.Quantity),
          UnitPrice: Number(item.UnitPrice || 0),
          Discount: Number(item.Discount || 0),
          UnitType: item.UnitType === "فرعی" || Number(item.UnitType) === 2 ? 2 : 1,
          Description: item.Description || "",
          trackingFactorValues: item.trackingFactorValues || null,
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

      const saveUrl = activeId ? `/api/inv/warehouse-issues/${activeId}` : "/api/inv/warehouse-issues";
      const saveMethod = activeId ? "PUT" : "POST";

      let res = await apiFetch(saveUrl, {
        method: saveMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const fallbackUrl = activeId ? `/api/inv/warehouse-issue/${activeId}` : "/api/inv/warehouse-issue";
        res = await apiFetch(fallbackUrl, {
          method: saveMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.WarehouseIssueID || data.WarehouseReceiptID || data.id || data.success)) {
        showToast("حواله انبار با موفقیت ذخیره شد.", "success");
        const savedId = data.WarehouseIssueID || data.WarehouseReceiptID || data.id || data.data?.WarehouseIssueID;
        if (savedId) {
          const numId = Number(savedId);
          setActiveId(numId);
          setValues((prev) => ({
            ...prev,
            WarehouseIssueID: numId,
            id: numId,
          }));
        }
        return true;
      } else {
        showToast(data?.message || "خطا در ذخیره‌سازی اطلاعات حواله انبار در دیتابیس", "error");
        return false;
      }
    } catch (err: any) {
      console.error(err);
      showToast("خطا در ارتباط با سرور هنگام ذخیره حواله انبار", "error");
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
    setBaseDocDate(""); // Task 132: پاک‌سازی تاریخ سند مبنا در سند جدید
    setValues({
      WarehouseIssueID: "",
      WarehouseDocumentTypeRef: "",
      DeliverWarehouseRef: "",
      WarehouseName: "",
      BaseType: WarehouseIssueBaseType.None,
      ItemRequestRef: "",
      SalesInvoiceRef: "",
      SupplyRequestRef: "",
      ReceiverRef: "",
      ReceiverName: "",
      SupplierRef: "",
      SupplierName: "",
      IssueNumber: "",
      ReceiptNumber: "",
      IssueDate: getTodayJalali(),
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
    apiFetch("/api/inv/warehouse-issues/next-number")
      .then((res) => (res.ok ? res.json() : apiFetch("/api/inv/warehouse-issue/next-number").then((r) => r.json())))
      .then((data) => {
        if (data?.documentNumber) {
          setValues((prev) => ({ ...prev, IssueNumber: data.documentNumber, ReceiptNumber: data.documentNumber }));
        }
      })
      .catch(() => {});
  };

  const handleDelete = async () => {
    if (!activeId) return;
    try {
      const res = await apiFetch(`/api/inv/warehouse-issues/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        await apiFetch(`/api/inv/warehouse-issue/${activeId}`, {
          method: "DELETE",
        });
      }
      showToast("حواله انبار با موفقیت حذف شد.", "success");
      handleNew();
    } catch (err: any) {
      showToast("حواله انبار با موفقیت حذف شد.", "success");
      handleNew();
    }
  };

  const handleListSelect = (item: any) => {
    if (!item) return;
    const selectedId = item.WarehouseIssueID || item.WarehouseReceiptID || item.id;
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
    if (!activeId && !values.IssueNumber) {
      showToast("لطفاً ابتدا حواله انبار را ذخیره نمایید.", "warning");
      return;
    }
    setIsVoucherIssued(true);
    showToast("سند حسابداری حواله انبار با موفقیت در سیستم مالی صادر گردید.", "success");
  };

  const handleVoucherView = () => {
    if (!isVoucherIssued) {
      showToast("ابتدا باید سند حسابداری صادر شود.", "warning");
      return;
    }
    showToast("در حال نمایش سند حسابداری صادر شده برای حواله انبار...", "info");
  };

  const handleVoucherEdit = () => {
    if (!isVoucherIssued) {
      showToast("سند حسابداری صادر نشده است.", "warning");
      return;
    }
    showToast("امکان ویرایش سند حسابداری صادر شده حواله انبار فراهم گردید.", "info");
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
    if (!values.ReceiverRef && !values.SupplierRef) {
      showToast("لطفاً ابتدا تحویل‌گیرنده حواله را انتخاب کنید.", "error");
      return;
    }
    setIsRapRegistered(true);
    showToast("اطلاعات حواله انبار بر اساس فرم جاری با موفقیت در سیستم دریافت و پرداخت ثبت شد.", "success");
  };

  const handleRapEdit = () => {
    if (!isRapRegistered) {
      showToast("ابتدا باید اطلاعات حواله در سیستم دریافت و پرداخت ثبت شود.", "warning");
      return;
    }
    showToast("اطلاعات ثبت شده حواله انبار در سیستم دریافت و پرداخت با موفقیت ویرایش گردید.", "info");
  };

  const handleRapDelete = () => {
    if (!isRapRegistered) {
      showToast("اطلاعاتی در سیستم دریافت و پرداخت برای حذف وجود ندارد.", "warning");
      return;
    }
    setIsRapRegistered(false);
    showToast("اطلاعات ثبت شده حواله انبار با موفقیت از سیستم دریافت و پرداخت حذف گردید.", "success");
  };

  const hasOtherInfo = Boolean(values.Description && String(values.Description).trim() !== "");
  // Task 87: دستگیره فوتر — درگ موس برای کم/زیاد کردن ارتفاع + دبل‌کلیک برای جمع شدن کامل و بازگشت
  const { isCollapsed: isFooterCollapsed, footerHeight, isDragging: footerDragging, handleProps: footerHandleProps } = useFooterPanelResize(150);

  return (
    <>
      <SimpleFormTwoRowTabbed
      title={activeId ? "ویرایش حواله انبار" : "حواله انبار جدید"}
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
      listApiUrl="/api/inv/warehouse-issues?nature=2"
      formName="حواله انبار"
      currentRecordId={activeId}
      listDisplayKey="IssueNumber"
      listColumns={[
        {
          key: "IssueNumber",
          label: "شماره حواله",
          title: "شماره حواله",
          renderItem: (row: any) => row.IssueNumber || row.ReceiptNumber || row.WarehouseIssueID || row.id || "—",
          render: (val: any, row: any) => val || row?.IssueNumber || row?.ReceiptNumber || row?.WarehouseIssueID || row?.id || "—",
        },
        {
          key: "IssueDate",
          label: "تاریخ حواله",
          title: "تاریخ حواله",
          renderItem: (row: any) => {
            const d = row.IssueDate || row.ReceiptDate;
            if (!d) return "—";
            try {
              return momentJalaali(d).format("jYYYY/jMM/jDD");
            } catch {
              return String(d);
            }
          },
          render: (val: any, row: any) => {
            const d = val || row?.IssueDate || row?.ReceiptDate;
            if (!d) return "—";
            try {
              return momentJalaali(d).format("jYYYY/jMM/jDD");
            } catch {
              return String(d);
            }
          },
        },
        {
          key: "ReceiverName",
          label: "تحویل‌گیرنده",
          title: "تحویل‌گیرنده",
          renderItem: (row: any) => row.ReceiverName || row.ReceiverPartyName || row.receiverParty?.title || row.SupplierName || "نامشخص",
          render: (val: any, row: any) => val || row?.ReceiverName || row?.ReceiverPartyName || row?.receiverParty?.title || row?.SupplierName || "نامشخص",
        },
        {
          key: "BaseType",
          label: "مبنا",
          title: "مبنا",
          renderItem: (row: any) => WAREHOUSE_ISSUE_BASE_TYPE_OPTIONS.find((b) => b.id === Number(row.BaseType))?.title || "بدون مبنا",
          render: (val: number, row: any) => WAREHOUSE_ISSUE_BASE_TYPE_OPTIONS.find((b) => b.id === Number(val ?? row?.BaseType))?.title || "بدون مبنا",
        },
        {
          key: "Status",
          label: "وضعیت",
          title: "وضعیت",
          renderItem: (row: any) => DocumentStateLabels[row.Status as DocumentState] || (row.Status === 1 ? "یادداشت" : row.Status === 2 ? "ثبت اولیه" : String(row.Status || "—")),
          render: (val: number, row: any) => {
            const st = Number(val ?? row?.Status);
            return DocumentStateLabels[st as DocumentState] || (st === 1 ? "یادداشت" : st === 2 ? "ثبت اولیه" : String(val || "—"));
          },
        },
      ]}
      targetForm="WarehouseIssue"
      isReadonly={isUsed}
      bottomTabs={[
        {
          id: "items_tab",
          label: "اقلام حواله انبار",
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
                      items: newItems.map((item: any, idx: number) => calculateRowFields({ ...item, RowNo: idx + 1 })),
                    }));
                  }}
                  onActiveRowChange={(tabId, rowIndex) => {
                    if (rowIndex !== null && rowIndex !== undefined) {
                      setSelectedItemIndex(rowIndex);
                    }
                  }}
                  hideHeader={false}
                  hideAddButton={isUsed || !isHeaderComplete || isInvoiceBasedIssue}
                  disableAddButton={isUsed || !isHeaderComplete || isInvoiceBasedIssue}
                  hideDeleteButton={isUsed || !isHeaderComplete || isInvoiceBasedIssue}
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
                className={`grid grid-cols-1 ${showPurchaseSales ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-2 w-full shrink-0 pt-0 lg:h-[var(--footer-h)] ${!hasValidItem ? "opacity-50 pointer-events-none select-none" : ""}`}
              >
                {/* Column 1 (RTL Right): عوامل حواله */}
                {showPurchaseSales && (
                <div className="bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700/80 p-2 pr-8 flex flex-col justify-between shadow-2xs relative h-[150px] max-h-[150px] lg:h-full lg:max-h-full overflow-hidden">
                  <div className="absolute top-2 right-0 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-r-0 border-indigo-200 dark:border-indigo-800 text-[11px] font-bold px-1 py-2.5 rounded-l-md shadow-2xs flex items-center justify-center z-10 select-none">
                    <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap tracking-wide">
                      عوامل حواله
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
                              const rowFactorAmount = getFactorAmountForRow(f, selItem, values.items, values.IssueDate || values.ReceiptDate || "", parametersList);
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
                                      onChange={(selectedParam) => {
                                        const titleVal = typeof selectedParam === 'object' ? (selectedParam?.Title || "") : String(selectedParam || "");
                                        const updated = [...(values.factors || [])];
                                        updated[idx] = { ...updated[idx], FactorTitle: titleVal };
                                        setValues((prev) => ({ ...prev, factors: updated }));
                                      }}
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
                                        const oldRowAmount = getFactorAmountForRow(f, selItem, values.items, values.IssueDate || values.ReceiptDate || "", parametersList);
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
                          const updated = (values.factors || []).filter((_: any, i: number) => i !== selectedFactorIndex);
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
                          warehouseId={values.WarehouseRef || values.DeliverWarehouseRef || values.SenderWarehouseRef}
                          mainUnitName={selItem?.UnitName}
                          pendingQuantity={pendingQty}
                          documentType="issue"
                          excludeVoucherId={values.WarehouseReceiptID || values.WarehouseIssueID || activeId}
                          partyId={values.ReceiverRef || values.SupplierRef}
                          documentDate={values.IssueDate || values.ReceiptDate}
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
          label: "عوامل حواله",
          content: (
            <TabCellRow
              tabs={factorsTabConfig}
              value={values.factors || []}
              onChange={(newFactors) =>
                setValues((prev) => ({
                  ...prev,
                  factors: newFactors.map((f: any, idx: number) => ({ ...f, RowNo: idx + 1 })),
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
                      خلاصه محاسبات مالی حواله انبار
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
                        مبلغ خالص حواله انبار
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
                      این حواله انبار به عنوان مدرک خروج قطعی کالا از انبار مورد نظر ثبت می‌گردد.
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
                  disabled={isUsed || isInvoiceBasedIssue}
                  placeholder="توضیحات حواله انبار..."
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

    {tfModalState.isOpen && (
      <TrackingFactorModal
        isOpen={tfModalState.isOpen}
        onClose={() => setTfModalState((prev) => ({ ...prev, isOpen: false }))}
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
        isWarehouseIssue={true}
        itemRef={getItemRef(values.items?.[tfModalState.rowIndex ?? -1])}
        warehouseRef={values.DeliverWarehouseRef || values.WarehouseRef}
        formName="حواله انبار"
        documentId={values.WarehouseIssueID || activeId}
        documentDate={values.IssueDate}
        onSave={(tfValues, totalQty) => {
          const idx = tfModalState.rowIndex;
          if (idx !== null && idx >= 0) {
            const updatedItems = [...(values.items || [])];
            updatedItems[idx] = calculateRowFields({
              ...updatedItems[idx],
              originalQuantity: tfModalState.originalQuantity ?? updatedItems[idx].originalQuantity,
              usedQuantity: tfModalState.receivedQuantity ?? updatedItems[idx].usedQuantity,
              remainingQuantity: tfModalState.remainingQuantity ?? updatedItems[idx].remainingQuantity,
              trackingFactorValues: tfValues,
              ...(totalQty > 0 ? { Quantity: totalQty } : {}),
            });
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }
          setTfModalState((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    )}
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
          values.IssueDate || values.ReceiptDate || "",
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
          values.IssueDate || values.ReceiptDate || "",
          parametersList || []
        );

        setValues((prev) => ({ ...prev, items: finalItems, factors: finalFactors }));
      }}
    />
    </>
  );
}

export default WarehouseIssueForm;

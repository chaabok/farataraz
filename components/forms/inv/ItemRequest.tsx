"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { FieldConfig } from "../SimpleFormTwoRow";
import { TabCellRow, TabCellConfig } from "../TabCellRow";
import { SingleSelectDropDown, SingleSelectColumn } from "@/components/inputs/SingleSelectDropDown";
import { MultiColumnDropDown, Column } from "@/components/inputs/MultiColumnDropdown";
import { NumberInput } from "@/components/inputs/NumberInput";
import { TextInput } from "@/components/inputs/TextInput";
import { DateInput } from "@/components/inputs/DateInput";
import { Select } from "@/components/inputs/Select";
import { StateListInput, DocumentState, DocumentStateLabels } from "@/components/inputs/StateListInput";
import { TextArea } from "@/components/inputs/TextArea";
import { FileText, Plus, List, AlertCircle } from "lucide-react";
import { TrackingFactorModal, TrackingFactorItem } from "@/components/forms/inv/TrackingFactorModal";
import { SubUnitModal } from "@/components/inputs/SubUnitModal";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch, jalaliToGregorianISO, gregorianToJalaliDisplay } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { eventBus, EVENTS } from "@/lib/events";
import momentJalaali from "moment-jalaali";

interface ItemRequestProps {
  id?: number;
  tabId?: string;
}

// Enum Options (Rule #13)
export enum BasisTypeEnum {
  NoBasis = 1, // بدون مبنا
  InventoryControl = 2, // کنترل موجودی
  MaterialDeliveryControl = 3, // کنترل تحویل مواد
}

const BASIS_TYPE_OPTIONS = [
  { id: BasisTypeEnum.NoBasis, title: "بدون مبنا", value: BasisTypeEnum.NoBasis, label: "بدون مبنا" },
  { id: BasisTypeEnum.InventoryControl, title: "کنترل موجودی", value: BasisTypeEnum.InventoryControl, label: "کنترل موجودی" },
  { id: BasisTypeEnum.MaterialDeliveryControl, title: "کنترل تحویل مواد", value: BasisTypeEnum.MaterialDeliveryControl, label: "کنترل تحویل مواد" },
];

const PRIORITY_OPTIONS = [
  { id: 1, title: "عادی", value: 1, label: "عادی" },
  { id: 2, title: "فوری", value: 2, label: "فوری" },
  { id: 3, title: "خیلی فوری", value: 3, label: "خیلی فوری" },
];

function getTodayJalali() {
  try {
    return momentJalaali().format("jYYYY/jMM/jDD");
  } catch (e) {
    return "";
  }
}

export function ItemRequest({ id, tabId }: ItemRequestProps) {
  const { removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, setActiveId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("ItemRequest", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    ItemRequestID: "",
    BasisType: BasisTypeEnum.NoBasis,
    RequestNumber: "",
    RequestDate: getTodayJalali(),
    Priority: 1,
    Status: DocumentState.InitialRegistration,
    Requester: "",
    RequesterRef: "",
    WarehouseRef: "",
    Description: "",
    items: [
      {
        id: "1",
        RowNo: 1,
        ItemRef: null,
        ItemCode: "",
        ItemName: "",
        UnitName: "",
        RequestQuantity: "",
        ApprovedQuantity: "",
        DeliveryDate: getTodayJalali(),
        Description: "",
      },
    ],
  });

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [requesterOptions, setRequesterOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Tracking Factors State
  const [allTrackingFactors, setAllTrackingFactors] = useState<TrackingFactorItem[]>([]);
  const [isTrackingFactorEnabled, setIsTrackingFactorEnabled] = useState(false);

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
  const [tfModalState, setTfModalState] = useState<{
    isOpen: boolean;
    rowIndex: number | null;
    itemName: string;
    itemCode: string;
    trackingFactors: TrackingFactorItem[];
    initialValues: Record<string | number, any>;
    initialQuantity?: number | string;
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
    initialQuantity: 1,
  });

  const getWarehouseNatureTitle = (natureVal: any) => {
    switch (Number(natureVal)) {
      case 1:
        return "مواد اولیه";
      case 2:
        return "نیمه ساخته";
      case 3:
        return "کالای ساخته شده";
      case 4:
        return "اموال";
      case 5:
        return "ضایعات";
      case 6:
        return "سایر";
      default:
        return "";
    }
  };

  const warehouseColumns: SingleSelectColumn[] = [
    { key: "code", label: "کد", width: 100 },
    { key: "title", label: "عنوان", width: 220 },
    { key: "title2", label: "عنوان(2)", width: 220 },
    { key: "nature", label: "ماهیت انبار", width: 150 },
  ];

  const requesterColumns: SingleSelectColumn[] = [
    { key: "code", label: "کد", width: 100 },
    { key: "title", label: "عنوان", width: 220 },
    { key: "title2", label: "عنوان(2)", width: 220 },
  ];

  // Fetch dropdown data
  useEffect(() => {
    // Fetch Warehouses
    apiFetch("/api/inv/warehouses")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        const warehouseList = list.filter(
          (w: any) => w.WarehouseType === undefined || w.WarehouseType === null || Number(w.WarehouseType) === 1
        );
        setWarehouses(
          warehouseList.map((w: any) => ({
            id: w.WarehouseID || w.id,
            WarehouseID: w.WarehouseID || w.id,
            code: w.WarehouseCode || w.code || "",
            title: w.WarehouseTitle || w.WarehouseName || w.title || "",
            title2: w.WarehouseTitle2 || w.title2 || "",
            nature: getWarehouseNatureTitle(w.WarehouseNature),
            WarehouseNature: w.WarehouseNature,
          }))
        );
      })
      .catch((err) => console.error("Error fetching warehouses:", err));

    // Fetch Products / Items
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
              ItemCode: item.ItemCode || item.code || item.product_code || "",
              ItemName: item.ItemName || item.title || item.product_name || item.name || "",
              UnitName: mainUnitName,
              mainUnit: mainUnitObj,
              subUnits: subUnitsList,
              allUnits: allUnitsList,
              physicalWarehouseIds: item.physicalWarehouseIds || [],
              title: `${item.ItemCode ? item.ItemCode + " - " : ""}${item.ItemName || item.title || item.name || ""}`,
            };
          })
        );
      })
      .catch((err) => console.error("Error fetching items:", err));

    // Fetch Detailed Accounts for Requester (Cost Center and Project)
    Promise.all([
      apiFetch("/api/accounting/detailed-types").then((res) => res.json()).catch(() => []),
      apiFetch("/api/accounting/detailed-accounts").then((res) => res.json()).catch(() => []),
    ]).then(([typesRes, accountsRes]) => {
      const typesList = Array.isArray(typesRes)
        ? typesRes
        : typesRes?.data || typesRes?.items || [];
      const accountsList = Array.isArray(accountsRes)
        ? accountsRes
        : accountsRes?.items || accountsRes?.data || (Array.isArray(accountsRes?.data) ? accountsRes.data : []);

      const targetTypeIds = new Set(
        typesList
          .filter((t: any) => {
            const code = String(t.code || "");
            const title = String(t.title || "");
            return (
              code === "15" ||
              code === "8" ||
              title.includes("مرکز هزینه") ||
              title.includes("مراکز هزینه") ||
              title.includes("پروژه")
            );
          })
          .map((t: any) => Number(t.detailedTypesId || t.id))
      );

      const filtered = (Array.isArray(accountsList) ? accountsList : []).filter((da: any) => {
        const active =
          da.isActive !== false &&
          da.isActive !== 0 &&
          String(da.isActive) !== "false";
        if (!active) return false;

        const dtId = Number(da.detailedTypesId || da.detailedType?.detailedTypesId);
        const dtCode = String(da.detailedType?.code || "");
        const dtTitle = String(da.detailedType?.title || "");

        return (
          targetTypeIds.has(dtId) ||
          dtCode === "15" ||
          dtCode === "8" ||
          dtTitle.includes("مرکز هزینه") ||
          dtTitle.includes("مراکز هزینه") ||
          dtTitle.includes("پروژه")
        );
      });

      setRequesterOptions(
        filtered.map((da: any) => ({
          id: da.detailedAccountId || da.id,
          code: da.code || "",
          title: da.title || "",
          title2: da.title_en || da.title2 || "",
          title_en: da.title_en || "",
          detailedAccountId: da.detailedAccountId || da.id,
        }))
      );
    }).catch((err) => console.error("Error fetching detailed accounts for requester:", err));

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
        const reqActive = checkSetting(resData, "isTrackingFactorActiveInItemRequest");
        setIsTrackingFactorEnabled(whActive && reqActive);
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
    if (!itemRef) return [];
    return allTrackingFactors
      .filter((tf: any) => {
        const related = tf.relatedItems || [];
        return related.some(
          (rel: any) => Number(rel.ItemRef || rel.item?.ItemID) === Number(itemRef)
        );
      })
      .sort((a, b) => (a.DisplayPriority || 1) - (b.DisplayPriority || 1));
  };

  // Fetch Next Request Number on new form
  const fetchNextNumber = () => {
    apiFetch("/api/inv/item-requests/next-number")
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.documentNumber || data.nextNumber)) {
          setValues((prev) => ({
            ...prev,
            RequestNumber: data.documentNumber || data.nextNumber,
          }));
        }
      })
      .catch((err) => console.error("Error fetching next request number:", err));
  };

  const updateValuesFromData = (data: any) => {
    if (!data) return;
    setValues({
      ItemRequestID: data.ItemRequestID,
      BasisType: Number(data.BasisType || BasisTypeEnum.NoBasis),
      RequestNumber: data.RequestNumber || "",
      RequestDate: data.RequestDate || getTodayJalali(),
      Priority: Number(data.Priority || 1),
      Status: Number(data.Status || DocumentState.InitialRegistration),
      Requester: data.Requester || "",
      RequesterRef: data.RequesterRef ? Number(data.RequesterRef) : "",
      WarehouseRef: data.WarehouseRef ? Number(data.WarehouseRef) : "",
      Description: data.Description || "",
      items:
        Array.isArray(data.details) && data.details.length > 0
          ? data.details.map((d: any, idx: number) => {
              const matchedItem = availableItems.find(
                (i) => Number(i.ItemID || i.id) === Number(d.ItemRef)
              );
              const mainUnitName = matchedItem?.UnitName || d.item?.MeasurementUnit?.MeasurementUnitTitle || d.UnitName || "عدد";
              const currentUnitName = d.UnitName || mainUnitName;

              let currentUnitType = d.UnitType || "اصلی";
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
                id: (idx + 1).toString(),
                RowNo: idx + 1,
                ItemRef: d.ItemRef ? Number(d.ItemRef) : null,
                ItemCode: matchedItem?.ItemCode || d.item?.ItemCode || d.ItemCode || "",
                ItemName: matchedItem?.ItemName || d.item?.ItemName || d.ItemName || "",
                UnitName: currentUnitName,
                UnitType: currentUnitType,
                RequestQuantity: Number(d.RequestQuantity || 1),
                ApprovedQuantity: Number(d.ApprovedQuantity || d.RequestQuantity || 1),
                DeliveryDate: d.DeliveryDate || getTodayJalali(),
                Description: d.Description || "",
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
                UnitName: "",
                UnitType: "اصلی",
                RequestQuantity: "",
                ApprovedQuantity: "",
                DeliveryDate: getTodayJalali(),
                Description: "",
                trackingFactorValues: {},
              },
            ],
    });
  };

  // Fetch existing record if activeId is set
  useEffect(() => {
    if (activeId) {
      setIsLoading(true);
      apiFetch(`/api/inv/item-requests/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            updateValuesFromData(data);
          }
        })
        .catch((err) => {
          console.error("Error fetching item request record:", err);
          showToast("خطا در واکشی اطلاعات درخواست کالا", "error");
        })
        .finally(() => setIsLoading(false));
    } else {
      fetchNextNumber();
    }
  }, [activeId, availableItems]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleNew = () => {
    setActiveId(undefined);
    setValues({
      ItemRequestID: "",
      BasisType: BasisTypeEnum.NoBasis,
      RequestNumber: "",
      RequestDate: getTodayJalali(),
      Priority: 1,
      Status: DocumentState.InitialRegistration,
      Requester: "",
      RequesterRef: "",
      WarehouseRef: "",
      Description: "",
      items: [
        {
          id: "1",
          RowNo: 1,
          ItemRef: null,
          ItemCode: "",
          ItemName: "",
          UnitName: "",
          RequestQuantity: "",
          ApprovedQuantity: "",
          DeliveryDate: getTodayJalali(),
          Description: "",
        },
      ],
    });
    fetchNextNumber();
  };

  const handleSave = async (): Promise<boolean> => {
    // Validation (Rule #16)
    if (!values.RequestNumber) {
      showToast("لطفاً شماره را وارد کنید *", "error");
      return false;
    }
    if (!values.RequestDate) {
      showToast("لطفاً تاریخ را وارد کنید *", "error");
      return false;
    }
    if (!values.Requester || !values.Requester.toString().trim()) {
      showToast("لطفاً درخواست‌کننده را وارد کنید *", "error");
      return false;
    }
    if (!values.WarehouseRef) {
      showToast("لطفاً انبار تحویل دهنده را انتخاب کنید *", "error");
      return false;
    }

    // Helper to safely extract numeric ItemRef from string/number/object
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

    // Validate details
    const itemsWithProduct = (values.items || []).filter((item: any) => getItemRef(item) !== null);
    if (itemsWithProduct.length === 0) {
      showToast("لطفاً حداقل یک کالا در جدول اقلام درخواست وارد کنید *", "error");
      return false;
    }
    const invalidQuantityItem = itemsWithProduct.find((item: any) => {
      const q = Number(item.RequestQuantity);
      return isNaN(q) || q <= 0 || item.RequestQuantity === "" || item.RequestQuantity === null || item.RequestQuantity === undefined;
    });
    if (invalidQuantityItem) {
      showToast("لطفاً مقدار را برای تمامی اقلام انتخاب شده وارد کنید *", "error");
      return false;
    }
    const validItems = itemsWithProduct;

    const reqObj = typeof values.Requester === "object" ? values.Requester : null;
    const reqTitle = reqObj ? (reqObj.title || reqObj.name || "") : String(values.Requester || "");
    const reqRef = values.RequesterRef ? Number(values.RequesterRef) : (reqObj ? Number(reqObj.id || reqObj.detailedAccountId) : null);

    const payload = {
      BasisType: Number(values.BasisType || BasisTypeEnum.NoBasis),
      RequestNumber: Number(values.RequestNumber),
      RequestDate: jalaliToGregorianISO(values.RequestDate || getTodayJalali()),
      Priority: Number(values.Priority || 1),
      Status: Number(values.Status || 1),
      Requester: reqTitle,
      RequesterRef: reqRef,
      WarehouseRef: values.WarehouseRef ? Number(typeof values.WarehouseRef === "object" ? (values.WarehouseRef.id || values.WarehouseRef.WarehouseID) : values.WarehouseRef) : null,
      Description: values.Description || "",
      details: validItems.map((item: any, idx: number) => ({
        RowNo: idx + 1,
        ItemRef: getItemRef(item),
        RequestQuantity: Number(item.RequestQuantity),
        ApprovedQuantity: Number(item.ApprovedQuantity || item.RequestQuantity),
        DeliveryDate: jalaliToGregorianISO(item.DeliveryDate || values.RequestDate || getTodayJalali()),
        Description: item.Description || "",
        trackingFactorValues: item.trackingFactorValues || null,
      })),
    };

    try {
      const res = await apiFetch(getUrl("/api/inv/item-requests"), {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "خطا در ذخیره‌سازی درخواست کالا", "error");
        return false;
      }

      const savedData = await res.json();
      showToast("درخواست کالا با موفقیت ذخیره شد", "success");
      if (savedData && (savedData.ItemRequestID || savedData.id)) {
        const savedId = Number(savedData.ItemRequestID || savedData.id);
        setActiveId(savedId);
        updateValuesFromData(savedData);
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
      const res = await apiFetch(`/api/inv/item-requests/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "خطا در حذف درخواست کالا", "error");
        throw new Error(errData.message || "خطا در حذف درخواست کالا");
      }
    } catch (err: any) {
      if (err?.message !== "خطا در حذف درخواست کالا") {
        showToast("خطا در ارسال درخواست حذف", "error");
      }
      throw err;
    }
  };

  const handleListSelect = (item: any) => {
    if (!item) return;
    const selectedId = item.ItemRequestID || item.id;
    if (selectedId) {
      setActiveId(Number(selectedId));
    }
  };

  // Define Form Header Fields (SimpleFormTwoRowTabbed)
  const fields: FieldConfig[] = [
    {
      name: "BasisType",
      label: "مبنا *",
      type: "select",
      required: true,
      options: BASIS_TYPE_OPTIONS,
    },
    {
      name: "RequestNumberAndDate",
      type: "custom",
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <NumberInput
            label="شماره :"
            required
            value={values.RequestNumber}
            onChange={(val) => handleChange("RequestNumber", val)}
            disabled={disabled || isUsed}
            placeholder="شماره"
            labelWidth="45px"
          />
          <DateInput
            label="تاریخ :"
            required
            outputFormat="timestamp"
            value={values.RequestDate}
            onChange={(val) => handleChange("RequestDate", val)}
            disabled={disabled || isUsed}
            labelWidth="40px"
          />
        </div>
      ),
    },
    {
      name: "RequesterAndWarehouse",
      type: "custom",
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <SingleSelectDropDown
            label="درخواست‌کننده :"
            required
            labelWidth="85px"
            options={requesterOptions}
            columns={requesterColumns}
            value={values.RequesterRef || values.Requester}
            valueKey="id"
            displayKey="title"
            onChange={(sel: any, selectedVal?: any) => {
              if (!sel) {
                setValues((prev) => ({ ...prev, Requester: "", RequesterRef: null }));
                return;
              }
              if (typeof sel === "object") {
                const selTitle = sel.title || sel.name || "";
                const selId = sel.id || sel.detailedAccountId || selectedVal;
                setValues((prev) => ({
                  ...prev,
                  Requester: selTitle,
                  RequesterRef: selId ? Number(selId) : null,
                }));
              } else {
                setValues((prev) => ({
                  ...prev,
                  Requester: String(sel),
                  RequesterRef: selectedVal ? Number(selectedVal) : null,
                }));
              }
            }}
            placeholder="انتخاب..."
            disabled={disabled || isUsed}
            addFormOptions={[
              { title: "تعریف حساب تفصیل جدید", componentName: "DetailedAccountForm", groupId: "accounting" },
              { title: "تعریف مرکز هزینه جدید", componentName: "CostCenter", groupId: "accounting" },
              { title: "تعریف پروژه جدید", componentName: "ProjectForm", groupId: "cnt" },
            ]}
          />
          <SingleSelectDropDown
            label="انبار تحویل دهنده :"
            required
            labelWidth="95px"
            options={warehouses}
            columns={warehouseColumns}
            value={values.WarehouseRef}
            valueKey="id"
            displayKey="title"
            onChange={(sel: any, selectedVal?: any) => {
              const finalVal = selectedVal !== undefined && selectedVal !== null ? selectedVal : (sel ? (sel.id || sel.WarehouseID) : null);
              handleChange("WarehouseRef", finalVal ? Number(finalVal) : null);
            }}
            placeholder="انتخاب انبار..."
            disabled={disabled || isUsed}
            addFormOptions={[
              { title: "تعریف انبار جدید", componentName: "WarehouseForm", groupId: "inv" },
            ]}
          />
        </div>
      ),
    },
    {
      name: "StatusAndPriority",
      type: "custom",
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
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
          <Select
            label="اولویت :"
            required
            value={values.Priority ?? 1}
            onChange={(val) => handleChange("Priority", val ? Number(val) : 1)}
            options={PRIORITY_OPTIONS}
            disabled={disabled || isUsed}
            labelWidth="45px"
          />
        </div>
      ),
    },
    {
      name: "Description",
      label: "توضیحات",
      type: "text",
      placeholder: "توضیحات تکمیلی درخواست کالا...",
      colSpan: 2,
    },
  ];

  const itemDropdownColumns: Column[] = [
    { key: "ItemCode", label: "کد کالا", width: 120 },
    { key: "ItemName", label: "عنوان کالا", width: 220 },
    { key: "UnitName", label: "واحد سنجش", width: 120 },
  ];

  // Filter available items by selected delivering warehouse in form header (values.WarehouseRef)
  const filteredAvailableItems = useMemo(() => {
    if (!values.WarehouseRef) {
      return availableItems;
    }
    const selectedWhId = Number(values.WarehouseRef);
    const filtered = availableItems.filter((item: any) => {
      if (!item.physicalWarehouseIds || !Array.isArray(item.physicalWarehouseIds) || item.physicalWarehouseIds.length === 0) {
        return true;
      }
      return item.physicalWarehouseIds.some((wId: any) => Number(wId) === selectedWhId);
    });
    return filtered.length > 0 ? filtered : availableItems;
  }, [availableItems, values.WarehouseRef]);

  const isHeaderComplete = Boolean(
    values.RequestNumber &&
    values.RequestDate &&
    (values.RequesterRef || (values.Requester && String(values.Requester).trim())) &&
    values.WarehouseRef
  );

  // Table Column Config for Requested Items Tab
  const detailTabConfig: TabCellConfig[] = [
    {
      name: "RowNo",
      label: "ردیف",
      type: "text",
      width: "60px",
      render: (_row, rowIndex) => (
        <span className="flex items-center justify-center w-full h-[25px] text-xs font-semibold text-center select-none">
          {rowIndex + 1}
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
        const selectedObj = filteredAvailableItems.find(
          (i) => Number(i.id) === Number(val) || Number(i.ItemID) === Number(val) || (row?.ItemCode && String(i.ItemCode) === String(row.ItemCode))
        ) || availableItems.find(
          (i) => Number(i.id) === Number(val) || Number(i.ItemID) === Number(val) || (row?.ItemCode && String(i.ItemCode) === String(row.ItemCode))
        ) || null;

        return (
          <MultiColumnDropDown
            data={filteredAvailableItems}
            columns={itemDropdownColumns}
            value={selectedObj}
            displayKey="ItemCode"
            placeholder="انتخاب کالا / خدمت..."
            disabled={isUsed || !isHeaderComplete}
            enableMultiSelection={true}
            addFormOptions={[
              { title: "افزودن کالا و خدمت جدید", componentName: "ProductServiceForm", groupId: "inv" }
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
                ItemRef: Number(firstId),
                ItemCode: firstItem.ItemCode || "",
                ItemName: firstItem.ItemName || "",
                UnitName: firstItem.UnitName || "عدد",
                UnitType: "اصلی",
              };

              for (let i = 1; i < selectedList.length; i++) {
                const extraItem = selectedList[i];
                const extraId = extraItem.ItemID || extraItem.id;
                updatedItems.push({
                  id: (Date.now() + i).toString(),
                  RowNo: updatedItems.length + 1,
                  ItemRef: Number(extraId),
                  ItemCode: extraItem.ItemCode || "",
                  ItemName: extraItem.ItemName || "",
                  UnitName: extraItem.UnitName || "عدد",
                  UnitType: "اصلی",
                  RequestQuantity: "",
                  ApprovedQuantity: "",
                  DeliveryDate: values.items?.[rowIndex]?.DeliveryDate || getTodayJalali(),
                  Description: "",
                });
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
      name: "UnitName",
      label: "واحد سنجش",
      type: "custom",
      width: "140px",
      render: (row, rowIndex) => {
        const matchedItem = filteredAvailableItems.find(
          (i) => Number(i.id) === Number(row?.ItemRef) || Number(i.ItemID) === Number(row?.ItemRef)
        ) || availableItems.find(
          (i) => Number(i.id) === Number(row?.ItemRef) || Number(i.ItemID) === Number(row?.ItemRef)
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
            <span className="flex items-center justify-center w-full h-[25px] px-1 text-xs text-gray-600 dark:text-gray-300 text-center select-none font-medium">
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
                  itemId: row?.ItemRef || matchedItem?.ItemID || matchedItem?.id || row?.item?.ItemID,
                  itemCode: row?.ItemCode || matchedItem?.ItemCode || matchedItem?.code || "-",
                  itemTitle: row?.ItemName || matchedItem?.ItemName || matchedItem?.title || "-",
                  primaryUnitName: primaryUnit,
                  subUnits: subUnitsForModal,
                  selectedSubUnitId: row?.UnitName,
                  initialSubQuantity: row?.SubQuantity || row?.RequestQuantity || 1,
                  initialMainQuantity: row?.RequestQuantity,
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
      label: "نوع",
      type: "text",
      width: "80px",
      render: (row) => (
        <span className="flex items-center justify-center w-full h-[25px] px-1 text-xs font-medium text-gray-700 dark:text-gray-300 text-center select-none">
          {row?.UnitType || "اصلی"}
        </span>
      ),
    },
    {
      name: "RequestQuantity",
      label: "مقدار درخواست *",
      type: "custom",
      width: "150px",
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
              value={row?.RequestQuantity || ""}
              onChange={(newVal) => {
                const updatedItems = [...(values.items || [])];
                updatedItems[rowIndex] = {
                  ...updatedItems[rowIndex],
                  RequestQuantity: newVal,
                  ApprovedQuantity: newVal,
                };
                setValues((prev) => ({ ...prev, items: updatedItems }));
              }}
              disabled={isUsed || showPlusBtn}
            />
            {showPlusBtn && (
              <button
                type="button"
                title="ثبت عوامل ردیابی"
                onClick={() => {
                  const origQty = row?.originalQuantity ?? (row?.remainingQuantity !== undefined && row?.usedQuantity !== undefined ? Number(row.remainingQuantity) + Number(row.usedQuantity) : row?.maxQuantity ?? row?.RequestQuantity ?? row?.Quantity);
                  const recQty = row?.usedQuantity ?? (origQty !== undefined && row?.remainingQuantity !== undefined ? Math.max(0, Number(origQty) - Number(row.remainingQuantity)) : 0);
                  const remQty = row?.remainingQuantity ?? (origQty !== undefined && recQty !== undefined ? Math.max(0, Number(origQty) - Number(recQty)) : row?.maxQuantity ?? row?.RequestQuantity ?? row?.Quantity);
                  const itemHasBase = Boolean(row?.BaseDocumentHeaderRef || row?.baseDocumentHeaderRef || row?.BaseRequestRef || (Number(values.BaseType || 0) !== 0 && Number(values.BaseType) !== 1));
                  setTfModalState({
                    isOpen: true,
                    rowIndex,
                    itemName: row?.ItemName || "کالا",
                    itemCode: row?.ItemCode || "",
                    trackingFactors: itemTfs,
                    initialValues: row?.trackingFactorValues || {},
                    initialQuantity: row?.RequestQuantity || remQty || 1,
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
      name: "ApprovedQuantity",
      label: "مقدار تایید شده",
      type: "custom",
      width: "120px",
      render: (row, rowIndex) => (
        <NumberInput
          value={row?.ApprovedQuantity || ""}
          onChange={(newVal) => {
            const updatedItems = [...(values.items || [])];
            updatedItems[rowIndex] = { ...updatedItems[rowIndex], ApprovedQuantity: newVal };
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "DeliveryDate",
      label: "تاریخ نیاز",
      type: "custom",
      width: "140px",
      render: (row, rowIndex) => (
        <DateInput
          outputFormat="timestamp"
          value={row?.DeliveryDate || ""}
          onChange={(newDate) => {
            const updatedItems = [...(values.items || [])];
            updatedItems[rowIndex] = { ...updatedItems[rowIndex], DeliveryDate: newDate };
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "Description",
      label: "ملاحظات",
      type: "custom",
      width: "200px",
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
        title={activeId ? "ویرایش درخواست کالا" : "درخواست کالا جدید"}
        fields={fields}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        onSaveNew={handleSaveNew}
        onNew={handleNew}
        onDelete={handleDelete}
        onListSelect={handleListSelect}
        listApiUrl="/api/inv/item-requests"
        listDisplayKey="RequestNumber"
        listColumns={[
          { key: "RequestNumber", label: "شماره", title: "شماره" },
          {
            key: "RequestDate",
            label: "تاریخ",
            title: "تاریخ",
            render: (val: string) => gregorianToJalaliDisplay(val),
          },
          {
            key: "BasisType",
            label: "مبنا",
            title: "مبنا",
            render: (val: number) => BASIS_TYPE_OPTIONS.find((b) => b.id === Number(val))?.title || val,
          },
          { key: "Requester", label: "درخواست‌کننده", title: "درخواست‌کننده" },
          {
            key: "Priority",
            label: "اولویت",
            title: "اولویت",
            render: (val: number) => PRIORITY_OPTIONS.find((p) => p.id === Number(val))?.title || val,
          },
          {
            key: "Status",
            label: "وضعیت",
            title: "وضعیت",
            render: (val: number) => DocumentStateLabels[val as DocumentState] || val,
          },
        ]}
        targetForm="ItemRequest"
        isReadonly={isUsed}
        bottomTabs={[
          {
            id: "items_tab",
            label: "اقلام درخواست کالا",
            content: (
              <div className="flex flex-col flex-1 h-full w-full min-h-0 overflow-hidden">
                {!isHeaderComplete && (
                  <div className="m-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-xs font-medium flex items-center gap-2 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-300 select-none shrink-0">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>جهت ورود اطلاعات در جدول اقلام، ابتدا اطلاعات اصلی (هدر) فرم را تکمیل نمایید.</span>
                  </div>
                )}
                <TabCellRow
                  tabs={detailTabConfig}
                  value={values.items || []}
                  onChange={(newItems) => {
                    if (!isHeaderComplete) return;
                    setValues((prev) => ({
                      ...prev,
                      items: newItems.map((item, idx) => ({ ...item, RowNo: idx + 1 })),
                    }));
                  }}
                  hideHeader={false}
                  hideAddButton={isUsed || !isHeaderComplete}
                  hideDeleteButton={isUsed || !isHeaderComplete}
                  isReadonly={isUsed || !isHeaderComplete}
                />
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

          // Calculate total quantity from tracking factor modal rows
          const totalQty = Array.isArray(tfValues)
            ? tfValues.reduce((sum: number, r: any) => {
                const q = parseFloat(String(r?.Quantity || 0).replace(/,/g, ""));
                return sum + (isNaN(q) ? 0 : q);
              }, 0)
            : parseFloat(String(tfValues?.Quantity || 0).replace(/,/g, "")) || 0;

          updatedItems[idx] = {
            ...updatedItems[idx],
            originalQuantity: tfModalState.originalQuantity ?? updatedItems[idx].originalQuantity,
            usedQuantity: tfModalState.receivedQuantity ?? updatedItems[idx].usedQuantity,
            remainingQuantity: tfModalState.remainingQuantity ?? updatedItems[idx].remainingQuantity,
            trackingFactorValues: tfValues,
            ...(totalQty > 0 ? { RequestQuantity: totalQty, ApprovedQuantity: totalQty } : {}),
          };
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

          updatedItems[idx] = {
            ...targetRow,
            UnitName: result.subUnit.SubUnitName,
            UnitType: "فرعی",
            SubQuantity: subQty,
            RequestQuantity: subQty,
            ApprovedQuantity: subQty,
            MainToSubRatio: result.ratioUsed,
            IsVariableRatio: result.isVariable,
          };

          setValues((prev) => ({ ...prev, items: updatedItems }));
        }}
        onSelectPrimaryUnit={(result) => {
          const idx = subUnitModalState.rowIndex;
          if (idx < 0 || idx >= (values.items || []).length) return;
          const updatedItems = [...(values.items || [])];
          const targetRow = updatedItems[idx];
          const fixedQty = result ? result.fixedMainQuantity : 0;

          updatedItems[idx] = {
            ...targetRow,
            UnitName: result?.primaryUnitName || subUnitModalState.primaryUnitName,
            UnitType: "اصلی",
            SubQuantity: undefined,
            RequestQuantity: fixedQty,
            ApprovedQuantity: fixedQty,
            MainToSubRatio: 1,
            IsVariableRatio: false,
          };

          setValues((prev) => ({ ...prev, items: updatedItems }));
        }}
      />
    </>
  );
}

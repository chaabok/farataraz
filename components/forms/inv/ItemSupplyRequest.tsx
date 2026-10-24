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
import { StateListInput, DocumentState, DocumentStateLabels } from "@/components/inputs/StateListInput";
import { TextArea } from "@/components/inputs/TextArea";
import { Plus } from "lucide-react";
import { TrackingFactorModal, TrackingFactorItem } from "@/components/forms/inv/TrackingFactorModal";
import { SubUnitModal } from "@/components/inputs/SubUnitModal";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import momentJalaali from "moment-jalaali";

interface ItemSupplyRequestProps {
  id?: number;
  tabId?: string;
}

export enum SupplyRequestBaseType {
  None = 1,
  InventoryControl = 2,
  ItemRequest = 3,
}

export const SUPPLY_REQUEST_BASE_OPTIONS = [
  { id: SupplyRequestBaseType.None, title: "بدون مبنا", value: SupplyRequestBaseType.None, label: "بدون مبنا" },
  { id: SupplyRequestBaseType.InventoryControl, title: "کنترل موجودی", value: SupplyRequestBaseType.InventoryControl, label: "کنترل موجودی" },
  { id: SupplyRequestBaseType.ItemRequest, title: "درخواست کالا", value: SupplyRequestBaseType.ItemRequest, label: "درخواست کالا" },
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

export function ItemSupplyRequest({ id, tabId }: ItemSupplyRequestProps) {
  const { removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, setActiveId, method, getUrl } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("ItemSupplyRequest", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    ItemSupplyRequestID: "",
    BaseSource: SupplyRequestBaseType.None,
    RequestNumber: "",
    RequestDate: getTodayJalali(),
    Priority: 1,
    Status: DocumentState.InitialRegistration,
    Requester: "",
    RequesterRef: "",
    Description: "",
    items: [
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
      },
    ],
  });

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

  const requesterColumns: SingleSelectColumn[] = [
    { key: "code", label: "کد", width: 100 },
    { key: "title", label: "عنوان", width: 220 },
    { key: "title2", label: "نوع تفصیلی", width: 180 },
  ];

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/inv/item-supply-requests/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setValues({
              ItemSupplyRequestID: data.ItemSupplyRequestID || data.ItemServiceSupplyRequestID || activeId,
              BaseSource: data.BasisType !== undefined ? Number(data.BasisType) : (data.BaseSource ? Number(data.BaseSource) : SupplyRequestBaseType.None),
              RequestNumber: data.RequestNumber || "",
              RequestDate: data.RequestDate ? momentJalaali(data.RequestDate).format("jYYYY/jMM/jDD") : getTodayJalali(),
              Priority: data.Priority ? Number(data.Priority) : 1,
              Status: data.Status ? Number(data.Status) : DocumentState.InitialRegistration,
              Requester: data.Requester || data.requesterAccount?.title || "",
              RequesterRef: data.RequesterRef ? Number(data.RequesterRef) : "",
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
                        id: String(d.ItemSupplyRequestDetailID || idx + 1),
                        RowNo: d.RowNo || idx + 1,
                        ItemRef: d.ItemRef,
                        ItemCode: d.item?.ItemCode || d.ItemCode || "",
                        ItemName: d.item?.ItemName || d.ItemName || "",
                        UnitName: currentUnitName,
                        UnitType: currentUnitType,
                        RequestQuantity: d.RequestQuantity,
                        ApprovedQuantity: d.ApprovedQuantity,
                        DeliveryDate: d.DeliveryDate ? momentJalaali(d.DeliveryDate).format("jYYYY/jMM/jDD") : getTodayJalali(),
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
          }
        })
        .catch((err) => console.error("Error loading item supply request:", err));
    } else {
      apiFetch("/api/inv/item-supply-requests/next-number")
        .then((res) => res.json())
        .then((data) => {
          if (data?.documentNumber) {
            setValues((prev) => ({ ...prev, RequestNumber: data.documentNumber }));
          }
        })
        .catch((err) => console.error("Error fetching next number:", err));
    }
  }, [activeId]);

  useEffect(() => {
    // Fetch items of type Goods (کالا) only
    apiFetch("/api/inv/items/dropdown?type=1")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        const goodsList = list.filter(
          (item: any) => item.ItemType === undefined || item.ItemType === null || Number(item.ItemType) === 1
        );
        setAvailableItems(
          goodsList.map((item: any) => {
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
              ItemType: Number(item.ItemType || 1),
              title: `${item.ItemCode ? item.ItemCode + " - " : ""}${item.ItemName || item.title || item.name || ""}`,
            };
          })
        );
      })
      .catch((err) => console.error("Error fetching items:", err));

    // Fetch Detailed Accounts for Requester (Cost Center and Project)
    apiFetch("/api/inv/item-supply-requests/requesters")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setRequesterOptions(
          list.map((da: any) => ({
            id: Number(da.id || da.detailedAccountId),
            code: da.code || "",
            title: da.title || "",
            title2: da.title2 || da.detailedType?.title || "",
            title_en: da.title_en || "",
            detailedAccountId: Number(da.id || da.detailedAccountId),
          }))
        );
      })
      .catch((err) => console.error("Error fetching requesters:", err));

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
        const supplyActive = checkSetting(resData, "isTrackingFactorActiveInItemSupplyRequest");
        setIsTrackingFactorEnabled(whActive && supplyActive);
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

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

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
        const selectedObj = availableItems.find(
          (i) => Number(i.id) === Number(val) || Number(i.ItemID) === Number(val) || (row?.ItemCode && String(i.ItemCode) === String(row.ItemCode))
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
              { title: "افزودن کالا جدید", componentName: "ProductServiceForm", groupId: "inv" }
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
        const matchedItem = availableItems.find(
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
                  const itemHasBase = Boolean(row?.BaseDocumentHeaderRef || row?.baseDocumentHeaderRef || row?.ItemRequestRef || (Number(values.BaseSource) && Number(values.BaseSource) !== SupplyRequestBaseType.None));
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

  const fields: FieldConfig[] = [
    {
      name: "BaseSource",
      label: "مبنا",
      type: "select",
      required: true,
      colSpan: 1,
      disabled: isUsed,
      options: SUPPLY_REQUEST_BASE_OPTIONS,
    },
    {
      name: "RequestNumberAndDate",
      type: "custom",
      colSpan: 1,
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <TextInput
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
            value={values.RequestDate}
            onChange={(val) => handleChange("RequestDate", val)}
            disabled={disabled || isUsed}
            labelWidth="40px"
          />
        </div>
      ),
    },
    {
      name: "Requester",
      label: "درخواست کننده",
      type: "custom",
      colSpan: 1,
      disabled: isUsed,
      render: ({ disabled }) => (
        <SingleSelectDropDown
          noWrapper={true}
          options={requesterOptions}
          data={requesterOptions}
          columns={requesterColumns}
          value={values.RequesterRef || values.Requester}
          selectedValue={values.RequesterRef || values.Requester}
          valueKey="id"
          displayKey="title"
          searchKeys={["code", "title", "title2"]}
          placeholder="انتخاب کنید..."
          onChange={(selected: any, selectedVal?: any) => {
            if (!selected) {
              setValues((prev) => ({ ...prev, Requester: "", RequesterRef: null }));
              return;
            }
            if (typeof selected === "object") {
              const reqTitle = selected.title || selected.name || "";
              const reqId = selected.id || selected.detailedAccountId || selectedVal;
              setValues((prev) => ({
                ...prev,
                Requester: reqTitle,
                RequesterRef: reqId ? Number(reqId) : null,
              }));
            } else {
              setValues((prev) => ({ ...prev, Requester: String(selected) }));
            }
          }}
          disabled={disabled || isUsed}
          addFormOptions={[
            { title: "تعریف حساب تفصیل جدید", componentName: "DetailedAccountForm", groupId: "accounting" },
            { title: "تعریف مرکز هزینه جدید", componentName: "CostCenter", groupId: "accounting" },
            { title: "تعریف پروژه جدید", componentName: "ProjectForm", groupId: "cnt" },
          ]}
        />
      ),
    },
    {
      name: "PriorityAndStatus",
      type: "custom",
      colSpan: 1,
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <Select
            label="اولویت :"
            value={values.Priority}
            onChange={(val) => handleChange("Priority", Number(val))}
            disabled={disabled || isUsed}
            options={PRIORITY_OPTIONS}
            labelWidth="45px"
          />
          <StateListInput
            label="وضعیت :"
            value={values.Status || DocumentState.InitialRegistration}
            onChange={(val) => handleChange("Status", Number(val))}
            disabled={disabled || isUsed}
            labelWidth="50px"
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
      placeholder: "توضیحات تکمیلی...",
    },
  ];

  const handleSave = async (): Promise<boolean> => {
    if (!values.RequestNumber) {
      showToast("لطفاً شماره را وارد کنید *", "error");
      return false;
    }
    if (!values.RequestDate) {
      showToast("لطفاً تاریخ را وارد کنید *", "error");
      return false;
    }

    const itemsWithProduct = (values.items || []).filter((item: any) => getItemRef(item) !== null);
    if (itemsWithProduct.length === 0) {
      showToast("لطفاً حداقل یک کالا یا خدمت در جدول اقلام درخواست وارد کنید *", "warning");
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

    setIsLoading(true);
    try {
      const payload = {
        ...values,
        BasisType: Number(values.BaseSource || SupplyRequestBaseType.None),
        BaseSource: Number(values.BaseSource || SupplyRequestBaseType.None),
        RequestNumber: Number(values.RequestNumber) || values.RequestNumber,
        RequestDate: values.RequestDate,
        Priority: Number(values.Priority || 1),
        Status: Number(values.Status || DocumentState.InitialRegistration),
        Requester: values.Requester || "",
        RequesterRef: values.RequesterRef ? Number(values.RequesterRef) : null,
        Description: values.Description || "",
        details: validItems.map((item: any, idx: number) => ({
          RowNo: idx + 1,
          ItemRef: getItemRef(item),
          UnitName: item.UnitName || "عدد",
          UnitType: item.UnitType || "اصلی",
          RequestQuantity: Number(item.RequestQuantity),
          ApprovedQuantity: Number(item.ApprovedQuantity || item.RequestQuantity),
          DeliveryDate: item.DeliveryDate || values.RequestDate || getTodayJalali(),
          Description: item.Description || "",
          trackingFactorValues: item.trackingFactorValues || null,
        })),
      };

      const saveUrl = activeId ? `/api/inv/item-supply-requests/${activeId}` : "/api/inv/item-supply-requests";
      const saveMethod = activeId ? "PUT" : "POST";

      const res = await apiFetch(saveUrl, {
        method: saveMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && (data.ItemSupplyRequestID || data.id || data.success)) {
        showToast("درخواست تامین کالا با موفقیت ذخیره شد.", "success");
        const savedId = data.ItemSupplyRequestID || data.id || data.data?.ItemSupplyRequestID;
        if (savedId) {
          const numId = Number(savedId);
          setActiveId(numId);
          setValues((prev) => ({
            ...prev,
            ItemSupplyRequestID: numId,
            id: numId,
          }));
        }
        return true;
      } else {
        showToast(data.message || "خطا در ذخیره‌سازی درخواست تامین کالا", "error");
        return false;
      }
    } catch (err: any) {
      console.error(err);
      showToast("خطا در ارتباط با سرور", "error");
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
      ItemSupplyRequestID: "",
      BaseSource: SupplyRequestBaseType.None,
      RequestNumber: "",
      RequestDate: getTodayJalali(),
      Priority: 1,
      Status: DocumentState.InitialRegistration,
      Requester: "",
      RequesterRef: "",
      Description: "",
      items: [
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
        },
      ],
    });

    apiFetch("/api/inv/item-supply-requests/next-number")
      .then((res) => res.json())
      .then((data) => {
        if (data?.documentNumber) {
          setValues((prev) => ({ ...prev, RequestNumber: data.documentNumber }));
        }
      })
      .catch((err) => console.error("Error fetching next number:", err));
  };

  const handleDelete = async () => {
    if (!activeId) return;
    try {
      const res = await apiFetch(`/api/inv/item-supply-requests/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "خطا در حذف درخواست تامین کالا", "error");
        throw new Error(errData.message || "خطا در حذف درخواست تامین کالا");
      }
    } catch (err: any) {
      if (err?.message !== "خطا در حذف درخواست تامین کالا") {
        showToast("خطا در ارسال درخواست حذف", "error");
      }
      throw err;
    }
  };

  const handleListSelect = (item: any) => {
    if (!item) return;
    const selectedId = item.ItemSupplyRequestID || item.id;
    if (selectedId) {
      setActiveId(Number(selectedId));
    }
  };

  const handleClose = () => {
    if (tabId) {
      removeTab(tabId);
    }
  };

  return (
    <>
      <SimpleFormTwoRowTabbed
        title={activeId ? "ویرایش درخواست تامین کالا" : "درخواست تامین کالا جدید"}
        fields={fields}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        onSaveNew={handleSaveNew}
        onNew={handleNew}
        onDelete={handleDelete}
        onListSelect={handleListSelect}
        onClose={handleClose}
        listApiUrl="/api/inv/item-supply-requests"
        listDisplayKey="RequestNumber"
        listColumns={[
          { key: "RequestNumber", label: "شماره", title: "شماره" },
          { key: "RequestDate", label: "تاریخ", title: "تاریخ" },
          {
            key: "BaseSource",
            label: "مبنا",
            title: "مبنا",
            render: (val: number) => SUPPLY_REQUEST_BASE_OPTIONS.find((b) => b.id === Number(val))?.title || "بدون مبنا",
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
        targetForm="ItemSupplyRequest"
        isReadonly={isUsed}
        bottomTabs={[
          {
            id: "items_tab",
            label: "اقلام درخواست تامین کالا",
            content: (
              <TabCellRow
                tabs={detailTabConfig}
                value={values.items || []}
                onChange={(newItems) =>
                  setValues((prev) => ({
                    ...prev,
                    items: newItems.map((item, idx) => ({ ...item, RowNo: idx + 1 })),
                  }))
                }
                hideHeader={false}
                hideAddButton={isUsed}
                hideDeleteButton={isUsed}
              />
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

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { FieldConfig } from "../SimpleFormTwoRow";
import { TabCellRow, TabCellConfig, TabCellColumn } from "../TabCellRow";
import { SingleSelectDropDown, SingleSelectColumn } from "@/components/inputs/SingleSelectDropDown";
import { MultiColumnDropDown, Column } from "@/components/inputs/MultiColumnDropdown";
import { NumberInput } from "@/components/inputs/NumberInput";
import { TextInput } from "@/components/inputs/TextInput";
import { Select } from "@/components/inputs/Select";
import { TextArea } from "@/components/inputs/TextArea";
import { CheckBoxRightLabel } from "@/components/inputs/CheckBoxRightLabel";
import { Package, Plus, List } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { eventBus, EVENTS } from "@/lib/events";
import { ItemType } from "@/backend/src/softwares/inv/domain/enums/item.enums";

interface ItemPackageProps {
  id?: number;
  tabId?: string;
}

const ITEM_TYPE_OPTIONS = [
  { id: ItemType.GOODS, value: ItemType.GOODS, label: "کالا", title: "کالا" },
  { id: ItemType.SERVICE, value: ItemType.SERVICE, label: "خدمت", title: "خدمت" },
];

export function ItemPackage({ id, tabId }: ItemPackageProps) {
  const { removeTab, addTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, setActiveId, method, getUrl } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("ItemPackage", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    ItemPackageID: "",
    ItemType: ItemType.GOODS,
    PackageCode: "",
    PackageTitle: "",
    PackageTitle2: "",
    MeasurementUnitRef: null,
    Quantity: 1,
    Description: "",
    IsActive: true,
    items: [
      {
        id: "1",
        RowNo: 1,
        ItemRef: null,
        ItemCode: "",
        ItemName: "",
        ItemName2: "",
        MeasurementUnitRef: null,
        Quantity: 1,
        Description: "",
      },
    ],
  });

  const [measurementUnits, setMeasurementUnits] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [allPackagesList, setAllPackagesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Measurement Units
  useEffect(() => {
    apiFetch("/api/inv/measurement-units")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data || []);
        if (Array.isArray(list)) {
          setMeasurementUnits(
            list.map((mu: any) => ({
              id: Number(mu.MeasurementUnitID || mu.id),
              code: mu.MeasurementUnitCode || mu.code || "",
              title: mu.MeasurementUnitName || mu.title || "",
              title2: mu.MeasurementUnitName2 || mu.title2 || "",
              symbol: mu.Symbol || mu.symbol || "",
            }))
          );
        }
      })
      .catch((err) => console.error("Error fetching measurement units:", err));
  }, []);

  // Fetch Available Items / Services for row selection
  useEffect(() => {
    apiFetch("/api/inv/items/dropdown")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableItems(
            data.map((item: any) => {
              const itemTypeId = Number(item.ItemType || item.itemType || 1);
              const mUnitRef = item.MeasurementUnitRef || item.MeasurementUnitID || item.mainUnit?.MeasurementUnitID;
              const mUnitName = item.MeasurementUnitName || item.UnitName || item.mainUnit?.MeasurementUnitName || "";
              return {
                id: Number(item.ItemID || item.id),
                ItemID: Number(item.ItemID || item.id),
                ItemType: itemTypeId,
                itemTypeTitle: itemTypeId === ItemType.SERVICE ? "خدمت" : "کالا",
                ItemCode: item.ItemCode || "",
                ItemName: item.ItemName || item.title || "",
                ItemName2: item.ItemName2 || "",
                MeasurementUnitID: mUnitRef ? Number(mUnitRef) : null,
                MeasurementUnitName: mUnitName,
                subUnits: Array.isArray(item.subUnits) ? item.subUnits : [],
                allUnits: Array.isArray(item.allUnits) ? item.allUnits : [],
              };
            })
          );
        }
      })
      .catch((err) => console.error("Error fetching items dropdown:", err));
  }, []);

  // Fetch all packages for navigation (first, prev, next, last)
  const fetchAllPackages = () => {
    apiFetch("/api/inv/item-packages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllPackagesList(data);
        }
      })
      .catch((err) => console.error("Error fetching package list:", err));
  };

  useEffect(() => {
    fetchAllPackages();
  }, [activeId]);

  // Fetch Next Package Code when creating a new form
  const fetchNextNumber = () => {
    apiFetch("/api/inv/item-packages/next-number")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.packageCode) {
          setValues((prev) => ({
            ...prev,
            PackageCode: data.packageCode,
          }));
        }
      })
      .catch((err) => console.error("Error fetching next package number:", err));
  };

  const updateValuesFromData = (data: any) => {
    if (!data) return;
    setValues({
      ItemPackageID: data.ItemPackageID,
      ItemType: Number(data.ItemType || ItemType.GOODS),
      PackageCode: data.PackageCode || "",
      PackageTitle: data.PackageTitle || "",
      PackageTitle2: data.PackageTitle2 || "",
      MeasurementUnitRef: data.MeasurementUnitRef ? Number(data.MeasurementUnitRef) : null,
      Quantity: data.Quantity !== undefined ? Number(data.Quantity) : 1,
      Description: data.Description || "",
      IsActive: data.IsActive !== undefined ? Boolean(data.IsActive) : true,
      items:
        Array.isArray(data.Details) && data.Details.length > 0
          ? data.Details.map((d: any, idx: number) => {
              const matchedItem = availableItems.find(
                (i) => Number(i.id) === Number(d.ItemRef)
              );
              return {
                id: (idx + 1).toString(),
                RowNo: idx + 1,
                ItemRef: d.ItemRef ? Number(d.ItemRef) : null,
                ItemCode: matchedItem?.ItemCode || d.Item?.ItemCode || "",
                ItemName: matchedItem?.ItemName || d.Item?.ItemName || "",
                ItemName2: matchedItem?.ItemName2 || d.Item?.ItemName2 || "",
                MeasurementUnitRef: d.MeasurementUnitRef ? Number(d.MeasurementUnitRef) : (matchedItem?.MeasurementUnitID || null),
                Quantity: Number(d.Quantity || 1),
                Description: d.Description || "",
              };
            })
          : [
              {
                id: "1",
                RowNo: 1,
                ItemRef: null,
                ItemCode: "",
                ItemName: "",
                ItemName2: "",
                MeasurementUnitRef: null,
                Quantity: 1,
                Description: "",
              },
            ],
    });
  };

  // Load existing package by ID
  useEffect(() => {
    if (activeId) {
      setIsLoading(true);
      apiFetch(`/api/inv/item-packages/${activeId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Package not found");
          return res.json();
        })
        .then((data) => {
          updateValuesFromData(data);
        })
        .catch((err) => {
          console.error("Error fetching package details:", err);
          showToast("خطا در واکشی اطلاعات پک کالا خدمت", "error");
        })
        .finally(() => setIsLoading(false));
    } else {
      fetchNextNumber();
    }
  }, [activeId]);

  // Handle EventBus Navigation
  useEffect(() => {
    const handleNavigate = (event: any) => {
      if (event && event.formName === "ItemPackage" && event.id) {
        setActiveId(Number(event.id));
      }
    };
    eventBus.on(EVENTS.NAVIGATE_FORM, handleNavigate);
    return () => {
      eventBus.off(EVENTS.NAVIGATE_FORM, handleNavigate);
    };
  }, [setActiveId]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleNew = () => {
    setActiveId(null);
    setValues({
      ItemPackageID: "",
      ItemType: ItemType.GOODS,
      PackageCode: "",
      PackageTitle: "",
      PackageTitle2: "",
      MeasurementUnitRef: null,
      Quantity: 1,
      Description: "",
      IsActive: true,
      items: [
        {
          id: "1",
          RowNo: 1,
          ItemRef: null,
          ItemCode: "",
          ItemName: "",
          ItemName2: "",
          MeasurementUnitRef: null,
          Quantity: 1,
          Description: "",
        },
      ],
    });
    fetchNextNumber();
  };

  const handleSave = async (): Promise<boolean> => {
    if (!values.PackageTitle || !String(values.PackageTitle).trim()) {
      showToast("لطفاً عنوان پک را وارد کنید *", "error");
      return false;
    }

    const getItemRef = (item: any) => {
      if (!item) return null;
      const ref = typeof item.ItemRef === "object" ? item.ItemRef?.id || item.ItemRef?.ItemID : item.ItemRef;
      const num = Number(ref);
      return !isNaN(num) && num > 0 ? num : null;
    };

    const validItems = (values.items || []).filter((item: any) => {
      const itemRef = getItemRef(item);
      return itemRef !== null && Number(item.Quantity || 0) > 0;
    });

    if (validItems.length === 0) {
      showToast("لطفاً حداقل یک کالا یا خدمت معتبر در اقلام پک وارد کنید *", "error");
      return false;
    }

    const payload = {
      ItemType: Number(values.ItemType || ItemType.GOODS),
      PackageCode: values.PackageCode || "",
      PackageTitle: String(values.PackageTitle).trim(),
      PackageTitle2: values.PackageTitle2 || "",
      MeasurementUnitRef: values.MeasurementUnitRef ? Number(typeof values.MeasurementUnitRef === "object" ? values.MeasurementUnitRef.id : values.MeasurementUnitRef) : null,
      Quantity: Number(values.Quantity || 1),
      Description: values.Description || "",
      IsActive: Boolean(values.IsActive),
      items: validItems.map((item: any, idx: number) => ({
        RowNo: idx + 1,
        ItemRef: getItemRef(item),
        MeasurementUnitRef: item.MeasurementUnitRef ? Number(typeof item.MeasurementUnitRef === "object" ? item.MeasurementUnitRef.id : item.MeasurementUnitRef) : null,
        Quantity: Number(item.Quantity || 1),
        Description: item.Description || "",
      })),
    };

    try {
      const res = await apiFetch(getUrl("/api/inv/item-packages"), {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "خطا در ذخیره‌سازی پک کالا خدمت", "error");
        return false;
      }

      const savedData = await res.json();
      showToast("پک کالا خدمت با موفقیت ذخیره شد", "success");
      if (savedData && (savedData.ItemPackageID || savedData.id)) {
        const savedId = Number(savedData.ItemPackageID || savedData.id);
        setActiveId(savedId);
        updateValuesFromData(savedData);
        fetchAllPackages();
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
      const res = await apiFetch(`/api/inv/item-packages/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "خطا در حذف پک کالا خدمت", "error");
        return;
      }
      showToast("پک کالا خدمت با موفقیت حذف شد", "success");
      handleNew();
      fetchAllPackages();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("خطا در اجرای عملیات حذف", "error");
    }
  };

  // Record Navigation logic
  const handleFirst = () => {
    if (allPackagesList.length > 0) {
      const first = allPackagesList[allPackagesList.length - 1];
      if (first?.ItemPackageID) setActiveId(Number(first.ItemPackageID));
    }
  };

  const handlePrevious = () => {
    if (allPackagesList.length > 0 && activeId) {
      const currentIdx = allPackagesList.findIndex((p) => Number(p.ItemPackageID) === Number(activeId));
      if (currentIdx !== -1 && currentIdx < allPackagesList.length - 1) {
        setActiveId(Number(allPackagesList[currentIdx + 1].ItemPackageID));
      }
    }
  };

  const handleNext = () => {
    if (allPackagesList.length > 0 && activeId) {
      const currentIdx = allPackagesList.findIndex((p) => Number(p.ItemPackageID) === Number(activeId));
      if (currentIdx > 0) {
        setActiveId(Number(allPackagesList[currentIdx - 1].ItemPackageID));
      }
    }
  };

  const handleLast = () => {
    if (allPackagesList.length > 0) {
      const last = allPackagesList[0];
      if (last?.ItemPackageID) setActiveId(Number(last.ItemPackageID));
    }
  };

  const handleList = () => {
    addTab(
      "فهرست پک کالا خدمت",
      "inv",
      <List className="w-4 h-4" />,
      "ItemPackageList"
    );
  };

  const packageListColumns = useMemo(() => [
    { key: "ItemType", label: "نوع", renderItem: (item: any) => (Number(item.ItemType) === ItemType.SERVICE ? "خدمت" : "کالا") },
    { key: "PackageCode", label: "کد" },
    { key: "PackageTitle", label: "عنوان" },
    { key: "PackageTitle2", label: "عنوان ۲" },
    { key: "IsActive", label: "وضعیت", renderItem: (item: any) => (item.IsActive ? "فعال" : "غیرفعال") },
  ], []);

  const handleListSelect = (item: any) => {
    const pkgId = item.ItemPackageID || item.id;
    if (pkgId && activeId !== pkgId) {
      setActiveId(Number(pkgId));
    }
  };

  const measurementUnitColumns: SingleSelectColumn[] = [
    { key: "code", label: "کد", width: 80 },
    { key: "title", label: "عنوان واحد", width: 180 },
    { key: "symbol", label: "نماد", width: 100 },
  ];

  const filteredAvailableItems = useMemo(() => {
    const selectedType = Number(values.ItemType);
    if (selectedType === ItemType.GOODS || selectedType === 1) {
      return availableItems.filter((i) => Number(i.ItemType) === ItemType.GOODS || Number(i.ItemType) === 1);
    }
    if (selectedType === ItemType.SERVICE || selectedType === 2) {
      return availableItems.filter((i) => Number(i.ItemType) === ItemType.SERVICE || Number(i.ItemType) === 2);
    }
    return availableItems;
  }, [availableItems, values.ItemType]);

  // Columns for MultiColumnDropDown item picker
  const itemDropdownColumns: Column[] = useMemo(() => {
    const isService = Number(values.ItemType) === ItemType.SERVICE || Number(values.ItemType) === 2;
    return [
      { key: "itemTypeTitle", label: "نوع", width: 80 },
      { key: "ItemCode", label: isService ? "کد خدمت" : "کد کالا", width: 110 },
      { key: "ItemName", label: isService ? "عنوان خدمت" : "عنوان کالا", width: 200 },
      { key: "ItemName2", label: isService ? "عنوان خدمت (۲)" : "عنوان کالا (۲)", width: 160 },
      { key: "MeasurementUnitName", label: "واحد سنجش", width: 110 },
    ];
  }, [values.ItemType]);

  // Header Fields Configuration
  const fieldsConfig: FieldConfig[] = [
    {
      name: "ItemType",
      type: "custom",
      noWrapper: true,
      render: ({ value, onChange, disabled }) => (
        <Select
          label="نوع :"
          required
          options={ITEM_TYPE_OPTIONS}
          value={value || ItemType.GOODS}
          onChange={(val) => onChange("ItemType", Number(val))}
          disabled={disabled || isUsed}
          labelWidth="75px"
        />
      ),
    },
    {
      name: "PackageCodeAndTitle",
      type: "custom",
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <TextInput
            label="کد پک :"
            value={values.PackageCode}
            onChange={(val) => handleChange("PackageCode", val)}
            disabled={disabled || isUsed}
            placeholder="کد پک"
            labelWidth="50px"
          />
          <TextInput
            label="عنوان پک :"
            required
            value={values.PackageTitle}
            onChange={(val) => handleChange("PackageTitle", val)}
            disabled={disabled || isUsed}
            placeholder="عنوان پک"
            labelWidth="65px"
          />
        </div>
      ),
    },
    {
      name: "PackageTitle2AndUnit",
      type: "custom",
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <TextInput
            label="عنوان پک(2) :"
            value={values.PackageTitle2}
            onChange={(val) => handleChange("PackageTitle2", val)}
            disabled={disabled || isUsed}
            placeholder="عنوان پک (۲)"
            labelWidth="75px"
          />
          <SingleSelectDropDown
            options={measurementUnits}
            columns={measurementUnitColumns}
            value={values.MeasurementUnitRef}
            valueKey="id"
            displayKey="title"
            onChange={(sel: any, selectedVal?: any) => {
              const finalVal = selectedVal !== undefined && selectedVal !== null ? selectedVal : (sel ? sel.id : null);
              handleChange("MeasurementUnitRef", finalVal ? Number(finalVal) : null);
            }}
            placeholder="انتخاب واحد سنجش..."
            disabled={disabled || isUsed}
            addFormOptions={[
              { title: "تعریف واحد سنجش جدید", componentName: "MeasurementUnitForm", groupId: "inv" },
            ]}
          />
        </div>
      ),
    },
    {
      name: "QuantityAndActive",
      type: "custom",
      noWrapper: true,
      render: ({ disabled }) => (
        <div className="grid grid-cols-2 gap-x-2 w-full items-center">
          <NumberInput
            label="مقدار :"
            value={values.Quantity}
            onChange={(val) => handleChange("Quantity", val !== "" ? Number(val) : 1)}
            disabled={disabled || isUsed}
            labelWidth="45px"
          />
          <CheckBoxRightLabel
            text="فعال"
            checked={Boolean(values.IsActive)}
            onChange={(val) => handleChange("IsActive", val)}
            disabled={disabled || isUsed}
          />
        </div>
      ),
    },
    {
      name: "Description",
      type: "custom",
      noWrapper: true,
      render: ({ value, onChange, disabled }) => (
        <TextArea
          label="توضیحات :"
          value={values.Description}
          onChange={(val) => onChange("Description", val)}
          disabled={disabled || isUsed}
          rows={1}
          className="!min-h-[35px] !h-[35px] py-1.5"
          labelWidth="75px"
        />
      ),
    },
  ];

  const itemCodeColumnHeader = useMemo(() => {
    const currentType = Number(values.ItemType);
    if (currentType === ItemType.SERVICE || currentType === 2) {
      return "کد خدمت *";
    }
    if (currentType === ItemType.GOODS || currentType === 1) {
      return "کد کالا *";
    }
    return "کد کالا یا خدمت *";
  }, [values.ItemType]);

  const itemNameColumnHeader = useMemo(() => {
    const currentType = Number(values.ItemType);
    if (currentType === ItemType.SERVICE || currentType === 2) {
      return "عنوان خدمت";
    }
    if (currentType === ItemType.GOODS || currentType === 1) {
      return "عنوان کالا";
    }
    return "عنوان کالا یا عنوان خدمت";
  }, [values.ItemType]);

  // Table Column Configuration for Items Tab
  const detailTabColumns: TabCellColumn[] = useMemo(() => [
    {
      key: "RowNo",
      header: "ردیف",
      type: "text",
      width: "60px",
      render: (_row, rowIndex) => (
        <span className="flex items-center justify-center w-full h-[25px] text-xs font-semibold text-center select-none">
          {rowIndex + 1}
        </span>
      ),
    },
    {
      key: "ItemRef",
      header: itemCodeColumnHeader,
      type: "custom",
      width: "260px",
      render: (row, rowIndex) => {
        const val = row?.ItemRef;
        const selectedObj = availableItems.find(
          (i) => Number(i.id) === Number(val) || Number(i.ItemID) === Number(val) || (row?.ItemCode && String(i.ItemCode) === String(row.ItemCode))
        ) || null;

        const placeholderText = Number(values.ItemType) === ItemType.SERVICE ? "انتخاب خدمت..." : "انتخاب کالا...";

        return (
          <MultiColumnDropDown
            data={filteredAvailableItems}
            columns={itemDropdownColumns}
            value={selectedObj}
            displayKey="ItemCode"
            placeholder={placeholderText}
            disabled={isUsed}
            enableMultiSelection={true}
            addFormOptions={[
              { title: "افزودن کالا و خدمت جدید", componentName: "ProductServiceForm", groupId: "inv" }
            ]}
            onChange={(selected) => {
              if (!selected) return;
              const selectedList = Array.isArray(selected) ? selected : [selected];
              if (selectedList.length === 0) return;

              const updatedItems = [...(values.items || [])];

              selectedList.forEach((itemObj, idx) => {
                const itemId = Number(itemObj.ItemID || itemObj.id);
                const matchedAvailItem = availableItems.find(
                  (i) => Number(i.id) === itemId || Number(i.ItemID) === itemId
                ) || itemObj;

                const defaultUnitId = matchedAvailItem.MeasurementUnitID || matchedAvailItem.MeasurementUnitRef || (matchedAvailItem.mainUnit ? Number(matchedAvailItem.mainUnit.MeasurementUnitID) : null);

                if (idx === 0) {
                  updatedItems[rowIndex] = {
                    ...updatedItems[rowIndex],
                    ItemRef: itemId,
                    ItemCode: matchedAvailItem.ItemCode || "",
                    ItemName: matchedAvailItem.ItemName || "",
                    ItemName2: matchedAvailItem.ItemName2 || "",
                    MeasurementUnitRef: defaultUnitId ? Number(defaultUnitId) : null,
                  };
                } else {
                  updatedItems.push({
                    id: (Date.now() + idx).toString(),
                    RowNo: updatedItems.length + 1,
                    ItemRef: itemId,
                    ItemCode: matchedAvailItem.ItemCode || "",
                    ItemName: matchedAvailItem.ItemName || "",
                    ItemName2: matchedAvailItem.ItemName2 || "",
                    MeasurementUnitRef: defaultUnitId ? Number(defaultUnitId) : null,
                    Quantity: 1,
                    Description: "",
                  });
                }
              });

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
      key: "ItemName",
      header: itemNameColumnHeader,
      type: "text",
      width: "220px",
      render: (row) => (
        <span className="flex items-center w-full h-[25px] px-2 text-xs text-gray-800 dark:text-gray-200 truncate select-none bg-gray-50 dark:bg-slate-800/50 rounded border border-gray-200 dark:border-gray-700">
          {row?.ItemName || "-"}
        </span>
      ),
    },
    {
      key: "MeasurementUnitRef",
      header: "واحد سنجش",
      type: "custom",
      width: "160px",
      render: (row, rowIndex) => {
        // Find selected item to extract its primary unit and sub-units
        const matchedItem = availableItems.find(
          (i) => Number(i.id) === Number(row?.ItemRef) || Number(i.ItemID) === Number(row?.ItemRef)
        );

        let rowUnitOptions: any[] = [];
        if (matchedItem) {
          if (Array.isArray(matchedItem.allUnits) && matchedItem.allUnits.length > 0) {
            matchedItem.allUnits.forEach((u: any) => {
              const uId = Number(u.MeasurementUnitID || u.SubUnitRef || u.id);
              const globalUnit = measurementUnits.find((g) => Number(g.id) === uId);
              const uTitle = globalUnit?.title || u.MeasurementUnitName || u.SubUnitName || u.title || "واحد";
              const uCode = globalUnit?.code || u.MeasurementUnitCode || u.SubUnitCode || u.code || "";
              if (uId && !rowUnitOptions.some((o) => Number(o.id) === uId)) {
                rowUnitOptions.push({ id: uId, title: uTitle, code: uCode });
              }
            });
          } else {
            if (matchedItem.MeasurementUnitID) {
              const mainId = Number(matchedItem.MeasurementUnitID);
              const globalUnit = measurementUnits.find((g) => Number(g.id) === mainId);
              const mainTitle = globalUnit?.title || matchedItem.MeasurementUnitName || "واحد اصلی";
              const mainCode = globalUnit?.code || "";
              rowUnitOptions.push({
                id: mainId,
                title: mainTitle,
                code: mainCode,
              });
            }
            if (Array.isArray(matchedItem.subUnits)) {
              matchedItem.subUnits.forEach((su: any) => {
                const suId = Number(su.MeasurementUnitID || su.SubUnitRef || su.id);
                const globalUnit = measurementUnits.find((g) => Number(g.id) === suId);
                const suTitle = globalUnit?.title || su.SubUnitName || su.MeasurementUnitName || su.title || "واحد فرعی";
                const suCode = globalUnit?.code || su.SubUnitCode || su.code || "";
                if (suId && !rowUnitOptions.some((o) => Number(o.id) === suId)) {
                  rowUnitOptions.push({ id: suId, title: suTitle, code: suCode });
                }
              });
            }
          }
        }

        // Fallback to all measurement units if item is not selected yet or has no units specified
        if (rowUnitOptions.length === 0) {
          rowUnitOptions = measurementUnits;
        }

        const effectiveUnitValue = row?.MeasurementUnitRef !== null && row?.MeasurementUnitRef !== undefined
          ? Number(row.MeasurementUnitRef)
          : (matchedItem?.MeasurementUnitID ? Number(matchedItem.MeasurementUnitID) : null);

        return (
          <SingleSelectDropDown
            options={rowUnitOptions}
            columns={measurementUnitColumns}
            value={effectiveUnitValue}
            valueKey="id"
            displayKey="title"
            onChange={(sel: any, selectedVal?: any) => {
              const finalVal = selectedVal !== undefined && selectedVal !== null ? selectedVal : (sel ? sel.id : null);
              const updated = [...(values.items || [])];
              updated[rowIndex] = {
                ...updated[rowIndex],
                MeasurementUnitRef: finalVal ? Number(finalVal) : null,
              };
              setValues((prev) => ({ ...prev, items: updated }));
            }}
            placeholder="واحد سنجش..."
            disabled={isUsed}
          />
        );
      },
    },
    {
      key: "Quantity",
      header: "مقدار",
      type: "custom",
      width: "110px",
      render: (row, rowIndex) => (
        <NumberInput
          value={row?.Quantity}
          onChange={(val) => {
            const updated = [...(values.items || [])];
            updated[rowIndex] = {
              ...updated[rowIndex],
              Quantity: val !== "" ? Number(val) : 1,
            };
            setValues((prev) => ({ ...prev, items: updated }));
          }}
          disabled={isUsed}
          min={0.0001}
        />
      ),
    },
    {
      key: "Description",
      header: "توضیحات",
      type: "custom",
      width: "250px",
      render: (row, rowIndex) => (
        <TextInput
          value={row?.Description || ""}
          onChange={(val) => {
            const updated = [...(values.items || [])];
            updated[rowIndex] = {
              ...updated[rowIndex],
              Description: val,
            };
            setValues((prev) => ({ ...prev, items: updated }));
          }}
          disabled={isUsed}
          placeholder="توضیحات..."
        />
      ),
    },
  ], [values.ItemType, values.items, availableItems, filteredAvailableItems, itemDropdownColumns, measurementUnits, itemCodeColumnHeader, itemNameColumnHeader, isUsed]);

  return (
    <SimpleFormTwoRowTabbed
      title="پک کالا خدمت"
      formId="ItemPackageForm"
      targetForm="ItemPackageForm"
      fields={fieldsConfig}
      values={values}
      onChange={handleChange}
      isReadonly={isUsed}
      onNew={handleNew}
      onList={handleList}
      listApiUrl="/api/inv/item-packages"
      listColumns={packageListColumns}
      listDisplayKey="PackageTitle"
      onListSelect={handleListSelect}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onDelete={handleDelete}
      onFirst={handleFirst}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onLast={handleLast}
      listComponentName="ItemPackageList"
      listTitle="فهرست پک کالا خدمت"
      bottomTabs={[
        {
          id: "items",
          label: "اقلام",
          content: (
            <TabCellRow
              tabs={[{ id: "items_tab", label: "اقلام", columns: detailTabColumns }]}
              value={values.items || []}
              onChange={(newItems) => {
                const list = Array.isArray(newItems) ? newItems : [];
                setValues((prev) => ({
                  ...prev,
                  items: list.map((item: any, idx: number) => ({
                    ...item,
                    RowNo: idx + 1,
                  })),
                }));
              }}
              hideHeader={true}
              hideAddButton={isUsed}
              hideDeleteButton={isUsed}
              isReadonly={isUsed}
            />
          ),
        },
      ]}
    />
  );
}

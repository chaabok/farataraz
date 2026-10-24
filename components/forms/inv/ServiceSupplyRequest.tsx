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
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import momentJalaali from "moment-jalaali";

interface ServiceSupplyRequestProps {
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
  { id: SupplyRequestBaseType.ItemRequest, title: "درخواست خدمت", value: SupplyRequestBaseType.ItemRequest, label: "درخواست خدمت" },
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

export function ServiceSupplyRequest({ id, tabId }: ServiceSupplyRequestProps) {
  const { removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, setActiveId, method, getUrl } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("ServiceSupplyRequest", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    ServiceSupplyRequestID: "",
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
        RequestQuantity: 1,
        ApprovedQuantity: 1,
        DeliveryDate: getTodayJalali(),
        Description: "",
      },
    ],
  });

  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [requesterOptions, setRequesterOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const requesterColumns: SingleSelectColumn[] = [
    { key: "code", label: "کد", width: 100 },
    { key: "title", label: "عنوان", width: 220 },
    { key: "title2", label: "نوع تفصیلی", width: 180 },
  ];

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/inv/service-supply-requests/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setValues({
              ServiceSupplyRequestID: data.ServiceSupplyRequestID || activeId,
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
                  ? data.details.map((d: any, idx: number) => ({
                      id: String(d.ServiceSupplyRequestDetailID || idx + 1),
                      RowNo: d.RowNo || idx + 1,
                      ItemRef: d.ItemRef,
                      ItemCode: d.item?.ItemCode || d.ItemCode || "",
                      ItemName: d.item?.ItemName || d.ItemName || "",
                      UnitName: d.item?.MeasurementUnit?.MeasurementUnitTitle || d.UnitName || "عدد",
                      RequestQuantity: d.RequestQuantity,
                      ApprovedQuantity: d.ApprovedQuantity,
                      DeliveryDate: d.DeliveryDate ? momentJalaali(d.DeliveryDate).format("jYYYY/jMM/jDD") : getTodayJalali(),
                      Description: d.Description || "",
                    }))
                  : [
                      {
                        id: "1",
                        RowNo: 1,
                        ItemRef: null,
                        ItemCode: "",
                        ItemName: "",
                        UnitName: "",
                        RequestQuantity: 1,
                        ApprovedQuantity: 1,
                        DeliveryDate: getTodayJalali(),
                        Description: "",
                      },
                    ],
            });
          }
        })
        .catch((err) => console.error("Error loading service supply request:", err));
    } else {
      apiFetch("/api/inv/service-supply-requests/next-number")
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
    // Fetch items of type Service (خدمت - ItemType = 2) or all if unavailable
    apiFetch("/api/inv/items/dropdown?type=2")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        const servicesList = list.filter(
          (item: any) => Number(item.ItemType) === 2 || item.ItemType === undefined || item.ItemType === null
        );
        setAvailableItems(
          servicesList.map((item: any) => ({
            id: item.ItemID || item.id,
            ItemID: item.ItemID || item.id,
            ItemCode: item.ItemCode || item.code || item.product_code || "",
            ItemName: item.ItemName || item.title || item.product_name || item.name || "",
            UnitName: item.MeasurementUnit?.MeasurementUnitTitle || item.UnitName || item.unit || "عدد",
            ItemType: Number(item.ItemType || 2),
            title: `${item.ItemCode ? item.ItemCode + " - " : ""}${item.ItemName || item.title || item.name || ""}`,
          }))
        );
      })
      .catch((err) => console.error("Error fetching services:", err));

    // Fetch Detailed Accounts for Requester (Cost Center and Project)
    apiFetch("/api/inv/service-supply-requests/requesters")
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
  }, []);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const itemDropdownColumns: Column[] = [
    { key: "ItemCode", label: "کد خدمت", width: 120 },
    { key: "ItemName", label: "عنوان خدمت", width: 220 },
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
      label: "کد خدمت *",
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
            placeholder="انتخاب خدمت..."
            disabled={isUsed}
            enableMultiSelection={true}
            addFormOptions={[
              { title: "افزودن خدمت جدید", componentName: "ProductServiceForm", groupId: "inv" }
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
                  RequestQuantity: 1,
                  ApprovedQuantity: 1,
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
      label: "عنوان خدمت",
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
      type: "text",
      width: "100px",
      render: (row) => (
        <span className="flex items-center justify-center w-full h-[25px] px-1 text-xs text-gray-600 dark:text-gray-300 text-center select-none">
          {row?.UnitName || "-"}
        </span>
      ),
    },
    {
      name: "RequestQuantity",
      label: "مقدار درخواست *",
      type: "custom",
      width: "120px",
      render: (row, rowIndex) => (
        <NumberInput
          value={row?.RequestQuantity || ""}
          onChange={(newVal) => {
            const updatedItems = [...(values.items || [])];
            updatedItems[rowIndex] = { ...updatedItems[rowIndex], RequestQuantity: newVal, ApprovedQuantity: newVal };
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }}
          disabled={isUsed}
        />
      ),
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

    const validItems = (values.items || []).filter((item: any) => {
      const itemRef = getItemRef(item);
      return itemRef !== null && Number(item.RequestQuantity || 0) > 0;
    });
    if (validItems.length === 0) {
      showToast("لطفاً حداقل یک خدمت با مقدار معتبر در جدول اقلام درخواست وارد کنید *", "warning");
      return false;
    }

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
          RequestQuantity: Number(item.RequestQuantity || 1),
          ApprovedQuantity: Number(item.ApprovedQuantity || item.RequestQuantity || 1),
          DeliveryDate: item.DeliveryDate || values.RequestDate || getTodayJalali(),
          Description: item.Description || "",
        })),
      };

      const saveUrl = activeId ? `/api/inv/service-supply-requests/${activeId}` : "/api/inv/service-supply-requests";
      const saveMethod = activeId ? "PUT" : "POST";

      const res = await apiFetch(saveUrl, {
        method: saveMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && (data.ServiceSupplyRequestID || data.id || data.success)) {
        showToast("درخواست تامین خدمت با موفقیت ذخیره شد.", "success");
        const savedId = data.ServiceSupplyRequestID || data.id || data.data?.ServiceSupplyRequestID;
        if (savedId) {
          const numId = Number(savedId);
          setActiveId(numId);
          setValues((prev) => ({
            ...prev,
            ServiceSupplyRequestID: numId,
            id: numId,
          }));
        }
        return true;
      } else {
        showToast(data.message || "خطا در ذخیره‌سازی درخواست تامین خدمت", "error");
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
      ServiceSupplyRequestID: "",
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
          RequestQuantity: 1,
          ApprovedQuantity: 1,
          DeliveryDate: getTodayJalali(),
          Description: "",
        },
      ],
    });

    apiFetch("/api/inv/service-supply-requests/next-number")
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
      const res = await apiFetch(`/api/inv/service-supply-requests/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "خطا در حذف درخواست تامین خدمت", "error");
        throw new Error(errData.message || "خطا در حذف درخواست تامین خدمت");
      }
    } catch (err: any) {
      if (err?.message !== "خطا در حذف درخواست تامین خدمت") {
        showToast("خطا در ارسال درخواست حذف", "error");
      }
      throw err;
    }
  };

  const handleListSelect = (item: any) => {
    if (!item) return;
    const selectedId = item.ServiceSupplyRequestID || item.id;
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
    <SimpleFormTwoRowTabbed
      title={activeId ? "ویرایش درخواست تامین خدمت" : "درخواست تامین خدمت جدید"}
      fields={fields}
      values={values}
      onChange={handleChange}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onNew={handleNew}
      onDelete={handleDelete}
      onListSelect={handleListSelect}
      onClose={handleClose}
      listApiUrl="/api/inv/service-supply-requests"
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
      targetForm="ServiceSupplyRequest"
      isReadonly={isUsed}
      bottomTabs={[
        {
          id: "items_tab",
          label: "اقلام درخواست تامین خدمت",
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
  );
}

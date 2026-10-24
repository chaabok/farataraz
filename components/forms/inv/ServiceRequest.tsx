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
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch, jalaliToGregorianISO, gregorianToJalaliDisplay } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import momentJalaali from "moment-jalaali";

interface ServiceRequestProps {
  id?: number;
  tabId?: string;
}

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

export function ServiceRequest({ id, tabId }: ServiceRequestProps) {
  const { removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, setActiveId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("ServiceRequest", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    ServiceRequestID: "",
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
    { key: "title2", label: "عنوان(2)", width: 220 },
  ];

  // Fetch dropdown data
  useEffect(() => {
    // Fetch Services (ItemType = 2)
    apiFetch("/api/inv/items/dropdown?type=2")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        const servicesOnly = list.filter((item: any) => Number(item.ItemType) === 2);
        setAvailableItems(
          servicesOnly.map((item: any) => ({
            id: item.ItemID || item.id,
            ItemID: item.ItemID || item.id,
            ItemCode: item.ItemCode || item.code || item.product_code || "",
            ItemName: item.ItemName || item.title || item.product_name || item.name || "",
            UnitName: item.MeasurementUnit?.MeasurementUnitTitle || item.UnitName || item.unit || "عدد",
            ItemType: Number(item.ItemType),
            title: `${item.ItemCode ? item.ItemCode + " - " : ""}${item.ItemName || item.title || item.name || ""}`,
          }))
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
  }, []);

  // Fetch Next Request Number on new form
  const fetchNextNumber = () => {
    apiFetch("/api/inv/service-requests/next-number")
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.documentNumber || data.nextNumber)) {
          setValues((prev) => ({
            ...prev,
            RequestNumber: data.documentNumber || data.nextNumber,
          }));
        }
      })
      .catch((err) => console.error("Error fetching next service request number:", err));
  };

  // Fetch existing record if activeId is set
  useEffect(() => {
    if (activeId) {
      setIsLoading(true);
      apiFetch(`/api/inv/service-requests/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setValues({
              ServiceRequestID: data.ServiceRequestID,
              RequestNumber: data.RequestNumber || "",
              RequestDate: data.RequestDate || getTodayJalali(),
              Priority: data.Priority || 1,
              Status: data.Status || DocumentState.InitialRegistration,
              Requester: data.Requester || "",
              RequesterRef: data.RequesterRef ? Number(data.RequesterRef) : "",
              Description: data.Description || "",
              items:
                Array.isArray(data.details) && data.details.length > 0
                  ? data.details.map((d: any, idx: number) => ({
                      id: (idx + 1).toString(),
                      RowNo: idx + 1,
                      ItemRef: d.ItemRef,
                      ItemCode: d.item?.ItemCode || d.ItemCode || "",
                      ItemName: d.item?.ItemName || d.ItemName || "",
                      UnitName: d.item?.MeasurementUnit?.MeasurementUnitTitle || d.UnitName || "عدد",
                      RequestQuantity: d.RequestQuantity || 1,
                      ApprovedQuantity: d.ApprovedQuantity || d.RequestQuantity || 1,
                      DeliveryDate: d.DeliveryDate || getTodayJalali(),
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
        .catch((err) => {
          console.error("Error fetching service request record:", err);
          showToast("خطا در واکشی اطلاعات درخواست خدمت", "error");
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
    setValues({
      ServiceRequestID: "",
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

    // Validate details
    const validItems = (values.items || []).filter((item: any) => item.ItemRef && Number(item.RequestQuantity) > 0);
    if (validItems.length === 0) {
      showToast("لطفاً حداقل یک خدمت با مقدار معتبر در جدول اقلام درخواست وارد کنید *", "error");
      return false;
    }

    const reqObj = typeof values.Requester === "object" ? values.Requester : null;
    const reqTitle = reqObj ? (reqObj.title || reqObj.name || "") : String(values.Requester || "");
    const reqRef = values.RequesterRef ? Number(values.RequesterRef) : (reqObj ? Number(reqObj.id || reqObj.detailedAccountId) : null);

    const payload = {
      ...values,
      Requester: reqTitle,
      RequesterRef: reqRef,
      RequestDate: jalaliToGregorianISO(values.RequestDate || getTodayJalali()),
      details: validItems.map((item: any, idx: number) => ({
        RowNo: idx + 1,
        ItemRef: item.ItemRef,
        RequestQuantity: Number(item.RequestQuantity),
        ApprovedQuantity: Number(item.ApprovedQuantity || item.RequestQuantity),
        DeliveryDate: jalaliToGregorianISO(item.DeliveryDate || values.RequestDate || getTodayJalali()),
        Description: item.Description,
      })),
    };

    try {
      const res = await apiFetch(getUrl("/api/inv/service-requests"), {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "خطا در ذخیره‌سازی درخواست خدمت", "error");
        return false;
      }

      const savedData = await res.json();
      showToast("درخواست خدمت با موفقیت ذخیره شد", "success");
      if (savedData && (savedData.ServiceRequestID || savedData.id)) {
        const savedId = Number(savedData.ServiceRequestID || savedData.id);
        setActiveId(savedId);
        setValues((prev) => ({
          ...prev,
          ServiceRequestID: savedId,
          id: savedId,
        }));
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
      const res = await apiFetch(`/api/inv/service-requests/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "خطا در حذف درخواست خدمت", "error");
        throw new Error(errData.message || "خطا در حذف درخواست خدمت");
      }
    } catch (err: any) {
      if (err?.message !== "خطا در حذف درخواست خدمت") {
        showToast("خطا در ارسال درخواست حذف", "error");
      }
      throw err;
    }
  };

  const handleListSelect = (item: any) => {
    if (!item) return;
    const selectedId = item.ServiceRequestID || item.id;
    if (selectedId) {
      setActiveId(Number(selectedId));
    }
  };

  // Define Form Header Fields (SimpleFormTwoRowTabbed)
  const fields: FieldConfig[] = [
    {
      name: "Requester",
      label: "درخواست‌کننده *",
      type: "custom",
      required: true,
      render: ({ disabled }) => (
        <SingleSelectDropDown
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
          placeholder="انتخاب درخواست‌کننده (مرکز هزینه / پروژه)..."
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
            value={values.RequestDate}
            onChange={(val) => handleChange("RequestDate", val)}
            disabled={disabled || isUsed}
            labelWidth="40px"
          />
        </div>
      ),
    },
    {
      name: "Description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات تکمیلی درخواست خدمت...",
      rows: 1,
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
  ];

  const itemDropdownColumns: Column[] = [
    { key: "ItemCode", label: "کد خدمت", width: 120 },
    { key: "ItemName", label: "عنوان خدمت", width: 220 },
    { key: "UnitName", label: "واحد سنجش", width: 120 },
  ];

  // Table Column Config for Requested Services Tab
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
          (i) => Number(i.id) === Number(val) || Number(i.ItemID) === Number(val) || (row?.ItemCode && i.ItemCode === row.ItemCode)
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
                ItemRef: firstId,
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
                  ItemRef: extraId,
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
      label: "تاریخ انجام",
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

  return (
    <SimpleFormTwoRowTabbed
      title={activeId ? "ویرایش درخواست خدمت" : "درخواست خدمت جدید"}
      fields={fields}
      values={values}
      onChange={handleChange}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onNew={handleNew}
      onDelete={handleDelete}
      onListSelect={handleListSelect}
      listApiUrl="/api/inv/service-requests"
      listDisplayKey="RequestNumber"
      listColumns={[
        { key: "RequestNumber", label: "شماره", title: "شماره" },
        {
          key: "RequestDate",
          label: "تاریخ",
          title: "تاریخ",
          render: (val: string) => gregorianToJalaliDisplay(val),
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
      targetForm="ServiceRequest"
      isReadonly={isUsed}
      bottomTabs={[
        {
          id: "items_tab",
          label: "اقلام درخواست خدمت",
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

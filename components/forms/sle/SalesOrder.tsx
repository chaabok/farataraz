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
import { Plus } from "lucide-react";
import { apiFetch, jalaliToGregorianISO, gregorianToJalaliDisplay, isValidJalaliDate } from "@/lib/utils";
import { useLanguage } from "@/lib/stores/languageStore";
import { formatLocalizedNumber } from "@/lib/digitLocale";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
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
    DeliveryLocationRef: "",
    SettlementMethodRef: "",
    Status: DocumentState.InitialRegistration,
    Description: "",
    items: [emptyRow()],
  });

  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [salesTypeOptions, setSalesTypeOptions] = useState<any[]>([]);
  const [settlementMethodOptions, setSettlementMethodOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
                      Quantity: d.Quantity || 1,
                      UnitPrice: d.UnitPrice || "",
                      TotalPrice: d.TotalPrice || "",
                      Description: d.Description || "",
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
    setValues({
      SalesOrderID: "",
      OrderNumber: "",
      OrderDate: getTodayJalali(),
      DeliveryDate: "",
      CustomerRef: "",
      CustomerName: "",
      SalesTypeRef: "",
      DeliveryLocationRef: "",
      SettlementMethodRef: "",
      Status: DocumentState.InitialRegistration,
      Description: "",
      items: [emptyRow()],
    });
    fetchNextNumber();
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
        UnitPrice: Number(item.UnitPrice || 0),
        TotalPrice:
          item.TotalPrice !== "" && item.TotalPrice !== undefined && item.TotalPrice !== null
            ? Number(item.TotalPrice)
            : Number(item.Quantity) * Number(item.UnitPrice || 0),
        Description: item.Description || "",
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
      name: "Description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات تکمیلی سفارش فروش...",
      rows: 1,
    },
    {
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
      name: "Quantity",
      label: "مقدار *",
      type: "custom",
      width: "110px",
      render: (row, rowIndex) => (
        <NumberInput
          value={row?.Quantity || ""}
          localizeDigits
          onChange={(newVal) => {
            const updatedItems = [...(values.items || [])];
            updatedItems[rowIndex] = {
              ...updatedItems[rowIndex],
              Quantity: newVal,
              TotalPrice:
                updatedItems[rowIndex].UnitPrice !== "" && updatedItems[rowIndex].UnitPrice !== undefined
                  ? Number(newVal) * Number(updatedItems[rowIndex].UnitPrice)
                  : updatedItems[rowIndex].TotalPrice,
            };
            setValues((prev) => ({ ...prev, items: updatedItems }));
          }}
          disabled={isUsed}
        />
      ),
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
          onChange={(newVal) => {
            const updatedItems = [...(values.items || [])];
            updatedItems[rowIndex] = {
              ...updatedItems[rowIndex],
              UnitPrice: newVal,
              TotalPrice:
                updatedItems[rowIndex].Quantity !== "" && updatedItems[rowIndex].Quantity !== undefined
                  ? Number(updatedItems[rowIndex].Quantity) * Number(newVal || 0)
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
            ? formatLocalizedNumber(row.TotalPrice, language)
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
              />
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
    </>
  );
}

export function SalesOrderForm(props: any) {
  return <SalesOrder {...props} />;
}

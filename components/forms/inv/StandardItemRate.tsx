"use client";

import React, { useState, useEffect } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { FieldConfig } from "../SimpleFormTwoRow";
import { TabCellConfig, TabCellRow } from "../TabCellRow";
import { SingleSelectDropDown, SingleSelectColumn } from "@/components/inputs/SingleSelectDropDown";
import { DateInput } from "@/components/inputs/DateInput";
import { DatePicker, toGregorianIsoDate } from "@/components/inputs/DatePicker";
import { TextInput } from "@/components/inputs/TextInput";
import { AmountInput } from "@/components/inputs/AmountInput";
import { FormLabel } from "@/components/inputs/FormLabel";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";

interface StandardItemRateProps {
  id?: number;
}

export function StandardItemRate({ id }: StandardItemRateProps) {
  const { addTab, removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("StandardItemRate", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    StandardItemRateID: "",
    FiscalYearRef: null,
    ItemAccountCategoryRef: null,
    CategoryTitle: "",
    CategoryTitle2: "",
    StandardRateText: "",
    EffectiveDate: "",
    Description: "",
    details: [],
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch('/api/inv/item-account-categories')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setCategories(list);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/inv/standard-item-rates/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          const item = data.data || data;
          const catId = item.ItemAccountCategoryRef ? Number(item.ItemAccountCategoryRef) : null;
          const foundCat = categories.find(
            (c: any) => Number(c.ItemAccountCategoryID) === catId || String(c.ItemAccountCategoryCode) === String(item.ItemAccountCategoryCode)
          );

          setValues((prev) => ({
            ...prev,
            StandardItemRateID: item.StandardItemRateID || activeId || "",
            FiscalYearRef: item.FiscalYearRef || prev.FiscalYearRef || null,
            ItemAccountCategoryRef: catId || prev.ItemAccountCategoryRef || null,
            CategoryTitle: item.ItemAccountCategoryName || foundCat?.ItemAccountCategoryName || prev.CategoryTitle || "",
            CategoryTitle2: item.ItemAccountCategoryName2 || foundCat?.ItemAccountCategoryName2 || prev.CategoryTitle2 || "",
            StandardRateText: (catId || prev.ItemAccountCategoryRef) ? "دارد" : "",
            EffectiveDate: item.EffectiveDate || prev.EffectiveDate || "",
            Description: item.Description !== undefined && item.Description !== null ? item.Description : prev.Description || "",
            details: (item.details && item.details.length > 0) ? item.details : prev.details || [],
          }));
        })
        .catch(console.error);
    }
  }, [activeId, categories]);

  const pricingMethodLabels: Record<number, string> = {
    1: 'میانگین موزون',
    2: 'FIFO',
    3: 'LIFO',
    4: 'استاندارد',
    5: 'شناسایی ویژه',
  };

  const categoryColumns: SingleSelectColumn[] = [
    { key: "ItemAccountCategoryCode", label: "کد طبقه" },
    { key: "ItemAccountCategoryName", label: "عنوان طبقه" },
    { key: "ItemAccountCategoryName2", label: "عنوان (2)" },
    { 
      key: "PricingMethod", 
      label: "روش قیمت‌گذاری",
      render: (val: any) => pricingMethodLabels[Number(val)] || val || ""
    },
  ];

  const handleCategorySelect = (selectedCat: any) => {
    if (selectedCat === null || selectedCat === undefined || selectedCat === "") {
      setValues((prev) => {
        if (prev.ItemAccountCategoryRef && prev.CategoryTitle) {
          return prev;
        }
        return {
          ...prev,
          ItemAccountCategoryRef: null,
          CategoryTitle: "",
          CategoryTitle2: "",
          StandardRateText: "",
          details: [],
        };
      });
      return;
    }

    let catObj: any = null;
    if (typeof selectedCat === "object" && selectedCat !== null) {
      if (selectedCat.ItemAccountCategoryID || selectedCat.id || selectedCat.ItemAccountCategoryRef) {
        catObj = selectedCat;
      } else if (selectedCat.ItemAccountCategoryCode) {
        const found = categories.find(
          (c: any) => String(c.ItemAccountCategoryCode) === String(selectedCat.ItemAccountCategoryCode)
        );
        catObj = found || selectedCat;
      } else {
        catObj = selectedCat;
      }
    } else if (selectedCat !== undefined && selectedCat !== null && selectedCat !== "") {
      const valStr = String(selectedCat).trim();
      let found = categories.find(
        (c: any) => String(c.ItemAccountCategoryCode) === valStr
      );
      if (!found) {
        found = categories.find(
          (c: any) => String(c.ItemAccountCategoryID) === valStr
        );
      }
      if (found) {
        catObj = found;
      } else {
        catObj = { ItemAccountCategoryID: Number(selectedCat) };
      }
    }

    const catId = catObj?.ItemAccountCategoryID ?? catObj?.id ?? catObj?.ItemAccountCategoryRef ?? null;
    const numCatId = catId !== null && catId !== undefined && !isNaN(Number(catId)) && Number(catId) > 0 ? Number(catId) : null;

    let needFetch = false;

    setValues((prev) => {
      const isSameCategory = Number(prev.ItemAccountCategoryRef) === Number(numCatId);
      const hasDetails = Array.isArray(prev.details) && prev.details.length > 0;

      if (!isSameCategory || !hasDetails) {
        needFetch = true;
      }

      const title = catObj?.ItemAccountCategoryName || (isSameCategory ? prev.CategoryTitle : "") || "";
      const title2 = catObj?.ItemAccountCategoryName2 || (isSameCategory ? prev.CategoryTitle2 : "") || "";

      return {
        ...prev,
        ItemAccountCategoryRef: numCatId,
        CategoryTitle: title,
        CategoryTitle2: title2,
        StandardRateText: numCatId ? "دارد" : "",
        details: isSameCategory ? prev.details : [],
      };
    });

    if (numCatId && errors.ItemAccountCategoryRef) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr.ItemAccountCategoryRef;
        return newErr;
      });
    }

    if (numCatId && !isNaN(numCatId) && numCatId > 0 && needFetch) {
      apiFetch(`/api/inv/standard-item-rates/items-by-category/${numCatId}${activeId ? `?rateId=${activeId}` : ''}`)
        .then((res) => res.json())
        .then((data) => {
          const items = Array.isArray(data) ? data : (data.data || []);
          setValues((prev) => ({
            ...prev,
            details: items,
          }));
        })
        .catch((err) => {
          console.error("Error fetching category items:", err);
        });
    }
  };

  useEffect(() => {
    if (categories.length > 0 && values.ItemAccountCategoryRef && !values.CategoryTitle) {
      const found = categories.find(
        (c: any) => String(c.ItemAccountCategoryID) === String(values.ItemAccountCategoryRef)
      );
      if (found) {
        setValues((prev) => ({
          ...prev,
          CategoryTitle: found.ItemAccountCategoryName || "",
          CategoryTitle2: found.ItemAccountCategoryName2 || "",
        }));
      }
    }
  }, [categories, values.ItemAccountCategoryRef]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const fields: FieldConfig[] = [
    {
      name: "ItemAccountCategoryRef",
      label: "کد طبقه",
      type: "custom",
      required: false,
      customComponent: (
        <SingleSelectDropDown
          value={values.ItemAccountCategoryRef}
          data={categories}
          options={categories}
          listApiUrl="/api/inv/item-account-categories"
          onChange={(param1, param2) => {
            if (param1 && typeof param1 === "object") {
              handleCategorySelect(param1);
            } else if (param2 && typeof param2 === "object") {
              handleCategorySelect(param2);
            } else if (param2 !== undefined && param2 !== null && param2 !== "") {
              handleCategorySelect(param2);
            } else if (param1 !== undefined && param1 !== null && param1 !== "") {
              handleCategorySelect(param1);
            } else {
              handleCategorySelect(null);
            }
          }}
          columns={categoryColumns}
          displayKey="ItemAccountCategoryCode"
          valueKey="ItemAccountCategoryID"
          filterItem={(cat: any) => cat.IsActive !== false}
          required={false}
          error={errors.ItemAccountCategoryRef}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "CategoryTitle",
      label: "عنوان طبقه",
      type: "custom",
      customComponent: (
        <TextInput
          value={values.CategoryTitle || ""}
          disabled={true}
          readOnly={true}
        />
      ),
    },
    {
      name: "CategoryTitle2",
      label: "عنوان طبقه (2)",
      type: "custom",
      customComponent: (
        <TextInput
          value={values.CategoryTitle2 || ""}
          disabled={true}
          readOnly={true}
        />
      ),
    },
    {
      name: "StandardRateText",
      label: "استاندارد",
      type: "custom",
      customComponent: (
        <TextInput
          value={values.StandardRateText || (values.ItemAccountCategoryRef ? "دارد" : "")}
          disabled={true}
          readOnly={true}
        />
      ),
    },
    {
      name: "EffectiveDate",
      label: "تاریخ موثر",
      type: "custom",
      required: true,
      customComponent: (
        <DateInput
          value={values.EffectiveDate}
          onChange={(val) => handleChange("EffectiveDate", val)}
          required={true}
          error={errors.EffectiveDate}
          disabled={isUsed}
          isHeader={true}
        />
      ),
    },
    {
      name: "Description",
      label: "توضیحات",
      type: "custom",
      customComponent: (
        <TextInput
          value={values.Description || ""}
          onChange={(val) => handleChange("Description", val)}
          disabled={isUsed}
        />
      ),
    },
  ];

  const detailTabConfig: TabCellConfig[] = [
    {
      id: "items",
      label: "جزئیات کالا و نرخ ها",
      columns: [
        {
          key: "ItemCode",
          header: "کد کالا",
          type: "text",
          width: "120px",
          render: (row) => (
            <input
              type="text"
              value={row.ItemCode || ""}
              readOnly={true}
              disabled={true}
              className="w-full text-[11px] px-1 bg-transparent dark:text-gray-200 outline-none h-full font-sans cursor-not-allowed opacity-80"
            />
          ),
        },
        {
          key: "ItemName",
          header: "عنوان کالا",
          type: "text",
          width: "200px",
          render: (row) => (
            <input
              type="text"
              value={row.ItemName || ""}
              readOnly={true}
              disabled={true}
              className="w-full text-[11px] px-1 bg-transparent dark:text-gray-200 outline-none h-full font-sans cursor-not-allowed opacity-80"
            />
          ),
        },
        {
          key: "ItemName2",
          header: "عنوان (2) کالا",
          type: "text",
          width: "180px",
          render: (row) => (
            <input
              type="text"
              value={row.ItemName2 || ""}
              readOnly={true}
              disabled={true}
              className="w-full text-[11px] px-1 bg-transparent dark:text-gray-200 outline-none h-full font-sans cursor-not-allowed opacity-80"
            />
          ),
        },
        {
          key: "MeasurementUnitName",
          header: "واحد سنجش اصلی",
          type: "text",
          width: "140px",
          render: (row) => (
            <input
              type="text"
              value={row.MeasurementUnitName || ""}
              readOnly={true}
              disabled={true}
              className="w-full text-[11px] px-1 bg-transparent dark:text-gray-200 outline-none h-full font-sans cursor-not-allowed opacity-80"
            />
          ),
        },
        {
          key: "UnitRate",
          header: "نرخ واحد",
          type: "amount",
          width: "160px",
          render: (row, rowIndex, onCellChange) => (
            <div className="w-full h-full p-0">
              <AmountInput
                value={row.UnitRate !== undefined && row.UnitRate !== null ? row.UnitRate : 0}
                onChange={(val) => onCellChange({ UnitRate: val })}
                className="w-full h-full text-[11px] border-none focus:ring-0"
                disabled={isUsed}
              />
            </div>
          ),
        },
      ],
    },
  ];

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    let catRef = values.ItemAccountCategoryRef;
    if (typeof catRef === "object" && catRef !== null) {
      catRef = catRef.ItemAccountCategoryID ?? catRef.id ?? catRef.ItemAccountCategoryRef ?? catRef.ItemAccountCategoryCode;
    }
    let numCategoryRef: number | null = null;

    if (catRef !== null && catRef !== undefined && catRef !== "") {
      const valNum = Number(catRef);
      const foundById = categories.find((c: any) => Number(c.ItemAccountCategoryID) === valNum);
      if (foundById) {
        numCategoryRef = Number(foundById.ItemAccountCategoryID);
      } else {
        const valStr = String(catRef).trim();
        const foundByCode = categories.find((c: any) => String(c.ItemAccountCategoryCode) === valStr);
        if (foundByCode) {
          numCategoryRef = Number(foundByCode.ItemAccountCategoryID);
        } else if (!isNaN(valNum) && valNum > 0) {
          numCategoryRef = valNum;
        }
      }
    }

    if ((!numCategoryRef || numCategoryRef <= 0) && values.CategoryTitle) {
      const foundByTitle = categories.find((c: any) => c.ItemAccountCategoryName === values.CategoryTitle);
      if (foundByTitle && foundByTitle.ItemAccountCategoryID) {
        numCategoryRef = Number(foundByTitle.ItemAccountCategoryID);
      }
    }

    if (numCategoryRef && numCategoryRef > 0 && values.ItemAccountCategoryRef !== numCategoryRef) {
      setValues((prev) => ({ ...prev, ItemAccountCategoryRef: numCategoryRef }));
    }

    if (!values.EffectiveDate) {
      newErrors.EffectiveDate = "ورود تاریخ موثر الزامی است";
    }

    if (numCategoryRef && values.EffectiveDate) {
      const gregIso = toGregorianIsoDate(values.EffectiveDate);
      if (gregIso) {
        try {
          const checkRes = await apiFetch(
            `/api/inv/standard-item-rates/validate-effective-date?categoryId=${numCategoryRef}&effectiveDate=${encodeURIComponent(gregIso)}${activeId ? `&excludeId=${activeId}` : ''}`
          ).then((r) => r.json());

          if (checkRes && checkRes.valid === false) {
            newErrors.EffectiveDate = checkRes.message;
          }
        } catch (err) {
          console.error("Effective date validation check error:", err);
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast(newErrors.EffectiveDate || newErrors.ItemAccountCategoryRef || "لطفاً فیلدهای اجباری را تکمیل نمایید", "error");
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        FiscalYearRef: values.FiscalYearRef ? Number(values.FiscalYearRef) : undefined,
        ItemAccountCategoryRef: numCategoryRef || null,
        EffectiveDate: toGregorianIsoDate(values.EffectiveDate),
        Description: values.Description || "",
        details: (values.details || []).map((d: any) => ({
          ItemRef: Number(d.ItemID || d.ItemRef),
          UnitRate: parseFloat(String(d.UnitRate || 0)),
        })),
      };

      const res = await apiFetch(getUrl("/api/inv/standard-item-rates"), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok && resData) {
        showToast("اطلاعات با موفقیت ذخیره شد", "success");
        const item = resData.data || resData;
        const savedId = item.StandardItemRateID || activeId;

        const savedCatId = item.ItemAccountCategoryRef ? Number(item.ItemAccountCategoryRef) : numCategoryRef;
        const foundCat = categories.find((c: any) => Number(c.ItemAccountCategoryID) === savedCatId);

        setValues((prev) => ({
          ...prev,
          StandardItemRateID: savedId || prev.StandardItemRateID || "",
          FiscalYearRef: item.FiscalYearRef || prev.FiscalYearRef || null,
          ItemAccountCategoryRef: savedCatId || prev.ItemAccountCategoryRef || null,
          CategoryTitle: item.ItemAccountCategoryName || foundCat?.ItemAccountCategoryName || prev.CategoryTitle || "",
          CategoryTitle2: item.ItemAccountCategoryName2 || foundCat?.ItemAccountCategoryName2 || prev.CategoryTitle2 || "",
          StandardRateText: (savedCatId || prev.ItemAccountCategoryRef) ? "دارد" : (prev.StandardRateText || ""),
          EffectiveDate: item.EffectiveDate || payload.EffectiveDate || prev.EffectiveDate || "",
          Description: item.Description !== undefined && item.Description !== null ? item.Description : prev.Description || "",
          details: (item.details && item.details.length > 0) ? item.details : prev.details || [],
        }));

        handleResponse(resData, "StandardItemRateID");
        return resData;
      } else {
        const errMsg = resData.message || "خطا در ذخیره‌سازی اطلاعات";
        if (errMsg.includes("تاریخ موثر")) {
          setErrors((prev) => ({ ...prev, EffectiveDate: errMsg }));
        }
        showToast(errMsg, "error");
        return false;
      }
    } catch (err: any) {
      console.error("Save standard item rate error:", err);
      showToast("خطا در ارتباط با سرور", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setActiveId(null);
    setValues({
      StandardItemRateID: "",
      FiscalYearRef: null,
      ItemAccountCategoryRef: null,
      CategoryTitle: "",
      CategoryTitle2: "",
      StandardRateText: "",
      EffectiveDate: "",
      Description: "",
      details: [],
    });
    setErrors({});
  };

  const handleSaveNew = async () => {
    const res = await handleSave();
    if (res) {
      handleNew();
    }
  };

  const handleListSelect = (param1: any, param2?: any) => {
    const selectedItem = (param1 && typeof param1 === "object") ? param1 : ((param2 && typeof param2 === "object") ? param2 : param1);
    if (!selectedItem) return;
    const selectedId = selectedItem.StandardItemRateID || selectedItem.id || selectedItem.ID || param2 || param1;
    if (selectedId) {
      setActiveId(Number(selectedId));
    }
  };

  const handleDelete = async () => {
    if (!activeId) return;
    try {
      const res = await apiFetch(`/api/inv/standard-item-rates/${activeId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        removeTab(activeId.toString());
      } else {
        const errData = await res.json();
        showToast(errData.message || "خطا در حذف اطلاعات", "error");
        throw new Error(errData.message || "خطا در حذف اطلاعات");
      }
    } catch (err: any) {
      console.error("Delete standard item rate error:", err);
      if (err.message) {
        showToast(err.message, "error");
      } else {
        showToast("خطا در ارتباط با سرور", "error");
      }
      throw err;
    }
  };

  return (
    <SimpleFormTwoRowTabbed
      title="نرخ استاندارد کالا"
      fields={fields}
      values={values}
      onChange={handleChange}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onNew={handleNew}
      onDelete={handleDelete}
      onListSelect={handleListSelect}
      isReadonly={isUsed}
      hasDateInput={false}
      bottomTabs={[
        {
          id: "rate",
          label: "نرخ کالا",
          content: (
            <TabCellRow
              tabs={detailTabConfig}
              value={values.details}
              onChange={(newDetails) => setValues((prev) => ({ ...prev, details: newDetails }))}
              hideHeader={true}
              hideAddButton={true}
              hideDeleteButton={true}
              hideCopyPaste={true}
              hideSumRow={true}
              showSumRow={false}
              isReadonly={isUsed}
            />
          ),
        },
      ]}
      listApiUrl="/api/inv/standard-item-rates"
      listDisplayKey="ItemAccountCategoryCode"
      listColumns={[
        { key: "StandardItemRateID", label: "شناسه" },
        { key: "ItemAccountCategoryCode", label: "کد طبقه" },
        { key: "ItemAccountCategoryName", label: "عنوان طبقه" },
        { key: "EffectiveDate", label: "تاریخ موثر" },
        { key: "Description", label: "توضیحات" },
      ]}
    />
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { FieldConfig } from "../SimpleFormTwoRow";
import { TabCellRow, TabCellConfig } from "../TabCellRow";
import { SingleSelectDropDown, SingleSelectColumn } from "@/components/inputs/SingleSelectDropDown";
import { MultiSelectDropDown } from "@/components/inputs/MultiSelectDropDown";
import { MultiColumnDropDown } from "@/components/inputs/MultiColumnDropdown";
import { CheckBoxRightLabel } from "@/components/inputs/CheckBoxRightLabel";
import { AmountInput } from "@/components/inputs/AmountInput";
import { NumberInput } from "@/components/inputs/NumberInput";
import { TextInput } from "@/components/inputs/TextInput";
import { DateInput } from "@/components/inputs/DateInput";
import { FormLabel } from "@/components/inputs/FormLabel";
import { Package, List, Plus, X, FolderTree } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch, cn } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { ItemType, PricingMethod, TaxAndDutyExemption } from "@/backend/src/softwares/inv/domain/enums/item.enums";
import { ProductImageGallery } from "@/components/forms/inv/ProductImageGallery";
import { TreeView, TreeNode } from "@/components/inputs/TreeView";

interface ProductServiceProps {
  id?: number;
}

export function ProductService({ id }: ProductServiceProps) {
  const { addTab, removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("Item", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    ItemID: "",
    ItemType: ItemType.GOODS,
    ItemCode: "",
    ItemName: "",
    ItemName2: "",
    MeasurementUnitRef: null,
    TechnicalSpecification: "",
    DetailedAccountCode: "",
    TaxRate: 0,
    DutyRate: 0,
    IranCode: "",
    ItemAccountCategoryRef: null,
    PricingMethod: PricingMethod.WEIGHTED_AVERAGE,
    TaxAndDutyExemption: TaxAndDutyExemption.NONE,
    IsSalable: true,
    IsActive: true,
    ItemPhysicalLocations: [],
    ItemSubUnits: [],
    ItemInventoryControls: [],
    ItemVolumeCbms: [],
    ItemSimilarItems: [],
    ItemImages: [],
  });

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [measurementUnits, setMeasurementUnits] = useState<any[]>([]);
  const [itemAccountCategories, setItemAccountCategories] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/inv/warehouses')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setWarehouses(list);
      })
      .catch(console.error);

    apiFetch('/api/inv/measurement-units')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setMeasurementUnits(list);
      })
      .catch(console.error);

    apiFetch('/api/inv/item-account-categories')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setItemAccountCategories(list);
      })
      .catch(console.error);

    apiFetch('/api/inv/items/dropdown')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setAllItems(list);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (values.ItemAccountCategoryRef && itemAccountCategories.length > 0) {
      const cat = itemAccountCategories.find(
        (c: any) => Number(c.ItemAccountCategoryID || c.id) === Number(values.ItemAccountCategoryRef)
      );
      if (cat && cat.PricingMethod !== undefined && cat.PricingMethod !== null) {
        const catPricingMethod = Number(cat.PricingMethod);
        if (values.PricingMethod !== catPricingMethod) {
          setValues((prev) => ({ ...prev, PricingMethod: catPricingMethod }));
        }
      }
    }
  }, [values.ItemAccountCategoryRef, itemAccountCategories]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDocumentNoAuto, setIsDocumentNoAuto] = useState(false);

  const [showGroupTreeModal, setShowGroupTreeModal] = useState(false);
  const [groupTreeData, setGroupTreeData] = useState<TreeNode | null>(null);
  const [selectedGroupNode, setSelectedGroupNode] = useState<TreeNode | null>(null);
  const [loadingGroupTree, setLoadingGroupTree] = useState(false);

  const [invSettings, setInvSettings] = useState<{
    isFixed: boolean;
    length: number;
    allowLetters: boolean;
    isLatin: boolean;
    allowDuplicateName: boolean;
    codingMethod: string;
    groupCodeLength: number;
    itemVariableCodeLength: number;
    counterStart: number;
  }>({
    isFixed: false,
    length: 10,
    allowLetters: false,
    isLatin: false,
    allowDuplicateName: false,
    codingMethod: '1',
    groupCodeLength: 6,
    itemVariableCodeLength: 4,
    counterStart: 1,
  });

  useEffect(() => {
    apiFetch('/api/common/base-settings/tab/3')
      .then((res) => res.json())
      .then((resData) => {
        const data = resData.data || {};
        const totalGroupLen = parseInt(data.groupCodeLength || data.totalProductServiceGroupLength || '6', 10) || 6;
        const totalItemLen = parseInt(data.itemCodeLength || '10', 10) || 10;
        const varLen = parseInt(data.itemVariableCodeLength || String(Math.max(1, totalItemLen - totalGroupLen)), 10) || 4;
        const cStart = parseInt(data.counterStart || '1', 10) || 1;

        setInvSettings({
          isFixed: data.isItemCodeLengthFixed === 'true' || data.isItemCodeLengthFixed === true,
          length: totalItemLen,
          allowLetters: data.allowItemCodeLetters === 'true' || data.allowItemCodeLetters === true,
          isLatin: data.isItemCodeLatin === 'true' || data.isItemCodeLatin === true,
          allowDuplicateName: data.allowDuplicateItemName === 'true' || data.allowDuplicateItemName === true,
          codingMethod: String(data.itemCodingMethod || '1'),
          groupCodeLength: totalGroupLen,
          itemVariableCodeLength: varLen,
          counterStart: cStart,
        });
      })
      .catch(console.error);
  }, []);

  const getParentCodePrefix = (tree: TreeNode | null, nodeId: string): string => {
    if (!tree || !nodeId) return '';
    const findAncestors = (curr: TreeNode, targetId: string, path: TreeNode[]): TreeNode[] | null => {
      if (curr.id === targetId) return path;
      if (curr.children) {
        for (const child of curr.children) {
          const found = findAncestors(child, targetId, [...path, curr]);
          if (found) return found;
        }
      }
      return null;
    };
    const ancestors = findAncestors(tree, nodeId, []);
    if (!ancestors || ancestors.length === 0) return '';
    return ancestors
      .filter(a => !a.isRoot)
      .map(a => a.data?.code || '')
      .join('');
  };

  const handleOpenGroupTreeModal = async () => {
    setShowGroupTreeModal(true);
    setLoadingGroupTree(true);
    setSelectedGroupNode(null);
    try {
      const res = await apiFetch('/api/inv/item-service-groups/tree');
      if (res.ok) {
        const resData = await res.json();
        if (resData && resData.data) {
          setGroupTreeData(resData.data);
        }
      }
      const itemsRes = await apiFetch('/api/inv/items/dropdown');
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        if (Array.isArray(itemsData)) {
          setAllItems(itemsData);
        }
      }
    } catch (e) {
      console.error("Error fetching group tree for automatic code generation:", e);
    } finally {
      setLoadingGroupTree(false);
    }
  };

  const handleConfirmGroupSelection = () => {
    const activeTree = displayGroupTreeData || groupTreeData;
    if (!selectedGroupNode || selectedGroupNode.isRoot || !activeTree) {
      showToast("لطفاً یک گروه معتبر از درختواره انتخاب کنید.", "warning");
      return;
    }

    const groupCode = getParentCodePrefix(activeTree, selectedGroupNode.id) + (selectedGroupNode.data?.code || '');
    if (!groupCode) {
      showToast("کد گروه انتخاب شده معتبر نمی‌باشد.", "error");
      return;
    }

    const groupCodeLength = groupCode.length;
    let variablePartLength = invSettings.itemVariableCodeLength;
    if (!variablePartLength || variablePartLength <= 0) {
      const totalLen = invSettings.length || 10;
      variablePartLength = Math.max(1, totalLen - groupCodeLength);
    }

    let maxCounter = 0;
    for (const item of allItems) {
      const itemCodeStr = String(item.ItemCode || item.product_code || item.id || '').trim();
      if (itemCodeStr.startsWith(groupCode)) {
        const suffix = itemCodeStr.substring(groupCode.length);
        const parsed = parseInt(suffix, 10);
        if (!isNaN(parsed) && parsed > maxCounter) {
          maxCounter = parsed;
        }
      }
    }

    const nextCounter = maxCounter > 0 ? maxCounter + 1 : (invSettings.counterStart || 1);
    const paddedSuffix = String(nextCounter).padStart(variablePartLength, '0');
    let generatedItemCode = groupCode + paddedSuffix;

    if (invSettings.length > 0 && generatedItemCode.length > invSettings.length) {
      generatedItemCode = generatedItemCode.slice(0, invSettings.length);
    }

    handleChange("ItemCode", generatedItemCode);
    setShowGroupTreeModal(false);
    showToast(`کد کالا (${generatedItemCode}) برای گروه ${selectedGroupNode.name} تولید گردید.`, "success");
  };

  useEffect(() => {

    if (activeId) {
      apiFetch(`/api/inv/items/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          const item = data.data || data;
          setValues({
            ItemID: item.ItemID || "",
            ItemType: item.ItemType ?? ItemType.GOODS,
            ItemCode: item.ItemCode !== undefined && item.ItemCode !== null ? String(item.ItemCode) : "",
            ItemName: item.ItemName || "",
            ItemName2: item.ItemName2 || "",
            MeasurementUnitRef: item.MeasurementUnitRef || null,
            TechnicalSpecification: item.TechnicalSpecification || "",
            DetailedAccountCode: item.DetailedAccountCode || "",
            TaxRate: item.TaxRate ?? 0,
            DutyRate: item.DutyRate ?? 0,
            IranCode: item.IranCode || "",
            ItemAccountCategoryRef: item.ItemAccountCategoryRef || null,
            PricingMethod: item.PricingMethod ?? PricingMethod.WEIGHTED_AVERAGE,
            TaxAndDutyExemption: item.TaxAndDutyExemption ?? TaxAndDutyExemption.NONE,
            IsSalable: item.IsSalable ?? true,
            IsActive: item.IsActive ?? true,
            ItemPhysicalLocations: item.ItemPhysicalLocations || [],
            ItemSubUnits: item.ItemSubUnits || [],
            ItemInventoryControls: item.ItemInventoryControls || [],
            ItemVolumeCbms: item.ItemVolumeCbms || [],
            ItemSimilarItems: item.ItemSimilarItems || [],
            ItemImages: item.ItemImages || [],
          });
        })
        .catch(console.error);
    } else {
      apiFetch(`/api/inv/items/next-number`)
        .then((res) => res.json())
        .then((resData) => {
          if (invSettings.codingMethod === '2') {
            setIsDocumentNoAuto(false);
          } else {
            setIsDocumentNoAuto(resData.isDocumentNumberAuto);
            if (resData.error) {
              showToast(resData.error, "error");
            }
            if (resData.isDocumentNumberAuto && resData.documentNumber) {
              setValues((prev) => ({ ...prev, ItemCode: String(resData.documentNumber) }));
            }
          }
        })
        .catch(console.error);
    }
  }, [activeId, invSettings.codingMethod]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "ItemType" && Number(value) === ItemType.SERVICE) {
        next.ItemAccountCategoryRef = null;
      }
      return next;
    });
    if (errors[name] || (name === "ItemType" && Number(value) === ItemType.SERVICE && errors.ItemAccountCategoryRef)) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        if (name === "ItemType" && Number(value) === ItemType.SERVICE) {
          delete newErrors.ItemAccountCategoryRef;
        }
        return newErrors;
      });
    }
  };

  const formatItemCode = (rawCode: any) => {
    if (rawCode === undefined || rawCode === null || rawCode === "") return rawCode;
    let codeStr = String(rawCode).trim();
    if (invSettings.length > 0 && codeStr.length > invSettings.length) {
      codeStr = codeStr.slice(0, invSettings.length);
    }
    if (invSettings.isFixed && codeStr.length > 0 && codeStr.length < invSettings.length) {
      return codeStr.padStart(invSettings.length, '0');
    }
    return codeStr;
  };

  const handleItemCodeBlur = () => {
    if (values.ItemCode) {
      const formatted = formatItemCode(values.ItemCode);
      if (formatted !== values.ItemCode) {
        handleChange("ItemCode", formatted);
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.ItemCode) {
      newErrors.ItemCode = "کد اجباری است *";
    } else if (values.ItemCode) {
      let codeStr = String(values.ItemCode).trim();
      if (invSettings.isFixed && codeStr.length > 0 && codeStr.length < invSettings.length) {
        codeStr = codeStr.padStart(invSettings.length, '0');
        setValues((prev) => ({ ...prev, ItemCode: codeStr }));
      }
      if (invSettings.length > 0 && codeStr.length > invSettings.length) {
        newErrors.ItemCode = `طول کد کالا نمی‌تواند بیشتر از ${invSettings.length} رقم باشد *`;
      }
      if (!invSettings.allowLetters && /[^\d]/.test(codeStr)) {
        newErrors.ItemCode = "کد کالا نمی‌تواند شامل حرف باشد *";
      }
      const persianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
      if (invSettings.isLatin && persianRegex.test(codeStr)) {
        newErrors.ItemCode = "کد کالا لاتین است و نمی‌تواند شامل حروف فارسی باشد *";
      }
    }
    if (values.ItemType === undefined || values.ItemType === null || values.ItemType === "") {
      newErrors.ItemType = "نوع اجباری است *";
    }
    if (!values.ItemName) {
      newErrors.ItemName = "نام کالا اجباری است *";
    }
    if (!values.ItemName2) {
      newErrors.ItemName2 = "نام کالا(2) اجباری است *";
    }
    if (!values.MeasurementUnitRef) {
      newErrors.MeasurementUnitRef = "واحد سنجش اجباری است *";
    }
    if (!values.ItemAccountCategoryRef && Number(values.ItemType) !== ItemType.SERVICE) {
      newErrors.ItemAccountCategoryRef = "طبقه کالا اجباری است *";
    }

    if (Array.isArray(values.ItemSimilarItems) && values.ItemSimilarItems.length > 0) {
      const priorities = values.ItemSimilarItems.map((it: any) => Number(it.Priority)).filter((p) => !isNaN(p));
      const uniquePriorities = new Set(priorities);
      if (priorities.length !== uniquePriorities.size) {
        newErrors.ItemSimilarItems = "اولویت کالاهای مشابه نمی‌تواند تکراری باشد *";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitData = async () => {
    if (!validate()) {
      showToast("لطفاً فیلدهای اجباری را تکمیل نمایید", "error");
      return null;
    }

    setIsSubmitting(true);
    try {
      const url = getUrl("/api/inv/items");

      let itemCodePayload: any = values.ItemCode;
      if (values.ItemCode !== undefined && values.ItemCode !== null && values.ItemCode !== "") {
        let codeStr = String(values.ItemCode).trim();
        if (invSettings.isFixed && codeStr.length > 0 && codeStr.length < invSettings.length) {
          codeStr = codeStr.padStart(invSettings.length, '0');
        }
        itemCodePayload = (invSettings.allowLetters || invSettings.isLatin || invSettings.isFixed) ? codeStr : Number(codeStr);
      } else {
        itemCodePayload = undefined;
      }

      const payload: any = {
        ...values,
        ItemType: Number(values.ItemType),
        ItemCode: itemCodePayload,
        TaxRate: Number(values.TaxRate || 0),
        DutyRate: Number(values.DutyRate || 0),
        PricingMethod: Number(values.PricingMethod),
        TaxAndDutyExemption: Number(values.TaxAndDutyExemption),
        IsSalable: Boolean(values.IsSalable),
        IsActive: Boolean(values.IsActive),
        MeasurementUnitRef: values.MeasurementUnitRef ? Number(values.MeasurementUnitRef) : null,
        ItemAccountCategoryRef: values.ItemAccountCategoryRef ? Number(values.ItemAccountCategoryRef) : null,
        ItemPhysicalLocations: values.ItemPhysicalLocations || [],
        ItemSubUnits: (values.ItemSubUnits || []).filter((su: any) => su.SubUnitRef),
        ItemInventoryControls: values.ItemInventoryControls || [],
        ItemVolumeCbms: values.ItemVolumeCbms || [],
        ItemSimilarItems: (values.ItemSimilarItems || []).filter((si: any) => si.SimilarItemRef),
        ItemImages: values.ItemImages || [],
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "خطا در ذخیره اطلاعات کالا و خدمت");
      }

      const result = await res.json();
      showToast("اطلاعات کالا و خدمت با موفقیت ذخیره گردید", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: "Item" });
      handleResponse(result, "ItemID");
      return result;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در ذخیره اطلاعات", "error");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    return await submitData();
  };

  const handleSaveClose = async () => {
    return await submitData();
  };

  const handleSaveNew = async () => {
    const res = await submitData();
    if (res) {
      setValues({
        ItemID: "",
        ItemType: ItemType.GOODS,
        ItemCode: "",
        ItemName: "",
        ItemName2: "",
        MeasurementUnitRef: null,
        TechnicalSpecification: "",
        DetailedAccountCode: "",
        TaxRate: 0,
        DutyRate: 0,
        IranCode: "",
        ItemAccountCategoryRef: null,
        PricingMethod: PricingMethod.WEIGHTED_AVERAGE,
        TaxAndDutyExemption: TaxAndDutyExemption.NONE,
        IsSalable: true,
        IsActive: true,
        ItemPhysicalLocations: [],
        ItemSubUnits: [],
        ItemInventoryControls: [],
        ItemVolumeCbms: [],
        ItemSimilarItems: [],
        ItemImages: [],
      });

      apiFetch(`/api/inv/items/next-number`)
        .then((res) => res.json())
        .then((resData) => {
          setIsDocumentNoAuto(resData.isDocumentNumberAuto);
          if (resData.isDocumentNumberAuto && resData.documentNumber) {
            setValues((prev) => ({ ...prev, ItemCode: resData.documentNumber }));
          }
        })
        .catch(console.error);
    }
  };

  const handleDelete = async () => {
    if (!activeId) return;
    if (isUsed) {
      showToast("امکان حذف این کالا به دلیل استفاده در بخش‌های دیگر وجود ندارد.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const usageRes = await apiFetch(`/api/core/usage-check?tableName=Item&id=${activeId}`);
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        if (usageData?.isUsed) {
          showToast(`امکان حذف این کالا به دلیل استفاده در بخش‌های دیگر وجود ندارد.`, "error");
          return;
        }
      }

      const res = await apiFetch(`/api/inv/items/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "خطا در حذف رکورد");
      }
      showToast("اطلاعات کالا و خدمت با موفقیت حذف گردید", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: "Item" });
      removeTab(`ProductService-${activeId}`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در حذف", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tax/Duty Exemption Checkbox logic
  const isSaleExempt = values.TaxAndDutyExemption === TaxAndDutyExemption.SALE_EXEMPT || values.TaxAndDutyExemption === TaxAndDutyExemption.BOTH_EXEMPT;
  const isPurchaseExempt = values.TaxAndDutyExemption === TaxAndDutyExemption.PURCHASE_EXEMPT || values.TaxAndDutyExemption === TaxAndDutyExemption.BOTH_EXEMPT;

  const handleTaxExemptionChange = (type: "sale" | "purchase", checked: boolean) => {
    const newSale = type === "sale" ? checked : isSaleExempt;
    const newPurchase = type === "purchase" ? checked : isPurchaseExempt;

    let exemptionEnum = TaxAndDutyExemption.NONE;
    if (newSale && newPurchase) {
      exemptionEnum = TaxAndDutyExemption.BOTH_EXEMPT;
    } else if (newSale) {
      exemptionEnum = TaxAndDutyExemption.SALE_EXEMPT;
    } else if (newPurchase) {
      exemptionEnum = TaxAndDutyExemption.PURCHASE_EXEMPT;
    }

    handleChange("TaxAndDutyExemption", exemptionEnum);
  };

  const measurementUnitColumns: SingleSelectColumn[] = [
    { key: "MeasurementUnitCode", label: "کد" },
    { key: "MeasurementUnitName", label: "عنوان" },
    { key: "MeasurementUnitName2", label: "عنوان دوم" },
  ];

  const itemAccountCategoryColumns: SingleSelectColumn[] = [
    { key: "ItemAccountCategoryCode", label: "کد" },
    { key: "ItemAccountCategoryName", label: "عنوان" },
    { key: "ItemAccountCategoryName2", label: "عنوان دوم" },
  ];

  const isGoods = Number(values.ItemType) === ItemType.GOODS;
  const isService = Number(values.ItemType) === ItemType.SERVICE;

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const displayGroupTreeData = useMemo(() => {
    if (!groupTreeData) return null;
    if (!groupTreeData.children || groupTreeData.children.length === 0) return groupTreeData;

    if (isGoods) {
      const goodsChildren = groupTreeData.children.filter((child: any) => {
        const code = child.code || child.data?.code;
        const name = child.name || child.data?.name;
        return code === '10' || name === 'کالا';
      });
      return {
        ...groupTreeData,
        children: goodsChildren,
      };
    }

    if (isService) {
      const serviceChildren = groupTreeData.children.filter((child: any) => {
        const code = child.code || child.data?.code;
        const name = child.name || child.data?.name;
        return code === '20' || name === 'خدمت';
      });
      return {
        ...groupTreeData,
        children: serviceChildren,
      };
    }

    return groupTreeData;
  }, [groupTreeData, isGoods, isService]);

  const fields: FieldConfig[] = [
    {
      name: "ItemType",
      label: "نوع",
      type: "select",
      required: true,
      colSpan: 1,
      disabled: isUsed,
      options: [
        { value: ItemType.GOODS, label: "کالا" },
        { value: ItemType.SERVICE, label: "خدمت" },
      ],
    },
    {
      name: "ItemCode",
      label: "کد",
      type: "custom",
      required: true,
      colSpan: 1,
      customComponent: (
        <div className="flex items-center w-full" dir="ltr">
          {invSettings.codingMethod === '2' && (
            <button
              type="button"
              onClick={handleOpenGroupTreeModal}
              disabled={isUsed}
              title="انتخاب گروه کالا و خدمت و تولید اتوماتیک کد"
              className="h-[25px] px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center rounded-l-lg border border-blue-600 border-r-0 shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={values.ItemCode ?? ""}
              maxLength={invSettings.length > 0 ? invSettings.length : undefined}
              onChange={(e) => {
                const val = e.target.value;
                if (!invSettings.allowLetters && !invSettings.isLatin && !invSettings.isFixed) {
                  if (val && /[^\d]/.test(val)) return;
                }
                if (invSettings.length > 0 && val.length > invSettings.length) {
                  return;
                }
                handleChange("ItemCode", val);
              }}
              onBlur={handleItemCodeBlur}
              disabled={isUsed}
              dir={invSettings.isLatin ? "ltr" : "rtl"}
              className={cn(
                "w-full px-4 h-[25px] text-[11px] bg-gray-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-mono",
                invSettings.isLatin ? "text-left" : "",
                invSettings.codingMethod === '2' ? "rounded-r-lg rounded-l-none border-l-0" : "rounded-lg",
                errors.ItemCode ? "border-rose-500 ring-rose-500/20 ring-1" : ""
              )}
            />
          </div>
        </div>
      ),
    },
    {
      name: "ItemName",
      label: "نام کالا",
      type: "text",
      required: true,
      colSpan: 1,
      disabled: isUsed,
    },
    {
      name: "ItemName2",
      label: "نام کالا(2)",
      type: "text",
      required: true,
      colSpan: 1,
      disabled: isUsed,
    },
    {
      name: "MeasurementUnitRef",
      label: "واحد سنجش",
      type: "custom",
      required: true,
      colSpan: 1,
      customComponent: (
        <SingleSelectDropDown
          noWrapper={true}
          listApiUrl="/api/inv/measurement-units"
          options={measurementUnits}
          columns={measurementUnitColumns}
          displayKey="MeasurementUnitName"
          valueKey="MeasurementUnitID"
          value={values.MeasurementUnitRef}
          error={errors.MeasurementUnitRef}
          onChange={(selected, selectedVal) => {
            const unitId = selected ? (selected.MeasurementUnitID || selected.id || selectedVal) : null;
            handleChange("MeasurementUnitRef", unitId);
          }}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "DetailedAccountCode",
      label: "کد تفصیل",
      type: "text",
      colSpan: 1,
      disabled: isUsed,
    },
    {
      name: "ItemAccountCategoryRef",
      label: "طبقه کالا",
      type: "custom",
      required: !isService,
      colSpan: 1,
      disabled: isUsed || isService,
      customComponent: (
        <SingleSelectDropDown
          noWrapper={true}
          listApiUrl="/api/inv/item-account-categories"
          options={itemAccountCategories}
          columns={itemAccountCategoryColumns}
          displayKey="ItemAccountCategoryName"
          valueKey="ItemAccountCategoryID"
          value={values.ItemAccountCategoryRef}
          error={errors.ItemAccountCategoryRef}
          onChange={(selected, selectedVal) => {
            const catId = selected ? (selected.ItemAccountCategoryID || selected.id || selectedVal) : null;
            const catObj = selected || itemAccountCategories.find((c: any) => Number(c.ItemAccountCategoryID || c.id) === Number(catId));
            const newPricingMethod = catObj?.PricingMethod !== undefined && catObj?.PricingMethod !== null
              ? Number(catObj.PricingMethod)
              : PricingMethod.WEIGHTED_AVERAGE;

            setValues((prev) => ({
              ...prev,
              ItemAccountCategoryRef: catId,
              PricingMethod: newPricingMethod,
            }));

            if (errors.ItemAccountCategoryRef) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.ItemAccountCategoryRef;
                return newErrors;
              });
            }
          }}
          disabled={isUsed || isService}
        />
      ),
    },
    {
      name: "PricingMethod",
      label: "روش قیمت گذاری",
      type: "select",
      colSpan: 1,
      disabled: true,
      options: [
        { value: 1, label: "میانگین موزون" },
        { value: 2, label: "FIFO (نخستین ورودی، نخستین خروجی)" },
        { value: 3, label: "LIFO (آخرین ورودی، نخستین خروجی)" },
        { value: 4, label: "نرخ استاندارد" },
      ],
    },
    {
      name: "TaxAndDutyExemption",
      label: "معاف از مالیات و عوارض",
      type: "custom",
      colSpan: 1,
      customComponent: (
        <div className="flex items-center gap-6 pt-1">
          <CheckBoxRightLabel
            label="معاف در فروش"
            checked={isSaleExempt}
            onChange={(chk) => handleTaxExemptionChange("sale", chk)}
            disabled={isUsed}
          />
          <CheckBoxRightLabel
            label="معاف در خرید"
            checked={isPurchaseExempt}
            onChange={(chk) => handleTaxExemptionChange("purchase", chk)}
            disabled={isUsed}
          />
        </div>
      ),
    },
    {
      name: "IsSalable",
      label: "وضعیت و قابلیت فروش",
      type: "custom",
      colSpan: 1,
      customComponent: (
        <div className="flex items-center gap-6 pt-1">
          <CheckBoxRightLabel
            label="قابل فروش"
            checked={!!values.IsSalable}
            onChange={(chk) => handleChange("IsSalable", chk)}
            disabled={isUsed}
          />
          <CheckBoxRightLabel
            label="فعال"
            checked={!!values.IsActive}
            onChange={(chk) => handleChange("IsActive", chk)}
            disabled={isUsed}
          />
        </div>
      ),
    },
  ];

  const hasPhysicalLocations = warehouses.some((w: any) => Number(w.WarehouseType) === 2);

  const getNatureTitle = (natureVal: any) => {
    switch (Number(natureVal)) {
      case 1: return "مواد اولیه";
      case 2: return "نیمه‌ساخته";
      case 3: return "محصول ساخته شده";
      case 4: return "اموال/دارایی";
      case 5: return "ضایعات";
      case 6: return "سایر";
      default: return "";
    }
  };

  let locationOptions: any[] = [];
  let dropdownColumns: SingleSelectColumn[] = [];

  if (hasPhysicalLocations) {
    const physicalNodes = warehouses.filter((w: any) => Number(w.WarehouseType) === 2);
    locationOptions = physicalNodes.map((w: any) => {
      const parentW = w.Parent || warehouses.find((p: any) => Number(p.WarehouseID) === Number(w.ParentRef));
      return {
        id: String(w.WarehouseID),
        WarehouseID: w.WarehouseID,
        LocationCode: w.WarehouseCode || "",
        LocationTitle: w.WarehouseTitle || "",
        LocationTitle2: w.WarehouseTitle2 || "",
        WarehouseCode: parentW?.WarehouseCode || "",
        WarehouseTitle: parentW?.WarehouseTitle || "",
        WarehouseNatureName: getNatureTitle(parentW?.WarehouseNature || w.WarehouseNature),
      };
    });

    dropdownColumns = [
      { key: "LocationCode", label: "کد محل فیزیکی" },
      { key: "LocationTitle", label: "عنوان محل فیزیکی" },
      { key: "WarehouseCode", label: "کد انبار" },
      { key: "WarehouseTitle", label: "عنوان انبار" },
      { key: "WarehouseNatureName", label: "ماهیت انبار" },
    ];
  } else {
    const warehouseNodes = warehouses.filter((w: any) => Number(w.WarehouseType) === 1 || !w.WarehouseType);
    locationOptions = warehouseNodes.map((w: any) => {
      return {
        id: String(w.WarehouseID),
        WarehouseID: w.WarehouseID,
        LocationCode: "",
        LocationTitle: w.WarehouseTitle || "",
        LocationTitle2: w.WarehouseTitle2 || "",
        WarehouseCode: w.WarehouseCode || "",
        WarehouseTitle: w.WarehouseTitle || "",
        WarehouseNatureName: getNatureTitle(w.WarehouseNature),
      };
    });

    dropdownColumns = [
      { key: "WarehouseCode", label: "کد انبار" },
      { key: "WarehouseTitle", label: "عنوان انبار" },
      { key: "WarehouseNatureName", label: "ماهیت انبار" },
    ];
  }

  const physicalLocationTabConfig: TabCellConfig[] = [
    {
      id: "physical_locations",
      label: "محل فیزیکی کالا",
      columns: [
        {
          key: "Code",
          header: "کد",
          width: "220px",
          type: "custom",
          render: (row: any, rowIndex: number, onChangeRow: (val: any) => void) => {
            const selectedValue = row.WarehouseRef ? String(row.WarehouseRef) : "";
            return (
              <SingleSelectDropDown
                data={locationOptions}
                options={locationOptions}
                columns={dropdownColumns}
                value={selectedValue}
                displayKey={hasPhysicalLocations ? "LocationCode" : "WarehouseCode"}
                valueKey="id"
                searchKeys={hasPhysicalLocations ? ["LocationCode", "LocationTitle", "WarehouseCode", "WarehouseTitle"] : ["WarehouseCode", "WarehouseTitle"]}
                addFormOptions={{ title: 'تعریف انبار جدید', componentName: 'WarehouseForm', groupId: 'inv' }}
                disabled={isUsed}
                onChange={(selectedItem) => {
                  if (!selectedItem) {
                    onChangeRow({
                      ...row,
                      WarehouseRef: null,
                      Code: "",
                      Title: "",
                      Title2: "",
                    });
                    return;
                  }

                  const currentList = values.ItemPhysicalLocations || [];
                  const isDuplicate = currentList.some((item: any, idx: number) => {
                    return idx !== rowIndex && Number(item.WarehouseRef) === Number(selectedItem.WarehouseID);
                  });

                  if (isDuplicate) {
                    showToast("محل فیزیکی انتخاب شده تکراری است", "error");
                    return;
                  }

                  const code = hasPhysicalLocations ? selectedItem.LocationCode : selectedItem.WarehouseCode;
                  const title = hasPhysicalLocations ? selectedItem.LocationTitle : selectedItem.WarehouseTitle;
                  const title2 = selectedItem.LocationTitle2 || "";

                  onChangeRow({
                    ...row,
                    WarehouseRef: selectedItem.WarehouseID,
                    Code: code,
                    Title: title,
                    Title2: title2,
                  });
                }}
              />
            );
          },
        },
        {
          key: "Title",
          header: "عنوان",
          type: "text",
          width: "250px",
        },
        {
          key: "Title2",
          header: "عنوان (2)",
          type: "text",
          width: "250px",
        },
        {
          key: "IsDefault",
          header: "پیش فرض",
          type: "checkbox",
          width: "100px",
        },
      ],
    },
  ];

  const handlePhysicalLocationsChange = (newLocations: any[]) => {
    let updated = [...newLocations];
    const currentList = values.ItemPhysicalLocations || [];

    const newlyCheckedIndex = updated.findIndex((loc, idx) => {
      const oldLoc = currentList[idx];
      return loc.IsDefault && (!oldLoc || !oldLoc.IsDefault);
    });

    if (newlyCheckedIndex !== -1) {
      updated = updated.map((loc, idx) => ({
        ...loc,
        IsDefault: idx === newlyCheckedIndex,
      }));
    } else {
      let foundDefault = false;
      updated = updated.map((loc) => {
        if (loc.IsDefault && !foundDefault) {
          foundDefault = true;
          return loc;
        }
        return { ...loc, IsDefault: false };
      });
    }

    handleChange("ItemPhysicalLocations", updated);
  };

  const subUnitTabConfig: TabCellConfig[] = [
    {
      id: "sub_units",
      label: "واحدهای سنجش فرعی",
      columns: [
        {
          key: "RowNo",
          header: "ردیف",
          width: "60px",
          render: (_row: any, rowIndex: number) => (
            <div className="text-center font-mono text-[11px] py-1 select-none text-slate-600 dark:text-slate-300">
              {rowIndex + 1}
            </div>
          ),
        },
        {
          key: "SubUnitRef",
          header: "عنوان واحد فرعی",
          width: "260px",
          type: "custom",
          render: (row: any, rowIndex: number, onChangeRow: (val: any) => void) => {
            const currentSubUnits = values.ItemSubUnits || [];

            const filteredUnits = measurementUnits.filter((unit: any) => {
              const unitId = Number(unit.MeasurementUnitID || unit.id);
              if (values.MeasurementUnitRef && Number(values.MeasurementUnitRef) === unitId) {
                return false;
              }
              const isSelectedInOtherRow = currentSubUnits.some(
                (item: any, idx: number) => idx !== rowIndex && Number(item.SubUnitRef) === unitId
              );
              if (isSelectedInOtherRow) {
                return false;
              }
              return true;
            });

            const subUnitColumns: SingleSelectColumn[] = [
              { key: "MeasurementUnitCode", label: "کد" },
              { key: "MeasurementUnitName", label: "عنوان" },
              { key: "MeasurementUnitName2", label: "عنوان (2)" },
            ];

            const selectedUnit = measurementUnits.find(
              (u: any) => Number(u.MeasurementUnitID || u.id) === Number(row.SubUnitRef)
            ) || null;

            return (
              <SingleSelectDropDown
                data={filteredUnits}
                columns={subUnitColumns}
                value={selectedUnit}
                displayKey="MeasurementUnitName"
                disabled={isUsed}
                onChange={(selectedItem) => {
                  if (!selectedItem) {
                    onChangeRow({
                      ...row,
                      SubUnitRef: null,
                      SubUnitCode: "",
                      SubUnitName: "",
                      SubUnitName2: "",
                    });
                    return;
                  }

                  onChangeRow({
                    ...row,
                    SubUnitRef: selectedItem.MeasurementUnitID,
                    SubUnitCode: selectedItem.MeasurementUnitCode || "",
                    SubUnitName: selectedItem.MeasurementUnitName || "",
                    SubUnitName2: selectedItem.MeasurementUnitName2 || "",
                  });
                }}
              />
            );
          },
        },
        {
          key: "MainToSubRatio",
          header: "نسبت واحد اصلی به فرعی",
          width: "180px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
            <AmountInput
              value={row.MainToSubRatio ?? 1}
              onChange={(val) => onChangeRow({ ...row, MainToSubRatio: val })}
              disabled={isUsed}
            />
          ),
        },
        {
          key: "IsVariableRatio",
          header: "ضریب تبدیل متغیر",
          width: "140px",
          type: "select",
          options: [
            { label: "خیر", value: "2" },
            { label: "بلی", value: "1" },
          ],
          defaultValue: "2",
        },
        {
          key: "TolerancePercent",
          header: "درصد تلرانس",
          width: "140px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
            <AmountInput
              value={row.TolerancePercent ?? 0}
              onChange={(val) => onChangeRow({ ...row, TolerancePercent: val })}
              disabled={isUsed}
            />
          ),
        },
      ],
    },
  ];

  const inventoryControlTabConfig: TabCellConfig[] = [
    {
      id: "inventory_control",
      label: "کنترل موجودی",
      columns: [
        {
          key: "RowNo",
          header: "ردیف",
          width: "60px",
          render: (_row: any, rowIndex: number) => (
            <div className="text-center font-mono text-[11px] py-1 select-none text-slate-600 dark:text-slate-300">
              {rowIndex + 1}
            </div>
          ),
        },
        {
          key: "EffectiveDate",
          header: "تاریخ موثر",
          width: "140px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
            <DateInput
              value={row.EffectiveDate || ""}
              onChange={(val) => onChangeRow({ ...row, EffectiveDate: val })}
              disabled={isUsed}
            />
          ),
        },
        {
          key: "MinQuantity",
          header: "حداقل موجودی",
          width: "150px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
            <AmountInput
              value={row.MinQuantity ?? 0}
              onChange={(val) => onChangeRow({ ...row, MinQuantity: val })}
              disabled={isUsed}
            />
          ),
        },
        {
          key: "MaxQuantity",
          header: "حداکثر موجودی",
          width: "150px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
            <AmountInput
              value={row.MaxQuantity ?? 0}
              onChange={(val) => onChangeRow({ ...row, MaxQuantity: val })}
              disabled={isUsed}
            />
          ),
        },
        {
          key: "OrderQuantity",
          header: "مقدار با صرفه سفارش",
          width: "160px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
            <AmountInput
              value={row.OrderQuantity ?? 0}
              onChange={(val) => onChangeRow({ ...row, OrderQuantity: val })}
              disabled={isUsed}
            />
          ),
        },
        {
          key: "ReorderPoint",
          header: "نقطه حد تجدید سفارش",
          width: "160px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
            <AmountInput
              value={row.ReorderPoint ?? 0}
              onChange={(val) => onChangeRow({ ...row, ReorderPoint: val })}
              disabled={isUsed}
            />
          ),
        },
        {
          key: "Description",
          header: "توضیحات",
          width: "250px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
            <TextInput
              value={row.Description || ""}
              onChange={(val) => onChangeRow({ ...row, Description: val })}
              disabled={isUsed}
            />
          ),
        },
      ],
    },
  ];

  // Measurement units for Volume CBM tab (Header unit + Sub units)
  const availableVolumeUnitsMap = new Map<number, any>();
  if (values.MeasurementUnitRef) {
    const headerUnit = measurementUnits.find(
      (u: any) => Number(u.MeasurementUnitID || u.id) === Number(values.MeasurementUnitRef)
    );
    if (headerUnit) {
      availableVolumeUnitsMap.set(Number(headerUnit.MeasurementUnitID || headerUnit.id), headerUnit);
    }
  }
  (values.ItemSubUnits || []).forEach((su: any) => {
    if (su.SubUnitRef) {
      const uId = Number(su.SubUnitRef);
      if (!availableVolumeUnitsMap.has(uId)) {
        const matchedUnit = measurementUnits.find(
          (u: any) => Number(u.MeasurementUnitID || u.id) === uId
        );
        availableVolumeUnitsMap.set(uId, {
          MeasurementUnitID: uId,
          MeasurementUnitCode: su.SubUnitCode || matchedUnit?.MeasurementUnitCode || "",
          MeasurementUnitName: su.SubUnitName || matchedUnit?.MeasurementUnitName || "",
          MeasurementUnitName2: su.SubUnitName2 || matchedUnit?.MeasurementUnitName2 || "",
        });
      }
    }
  });
  const volumeUnitOptions = Array.from(availableVolumeUnitsMap.values());
  const volumeUnitColumns: SingleSelectColumn[] = [
    { key: "MeasurementUnitCode", label: "کد" },
    { key: "MeasurementUnitName", label: "عنوان" },
    { key: "MeasurementUnitName2", label: "عنوان (2)" },
  ];

  const volumeCbmTabConfig: TabCellConfig[] = [
    {
      id: "volume_cbm",
      label: "حجم(CBM) کالا",
      columns: [
        {
          key: "RowNo",
          header: "ردیف",
          width: "60px",
          render: (_row: any, rowIndex: number) => (
            <div className="text-center font-mono text-[11px] py-1 select-none text-slate-600 dark:text-slate-300">
              {rowIndex + 1}
            </div>
          ),
        },
        {
          key: "Quantity",
          header: "مقدار",
          width: "120px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => {
            const qty = row.Quantity !== undefined && row.Quantity !== null ? row.Quantity : 1;
            return (
              <AmountInput
                value={qty}
                onChange={(val) => {
                  const newQty = Number(val || 0);
                  const len = Number(row.Length || 0);
                  const wdt = Number(row.Width || 0);
                  const hgt = Number(row.Height || 0);
                  const vol = newQty * len * wdt * hgt;
                  onChangeRow({ ...row, Quantity: val, Volume: vol });
                }}
                disabled={isUsed}
              />
            );
          },
        },
        {
          key: "MeasurementUnitRef",
          header: "واحد سنجش",
          width: "240px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => {
            const currentUnitRef = row.MeasurementUnitRef || values.MeasurementUnitRef || null;
            const selectedUnit = volumeUnitOptions.find(
              (u: any) => Number(u.MeasurementUnitID || u.id) === Number(currentUnitRef)
            ) || null;

            return (
              <SingleSelectDropDown
                data={volumeUnitOptions}
                columns={volumeUnitColumns}
                value={selectedUnit}
                displayKey="MeasurementUnitName"
                disabled={isUsed}
                onChange={(selectedItem) => {
                  if (!selectedItem) {
                    onChangeRow({
                      ...row,
                      MeasurementUnitRef: null,
                    });
                    return;
                  }
                  const uId = Number(selectedItem.MeasurementUnitID || selectedItem.id);
                  onChangeRow({
                    ...row,
                    MeasurementUnitRef: uId,
                  });
                }}
              />
            );
          },
        },
        {
          key: "Length",
          header: "طول",
          width: "120px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => {
            const len = row.Length !== undefined && row.Length !== null ? row.Length : 0;
            return (
              <AmountInput
                value={len}
                onChange={(val) => {
                  const newLen = Number(val || 0);
                  const qty = Number(row.Quantity !== undefined && row.Quantity !== null ? row.Quantity : 1);
                  const wdt = Number(row.Width || 0);
                  const hgt = Number(row.Height || 0);
                  const vol = qty * newLen * wdt * hgt;
                  onChangeRow({ ...row, Length: val, Volume: vol });
                }}
                disabled={isUsed}
              />
            );
          },
        },
        {
          key: "Width",
          header: "عرض",
          width: "120px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => {
            const wdt = row.Width !== undefined && row.Width !== null ? row.Width : 0;
            return (
              <AmountInput
                value={wdt}
                onChange={(val) => {
                  const newWdt = Number(val || 0);
                  const qty = Number(row.Quantity !== undefined && row.Quantity !== null ? row.Quantity : 1);
                  const len = Number(row.Length || 0);
                  const hgt = Number(row.Height || 0);
                  const vol = qty * len * newWdt * hgt;
                  onChangeRow({ ...row, Width: val, Volume: vol });
                }}
                disabled={isUsed}
              />
            );
          },
        },
        {
          key: "Height",
          header: "ارتفاع",
          width: "120px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => {
            const hgt = row.Height !== undefined && row.Height !== null ? row.Height : 0;
            return (
              <AmountInput
                value={hgt}
                onChange={(val) => {
                  const newHgt = Number(val || 0);
                  const qty = Number(row.Quantity !== undefined && row.Quantity !== null ? row.Quantity : 1);
                  const len = Number(row.Length || 0);
                  const wdt = Number(row.Width || 0);
                  const vol = qty * len * wdt * newHgt;
                  onChangeRow({ ...row, Height: val, Volume: vol });
                }}
                disabled={isUsed}
              />
            );
          },
        },
        {
          key: "Volume",
          header: "حجم محموله",
          width: "140px",
          type: "custom",
          render: (row: any) => {
            const qty = Number(row.Quantity !== undefined && row.Quantity !== null ? row.Quantity : 1);
            const len = Number(row.Length || 0);
            const wdt = Number(row.Width || 0);
            const hgt = Number(row.Height || 0);
            const vol = row.Volume !== undefined && row.Volume !== null ? row.Volume : (qty * len * wdt * hgt);
            return (
              <AmountInput
                value={vol}
                disabled={true}
              />
            );
          },
        },
        {
          key: "Description",
          header: "توضیحات",
          width: "250px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
            <TextInput
              value={row.Description || ""}
              onChange={(val) => onChangeRow({ ...row, Description: val })}
              disabled={isUsed}
            />
          ),
        },
      ],
    },
  ];

  const filteredItemOptions = allItems.filter((it: any) => {
    if (values.ItemID && Number(it.ItemID) === Number(values.ItemID)) return false;
    if (values.ItemCode && String(it.product_code || it.ItemCode) === String(values.ItemCode)) return false;
    return true;
  });

  const itemDropdownColumns: SingleSelectColumn[] = [
    { key: "product_code", label: "کد کالا" },
    { key: "product_name", label: "نام کالا" },
    { key: "name2", label: "نام کالا (2)" },
    { key: "unit", label: "واحد سنجش" },
  ];

  const unitDropDownColumns: SingleSelectColumn[] = [
    { key: "MeasurementUnitCode", label: "کد" },
    { key: "MeasurementUnitName", label: "عنوان" },
    { key: "MeasurementUnitName2", label: "عنوان (2)" },
    { key: "UnitType", label: "نوع واحد" },
  ];

  const similarItemsTabConfig: TabCellConfig[] = [
    {
      id: "similar_items",
      columns: [
        {
          key: "RowNo",
          header: "ردیف",
          width: "60px",
          render: (_row: any, rowIndex: number) => (
            <div className="text-center font-mono text-[11px] py-1 select-none text-slate-600 dark:text-slate-300">
              {rowIndex + 1}
            </div>
          ),
        },
        {
          key: "SimilarItemRef",
          header: "کد کالا",
          width: "220px",
          type: "custom",
          render: (row: any, rowIndex: number, onChangeRow: (val: any) => void) => {
            const selectedItemObj = allItems.find(
              (it: any) => Number(it.ItemID) === Number(row.SimilarItemRef)
            ) || null;

            return (
              <MultiColumnDropDown
                data={filteredItemOptions}
                columns={itemDropdownColumns}
                value={selectedItemObj}
                displayKey="product_code"
                placeholder="انتخاب کالا / خدمت..."
                disabled={isUsed}
                enableMultiSelection={false}
                onChange={(selected) => {
                  if (!selected) {
                    onChangeRow({
                      ...row,
                      SimilarItemRef: null,
                      SimilarItemCode: "",
                      SimilarItemName: "",
                      SimilarItemName2: "",
                      MeasurementUnitRef: null,
                    });
                    return;
                  }

                  const selectedList = Array.isArray(selected) ? selected : [selected];
                  if (selectedList.length === 0) return;

                  const currentList = [...(values.ItemSimilarItems || [])];

                  if (selectedList.length === 1) {
                    const selectedObj = selectedList[0];
                    const existingPriorities = currentList
                      .map((it: any, idx: number) => (idx !== rowIndex ? Number(it.Priority) : null))
                      .filter((p) => p !== null && !isNaN(p!)) as number[];
                    let priorityToAssign = Number(row.Priority) || 1;
                    while (existingPriorities.includes(priorityToAssign)) {
                      priorityToAssign += 1;
                    }

                    const mainUnitRef = selectedObj.mainUnit ? selectedObj.mainUnit.MeasurementUnitID : selectedObj.MeasurementUnitRef;

                    onChangeRow({
                      ...row,
                      SimilarItemRef: Number(selectedObj.ItemID),
                      SimilarItemCode: String(selectedObj.product_code || selectedObj.ItemCode || ""),
                      SimilarItemName: selectedObj.product_name || selectedObj.name || "",
                      SimilarItemName2: selectedObj.name2 || "",
                      MeasurementUnitRef: mainUnitRef ? Number(mainUnitRef) : null,
                      QuantityRatio: row.QuantityRatio ?? 1,
                      Priority: priorityToAssign,
                      Description: row.Description || "",
                    });
                  } else {
                    let updatedList = [...currentList];
                    const allExistingPriorities = updatedList
                      .map((it: any) => Number(it.Priority))
                      .filter((p) => !isNaN(p));

                    let nextPriority = 1;

                    selectedList.forEach((selectedObj: any, idx: number) => {
                      while (allExistingPriorities.includes(nextPriority)) {
                        nextPriority += 1;
                      }
                      allExistingPriorities.push(nextPriority);

                      const mainUnitRef = selectedObj.mainUnit ? selectedObj.mainUnit.MeasurementUnitID : selectedObj.MeasurementUnitRef;

                      const newRowData = {
                        SimilarItemRef: Number(selectedObj.ItemID),
                        SimilarItemCode: String(selectedObj.product_code || selectedObj.ItemCode || ""),
                        SimilarItemName: selectedObj.product_name || selectedObj.name || "",
                        SimilarItemName2: selectedObj.name2 || "",
                        MeasurementUnitRef: mainUnitRef ? Number(mainUnitRef) : null,
                        QuantityRatio: 1,
                        Priority: nextPriority,
                        Description: "",
                      };

                      if (idx === 0) {
                        updatedList[rowIndex] = newRowData;
                      } else {
                        updatedList.push(newRowData);
                      }
                    });

                    handleChange("ItemSimilarItems", updatedList);
                  }
                }}
              />
            );
          },
        },
        {
          key: "SimilarItemName",
          header: "نام کالا",
          width: "200px",
          type: "custom",
          render: (row: any) => (
            <TextInput
              value={row.SimilarItemName || ""}
              disabled={true}
              className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
            />
          ),
        },
        {
          key: "SimilarItemName2",
          header: "نام کالا (2)",
          width: "200px",
          type: "custom",
          render: (row: any) => (
            <TextInput
              value={row.SimilarItemName2 || ""}
              disabled={true}
              className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
            />
          ),
        },
        {
          key: "MeasurementUnitRef",
          header: "واحد سنجش",
          width: "220px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => {
            const selectedItemObj = allItems.find(
              (it: any) => Number(it.ItemID) === Number(row.SimilarItemRef)
            );

            let rowUnitOptions: any[] = [];
            if (selectedItemObj && Array.isArray(selectedItemObj.allUnits) && selectedItemObj.allUnits.length > 0) {
              rowUnitOptions = selectedItemObj.allUnits;
            } else if (selectedItemObj) {
              if (selectedItemObj.MeasurementUnitRef) {
                const mUnit = measurementUnits.find(
                  (mu: any) => Number(mu.MeasurementUnitID) === Number(selectedItemObj.MeasurementUnitRef)
                );
                if (mUnit) {
                  rowUnitOptions.push({
                    MeasurementUnitID: Number(mUnit.MeasurementUnitID),
                    MeasurementUnitCode: mUnit.MeasurementUnitCode || "",
                    MeasurementUnitName: mUnit.MeasurementUnitName || "",
                    MeasurementUnitName2: mUnit.MeasurementUnitName2 || "",
                    UnitType: "اصلی",
                  });
                } else {
                  rowUnitOptions.push({
                    MeasurementUnitID: Number(selectedItemObj.MeasurementUnitRef),
                    MeasurementUnitCode: selectedItemObj.MeasurementUnitCode || "",
                    MeasurementUnitName: selectedItemObj.MeasurementUnitName || selectedItemObj.unit || "",
                    MeasurementUnitName2: selectedItemObj.MeasurementUnitName2 || "",
                    UnitType: "اصلی",
                  });
                }
              }
            } else if (row.MeasurementUnitRef) {
              const mUnit = measurementUnits.find(
                (mu: any) => Number(mu.MeasurementUnitID) === Number(row.MeasurementUnitRef)
              );
              if (mUnit) {
                rowUnitOptions.push({
                  MeasurementUnitID: Number(mUnit.MeasurementUnitID),
                  MeasurementUnitCode: mUnit.MeasurementUnitCode || "",
                  MeasurementUnitName: mUnit.MeasurementUnitName || "",
                  MeasurementUnitName2: mUnit.MeasurementUnitName2 || "",
                  UnitType: "اصلی",
                });
              } else {
                rowUnitOptions.push({
                  MeasurementUnitID: Number(row.MeasurementUnitRef),
                  MeasurementUnitCode: "",
                  MeasurementUnitName: "واحد اصلی",
                  MeasurementUnitName2: "",
                  UnitType: "اصلی",
                });
              }
            }

            const selectedUnitObj = rowUnitOptions.find(
              (u: any) => Number(u.MeasurementUnitID) === Number(row.MeasurementUnitRef)
            ) || rowUnitOptions[0] || null;

            return (
              <SingleSelectDropDown
                data={rowUnitOptions}
                columns={unitDropDownColumns}
                value={selectedUnitObj}
                displayKey="MeasurementUnitName"
                disabled={isUsed || !row.SimilarItemRef}
                onChange={(selectedUnit) => {
                  if (!selectedUnit) {
                    onChangeRow({
                      ...row,
                      MeasurementUnitRef: null,
                    });
                    return;
                  }
                  onChangeRow({
                    ...row,
                    MeasurementUnitRef: Number(selectedUnit.MeasurementUnitID || selectedUnit.id),
                  });
                }}
              />
            );
          },
        },
        {
          key: "QuantityRatio",
          header: "نسبت مقداری",
          width: "140px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
            <AmountInput
              value={row.QuantityRatio ?? 1}
              onChange={(val) => onChangeRow({ ...row, QuantityRatio: val })}
              disabled={isUsed}
            />
          ),
        },
        {
          key: "Priority",
          header: "اولویت",
          width: "120px",
          type: "custom",
          render: (row: any, rowIndex: number, onChangeRow: (val: any) => void) => (
            <NumberInput
              value={row.Priority ?? 1}
              onChange={(val) => {
                const newPriority = Number(val || 1);
                const currentList = values.ItemSimilarItems || [];
                const isDuplicate = currentList.some(
                  (it: any, idx: number) => idx !== rowIndex && Number(it.Priority) === newPriority
                );
                if (isDuplicate) {
                  showToast("اولویت تعیین شده تکراری است", "error");
                }
                onChangeRow({ ...row, Priority: val });
              }}
              disabled={isUsed}
            />
          ),
        },
        {
          key: "Description",
          header: "توضیحات",
          width: "250px",
          type: "custom",
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
            <TextInput
              value={row.Description || ""}
              onChange={(val) => onChangeRow({ ...row, Description: val })}
              disabled={isUsed}
            />
          ),
        },
      ],
    },
  ];

  // Sub units footer text calculation
  const mainUnitObj = measurementUnits.find(
    (u: any) => Number(u.MeasurementUnitID || u.id) === Number(values.MeasurementUnitRef)
  );
  const mainUnitName = mainUnitObj ? (mainUnitObj.MeasurementUnitName || mainUnitObj.name || "") : "";

  const subUnitsList = values.ItemSubUnits || [];
  const subUnitRatioTexts = subUnitsList
    .map((item: any) => {
      let subUnitName = item.SubUnitName;
      if (!subUnitName && item.SubUnitRef) {
        const u = measurementUnits.find(
          (m: any) => Number(m.MeasurementUnitID || m.id) === Number(item.SubUnitRef)
        );
        if (u) subUnitName = u.MeasurementUnitName || u.name;
      }
      const ratio = item.MainToSubRatio !== undefined && item.MainToSubRatio !== null ? item.MainToSubRatio : 1;
      if (subUnitName && mainUnitName) {
        return `هر ${subUnitName} معادل ${ratio} ${mainUnitName}`;
      } else if (subUnitName) {
        return `هر ${subUnitName} معادل ${ratio}`;
      }
      return null;
    })
    .filter(Boolean);

  const subUnitsFooterText = subUnitRatioTexts.join(" | ");

  const bottomTabs = [
    {
      id: "general_info",
      label: "جزئیات",
      content: (
        <div className="p-4 overflow-y-auto h-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col gap-1.5">
              <FormLabel>ایران کد</FormLabel>
              <TextInput
                value={values.IranCode || ""}
                onChange={(val) => handleChange("IranCode", val)}
                disabled={isUsed || isService}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FormLabel>مشخصه فنی</FormLabel>
              <TextInput
                value={values.TechnicalSpecification || ""}
                onChange={(val) => handleChange("TechnicalSpecification", val)}
                disabled={isUsed || isService}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FormLabel>نرخ مالیات (%)</FormLabel>
              <AmountInput
                value={values.TaxRate}
                onChange={(val) => handleChange("TaxRate", val)}
                disabled={isUsed}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FormLabel>نرخ عوارض (%)</FormLabel>
              <AmountInput
                value={values.DutyRate}
                onChange={(val) => handleChange("DutyRate", val)}
                disabled={isUsed}
              />
            </div>
          </div>
        </div>
      ),
    },
    ...(!isService
      ? [
          {
            id: "sub_units",
            label: "واحدهای سنجش فرعی",
            content: (
              <div className="flex-1 h-full min-h-0 overflow-hidden p-0 m-0" id="ItemSubUnitsContainer">
                <TabCellRow
                  tabs={subUnitTabConfig}
                  value={values.ItemSubUnits || []}
                  onChange={(newSubUnits) => handleChange("ItemSubUnits", newSubUnits)}
                  hideHeader={true}
                  isReadonly={isUsed}
                  footerCenterContent={
                    subUnitsFooterText ? (
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {subUnitsFooterText}
                      </span>
                    ) : null
                  }
                />
              </div>
            ),
          },
        ]
      : []),
    ...(!isService
      ? [
          {
            id: "inventory_controls",
            label: "کنترل موجودی",
            content: (
              <div className="flex-1 h-full min-h-0 overflow-hidden p-0 m-0" id="ItemInventoryControlsContainer">
                <TabCellRow
                  tabs={inventoryControlTabConfig}
                  value={values.ItemInventoryControls || []}
                  onChange={(newControls) => handleChange("ItemInventoryControls", newControls)}
                  hideHeader={true}
                  isReadonly={isUsed}
                />
              </div>
            ),
          },
        ]
      : []),
    ...(!isService
      ? [
          {
            id: "volume_cbm",
            label: "حجم(CBM) کالا",
            content: (
              <div className="flex-1 h-full min-h-0 overflow-hidden p-0 m-0" id="ItemVolumeCbmsContainer">
                <TabCellRow
                  tabs={volumeCbmTabConfig}
                  value={values.ItemVolumeCbms || []}
                  onChange={(newCbms) => handleChange("ItemVolumeCbms", newCbms)}
                  hideHeader={true}
                  isReadonly={isUsed}
                />
              </div>
            ),
          },
        ]
      : []),
    ...(isGoods
      ? [
          {
            id: "physical_locations",
            label: "محل فیزیکی کالا",
            content: (
              <div className="flex-1 h-full min-h-0 overflow-hidden p-0 m-0" id="ItemPhysicalLocationsContainer">
                <TabCellRow
                  tabs={physicalLocationTabConfig}
                  value={values.ItemPhysicalLocations || []}
                  onChange={handlePhysicalLocationsChange}
                  hideHeader={true}
                  isReadonly={isUsed}
                />
              </div>
            ),
          },
        ]
      : []),
    ...(!isService
      ? [
          {
            id: "similar_items",
            label: "کالای مشابه",
            content: (
              <div className="flex-1 h-full min-h-0 overflow-hidden p-0 m-0" id="ItemSimilarItemsContainer">
                <TabCellRow
                  tabs={similarItemsTabConfig}
                  value={values.ItemSimilarItems || []}
                  onChange={(newSimilarItems) => handleChange("ItemSimilarItems", newSimilarItems)}
                  hideHeader={true}
                  isReadonly={isUsed}
                />
              </div>
            ),
          },
        ]
      : []),
    ...(!isService
      ? [
          {
            id: "image_gallery",
            label: "گالری تصویر کالا",
            content: (
              <div className="flex-1 h-full min-h-0 overflow-hidden p-0 m-0" id="ItemImagesContainer">
                <ProductImageGallery
                  value={values.ItemImages || []}
                  onChange={(newImages) => handleChange("ItemImages", newImages)}
                  isReadonly={isUsed}
                />
              </div>
            ),
          },
        ]
      : []),
  ];

  const handleNew = () => {
    addTab("کالا خدمت جدید", "inv", <Package className="w-4 h-4" />, "ProductServiceForm");
  };

  const handleList = () => {
    addTab("فهرست کالا و خدمات", "inv", <List className="w-4 h-4" />, "ProductServiceList");
  };

  const listColumns = [
    { key: "ItemType", label: "نوع", renderItem: (item: any) => (Number(item.ItemType) === ItemType.SERVICE ? "خدمت" : "کالا") },
    { key: "ItemCode", label: "کد" },
    { key: "ItemName", label: "نام کالا" },
    { key: "ItemName2", label: "نام کالا(2)" },
    { key: "IsActive", label: "وضعیت", renderItem: (item: any) => (item.IsActive ? "فعال" : "غیرفعال") },
  ];

  return (
    <>
      <SimpleFormTwoRowTabbed
        isReadonly={isUsed || false}
        title={activeId ? "ویرایش کالا خدمت" : "کالا خدمت جدید"}
        icon={<Package className="w-4 h-4" />}
        headerGradient="from-blue-600 to-blue-500"
        fields={fields}
        values={values}
        onChange={handleChange}
        errors={errors}
        onNew={handleNew}
        onList={handleList}
        listApiUrl="/api/inv/items"
        listColumns={listColumns}
        listDisplayKey="ItemName"
        onListSelect={(item: any) => {
          const itemId = item.ItemID || item.id;
          if (activeId !== itemId) {
            addTab(
              `ویرایش کالا خدمت ${item.ItemName || item.ItemCode || itemId}`,
              "inv",
              <Package className="w-4 h-4" />,
              "ProductServiceForm",
              { id: itemId }
            );
          }
        }}
        onSave={handleSave}
        onSaveNew={handleSaveNew}
        onSaveClose={handleSaveClose}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
        bottomTabs={bottomTabs}
        defaultBottomTabId="general_info"
      />

      {showGroupTreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150" dir="rtl">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  انتخاب گروه کالا و خدمت (تولید اتوماتیک کد)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGroupTreeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 overflow-y-auto min-h-[350px]">
              {loadingGroupTree ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500 py-12">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">در حال بارگذاری اطلاعات گروه ها...</span>
                </div>
              ) : displayGroupTreeData ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/50">
                  <TreeView
                    data={displayGroupTreeData}
                    defaultExpandAll={true}
                    readOnly={true}
                    disableContextMenu={true}
                    selectedNodeId={selectedGroupNode?.id}
                    onSelect={(node) => setSelectedGroupNode(node)}
                    renderLabel={(node) => {
                      if (node.isRoot) {
                        return <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{node.name}</span>;
                      }
                      const prefix = getParentCodePrefix(displayGroupTreeData, node.id);
                      const selfCode = node.data?.code || '';
                      const fullCode = prefix + selfCode;
                      return (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                          {fullCode && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px] bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 font-bold shrink-0" dir="ltr">
                              {fullCode}
                            </span>
                          )}
                          <span>{node.name}</span>
                        </div>
                      );
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  اطلاعات گروه‌بندی یافت نشد.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
              <div className="text-xs text-slate-500">
                {selectedGroupNode && !selectedGroupNode.isRoot ? (
                  <span>
                    گروه انتخاب شده: <strong className="text-slate-800 dark:text-slate-100">{selectedGroupNode.name}</strong> (کد گروه: <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold" dir="ltr">{getParentCodePrefix(displayGroupTreeData || groupTreeData, selectedGroupNode.id) + (selectedGroupNode.data?.code || '')}</code>)
                  </span>
                ) : (
                  <span>لطفاً یک گروه را از درختواره انتخاب نمایید.</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGroupTreeModal(false)}
                  className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleConfirmGroupSelection}
                  disabled={!selectedGroupNode || selectedGroupNode.isRoot}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  تأیید و تولید کد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductService;

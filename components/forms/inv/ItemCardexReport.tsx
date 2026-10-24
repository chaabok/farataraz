"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { useLanguage } from "@/lib/stores/languageStore";
import { apiFetch, cn } from "@/lib/utils";
import { TabCellRow, TabCellConfig, TabCellColumn } from "@/components/forms/TabCellRow";
import { SingleSelectDropDown, SingleSelectColumn } from "@/components/inputs/SingleSelectDropDown";
import { DateInput } from "@/components/inputs/DateInput";
import {
  RotateCw,
  Plus,
  Calendar,
  Layers,
  Tag,
  Package,
  FileText,
  Building2,
} from "lucide-react";

interface ItemCardexReportProps {
  id?: string;
  tabId?: string;
}

export default function ItemCardexReport({ id, tabId }: ItemCardexReportProps) {
  const { addTab, tabs, setActiveTabId } = useTabs();
  const { showToast } = useToast();
  const { direction } = useLanguage();

  // Filters State
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("1403/01/01");
  const [toDate, setToDate] = useState<string>("1405/12/29");
  const [warehouses, setWarehouses] = useState<any[]>([]);

  // Raw Items & Loading & Selection
  const [rawItems, setRawItems] = useState<any[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [doubleClickedItemId, setDoubleClickedItemId] = useState<string | number | null>(null);
  const [selectedItemTrackingFactors, setSelectedItemTrackingFactors] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(false);
  const [isLoadingKardex, setIsLoadingKardex] = useState<boolean>(false);

  // Tab Data State for TabCellRow
  const [tabData, setTabData] = useState<Record<string, any[]>>({
    items: [],
    tracking_factors: [],
    sub_units: [],
    kardex: [],
  });

  const mapItemRow = (item: any) => {
    const id = item.id || item.ItemID || item.ProductID || "";
    const code = item.code || item.ItemCode || item.itemcode || item.Code || item.ProductCode || "-";
    const title = item.title || item.ItemName || item.itemname || item.Name || item.Title || item.ProductName || "-";
    const latinTitle = item.latinTitle || item.ItemName2 || item.itemname2 || item.LatinName || item.latinname || item.Name2 || "-";
    const unit = item.unit || item.MeasurementUnitName || item.unitName || item.UnitName || item.Unit || "-";

    // Category resolution strictly from ItemAccountCategory form
    const rawCategory = item.category || item.CategoryName || item.categoryName || item.ItemAccountCategoryName || item.ItemAccountCategory?.ItemAccountCategoryName || "";
    const category = (rawCategory && rawCategory !== "-" && rawCategory.trim() !== "") ? rawCategory : "-";

    const barcode = item.barcode || item.Barcode || item.BarcodeNo || item.IranCode || "-";

    // Valuation / Pricing method resolution strictly from ItemAccountCategory form
    let valuationMethod = "-";
    if (category !== "-") {
      const pm = item.CategoryPricingMethod ?? item.ItemAccountCategory?.PricingMethod ?? item.PricingMethod ?? item.pricingMethod;
      if (item.valuationMethod && item.valuationMethod !== "-" && typeof item.valuationMethod === "string" && !/^\d+$/.test(item.valuationMethod)) {
        valuationMethod = item.valuationMethod;
      } else if (item.ValuationMethod && item.ValuationMethod !== "-" && typeof item.ValuationMethod === "string" && !/^\d+$/.test(item.ValuationMethod)) {
        valuationMethod = item.ValuationMethod;
      } else if (item.PricingMethodName && item.PricingMethodName !== "-") {
        valuationMethod = item.PricingMethodName;
      } else if (pm !== undefined && pm !== null) {
        const pNum = Number(pm);
        if (pNum === 1) valuationMethod = "میانگین موزون";
        else if (pNum === 2) valuationMethod = "FIFO (نخستین ورودی، نخستین خروجی)";
        else if (pNum === 3) valuationMethod = "LIFO (آخرین ورودی، نخستین خروجی)";
        else if (pNum === 4) valuationMethod = "نرخ استاندارد";
      }
    }

    return {
      id,
      code,
      title,
      latinTitle,
      unit,
      category,
      barcode,
      valuationMethod,
      raw: item,
    };
  };

  const loadWarehouses = async (fiscalYearId?: string) => {
    try {
      const fyId = fiscalYearId !== undefined ? fiscalYearId : (localStorage.getItem("app-fiscal-year") || "");
      const res = await apiFetch(`/api/inv/items/kardex-warehouses?fiscalYearId=${fyId}`);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : json.data || [];
        const mapped = list.map((w: any) => ({
          WarehouseID: String(w.WarehouseID || w.id),
          id: String(w.WarehouseID || w.id),
          code: String(w.WarehouseCode || w.code || "-"),
          WarehouseCode: String(w.WarehouseCode || w.code || "-"),
          title: String(w.WarehouseTitle || w.title || w.WarehouseName || w.name || "انبار"),
          WarehouseTitle: String(w.WarehouseTitle || w.title || w.WarehouseName || w.name || "انبار"),
          name: String(w.WarehouseTitle || w.title || w.WarehouseName || w.name || "انبار"),
          raw: w,
        }));
        setWarehouses(mapped);
      } else {
        const resFallback = await apiFetch("/api/inv/warehouses");
        if (resFallback.ok) {
          const json = await resFallback.json();
          const list = Array.isArray(json) ? json : json.data || [];
          const mapped = list.map((w: any) => ({
            WarehouseID: String(w.WarehouseID || w.id),
            id: String(w.WarehouseID || w.id),
            code: String(w.WarehouseCode || w.code || "-"),
            WarehouseCode: String(w.WarehouseCode || w.code || "-"),
            title: String(w.WarehouseTitle || w.title || w.WarehouseName || w.name || "انبار"),
            WarehouseTitle: String(w.WarehouseTitle || w.title || w.WarehouseName || w.name || "انبار"),
            name: String(w.WarehouseTitle || w.title || w.WarehouseName || w.name || "انبار"),
            raw: w,
          }));
          setWarehouses(mapped);
        }
      }
    } catch (err) {
      console.error("Error loading warehouses:", err);
    }
  };

  // Update detail tabs when selected item changes
  const updateItemDetails = async (item: any) => {
    if (!item) {
      setSelectedItemTrackingFactors([]);
      setTabData((prev) => ({
        ...prev,
        sub_units: [],
        tracking_factors: [],
      }));
      return;
    }

    let itemSubUnits: any[] = [];
    let itemTrackingFactors: any[] = [];

    if (item.id) {
      try {
        const itemRes = await apiFetch(`/api/inv/items/${item.id}`);
        if (itemRes.ok) {
          const itemData = await itemRes.json();

          // Sub units
          if (Array.isArray(itemData?.ItemSubUnits) && itemData.ItemSubUnits.length > 0) {
            itemSubUnits = itemData.ItemSubUnits.map((su: any, i: number) => ({
              id: su.ItemSubUnitID || i + 1,
              subUnitName: su.SubUnitName || su.UnitName || "واحد فرعی",
              mainToSubRatio: Number(su.MainToSubRatio || 1),
              isVariableRatio: su.IsVariableRatio ? "بلی" : "خیر",
              tolerancePercent: Number(su.TolerancePercent || 0),
            }));
          }

          if (Array.isArray(itemData?.ItemTrackingFactors) && itemData.ItemTrackingFactors.length > 0) {
            setSelectedItemTrackingFactors(itemData.ItemTrackingFactors);
          }
        }

        // Fetch actual tracking factor movements recorded in warehouse receipt/issue vouchers
        const targetWh = selectedWarehouse;
        const targetFrom = fromDate;
        const targetTo = toDate;
        const tfMovementsRes = await apiFetch(
          `/api/inv/items/${item.id}/tracking-factor-movements?warehouseId=${targetWh}&fromDate=${targetFrom}&toDate=${targetTo}`
        );
        if (tfMovementsRes.ok) {
          const resData = await tfMovementsRes.json();
          let movementsList: any[] = [];
          let factorsList: any[] = [];

          if (Array.isArray(resData)) {
            movementsList = resData;
          } else if (resData && typeof resData === "object") {
            movementsList = resData.movements || [];
            factorsList = resData.trackingFactors || [];
          }

          if (factorsList.length > 0) {
            setSelectedItemTrackingFactors(factorsList);
          }
          itemTrackingFactors = movementsList;
        }
      } catch (e) {
        console.error("Failed to fetch item details or tracking factor movements", e);
      }
    }

    setTabData((prev) => ({
      ...prev,
      sub_units: itemSubUnits,
      tracking_factors: itemTrackingFactors,
    }));
  };

  const applySubUnitToKardex = (subUnitRow: any, baseTransactions = allKardexTransactions) => {
    if (!subUnitRow) {
      setTabData((prev) => ({ ...prev, kardex: baseTransactions }));
      return;
    }

    const ratio = Number(subUnitRow.mainToSubRatio || subUnitRow.ratio || 1);
    const validRatio = ratio > 0 ? ratio : 1;
    const subName = String(subUnitRow.subUnitName || subUnitRow.name || "واحد فرعی").trim();

    let runningBalanceQty = 0;
    let runningBalanceAmount = 0;

    const adjustedKardex = baseTransactions.map((kTx: any) => {
      const rawInQty = Number(kTx.inQty || 0);
      const rawOutQty = Number(kTx.outQty || 0);
      const origInAmount = Number(kTx.inAmount || 0);
      const origOutAmount = Number(kTx.outAmount || 0);

      const newInQty = rawInQty > 0 ? (rawInQty / validRatio) : 0;
      const newOutQty = rawOutQty > 0 ? (rawOutQty / validRatio) : 0;

      const newInRate = newInQty > 0 ? (origInAmount > 0 ? origInAmount / newInQty : Number(kTx.inRate || 0) * validRatio) : 0;
      const newOutRate = newOutQty > 0 ? (origOutAmount > 0 ? origOutAmount / newOutQty : Number(kTx.outRate || 0) * validRatio) : 0;

      runningBalanceQty += newInQty - newOutQty;
      runningBalanceAmount += origInAmount - origOutAmount;

      return {
        ...kTx,
        inQty: newInQty,
        outQty: newOutQty,
        inRate: Math.round(newInRate),
        outRate: Math.round(newOutRate),
        inAmount: origInAmount,
        outAmount: origOutAmount,
        balanceQty: runningBalanceQty,
        balanceAmount: runningBalanceAmount,
        inUnit: newInQty > 0 ? subName : "",
        outUnit: newOutQty > 0 ? subName : "",
      };
    });

    setTabData((prev) => ({ ...prev, kardex: adjustedKardex }));
  };

  const applyTrackingFactorToKardex = (tfRow: any, baseTransactions = allKardexTransactions) => {
    if (!tfRow) {
      setTabData((prev) => ({ ...prev, kardex: baseTransactions }));
      return;
    }

    const detailIds = Array.isArray(tfRow.voucherDetailIds)
      ? tfRow.voucherDetailIds.map(Number)
      : [];

    const isSerialRow = Boolean(
      tfRow.serialNumber ||
        (tfRow.value && String(tfRow.value).includes("سریال")) ||
        tfRow["3"] ||
        tfRow.serial
    );

    const selectedTfQty = isSerialRow
      ? 1
      : Number(tfRow.quantity || tfRow.qty || 1);

    let filtered = baseTransactions;
    if (detailIds.length > 0) {
      filtered = baseTransactions.filter((kTx: any) => {
        const kDetId = Number(kTx.voucherDetailId || kTx.id || kTx.warehouseReceiptDetailId || 0);
        return detailIds.includes(kDetId);
      });
    }

    let runningBalanceQty = 0;
    let runningBalanceAmount = 0;

    const adjustedFiltered = filtered.map((kTx: any) => {
      const origInQty = Number(kTx.inQty || 0);
      const origOutQty = Number(kTx.outQty || 0);
      const origInAmount = Number(kTx.inAmount || 0);
      const origOutAmount = Number(kTx.outAmount || 0);

      let newInQty = 0;
      let newOutQty = 0;
      let newInAmount = 0;
      let newOutAmount = 0;

      if (origInQty > 0) {
        newInQty = Math.min(selectedTfQty, origInQty);
        const unitPrice = Number(kTx.unitPrice || (origInQty > 0 ? origInAmount / origInQty : 0));
        newInAmount = Math.round(newInQty * unitPrice);
      }

      if (origOutQty > 0) {
        newOutQty = Math.min(selectedTfQty, origOutQty);
        const unitPrice = Number(kTx.unitPrice || (origOutQty > 0 ? origOutAmount / origOutQty : 0));
        newOutAmount = Math.round(newOutQty * unitPrice);
      }

      runningBalanceQty += newInQty - newOutQty;
      runningBalanceAmount += newInAmount - newOutAmount;

      return {
        ...kTx,
        inQty: newInQty,
        outQty: newOutQty,
        inAmount: newInAmount,
        outAmount: newOutAmount,
        quantity: newInQty > 0 ? newInQty : newOutQty,
        amount: newInAmount > 0 ? newInAmount : newOutAmount,
        balanceQty: runningBalanceQty,
        balanceAmount: runningBalanceAmount,
      };
    });

    setTabData((prev) => ({ ...prev, kardex: adjustedFiltered }));
  };

  const fetchKardexForItem = async (item: any, whId?: string, fDate?: string, tDate?: string) => {
    if (!item || !item.id) {
      setAllKardexTransactions([]);
      setSelectedTrackingFactorRow(null);
      setTabData((prev) => ({ ...prev, kardex: [] }));
      return;
    }
    setIsLoadingKardex(true);
    setSelectedTrackingFactorRow(null);
    const targetWh = whId !== undefined ? whId : selectedWarehouse;
    const targetFrom = fDate !== undefined ? fDate : fromDate;
    const targetTo = tDate !== undefined ? tDate : toDate;

    try {
      const res = await apiFetch(
        `/api/inv/items/${item.id}/kardex?warehouseId=${targetWh}&fromDate=${targetFrom}&toDate=${targetTo}`
      );

      if (res.ok) {
        const json = await res.json();
        const transactions = Array.isArray(json) ? json : json.data || [];
        // Ensure strictly sorted by date ascending, then ID
        transactions.sort((a: any, b: any) => {
          const dateCompare = String(a.date || "").localeCompare(String(b.date || ""));
          if (dateCompare !== 0) return dateCompare;
          return Number(a.id || 0) - Number(b.id || 0);
        });
        setAllKardexTransactions(transactions);
        if (selectedSubUnitRow) {
          applySubUnitToKardex(selectedSubUnitRow, transactions);
        } else if (selectedTrackingFactorRow) {
          applyTrackingFactorToKardex(selectedTrackingFactorRow, transactions);
        } else {
          setTabData((prev) => ({ ...prev, kardex: transactions }));
        }
      } else {
        setAllKardexTransactions([]);
        setTabData((prev) => ({ ...prev, kardex: [] }));
      }
    } catch (err) {
      console.error("Calculate Kardex error:", err);
      setAllKardexTransactions([]);
      setTabData((prev) => ({ ...prev, kardex: [] }));
    } finally {
      setIsLoadingKardex(false);
    }
  };

  const loadItems = async (whId?: string, fDate?: string, tDate?: string) => {
    setIsLoadingItems(true);
    const targetWh = whId !== undefined ? whId : selectedWarehouse;
    const targetFrom = fDate !== undefined ? fDate : fromDate;
    const targetTo = tDate !== undefined ? tDate : toDate;

    try {
      let mapped: any[] = [];
      // 1. Try querying active kardex items
      const resActive = await apiFetch(
        `/api/inv/items/kardex-active-items?warehouseId=${targetWh}&fromDate=${targetFrom}&toDate=${targetTo}`
      );
      if (resActive.ok) {
        const jsonActive = await resActive.json();
        const listActive = Array.isArray(jsonActive) ? jsonActive : jsonActive.data || [];
        if (listActive.length > 0) {
          mapped = listActive.map(mapItemRow);
        }
      }

      // 2. Fallback to all items if no active voucher items found
      if (mapped.length === 0) {
        const resAll = await apiFetch("/api/inv/items");
        if (resAll.ok) {
          const json = await resAll.json();
          const list = Array.isArray(json) ? json : json.data || json.items || [];
          if (list.length > 0) {
            mapped = list.map(mapItemRow);
          }
        }
      }

      setRawItems(mapped);
      setSelectedItemIndex(0);

      setTabData((prev) => ({
        ...prev,
        items: mapped,
        tracking_factors: [],
        sub_units: [],
        kardex: [],
      }));

      if (mapped.length > 0) {
        setDoubleClickedIndex(null);
        setDoubleClickedItemId(null);
        updateItemDetails(mapped[0]);
      } else {
        setDoubleClickedIndex(null);
        setDoubleClickedItemId(null);
        updateItemDetails(null);
      }
    } catch (err) {
      console.error("Error loading items:", err);
      setRawItems([]);
      setTabData({
        items: [],
        tracking_factors: [],
        sub_units: [],
        kardex: [],
      });
    } finally {
      setIsLoadingItems(false);
    }
  };

  const [doubleClickedIndex, setDoubleClickedIndex] = useState<number | null>(null);
  const [allKardexTransactions, setAllKardexTransactions] = useState<any[]>([]);
  const [selectedTrackingFactorRow, setSelectedTrackingFactorRow] = useState<any | null>(null);
  const [selectedSubUnitRow, setSelectedSubUnitRow] = useState<any | null>(null);
  const isInitializedRef = useRef(false);

  // Live Refresh Kardex Report for current filters
  const refreshLiveKardex = async (whId?: string, fDate?: string, tDate?: string) => {
    const targetWh = whId !== undefined ? whId : selectedWarehouse;
    const targetFrom = fDate !== undefined ? fDate : fromDate;
    const targetTo = tDate !== undefined ? tDate : toDate;

    setIsLoadingItems(true);
    setSelectedTrackingFactorRow(null);
    setSelectedSubUnitRow(null);

    try {
      let mapped: any[] = [];
      const resActive = await apiFetch(
        `/api/inv/items/kardex-active-items?warehouseId=${targetWh}&fromDate=${targetFrom}&toDate=${targetTo}`
      );
      if (resActive.ok) {
        const jsonActive = await resActive.json();
        const listActive = Array.isArray(jsonActive) ? jsonActive : jsonActive.data || [];
        if (listActive.length > 0) {
          mapped = listActive.map(mapItemRow);
        }
      }

      if (mapped.length === 0) {
        const resAll = await apiFetch("/api/inv/items");
        if (resAll.ok) {
          const json = await resAll.json();
          const list = Array.isArray(json) ? json : json.data || json.items || [];
          if (list.length > 0) {
            mapped = list.map(mapItemRow);
          }
        }
      }

      setRawItems(mapped);

      // Preserve previously selected item if present in new mapped list, else use item at index 0
      let activeItem = mapped.find(
        (i) =>
          doubleClickedItemId !== null &&
          (String(i.id) === String(doubleClickedItemId) || String(i.code) === String(doubleClickedItemId))
      );
      if (!activeItem && mapped.length > 0) {
        activeItem = mapped[0];
      }

      setTabData((prev) => ({
        ...prev,
        items: mapped,
      }));

      if (activeItem) {
        const activeId = activeItem.id || activeItem.ItemID;
        setDoubleClickedItemId(activeId);
        await updateItemDetails(activeItem);
        await fetchKardexForItem(activeItem, targetWh, targetFrom, targetTo);
      } else {
        setDoubleClickedItemId(null);
        setAllKardexTransactions([]);
        setTabData((prev) => ({ ...prev, kardex: [] }));
      }
    } catch (err) {
      console.error("Error live refreshing Kardex:", err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const loadInitialDatesAndWarehouses = async () => {
    try {
      const activeFyId = localStorage.getItem("app-fiscal-year") || "";

      // 1. Fetch Date Bounds (from date: first day of fiscal year, to date: latest voucher date in that fiscal year)
      let resolvedFromDate = fromDate;
      let resolvedToDate = toDate;

      try {
        const boundsRes = await apiFetch(`/api/inv/items/kardex-date-bounds?fiscalYearId=${activeFyId}`);
        if (boundsRes.ok) {
          const boundsData = await boundsRes.json();
          if (boundsData.fromDate) {
            resolvedFromDate = boundsData.fromDate;
            setFromDate(boundsData.fromDate);
          }
          if (boundsData.toDate) {
            resolvedToDate = boundsData.toDate;
            setToDate(boundsData.toDate);
          }
        }
      } catch (e) {
        console.error("Error fetching date bounds:", e);
      }

      // 2. Fetch warehouses with transactions in that fiscal year
      await loadWarehouses(activeFyId);

      // 3. Refresh live Kardex with resolved dates
      await refreshLiveKardex(selectedWarehouse, resolvedFromDate, resolvedToDate);
    } catch (err) {
      console.error("Error loading kardex initial data:", err);
      await loadWarehouses();
      await refreshLiveKardex();
    } finally {
      isInitializedRef.current = true;
    }
  };

  useEffect(() => {
    loadInitialDatesAndWarehouses();

    const handleStorageChange = () => {
      loadInitialDatesAndWarehouses();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Live Auto-Refresh Kardex when dates change
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const timer = setTimeout(() => {
      refreshLiveKardex(selectedWarehouse, fromDate, toDate);
    }, 450);
    return () => clearTimeout(timer);
  }, [fromDate, toDate]);

  const handleActiveRowChange = (tabId: string, rowIndex: number | null, rowData: any) => {
    if (tabId === "items" && rowIndex !== null && rawItems[rowIndex]) {
      setSelectedItemIndex(rowIndex);
      const rawItem = rawItems[rowIndex];
      const itemId = rawItem.id || rawItem.ItemID;
      setDoubleClickedItemId(itemId);
      setSelectedTrackingFactorRow(null);
      setSelectedSubUnitRow(null);
      updateItemDetails(rawItem);
      fetchKardexForItem(rawItem, selectedWarehouse, fromDate, toDate);
    }
  };

  const handleRowDoubleClick = (tabId: string, rowIndex: number | null, rowData: any) => {
    if (tabId === "items" && rowData) {
      if (rowIndex !== null) {
        setSelectedItemIndex(rowIndex);
        setDoubleClickedIndex(rowIndex);
      }
      const rawItem = (rowIndex !== null && rawItems[rowIndex]) ? rawItems[rowIndex] : rowData;
      const itemId = rawItem.id || rawItem.ItemID || rowData.id || rowData.ItemID;
      setDoubleClickedItemId(itemId);
      setSelectedTrackingFactorRow(null);
      setSelectedSubUnitRow(null);
      updateItemDetails(rawItem);
      fetchKardexForItem(rawItem, selectedWarehouse, fromDate, toDate);
      showToast(`گردش اسناد کاردکس برای کالای «${rawItem.title || rawItem.code}» بارگذاری شد`, "info");
    } else if (tabId === "tracking_factors" && rowData) {
      setSelectedSubUnitRow(null);
      const isSame = selectedTrackingFactorRow && String(selectedTrackingFactorRow.id) === String(rowData.id);
      if (isSame) {
        setSelectedTrackingFactorRow(null);
        setTabData((prev) => ({ ...prev, kardex: allKardexTransactions }));
        showToast("نمایش تمامی گردش‌های کاردکس کالا", "info");
      } else {
        setSelectedTrackingFactorRow(rowData);
        applyTrackingFactorToKardex(rowData);
        showToast("گردش اسناد کاردکس برای عامل ردیابی انتخاب‌شده بارگذاری شد", "info");
      }
    } else if (tabId === "sub_units" && rowData) {
      setSelectedTrackingFactorRow(null);
      const isSame =
        selectedSubUnitRow &&
        (String(selectedSubUnitRow.id) === String(rowData.id) ||
          (rowData.subUnitName && String(selectedSubUnitRow.subUnitName) === String(rowData.subUnitName)));
      if (isSame) {
        setSelectedSubUnitRow(null);
        setTabData((prev) => ({ ...prev, kardex: allKardexTransactions }));
        showToast("نمایش گردش اسناد کاردکس به واحد اصلی", "info");
      } else {
        setSelectedSubUnitRow(rowData);
        applySubUnitToKardex(rowData);
        const subName = rowData.subUnitName || rowData.name || "واحد فرعی";
        showToast(`گردش اسناد کاردکس بر اساس واحد فرعی «${subName}» به روز گردید`, "info");
      }
    }
  };

  // Calculate Kardex on button click
  const handleCalculateKardex = async () => {
    await loadItems(selectedWarehouse, fromDate, toDate);
    const selectedItem = rawItems[selectedItemIndex];
    if (selectedItem) {
      setDoubleClickedItemId(selectedItem.id);
      setDoubleClickedIndex(selectedItemIndex);
      await fetchKardexForItem(selectedItem, selectedWarehouse, fromDate, toDate);
    }
    showToast("کاردکس کالا با موفقیت بر اساس انبار و بازه زمانی محاسبه گردید", "success");
  };

  const renderItemCell = (field: string) => {
    const ItemCell = (row: any, rowIndex: number) => {
      const isSelected =
        doubleClickedItemId !== null &&
        doubleClickedItemId !== undefined &&
        (String(row?.id) === String(doubleClickedItemId) ||
          String(row?.ItemID) === String(doubleClickedItemId) ||
          (row?.code && String(row?.code) === String(doubleClickedItemId)));
      const val = row[field];
      return (
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleRowDoubleClick("items", rowIndex, row);
          }}
          className={cn(
            "w-full h-full px-2 py-1 flex items-center cursor-pointer select-none text-xs transition-colors",
            isSelected ? "!text-white font-semibold" : "text-white dark:text-white"
          )}
        >
          {val !== undefined && val !== null ? String(val) : ""}
        </div>
      );
    };
    ItemCell.displayName = `ItemCell_${field}`;
    return ItemCell;
  };

  const [selectedKardexRowIndex, setSelectedKardexRowIndex] = useState<number | null>(null);

  const handleKardexRowDoubleClick = async (row: any) => {
    if (!row) return;

    let voucherId = row.voucherId || row.warehouseReceiptId || row.WarehouseReceiptID;
    const voucherNo = row.voucherNo;

    const isIssue =
      row.nature === 2 ||
      (row.outQty !== undefined && Number(row.outQty) > 0) ||
      (row.inQty !== undefined && Number(row.inQty) === 0 && Number(row.outQty || 0) > 0) ||
      String(row.voucherType || "").includes("حواله") ||
      String(row.voucherType || "").includes("صادره") ||
      String(row.voucherType || "").includes("مصرف") ||
      String(row.voucherType || "").includes("ارسال") ||
      String(row.voucherType || "").includes("کسری") ||
      String(row.voucherType || "").includes("تحویل");

    const componentName = isIssue ? "WarehouseIssueForm" : "WarehouseReceiptForm";
    const docTitlePrefix = isIssue ? "حواله انبار شماره" : "رسید انبار شماره";

    // If voucherId is not directly found, attempt lookup by voucherNo
    if (!voucherId && voucherNo) {
      try {
        const endpoint = isIssue ? "/api/inv/warehouse-issues" : "/api/inv/warehouse-receipts";
        const res = await apiFetch(`${endpoint}?receiptNumber=${voucherNo}`);
        if (res.ok) {
          const docs = await res.json();
          const docList = Array.isArray(docs) ? docs : docs.data || [];
          const matched = docList.find(
            (d: any) =>
              String(d.ReceiptNumber) === String(voucherNo) ||
              String(d.WarehouseReceiptID) === String(row.id) ||
              String(d.WarehouseIssueID) === String(row.id)
          );
          if (matched) {
            voucherId = matched.WarehouseReceiptID || matched.WarehouseIssueID || matched.id;
          }
        }
      } catch (e) {
        console.warn("Could not fetch voucher by number:", e);
      }
    }

    if (!voucherId) {
      voucherId = row.id;
    }

    const tabTitle = `${docTitlePrefix} ${voucherNo || voucherId}`;

    // Check if a tab is already open with this document
    const existingTab = tabs.find(
      (t) =>
        (t.componentName === componentName ||
          (componentName === "WarehouseReceiptForm" && t.componentName === "WarehouseReceipt") ||
          (componentName === "WarehouseIssueForm" && t.componentName === "WarehouseIssue")) &&
        Number(t.props?.id) === Number(voucherId)
    );

    if (existingTab) {
      setActiveTabId(existingTab.id);
      showToast(`برگه ${tabTitle} باز شد`, "info");
    } else {
      addTab(
        tabTitle,
        "inv",
        <FileText className="w-4 h-4 text-emerald-400" />,
        componentName,
        { id: Number(voucherId) }
      );
      showToast(`برگه ${tabTitle} در تب‌بار باز گردید`, "success");
    }
  };

  const renderKardexCell = (
    field: string,
    isAmount = false,
    align: "right" | "center" | "left" = "right"
  ) => {
    const KardexCell = (row: any, rowIndex: number) => {
      const isSelected = selectedKardexRowIndex === rowIndex;
      const rawVal = row[field];
      let displayVal = "";

      if (isAmount) {
        if (rawVal !== undefined && rawVal !== null && rawVal !== "" && Number(rawVal) !== 0) {
          displayVal = Number(rawVal).toLocaleString();
        } else if (field === "balanceQty" || field === "balanceAmount") {
          displayVal = Number(rawVal || 0).toLocaleString();
        } else {
          displayVal = rawVal === 0 ? "0" : "-";
        }
      } else {
        displayVal = rawVal !== undefined && rawVal !== null ? String(rawVal) : "";
      }

      return (
        <div
          onClick={() => setSelectedKardexRowIndex(rowIndex)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setSelectedKardexRowIndex(rowIndex);
            handleKardexRowDoubleClick(row);
          }}
          className={cn(
            "w-full h-full px-2 py-1 flex items-center cursor-pointer select-none text-xs transition-colors text-white dark:text-white",
            align === "center"
              ? "justify-center text-center"
              : align === "left"
              ? "justify-start text-left font-mono"
              : "justify-start text-right",
            isSelected ? "!text-white font-semibold bg-blue-900/40" : "hover:bg-slate-800/40"
          )}
        >
          {displayVal}
        </div>
      );
    };
    KardexCell.displayName = `KardexCell_${field}`;
    return KardexCell;
  };

  const extractStringFromObj = (v: any, fieldType?: 'batch' | 'expire' | 'serial'): string => {
    if (v === undefined || v === null) return "";
    if (typeof v === "object") {
      if (Array.isArray(v)) {
        return v.map((item) => extractStringFromObj(item, fieldType)).filter(Boolean).join(" | ");
      }
      if (fieldType === 'batch') {
        return String(v.batchNumber || v.BatchNumber || v.batch_number || v.batch || "");
      }
      if (fieldType === 'expire') {
        return String(v.expireDate || v.ExpireDate || v.expire_date || v.expirationDate || "");
      }
      if (fieldType === 'serial') {
        return String(v.serialNumber || v.SerialNumber || v.serial_number || v.serial || "");
      }
      return (
        (v.factorValue !== undefined && typeof v.factorValue !== 'object' ? String(v.factorValue) : '') ||
        (v.value !== undefined && typeof v.value !== 'object' ? String(v.value) : '') ||
        (v.StartValue !== undefined && typeof v.StartValue !== 'object' ? String(v.StartValue) : '') ||
        ""
      );
    }
    return String(v);
  };

  const renderSimpleCell = (field: string, isAmount = false) => {
    const SimpleCell = (row: any) => {
      let val = row[field];
      if (val === undefined || val === null) {
        if (row.values && row.values[field] !== undefined && row.values[field] !== null) {
          val = row.values[field];
        }
      }
      let strVal = extractStringFromObj(val);
      if (isAmount && strVal) {
        const num = Number(strVal);
        if (!isNaN(num)) strVal = num.toLocaleString();
      }
      return (
        <div className={cn("w-full h-full px-2 py-1 flex items-center select-none text-xs text-white dark:text-white", isAmount ? "justify-start font-mono" : "justify-start")}>
          {strVal || "-"}
        </div>
      );
    };
    SimpleCell.displayName = `SimpleCell_${field}`;
    return SimpleCell;
  };

  const isItemSelected = doubleClickedItemId !== null && doubleClickedItemId !== undefined;

  const trackingFactorColumns: TabCellColumn[] = useMemo(() => {
    if (!selectedItemTrackingFactors || selectedItemTrackingFactors.length === 0) {
      return [
        { key: "code", header: "کد عامل ردیابی", width: "130px", type: "text", render: renderSimpleCell("code") },
        { key: "name", header: "عنوان عامل ردیابی", width: "180px", type: "text", render: renderSimpleCell("name") },
        { key: "value", header: "جزئیات اطلاعات ردیابی", width: "250px", type: "text", render: renderSimpleCell("value") },
      ];
    }

    const factorCols: TabCellColumn[] = selectedItemTrackingFactors.map((tf: any, tfIdx: number) => {
      const factorKey = `tf_col_${tf.TrackingFactorID || tf.ItemTrackingFactorID || tf.TrackingFactorRef || tf.id || tf.Code || tf.TrackingFactorCode || tfIdx}_${tfIdx}`;
      const lookupKey = String(tf.TrackingFactorID || tf.ItemTrackingFactorID || tf.TrackingFactorRef || tf.id || tf.Code || tf.TrackingFactorCode || "");
      const factorCode = String(tf.TrackingFactorCode || tf.Code || "");
      const headerName = String(tf.TrackingFactorName || tf.Name || tf.Title || "عامل ردیابی").trim();
      const headerNameLower = headerName.toLowerCase();
      const tfType = Number(tf.TrackingFactorType || 0);

      const isBatchCol = headerName.includes("بچ") || headerNameLower.includes("batch") || tfType === 6;
      const isExpireCol = headerName.includes("انقض") || headerNameLower.includes("expir") || tfType === 4;
      const isSerialCol = headerName.includes("سریال") || headerNameLower.includes("serial") || tfType === 8 || tfType === 2;
      const fieldType = isBatchCol ? 'batch' : isExpireCol ? 'expire' : isSerialCol ? 'serial' : undefined;

      const renderFactorCell = (row: any) => {
        let rawVal = row[lookupKey] ?? row[factorCode] ?? row[tf.TrackingFactorRef] ?? row[tf.TrackingFactorCode] ?? row[factorKey];
        if (isExpireCol && rawVal && row.batchNumber && String(rawVal) === String(row.batchNumber) && String(rawVal) !== String(row.expireDate)) {
          rawVal = undefined;
        }
        if (isBatchCol && rawVal && row.expireDate && String(rawVal) === String(row.expireDate) && String(rawVal) !== String(row.batchNumber)) {
          rawVal = undefined;
        }
        if ((rawVal === undefined || rawVal === null || rawVal === "") && row.TrackingFactorValues) {
          let tfv = row.TrackingFactorValues;
          if (typeof tfv === "string") {
            try {
              tfv = JSON.parse(tfv);
            } catch {}
          }
          if (tfv && typeof tfv === "object") {
            rawVal = tfv[lookupKey] ?? tfv[factorCode] ?? tfv[headerName];
          }
        }

        let strVal = extractStringFromObj(rawVal, fieldType);

        if (!strVal || strVal === "-") {
          if (isBatchCol) {
            strVal = extractStringFromObj(row.batchNumber || row.BatchNumber || row.batch_number || row.batch, 'batch');
          } else if (isExpireCol) {
            strVal = extractStringFromObj(row.expireDate || row.ExpireDate || row.expire_date || row.expirationDate, 'expire');
          } else if (isSerialCol) {
            strVal = extractStringFromObj(row.serialNumber || row.SerialNumber || row.serial_number || row.serial, 'serial');
            if (!strVal || strVal === "-") {
              const startVal = row[`${lookupKey}_Start`] || row[`${factorCode}_Start`] || row.StartValue || row.startValue;
              const endVal = row[`${lookupKey}_End`] || row[`${factorCode}_End`] || row.EndValue || row.endValue;
              if (startVal && endVal) {
                strVal = startVal === endVal ? String(startVal) : `از ${startVal} تا ${endVal}`;
              } else if (startVal) {
                strVal = String(startVal);
              }
            }
          }
        }

        if (!strVal || strVal === "-") {
          const rowTfName = String(row.name || row.TrackingFactorName || row.TrackingFactorTitle || "");
          const rowTfRef = String(row.TrackingFactorRef || row.code || "");
          const isDirectMatch =
            (rowTfRef && (rowTfRef === lookupKey || rowTfRef === factorCode)) ||
            (rowTfName && (rowTfName === headerName || rowTfName.includes(headerName) || headerName.includes(rowTfName)));

          if (isDirectMatch) {
            strVal = extractStringFromObj(row.factorValue || row.FactorValue, fieldType);
          }
        }

        return (
          <div className="w-full h-full px-2 py-1 flex items-center select-none text-xs text-white dark:text-white justify-start">
            {strVal || "-"}
          </div>
        );
      };

      return {
        key: factorKey,
        header: headerName,
        type: "text",
        width: tfType === 4 || tfType === 8 ? "180px" : tfType === 5 || tfType === 3 ? "140px" : "160px",
        render: renderFactorCell,
      };
    });

    if (factorCols.length === 0) {
      return [
        { key: "code", header: "کد عامل ردیابی", width: "130px", type: "text", render: renderSimpleCell("code") },
        { key: "name", header: "عنوان عامل ردیابی", width: "180px", type: "text", render: renderSimpleCell("name") },
        { key: "value", header: "جزئیات اطلاعات ردیابی", width: "250px", type: "text", render: renderSimpleCell("value") },
      ];
    }

    factorCols.push({
      key: "value",
      header: "جزئیات اطلاعات ردیابی",
      width: "250px",
      type: "text",
      render: renderSimpleCell("value"),
    });

    return factorCols;
  }, [selectedItemTrackingFactors]);

  // Top TabCellRow Config (Master: Items, Tracking Factors, Sub Units)
  const topTabsConfig: TabCellConfig[] = useMemo(
    () => [
      {
        id: "items",
        label: "کالا",
        icon: <Package className="w-4 h-4" />,
        columns: [
          { key: "code", header: "کد کالا", width: "130px", type: "text", render: renderItemCell("code") },
          { key: "title", header: "عنوان کالا", width: "220px", type: "text", render: renderItemCell("title") },
          { key: "latinTitle", header: "عنوان لاتین / دوم", width: "200px", type: "text", render: renderItemCell("latinTitle") },
          { key: "unit", header: "واحد اصلی", width: "110px", type: "text", render: renderItemCell("unit") },
          { key: "category", header: "طبقه کالا", width: "150px", type: "text", render: renderItemCell("category") },
          { key: "barcode", header: "بارکد / ایران کد", width: "140px", type: "text", render: renderItemCell("barcode") },
          { key: "valuationMethod", header: "روش ارزیابی", width: "180px", type: "text", render: renderItemCell("valuationMethod") },
        ],
      },
      {
        id: "tracking_factors",
        label: "عامل ردیابی",
        disabled: !isItemSelected,
        icon: <Tag className="w-4 h-4" />,
        columns: trackingFactorColumns,
      },
      {
        id: "sub_units",
        label: "واحد فرعی",
        disabled: !isItemSelected,
        icon: <Layers className="w-4 h-4" />,
        columns: [
          { key: "subUnitName", header: "عنوان واحد فرعی", width: "200px", type: "text", render: renderSimpleCell("subUnitName") },
          { key: "mainToSubRatio", header: "نسبت واحد اصلی به فرعی", width: "170px", type: "amount", render: renderSimpleCell("mainToSubRatio", true) },
          { key: "isVariableRatio", header: "ضریب تبدیل متغیر", width: "140px", type: "text", render: renderSimpleCell("isVariableRatio") },
          { key: "tolerancePercent", header: "درصد تلرانس", width: "140px", type: "amount", render: renderSimpleCell("tolerancePercent", true) },
        ],
      },
    ],
    [doubleClickedItemId, isItemSelected, trackingFactorColumns, selectedTrackingFactorRow, selectedSubUnitRow]
  );

  // Bottom TabCellRow Config (Detail: Kardex Voucher Transactions)
  const bottomTabsConfig: TabCellConfig[] = useMemo(
    () => [
      {
        id: "kardex",
        label: "گردش اسناد کاردکس",
        icon: <FileText className="w-4 h-4" />,
        columns: [
          { key: "voucherType", header: "نوع سند", width: "150px", type: "text", render: renderKardexCell("voucherType", false, "right") },
          { key: "voucherNo", header: "شماره سند", width: "120px", type: "text", render: renderKardexCell("voucherNo", false, "center") },
          { key: "refNo", header: "شماره عطف", width: "120px", type: "text", render: renderKardexCell("refNo", false, "center") },
          { key: "date", header: "تاریخ", width: "110px", type: "text", render: renderKardexCell("date", false, "center") },
          { key: "inQty", header: "مقدار وارده", width: "120px", type: "amount", render: renderKardexCell("inQty", true, "left") },
          { key: "inUnit", header: "واحد ورود", width: "100px", type: "text", render: renderKardexCell("inUnit", false, "center") },
          { key: "inRate", header: "نرخ وارده", width: "130px", type: "amount", render: renderKardexCell("inRate", true, "left") },
          { key: "inAmount", header: "مبلغ وارده", width: "150px", type: "amount", render: renderKardexCell("inAmount", true, "left") },
          { key: "outQty", header: "مقدار صادره", width: "120px", type: "amount", render: renderKardexCell("outQty", true, "left") },
          { key: "outUnit", header: "واحد صدور", width: "100px", type: "text", render: renderKardexCell("outUnit", false, "center") },
          { key: "outRate", header: "نرخ صادره", width: "130px", type: "amount", render: renderKardexCell("outRate", true, "left") },
          { key: "outAmount", header: "مبلغ صادره", width: "150px", type: "amount", render: renderKardexCell("outAmount", true, "left") },
          { key: "balanceQty", header: "مقدار مانده", width: "130px", type: "amount", render: renderKardexCell("balanceQty", true, "left") },
          { key: "balanceAmount", header: "مبلغ مانده", width: "160px", type: "amount", render: renderKardexCell("balanceAmount", true, "left") },
        ],
      },
    ],
    [selectedKardexRowIndex, tabs]
  );

  const warehouseColumns: SingleSelectColumn[] = useMemo(
    () => [
      { key: "code", label: "کد انبار", width: 90 },
      { key: "title", label: "عنوان انبار", width: 170 },
    ],
    []
  );

  const warehouseData = useMemo(() => {
    const allOpt = {
      WarehouseID: "all",
      id: "all",
      code: "---",
      WarehouseCode: "---",
      title: "همه انبارها...",
      WarehouseTitle: "همه انبارها...",
      name: "همه انبارها...",
      WarehouseName: "همه انبارها...",
    };
    return [allOpt, ...warehouses];
  }, [warehouses]);

  return (
    <div
      dir={direction}
      className="flex flex-col h-full bg-[#0b0f19] text-gray-100 select-none overflow-hidden font-sans"
    >
      {/* 1. TOP HEADER & FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#111827] border-b border-slate-800 shadow-sm">
        {/* Right Side in RTL: Filters in order (Warehouse, From Date, To Date) */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {/* 1. Warehouse Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-gray-300 font-medium whitespace-nowrap">انبار :</span>
            <div className="w-56">
              <SingleSelectDropDown
                data={warehouseData}
                columns={warehouseColumns}
                value={selectedWarehouse}
                valueKey="WarehouseID"
                displayKey="title"
                placeholder="انتخاب انبار..."
                onChange={(item, selectedVal) => {
                  const val = selectedVal ?? item?.WarehouseID ?? item?.id ?? "all";
                  const newWh = String(val);
                  setSelectedWarehouse(newWh);
                  refreshLiveKardex(newWh, fromDate, toDate);
                }}
                addFormOptions={{ title: "تعریف انبار جدید", componentName: "WarehouseForm", groupId: "inv" }}
                noWrapper={true}
                className="w-full text-xs"
              />
            </div>
          </div>

          {/* 2. From Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-300 font-medium whitespace-nowrap text-xs">از تاریخ :</span>
            <div className="w-28">
              <DateInput
                value={fromDate}
                onChange={(val) => {
                  setFromDate(val);
                  refreshLiveKardex(selectedWarehouse, val, toDate);
                }}
                outputFormat="dateString"
                noWrapper={true}
                className="bg-[#182235] border-slate-700 text-gray-100 h-[25px] text-xs text-center"
              />
            </div>
          </div>

          {/* 3. To Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-300 font-medium whitespace-nowrap text-xs">تا تاریخ :</span>
            <div className="w-28">
              <DateInput
                value={toDate}
                onChange={(val) => {
                  setToDate(val);
                  refreshLiveKardex(selectedWarehouse, fromDate, val);
                }}
                outputFormat="dateString"
                noWrapper={true}
                className="bg-[#182235] border-slate-700 text-gray-100 h-[25px] text-xs text-center"
              />
            </div>
          </div>
        </div>

        {/* Left Side in RTL: Calculate & Display Button */}
        <div className="flex items-center">
          <button
            onClick={handleCalculateKardex}
            disabled={isLoadingKardex}
            className="flex items-center gap-1.5 px-3 h-[25px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-blue-900/30 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingKardex ? "animate-spin" : ""}`} />
            <span>محاسبه و نمایش کاردکس</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTAINER WITH TWO ROW TABCELLROWS */}
      <div className="flex-1 flex flex-col min-h-0 p-2 gap-2 overflow-hidden">
        {/* Master / Top Section: Items, Tracking Factors, Sub Units */}
        <div className="h-[186px] flex-none flex flex-col min-h-0 overflow-hidden">
          <TabCellRow
            tabs={topTabsConfig}
            value={{
              items: tabData.items || [],
              tracking_factors: tabData.tracking_factors || [],
              sub_units: tabData.sub_units || [],
            }}
            onChange={(newData) => {
              if (newData && typeof newData === 'object' && !Array.isArray(newData)) {
                setTabData((prev) => ({ ...prev, ...newData }));
              }
            }}
            onActiveRowChange={handleActiveRowChange}
            onRowDoubleClick={handleRowDoubleClick}
            rowClassName={(row, _rowIndex, tabId) => {
              if (tabId === "items") {
                const isItemSelected =
                  doubleClickedItemId !== null &&
                  doubleClickedItemId !== undefined &&
                  (String(row?.id) === String(doubleClickedItemId) ||
                    String(row?.ItemID) === String(doubleClickedItemId) ||
                    (row?.code && String(row?.code) === String(doubleClickedItemId)));

                if (isItemSelected) {
                  return "!bg-emerald-600 dark:!bg-emerald-600 !text-white font-medium hover:!bg-emerald-700 shadow-inner";
                }
              } else if (tabId === "tracking_factors") {
                const isTFSelected =
                  selectedTrackingFactorRow !== null &&
                  selectedTrackingFactorRow !== undefined &&
                  ((row?.factorValueSig &&
                    selectedTrackingFactorRow?.factorValueSig &&
                    row.factorValueSig === selectedTrackingFactorRow.factorValueSig) ||
                    (row?.id !== undefined &&
                      selectedTrackingFactorRow?.id !== undefined &&
                      String(row.id) === String(selectedTrackingFactorRow.id)));

                if (isTFSelected) {
                  return "!bg-emerald-600 dark:!bg-emerald-600 !text-white font-medium hover:!bg-emerald-700 shadow-inner";
                }
              } else if (tabId === "sub_units") {
                const isSubUnitSelected =
                  selectedSubUnitRow !== null &&
                  selectedSubUnitRow !== undefined &&
                  (String(row?.id) === String(selectedSubUnitRow?.id) ||
                    (row?.subUnitName && String(row?.subUnitName) === String(selectedSubUnitRow?.subUnitName)));

                if (isSubUnitSelected) {
                  return "!bg-emerald-600 dark:!bg-emerald-600 !text-white font-medium hover:!bg-emerald-700 shadow-inner";
                }
              }
              return "";
            }}
            dir={direction}
            isReadonly={true}
            hideAddButton={true}
            hideDeleteButton={true}
            hideCopyPaste={true}
            className="h-full rounded-lg border border-slate-800 shadow-sm overflow-hidden"
          />
        </div>

        {/* Detail / Bottom Section: Kardex Voucher Transactions */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabCellRow
            tabs={bottomTabsConfig}
            value={{
              kardex: tabData.kardex || [],
            }}
            onChange={(newData) => {
              const kardexList = Array.isArray(newData) ? newData : (newData?.kardex || []);
              setTabData((prev) => ({ ...prev, kardex: kardexList }));
            }}
            onRowDoubleClick={(_tab, rowIndex, row) => {
              setSelectedKardexRowIndex(rowIndex);
              handleKardexRowDoubleClick(row);
            }}
            rowClassName={(row, rowIndex) =>
              cn(
                "!text-white dark:!text-white hover:bg-slate-800/60 transition-colors",
                selectedKardexRowIndex === rowIndex ? "!bg-blue-900/40 !text-white" : ""
              )
            }
            selectedIndex={selectedKardexRowIndex}
            dir={direction}
            isReadonly={true}
            hideAddButton={true}
            hideDeleteButton={true}
            hideCopyPaste={true}
            className="h-full rounded-lg border border-slate-800 shadow-sm overflow-hidden"
          />
        </div>
      </div>
    </div>
  );
}


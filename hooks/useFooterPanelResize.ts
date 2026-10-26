'use client';

/**
 * Task 87: هوک مشترک دستگیره تغییر ارتفاع فوتر فرم‌های اسناد (رسید انبار، حواله انبار،
 * سفارش فروش، فاکتور خرید و ...) — به‌جای کد تکراری در ۷ فرم.
 *
 * رفتار:
 *  ۱) درگ موس: کم/زیاد کردن ارتفاع فوتر (کشیدن به بالا → فوتر بلندتر و جدول اقلام فشرده‌تر)
 *  ۲) دبل‌کلیک: جمع شدن کامل فوتر (ارتفاع صفر)
 *  ۳) دبل‌کلیک مجدد: بازگشت فوتر به آخرین ارتفاع قبل از جمع شدن
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

/** حداقل ارتفاع مجاز فوتر هنگام درگ */
export const FOOTER_PANEL_MIN_HEIGHT = 60;

export interface FooterPanelResizeResult {
  /** ارتفاع فعلی ناحیه فوتر (px) — روی wrapper فوتر اعمال شود */
  footerHeight: number;
  /** آیا فوتر جمع شده است (ارتفاع صفر) */
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  /** آیا درگ تغییر ارتفاع در جریان است (برای غیرفعال کردن transition و هایلایت دستگیره) */
  isDragging: boolean;
  /** پراپ‌های آماده برای دستگیره (separator) */
  handleProps: {
    onMouseDown: (e: React.MouseEvent) => void;
    onDoubleClick: (e: React.MouseEvent) => void;
    role: 'separator';
    'aria-label': string;
  };
}

export function useFooterPanelResize(defaultHeight = 150): FooterPanelResizeResult {
  const [footerHeight, setFooterHeight] = useState(defaultHeight);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const footerHeightRef = useRef(defaultHeight);
  /** آخرین ارتفاع «باز» فوتر — برای بازگشت با دبل‌کلیک دوم */
  const expandedHeightRef = useRef(defaultHeight);
  const isCollapsedRef = useRef(false);
  const dragStateRef = useRef<{ startY: number; startHeight: number; maxHeight: number } | null>(null);

  useEffect(() => {
    footerHeightRef.current = footerHeight;
    if (!isCollapsedRef.current) expandedHeightRef.current = footerHeight;
  }, [footerHeight]);

  useEffect(() => {
    isCollapsedRef.current = isCollapsed;
  }, [isCollapsed]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || isCollapsedRef.current) return;
    const handleEl = e.currentTarget as HTMLElement;
    // حد مجاز: ارتفاع والدا (کانتینر تب اقلام) منهای حداقل ارتفاع جدول اقلام (۱۵۰) و ارتفاع دستگیره (~۱۰)
    const container = handleEl.parentElement as HTMLElement | null;
    const containerH = container?.clientHeight || 600;
    const maxHeight = Math.max(FOOTER_PANEL_MIN_HEIGHT + 40, containerH - 160);
    dragStateRef.current = { startY: e.clientY, startHeight: footerHeightRef.current, maxHeight };
    e.preventDefault(); // جلوگیری از انتخاب متن هنگام درگ
    setIsDragging(true);
  }, []);

  // شنود mousemove/mouseup روی document تا درگ حتی خارج از دستگیره ادامه یابد
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (ev: MouseEvent) => {
      const st = dragStateRef.current;
      if (!st) return;
      const delta = st.startY - ev.clientY; // کشیدن به بالا → فوتر بلندتر
      const next = Math.min(st.maxHeight, Math.max(FOOTER_PANEL_MIN_HEIGHT, st.startHeight + delta));
      if (next !== footerHeightRef.current) setFooterHeight(next);
    };
    const onUp = () => {
      dragStateRef.current = null;
      setIsDragging(false);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
    };
  }, [isDragging]);

  const onDoubleClick = useCallback(() => {
    if (isCollapsedRef.current) {
      // بازگشت به آخرین ارتفاع قبل از جمع شدن
      setFooterHeight(expandedHeightRef.current || 150);
      setIsCollapsed(false);
    } else {
      setIsCollapsed(true); // ارتفاع فوتر صفر (unmount)
    }
  }, []);

  return {
    footerHeight,
    isCollapsed,
    setIsCollapsed,
    isDragging,
    handleProps: {
      onMouseDown,
      onDoubleClick,
      role: 'separator',
      'aria-label': 'دستگیره تغییر ارتفاع فوتر — درگ برای کم/زیاد کردن، دابل‌کلیک برای جمع/باز شدن',
    },
  };
}

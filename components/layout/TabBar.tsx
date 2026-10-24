'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTabs } from '@/components/TabsProvider';
import { X, LayoutDashboard, ChevronDown, Check, Layers, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '@/components/Providers';

const groupColorsStyles: Record<string, { active: string; inactive: string }> = {
  general_group: { 
    active: 'bg-blue-600 text-white border-blue-800 dark:border-blue-400', 
    inactive: 'bg-white text-blue-700 border-transparent hover:bg-blue-50 dark:bg-gray-900 dark:text-blue-400 dark:hover:bg-gray-800' 
  },
  financial_group: { 
    active: 'bg-emerald-600 text-white border-emerald-800 dark:border-emerald-400', 
    inactive: 'bg-white text-emerald-700 border-transparent hover:bg-emerald-50 dark:bg-gray-900 dark:text-emerald-400 dark:hover:bg-gray-800' 
  },
  supply_chain_group: { 
    active: 'bg-orange-500 text-white border-orange-700 dark:border-orange-400', 
    inactive: 'bg-white text-orange-700 border-transparent hover:bg-orange-50 dark:bg-gray-900 dark:text-orange-400 dark:hover:bg-orange-800' 
  },
  org_management_group: { 
    active: 'bg-rose-500 text-white border-rose-700 dark:border-rose-400', 
    inactive: 'bg-white text-rose-700 border-transparent hover:bg-rose-50 dark:bg-gray-900 dark:text-rose-400 dark:hover:bg-rose-800' 
  },
};

export function TabBar() {
  const { tabs, activeTabId, setActiveTabId, removeTab, removeAllTabs, dirtyTabs } = useTabs();
  const { t, direction } = useLanguage();

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [overflowingTabIds, setOverflowingTabIds] = useState<Set<string>>(new Set());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check which specific tabs overflow the scroll container width
  const checkOverflow = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const hiddenSet = new Set<string>();

    const tabElements = container.querySelectorAll('[data-tab-id]');
    tabElements.forEach((el) => {
      const tabId = el.getAttribute('data-tab-id');
      if (!tabId) return;
      const rect = el.getBoundingClientRect();

      // Check if partially or fully out of the visible container viewport bounds
      const isFullyVisible =
        rect.left >= containerRect.left - 2 &&
        rect.right <= containerRect.right + 2;

      if (!isFullyVisible) {
        hiddenSet.add(tabId);
      }
    });

    setOverflowingTabIds(hiddenSet);
    setIsOverflowing(hiddenSet.size > 0);
  }, []);

  useEffect(() => {
    checkOverflow();
    const el = scrollContainerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });
    resizeObserver.observe(el);

    const handleScroll = () => {
      checkOverflow();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkOverflow);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [tabs, checkOverflow]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Display dynamic tabs from latest to oldest
  const reversedTabs = [...tabs].reverse();

  // Filter tabs that are actually overflowing / clipped
  const overflowingTabsList = reversedTabs.filter((tab) => overflowingTabIds.has(tab.id));
  const isDashboardOverflowing = overflowingTabIds.has('dashboard');

  // Handle Close Single Tab with Unsaved Data Check
  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dirtyTabs[id]) {
      const confirmSingle = window.confirm(
        t('unsavedSingleConfirm' as any) || "این فرم دارای اطلاعات ذخیره‌نشده می‌باشد. آیا از بستن آن اطمینان دارید؟"
      );
      if (!confirmSingle) return;
    }
    removeTab(id, e);
  };

  // Handle Close All Tabs with Unsaved Data Check
  const handleCloseAllTabs = () => {
    const hasDirty = tabs.some((tab) => dirtyTabs[tab.id] === true);
    if (hasDirty) {
      const confirmClose = window.confirm(
        t('unsavedAllConfirm' as any) || "برخی از فرم‌های باز شده دارای اطلاعات ذخیره‌نشده می‌باشند. آیا از بستن همه فرم‌ها اطمینان دارید؟"
      );
      if (!confirmClose) return;
    }
    removeAllTabs();
    setIsMenuOpen(false);
  };

  return (
    <div className="relative flex h-10 w-full items-center bg-gray-50 px-2 py-1 border-b dark:border-gray-800 dark:bg-gray-950/80 shadow-sm z-40">
      {/* Scrollable Tabs Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 flex items-center overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700"
      >
        <div className="flex w-max items-center gap-2">
          {/* Permanent Dashboard Tab */}
          <button
            data-tab-id="dashboard"
            onClick={() => setActiveTabId(null)}
            className={clsx(
              "flex h-8 items-center gap-2 rounded-t-lg px-4 py-1 text-sm font-medium transition-colors border-b-2 shrink-0",
              activeTabId === null 
                ? "bg-gray-200 text-gray-900 border-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-400" 
                : "bg-white text-gray-600 border-transparent hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{t('dashboard')}</span>
          </button>

          {reversedTabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const isDirty = !!dirtyTabs[tab.id];
            const styles = groupColorsStyles[tab.groupId] || groupColorsStyles['general_group'];

            return (
              <div
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={clsx(
                  "group flex h-8 cursor-pointer items-center justify-between gap-2.5 rounded-t-lg px-3 py-1 min-w-[120px] max-w-[200px] text-sm font-medium transition-colors border-b-2 shrink-0",
                  isActive ? styles.active : styles.inactive
                )}
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  {isDirty ? (
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" title="اطلاعات ذخیره‌نشده" />
                  ) : tab.icon ? (
                    <div className="text-current opacity-80 [&_svg]:!h-4 [&_svg]:!w-4 shrink-0">
                      {tab.icon}
                    </div>
                  ) : null}
                  <span className="truncate">{tab.title}</span>
                </div>
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className={clsx(
                    "flex h-5 w-5 items-center justify-center rounded-full transition-colors opacity-70 group-hover:opacity-100 shrink-0",
                    isActive 
                      ? "hover:bg-white/20 text-white" 
                      : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                  title={t('closeTab' as any) || "بستن تب"}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overflow Dropdown Arrow Icon */}
      {isOverflowing && (
        <div 
          ref={dropdownRef}
          className={clsx(
            "relative shrink-0 flex items-center z-50 bg-gray-50 dark:bg-gray-950 px-1",
            direction === 'rtl' ? 'border-r border-gray-200 dark:border-gray-800 me-1' : 'border-l border-gray-200 dark:border-gray-800 ms-1'
          )}
        >
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title={t('openTabs' as any) || "لیست فرم‌های باز شده"}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm"
          >
            <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-mono text-xs">{overflowingTabIds.size}</span>
            <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform duration-200", isMenuOpen && "rotate-180")} />
          </button>

          {/* Overflowed Tabs Dropdown Menu */}
          {isMenuOpen && (
            <div 
              className={clsx(
                "absolute top-full mt-1.5 w-80 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl py-2 z-[9999] animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto",
                direction === 'rtl' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
              )}
            >
              <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                <span>{t('overflowFormsList' as any) || 'فرم‌های سرریز شده'}</span>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px]">
                    {overflowingTabIds.size} {t('form' as any) || 'فرم'}
                  </span>
                  <button
                    onClick={handleCloseAllTabs}
                    className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-2 py-0.5 rounded transition-colors"
                    title={t('closeAllTabs' as any) || "بستن همه تب‌ها"}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{t('closeAll' as any) || 'بستن همه'}</span>
                  </button>
                </div>
              </div>

              <div className="py-1">
                {/* Dashboard Tab Item if overflowing */}
                {isDashboardOverflowing && (
                  <>
                    <div 
                      onClick={() => {
                        setActiveTabId(null);
                        setIsMenuOpen(false);
                        const el = scrollContainerRef.current?.querySelector('[data-tab-id="dashboard"]');
                        el?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
                      }}
                      className={clsx(
                        "group flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors",
                        activeTabId === null ? "bg-blue-50/80 text-blue-700 font-semibold dark:bg-blue-950/40 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <LayoutDashboard className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
                        <span className="truncate">{t('dashboard')}</span>
                      </div>
                      {activeTabId === null && (
                        <Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                  </>
                )}

                {/* Overflowed Open Tabs List */}
                {overflowingTabsList.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  const isDirty = !!dirtyTabs[tab.id];

                  return (
                    <div
                      key={tab.id}
                      onClick={() => {
                        setActiveTabId(tab.id);
                        setIsMenuOpen(false);
                        const el = scrollContainerRef.current?.querySelector(`[data-tab-id="${tab.id}"]`);
                        el?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
                      }}
                      className={clsx(
                        "group flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors",
                        isActive ? "bg-blue-50/80 text-blue-700 font-semibold dark:bg-blue-950/40 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {isDirty ? (
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="دارای اطلاعات ذخیره‌نشده" />
                        ) : tab.icon ? (
                          <div className="shrink-0 [&_svg]:!h-4 [&_svg]:!w-4 opacity-80">
                            {tab.icon}
                          </div>
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                        <span className="truncate">{tab.title}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActive && (
                          <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                        <button
                          onClick={(e) => handleCloseTab(tab.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-all"
                          title={t('closeTab' as any) || "بستن تب"}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


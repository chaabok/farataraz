"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MegaMenuOption {
  value: string;
  label: string;
  disabled?: boolean;
  tooltip?: string;
  badge?: string;
  icon?: React.ReactNode;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface MegaMenuSection {
  id?: string;
  title: string;
  items: MegaMenuOption[];
  searchable?: boolean;
  maxHeight?: string;
  headerRight?: React.ReactNode;
}

export interface MegaMenuInputProps {
  id?: string;
  value?: string | string[];
  onChange?: (value: string, option: MegaMenuOption) => void;
  disabled?: boolean;
  placeholder?: string;
  title?: React.ReactNode;
  sections: MegaMenuSection[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  footerNote?: React.ReactNode;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
  buttonWidth?: string;
  popoverWidth?: string;
  align?: 'right' | 'left';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  closeOnSelect?: boolean;
  /**
   * Task 70: اختیاری — والد با این کال‌بک فهرست بخش‌ها را دوباره واکشی می‌کند؛
   * هر بار پاپ‌اور باز شود و با کلیک روی دکمه بروزرسانی هدر فراخوانی می‌شود.
   */
  onRefresh?: () => void | Promise<void>;
}

export const MegaMenuInput: React.FC<MegaMenuInputProps> = ({
  id = 'megamenu-input',
  value,
  onChange,
  disabled = false,
  placeholder = 'انتخاب کنید...',
  title = 'انتخاب گزینه‌ها',
  sections = [],
  showSearch = true,
  searchPlaceholder = 'جستجو...',
  footerNote,
  buttonClassName,
  buttonStyle,
  buttonWidth,
  popoverWidth = 'w-[360px] max-w-[90vw]',
  align = 'right',
  isOpen: controlledIsOpen,
  onOpenChange,
  className = '',
  label,
  required = false,
  error,
  closeOnSelect = true,
  onRefresh,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  // Task 70: رفرش خودکار لیست هر بار پاپ‌اور باز می‌شود + دکمه بروزرسانی هدر
  const wasOpenRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // همگام‌سازی ref در effect (نه حین رندر)
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  const handleRefresh = useCallback(async () => {
    const fn = onRefreshRef.current;
    if (!fn) return;
    setIsRefreshing(true);
    try {
      await fn();
    } catch (err) {
      console.error('onRefresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isOpened = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  // Task 70: رفرش خودکار لیست هر بار پاپ‌اور باز می‌شود (حالت کنترل‌شده و داخلی هر دو)
  useEffect(() => {
    if (isOpened && !wasOpenRef.current) {
      handleRefresh();
    }
    wasOpenRef.current = isOpened;
  }, [isOpened, handleRefresh]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < 280 && spaceAbove > spaceBelow;

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 999999,
    };

    if (openUp) {
      style.bottom = `${window.innerHeight - rect.top + 4}px`;
      style.maxHeight = `${Math.min(spaceAbove - 16, 420)}px`;
    } else {
      style.top = `${rect.bottom + 4}px`;
      style.maxHeight = `${Math.min(spaceBelow - 16, 420)}px`;
    }

    if (align === 'right') {
      const rightOffset = window.innerWidth - rect.right;
      style.right = `${Math.max(8, rightOffset)}px`;
    } else {
      style.left = `${Math.max(8, rect.left)}px`;
    }

    setPopoverStyle(style);
  }, [align]);

  useEffect(() => {
    if (isOpened) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpened, updatePosition]);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled) return;

    if (isOpened) {
      if (onOpenChange) onOpenChange(false);
      else setInternalIsOpen(false);
    } else {
      updatePosition();
      if (onOpenChange) onOpenChange(true);
      else setInternalIsOpen(true);
    }
  };

  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    else setInternalIsOpen(false);
    setSearchQuery('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        if (isOpened) {
          handleClose();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpened]);

  // Determine display label
  const displayLabel = useMemo(() => {
    if (Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      return value.join(', ');
    }
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
    return placeholder;
  }, [value, placeholder]);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.trim().toLowerCase();
    return sections.map(section => {
      if (section.searchable === false) return section;
      return {
        ...section,
        items: section.items.filter(
          item =>
            item.label.toLowerCase().includes(query) ||
            item.value.toLowerCase().includes(query)
        ),
      };
    });
  }, [sections, searchQuery]);

  // Grid columns class based on section count
  const gridColsClass = useMemo(() => {
    const count = sections.length;
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    return 'grid-cols-2 md:grid-cols-4';
  }, [sections.length]);

  const popoverContent = isOpened && mounted ? (
    <div
      ref={popoverRef}
      id={`${id}-popover`}
      style={popoverStyle}
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl rounded-xl p-2 text-right rtl animate-in fade-in duration-150 flex flex-col',
        popoverWidth
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
          <span className="font-bold text-[11px] text-slate-800 dark:text-slate-100">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              id={`${id}-btn-refresh`}
              type="button"
              onClick={handleRefresh}
              title="بروزرسانی لیست"
              aria-label="بروزرسانی لیست"
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-indigo-500')} />
            </button>
          )}
          <button
            id={`${id}-btn-close`}
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 transition-colors"
          >
            بستن ✕
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="mb-1.5 relative shrink-0">
          <input
            id={`${id}-search-input`}
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-2 py-0.5 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-2 pl-6"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Content Grid */}
      <div className={cn('grid gap-2 flex-1 overflow-hidden', gridColsClass)}>
        {filteredSections.map((section, idx) => {
          const isLastSection = idx === filteredSections.length - 1;
          const sectionMaxHeight = section.maxHeight || 'max-h-48';

          return (
            <div
              key={section.id || section.title || idx}
              className={cn(
                'space-y-0.5 flex flex-col overflow-hidden',
                !isLastSection &&
                  'border-l border-slate-200 dark:border-slate-800 pl-1.5'
              )}
            >
              {/* Section Title */}
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 pb-0.5 border-b border-slate-100 dark:border-slate-800/60 mb-1 flex items-center justify-between shrink-0">
                <span>{section.title}</span>
                {section.headerRight}
              </div>

              {/* Section Items */}
              <div
                className={cn(
                  'overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin flex-1',
                  sectionMaxHeight
                )}
              >
                {section.items.length === 0 ? (
                  <div className="text-[10px] text-slate-400 py-2 text-center">
                    هیچ موردی یافت نشد
                  </div>
                ) : (
                  section.items.map(item => {
                    const isValueMatch = Array.isArray(value)
                      ? value.includes(item.value)
                      : value === item.value;
                    const isSelected =
                      item.isSelected !== undefined
                        ? item.isSelected
                        : isValueMatch;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        disabled={item.disabled}
                        onClick={() => {
                          if (item.disabled) return;
                          if (item.onClick) {
                            item.onClick();
                          }
                          onChange?.(item.value, item);
                          if (closeOnSelect) {
                            handleClose();
                          }
                        }}
                        title={item.tooltip || ''}
                        className={cn(
                          'w-full text-right px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors',
                          isSelected
                            ? 'bg-indigo-600 text-white font-semibold'
                            : item.disabled
                            ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50 text-slate-400'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
                          item.className
                        )}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {item.showCheckbox && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={item.disabled}
                              onChange={() => {}}
                              className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 pointer-events-none w-3.5 h-3.5"
                            />
                          )}
                          {item.icon}
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isSelected && (
                          <span className="shrink-0 text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                        {item.disabled && (
                          <span
                            className="shrink-0 text-[9px]"
                            title={item.tooltip}
                          >
                            🔒
                          </span>
                        )}
                        {item.badge && (
                          <span className="shrink-0 text-[9px] px-1 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      {footerNote && (
        <div className="mt-1.5 pt-1 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {footerNote}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div
      ref={containerRef}
      id={`${id}-container`}
      className={cn('relative inline-block text-right rtl', className)}
    >
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        title={displayLabel}
        style={{ ...buttonStyle, width: (buttonWidth && !String(buttonWidth).includes("NaN")) ? buttonWidth : undefined }}
        className={cn(
          'px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs flex items-center justify-between gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors',
          isOpened ? 'ring-1 ring-indigo-500 border-indigo-500' : '',
          buttonClassName
        )}
      >
        <span className="truncate font-medium">{displayLabel}</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200',
            isOpened ? 'rotate-180' : ''
          )}
        />
      </button>

      {/* Render Popover Flyout via Portal to document.body */}
      {mounted && popoverContent ? createPortal(popoverContent, document.body) : null}

      {error && (
        <div className="text-[10px] text-red-500 mt-0.5">{error}</div>
      )}
    </div>
  );
};

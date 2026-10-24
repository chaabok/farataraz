"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch, cn, getBandStyleWidth } from '@/lib/utils';
import { useToast } from '../ToastProvider';
import { useConfirm } from '../ConfirmProvider';
import { useMenuStore } from '@/lib/stores/menuStore';
import { SIDEBAR_STRUCTURE } from '@/lib/sidebar-metadata';
import { DynamicFormRunner } from './DynamicFormRunner';
import CustomerGroup from './sle/CustomerGroup';

const SYSTEM_COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  CustomerGroup: CustomerGroup,
  CustomerGroupForm: CustomerGroup,
};

import { useLanguage } from '@/components/Providers';
import { 
  Settings2, Plus, Trash2, ArrowUp, ArrowDown, Save, 
  Layout, Eye, FileText, Check, ChevronLeft, ChevronRight, ChevronDown, 
  Wrench, Sparkles, Type, Search, Folder, FolderOpen, RefreshCw, 
  FolderTree, Layers, ListTree, Tag, X, FileJson, Building2, Users, 
  Calculator, ShoppingCart, Factory, Briefcase, Settings, FolderPlus,
  Database, Box, BarChart, Truck, LayoutDashboard, Shield, CreditCard,
  Wallet, Palette, Hash, Pencil, FormInput, FilePlus, HelpCircle, Maximize2, Sliders,
  PanelRightClose, PanelRightOpen, Scaling, Undo2, Redo2
} from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { 
  TextInput, 
  DateInput, 
  Select, 
  NumberInput, 
  AmountInput,
  TextArea,
  Checkbox,
  RadioGroup,
  MultiSelect,
  MultiCheckbox,
  EmailInput,
  WebsiteInput,
  FileUpload,
} from "../inputs";
import { NewButton } from "../buttons/NewButton";
import { ListButton } from "../buttons/ListButton";
import { SaveButton } from "../buttons/SaveButton";
import { SaveCloseButton } from "../buttons/SaveCloseButton";
import { SaveNewButton } from "../buttons/SaveNewButton";
import { DeleteButton } from "../buttons/DeleteButton";
import { DeleteAndNewButton } from "../buttons/DeleteAndNewButton";
import { PrintDropdownButton } from "../buttons/PrintDropdownButton";
import { VoucherActionButtons } from "../buttons/VoucherActionButtons";

const FONT_OPTIONS = [
  { value: 'font-sans', label: 'Inter (Sans-serif)' },
  { value: 'font-mono', label: 'JetBrains Mono (Technical)' },
  { value: 'font-serif', label: 'Playfair Display (Editorial)' },
  { value: 'font-vazir', label: 'وزیرمتن (Vazirmatn)' },
];

const FONT_SIZE_OPTIONS = [
  { value: 'text-xs', label: 'بسیار کوچک (12px)' },
  { value: 'text-sm', label: 'کوچک (14px)' },
  { value: 'text-base', label: 'معمولی (16px)' },
  { value: 'text-lg', label: 'بزرگ (18px)' },
];

const COMPONENT_TEMPLATES = [
  { value: 'SimpleForm', label: 'فرم ساده تک ردیفی' },
  { value: 'SimpleFormTabbed', label: 'فرم ساده با تب بندی' },
  { value: 'SimpleFormTwoRow', label: 'فرم 2 ستونه' },
  { value: 'SimpleFormTwoRowTabbed', label: 'فرم 2 ستونه با تب بندی' },
];

const FIELD_TYPES = [
  { value: 'text', label: 'متن ساده (Text)' },
  { value: 'number', label: 'شماره فرم (Number)' },
  { value: 'amount', label: 'مبلغ / ریال (Amount)' },
  { value: 'textarea', label: 'متن چند خطی (Text Area)' },
  { value: 'date', label: 'تاریخ (Date)' },
  { value: 'select', label: 'منوی کشویی انتخاب (Select)' },
  { value: 'checkbox', label: 'چک‌باکس (Checkbox)' },
  { value: 'radio', label: 'رادیو دکمه (Radio)' },
  { value: 'email', label: 'ایمیل (Email)' },
  { value: 'website', label: 'آدرس وب‌سایت (Website)' },
  { value: 'file', label: 'آپلود فایل (File Upload)' },
];

const DASHBOARD_GROUPS = [
  { id: 'general_group', name: 'تنظیمات و عمومی' },
  { id: 'financial_group', name: 'حسابداری و مالی' },
  { id: 'supply_chain_group', name: 'تامین و تولید' },
  { id: 'warehouse_logistics_group', name: 'انبار و بازرگانی' },
  { id: 'org_management_group', name: 'مدیریت و سازمان' },
];

const GROUP_MAIN_MENUS: Record<string, string[]> = {
  general_group: ['تنظیمات ساختاری', 'مدیریت کاربران', 'سیستم عمومی', 'فرم ساز پویا (DFB)'],
  financial_group: ['حسابداری', 'دریافت و پرداخت', 'اموال', 'حقوق و دستمزد'],
  supply_chain_group: ['تولید'],
  warehouse_logistics_group: ['فروش', 'نرم افزار انبار', 'انبار تعدادی'],
  org_management_group: ['منابع انسانی', 'اداری'],
};

const SUBMENU_PRESETS = [
  'اطلاعات پایه',
  'عملیات',
  'گزارشات',
  'فهرست‌ها',
  'فرم‌های ایجاد شده',
];

export interface CustomMainMenu {
  id: string;
  groupId: string;
  title: string;
  titleEn?: string;
  priority: number;
  icon?: string;
  color?: string;
}

export interface CustomSubMenu {
  id: string;
  groupId: string;
  menuTitle: string;
  title: string;
  priority?: number;
}

export const AVAILABLE_MENU_ICONS = [
  { value: 'Folder', label: 'پوشه (Folder)', IconComp: Folder },
  { value: 'FolderPlus', label: 'پوشه جدید (FolderPlus)', IconComp: FolderPlus },
  { value: 'Settings', label: 'تنظیمات (Settings)', IconComp: Settings },
  { value: 'Database', label: 'دیتابیس (Database)', IconComp: Database },
  { value: 'Users', label: 'کاربران (Users)', IconComp: Users },
  { value: 'ShoppingCart', label: 'فروشگاه (ShoppingCart)', IconComp: ShoppingCart },
  { value: 'Factory', label: 'تولید (Factory)', IconComp: Factory },
  { value: 'Briefcase', label: 'کسب و کار (Briefcase)', IconComp: Briefcase },
  { value: 'Box', label: 'انبار / کالا (Box)', IconComp: Box },
  { value: 'FileText', label: 'اسناد / فرم‌ها (FileText)', IconComp: FileText },
  { value: 'BarChart', label: 'گزارشات (BarChart)', IconComp: BarChart },
  { value: 'Truck', label: 'ترابری (Truck)', IconComp: Truck },
  { value: 'LayoutDashboard', label: 'داشبورد (LayoutDashboard)', IconComp: LayoutDashboard },
  { value: 'Layers', label: 'لایه‌ها (Layers)', IconComp: Layers },
  { value: 'Shield', label: 'امنیت (Shield)', IconComp: Shield },
  { value: 'Calculator', label: 'حسابداری (Calculator)', IconComp: Calculator },
  { value: 'CreditCard', label: 'کارت مالی (CreditCard)', IconComp: CreditCard },
  { value: 'Wallet', label: 'کیف پول (Wallet)', IconComp: Wallet },
  { value: 'Wrench', label: 'ابزارها (Wrench)', IconComp: Wrench },
  { value: 'Building2', label: 'سازمانی (Building2)', IconComp: Building2 },
];

export const PRESET_MENU_COLORS = [
  { hex: '#3b82f6', label: 'آبی' },
  { hex: '#10b981', label: 'زمردی' },
  { hex: '#f59e0b', label: 'کهربایی' },
  { hex: '#ef4444', label: 'قرمز' },
  { hex: '#8b5cf6', label: 'بنفش' },
  { hex: '#ec4899', label: 'صورتی' },
  { hex: '#06b6d4', label: 'فیروزه‌ای' },
  { hex: '#f97316', label: 'نارنجی' },
  { hex: '#6366f1', label: 'نیلی' },
  { hex: '#64748b', label: 'خاکستری' },
];

interface TreeNodeItem {
  id: string;
  title: string;
  type: 'group' | 'menu' | 'submenu' | 'form';
  groupId: string;
  menuTitle: string;
  subMenuTitle: string;
  form?: any;
  children: TreeNodeItem[];
  formCount: number;
}

export interface BandConfig {
  id: string;
  title: string;
  parentBandId?: string;
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  bgColor?: string;
  borderRadius?: string;
}

const THEME_BG_COLORS: Record<string, string> = {
  blue: '#f0f7ff',
  emerald: '#f0fdf4',
  cyan: '#ecfeff',
  rose: '#fff1f2',
  purple: '#faf5ff',
  indigo: '#eef2ff',
};

const THEME_BORDER_COLORS: Record<string, string> = {
  blue: '#bfdbfe',
  emerald: '#bbf7d0',
  cyan: '#a5f3fc',
  rose: '#fecdd3',
  purple: '#e9d5ff',
  indigo: '#c7d2fe',
};

const DEFAULT_BAND: BandConfig = {
  id: 'band_1',
  title: 'باند اصلی',
  width: '100%',
  height: 'auto',
  margin: '6px 0px',
  padding: '12px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#bfdbfe',
  bgColor: '#f0f7ff',
  borderRadius: '12px',
};

export function DfbBuilder() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Tree View State (Default visible when DFB opens, hidden when entering form design mode)
  const [showTreePanel, setShowTreePanel] = useState(true);
  const [searchTree, setSearchTree] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedTreeNodeId, setSelectedTreeNodeId] = useState<string | null>(null);

  // Drag & Drop States for Bands and Fields
  const [draggedBandIndex, setDraggedBandIndex] = useState<number | null>(null);
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);

  // Preview Runner Modal
  const [previewFormCode, setPreviewFormCode] = useState<string | null>(null);

  // Form Bands & Fields State
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formComponent, setFormComponent] = useState('SimpleForm');
  const [showPrintList, setShowPrintList] = useState(false);
  const [showVoucherActionbar, setShowVoucherActionbar] = useState(false);
  
  // Bands State
  const [bands, setBands] = useState<BandConfig[]>([DEFAULT_BAND]);
  const [selectedBandIndex, setSelectedBandIndex] = useState<number | null>(0);

  const [fields, setFields] = useState<any[]>([]);
  const [styles, setStyles] = useState<any>({
    themeColor: 'blue',
    fontSize: 'text-sm',
    fontFamily: 'font-sans',
    headerGradient: 'from-blue-600 to-blue-500',
  });

  // Active Selected Field for Styling
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [editorTab, setEditorTab] = useState<'canvas' | 'settings'>('canvas');

  // ==========================================
  // Form Builder Undo / Redo History Engine
  // ==========================================
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isUndoRedoRef = React.useRef<boolean>(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex >= 0 && historyIndex < history.length - 1;

  const currentFormState = useMemo(() => ({
    bands,
    fields,
    styles,
    formTitle,
    formCode,
    formDesc,
    formComponent,
    showPrintList,
    showVoucherActionbar,
  }), [bands, fields, styles, formTitle, formCode, formDesc, formComponent, showPrintList, showVoucherActionbar]);

  useEffect(() => {
    if (!isEditing) {
      if (history.length > 0) {
        setHistory([]);
        setHistoryIndex(-1);
      }
      return;
    }

    if (isUndoRedoRef.current) return;

    if (history.length === 0) {
      setHistory([currentFormState]);
      setHistoryIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      const activeState = history[historyIndex];
      if (!activeState || JSON.stringify(activeState) !== JSON.stringify(currentFormState)) {
        setHistory(prev => {
          const next = prev.slice(0, historyIndex + 1);
          return [...next, currentFormState];
        });
        setHistoryIndex(prev => prev + 1);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [currentFormState, isEditing]);

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const state = history[newIndex];
    if (!state) return;

    isUndoRedoRef.current = true;
    setBands(state.bands);
    setFields(state.fields);
    setStyles(state.styles);
    setFormTitle(state.formTitle);
    setFormCode(state.formCode);
    setFormDesc(state.formDesc);
    setFormComponent(state.formComponent);
    setShowPrintList(state.showPrintList);
    setShowVoucherActionbar(state.showVoucherActionbar);
    setHistoryIndex(newIndex);

    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 100);

    showToast('تغییر قبلی لغو شد (Undo)', 'info');
  };

  const handleRedo = () => {
    if (historyIndex < 0 || historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const state = history[newIndex];
    if (!state) return;

    isUndoRedoRef.current = true;
    setBands(state.bands);
    setFields(state.fields);
    setStyles(state.styles);
    setFormTitle(state.formTitle);
    setFormCode(state.formCode);
    setFormDesc(state.formDesc);
    setFormComponent(state.formComponent);
    setShowPrintList(state.showPrintList);
    setShowVoucherActionbar(state.showVoucherActionbar);
    setHistoryIndex(newIndex);

    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 100);

    showToast('تغییر مجدداً اعمال شد (Redo)', 'info');
  };

  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingInInput = target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      );

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          if (!isTypingInInput) {
            e.preventDefault();
            handleUndo();
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (!isTypingInInput) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, historyIndex, history]);

  // Interactive Mouse Drag Resizing State for Bands & Fields
  const fieldRefs = React.useRef<{ [key: number]: HTMLDivElement | null }>({});
  const bandRefs = React.useRef<{ [key: number]: HTMLDivElement | null }>({});
  const canvasContainerRef = React.useRef<HTMLDivElement | null>(null);

  const [resizingBand, setResizingBand] = useState<{
    index: number;
    startX: number;
    startY: number;
    startWidthPx: number;
    startHeightPx: number;
    parentWidthPx: number;
    handleType: 'width' | 'height' | 'both' | 'left-width';
  } | null>(null);

  useEffect(() => {
    if (!resizingBand) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { index, startX, startY, startWidthPx, startHeightPx, parentWidthPx, handleType } = resizingBand;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      setBands(prevBands => {
        const updated = [...prevBands];
        if (!updated[index]) return prevBands;

        const currentBand = updated[index];
        const nextBand = { ...currentBand };

        if (handleType === 'width' || handleType === 'left-width' || handleType === 'both') {
          let newWidthPx = startWidthPx;
          if (handleType === 'width' || handleType === 'both') {
            newWidthPx = startWidthPx + deltaX;
          } else if (handleType === 'left-width') {
            newWidthPx = startWidthPx - deltaX;
          }
          const effectiveParentW = parentWidthPx > 0 ? parentWidthPx : 800;
          let pct = Math.round((newWidthPx / effectiveParentW) * 100);
          pct = Math.max(25, Math.min(100, pct));
          nextBand.width = `${pct}%`;
        }

        if (handleType === 'height' || handleType === 'both') {
          const newHeightPx = Math.max(60, Math.round(startHeightPx + deltaY));
          nextBand.height = `${newHeightPx}px`;
        }

        updated[index] = nextBand;
        return updated;
      });
    };

    const handleMouseUp = () => {
      setResizingBand(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingBand]);

  const handleBandResizeStart = (
    e: React.MouseEvent,
    index: number,
    bandEl: HTMLElement,
    handleType: 'width' | 'height' | 'both' | 'left-width'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBandIndex(index);
    setSelectedFieldIndex(null);

    const rect = bandEl.getBoundingClientRect();
    const parentRect = canvasContainerRef.current?.getBoundingClientRect() || { width: rect.width || 800 };

    setResizingBand({
      index,
      startX: e.clientX,
      startY: e.clientY,
      startWidthPx: rect.width,
      startHeightPx: rect.height,
      parentWidthPx: parentRect.width,
      handleType,
    });
  };

  const isDescendantOf = (bandsList: BandConfig[], childId: string, potentialParentId: string): boolean => {
    let current = bandsList.find(b => b.id === potentialParentId);
    while (current && current.parentBandId) {
      if (current.parentBandId === childId) return true;
      const nextParentId = current.parentBandId;
      current = bandsList.find(b => b.id === nextParentId);
    }
    return false;
  };

  const handleNestBand = (draggedIdx: number, parentBandId: string | undefined) => {
    const draggedBand = bands[draggedIdx];
    if (!draggedBand) return;

    if (parentBandId) {
      if (draggedBand.id === parentBandId) {
        showToast('یک باند نمی‌تواند به عنوان زیرباند خودش تنظیم شود.', 'warning');
        return;
      }
      if (isDescendantOf(bands, draggedBand.id, parentBandId)) {
        showToast('امکان قرار دادن باند والد در زیرباند‌های خودش وجود ندارد.', 'error');
        return;
      }
    }

    const updatedBands = [...bands];
    updatedBands[draggedIdx] = {
      ...draggedBand,
      parentBandId: parentBandId || undefined,
    };
    setBands(updatedBands);
    setDraggedBandIndex(null);
    const parentBand = bands.find(b => b.id === parentBandId);
    showToast(
      parentBand
        ? `باند «${draggedBand.title || 'بدون عنوان'}» به عنوان زیرباند «${parentBand.title || 'بدون عنوان'}» قرار گرفت.`
        : `باند «${draggedBand.title || 'بدون عنوان'}» به سطح اصلی منتقل گردید.`,
      'success'
    );
  };

  const handleAutoLayoutBandSiblings = (bIdx: number) => {
    const targetBand = bands[bIdx];
    if (!targetBand) return;

    const parentId = targetBand.parentBandId;
    const siblings = bands.filter(b => b.parentBandId === parentId);
    const count = siblings.length;
    if (count === 0) return;

    const percentage = Math.round(100 / count);
    const widthStr = `${percentage}%`;

    const updatedBands = bands.map(b => {
      if (b.parentBandId === parentId) {
        return { ...b, width: widthStr };
      }
      return b;
    });

    const updatedFields = [...fields];
    siblings.forEach(sib => {
      const sibFields = updatedFields.filter(f => f.bandId === sib.id);
      const fCount = sibFields.length;
      if (fCount > 0) {
        const fPct = Math.round(100 / fCount);
        const fWidthStr = `${fPct}%`;
        updatedFields.forEach((f, fIdx) => {
          if (f.bandId === sib.id) {
            updatedFields[fIdx] = {
              ...f,
              styles: {
                ...(f.styles || {}),
                width: fWidthStr,
              }
            };
          }
        });
      }
    });

    setBands(updatedBands);
    setFields(updatedFields);
    showToast(`چیدمان خودکار برای ${count} زیرباند (${widthStr} هرکدام) و فیلدهای داخلی انجام شد.`, 'success');
  };

  const handleAddBand = (parentBandId?: string) => {
    const newBandId = `band_${Date.now()}`;
    const themeBg = THEME_BG_COLORS[styles.themeColor] || '#f0f7ff';
    const themeBorder = THEME_BORDER_COLORS[styles.themeColor] || '#bfdbfe';
    const parentBand = typeof parentBandId === 'string' ? bands.find(b => b.id === parentBandId) : undefined;

    const newBand: BandConfig = {
      id: newBandId,
      title: parentBand ? `زیرباند ${parentBand.title || 'باند'}` : `باند شماره ${bands.length + 1}`,
      width: '100%',
      height: 'auto',
      margin: '6px 0px',
      padding: '12px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: themeBorder,
      bgColor: themeBg,
      borderRadius: '12px',
      parentBandId: parentBand ? parentBand.id : undefined,
    };

    let updatedBandsList = [...bands];
    if (parentBand) {
      const parentIdx = bands.findIndex(b => b.id === parentBand.id);
      updatedBandsList.splice(parentIdx + 1, 0, newBand);
      setSelectedBandIndex(parentIdx + 1);
    } else {
      updatedBandsList.push(newBand);
      setSelectedBandIndex(updatedBandsList.length - 1);
    }

    const siblings = updatedBandsList.filter(b => b.parentBandId === (parentBand ? parentBand.id : undefined));
    if (siblings.length > 0) {
      const percentage = Math.round(100 / siblings.length);
      const widthStr = `${percentage}%`;
      updatedBandsList = updatedBandsList.map(b => {
        if (b.parentBandId === (parentBand ? parentBand.id : undefined)) {
          return { ...b, width: widthStr };
        }
        return b;
      });
    }

    setBands(updatedBandsList);
    setSelectedFieldIndex(null);
    showToast(
      parentBand ? `زیرباند جدید درون «${parentBand.title || 'باند'}» ایجاد گردید و نسبت‌ها خودکار تنظیم شد.` : 'باند جدید ایجاد گردید.',
      'success'
    );
  };

  const handleDropBand = (targetIdx: number) => {
    if (draggedBandIndex === null || draggedBandIndex === targetIdx) return;
    const targetBand = bands[targetIdx];
    const draggedBand = bands[draggedBandIndex];
    if (!targetBand || !draggedBand) return;

    if (draggedBand.id !== targetBand.id && !isDescendantOf(bands, draggedBand.id, targetBand.id)) {
      handleNestBand(draggedBandIndex, targetBand.id);
    } else {
      const newBands = [...bands];
      const [dragged] = newBands.splice(draggedBandIndex, 1);
      newBands.splice(targetIdx, 0, dragged);
      setBands(newBands);
      setSelectedBandIndex(targetIdx);
      setDraggedBandIndex(null);
      showToast('باند با موفقیت به موقعیت جدید منتقل گردید.', 'info');
    }
  };

  const handleDropFieldOntoBand = (targetBandIndex: number, targetFieldIndex?: number) => {
    if (draggedFieldIndex === null) return;
    const targetBand = bands[targetBandIndex];
    if (!targetBand) return;

    const newFields = [...fields];
    const sourceField = newFields[draggedFieldIndex];
    if (!sourceField) return;

    sourceField.bandId = targetBand.id;

    if (targetFieldIndex !== undefined && targetFieldIndex !== draggedFieldIndex) {
      const [moved] = newFields.splice(draggedFieldIndex, 1);
      newFields.splice(targetFieldIndex, 0, moved);
    }

    setFields([...newFields]);
    setDraggedFieldIndex(null);
    showToast(`فیلد با موفقیت به ${targetBand.title || `باند شماره ${targetBandIndex + 1}`} منتقل گردید.`, 'success');
  };

  const handleThemeChange = (col: string) => {
    const themeBg = THEME_BG_COLORS[col] || '#f0f7ff';
    const themeBorder = THEME_BORDER_COLORS[col] || '#bfdbfe';
    const headerGradMap: Record<string, string> = {
      blue: 'from-blue-600 to-blue-500',
      emerald: 'from-emerald-600 to-emerald-500',
      cyan: 'from-cyan-600 to-cyan-500',
      rose: 'from-rose-600 to-rose-500',
    };
    setStyles((prev: any) => ({
      ...prev,
      themeColor: col,
      headerGradient: headerGradMap[col] || 'from-blue-600 to-blue-500',
    }));

    setBands(prevBands => prevBands.map(b => ({
      ...b,
      bgColor: themeBg,
      borderColor: themeBorder,
    })));
    showToast(`رنگ نمایه فرم به «${col}» تغییر یافت و رنگ بک‌گراند باندها همگام گردید.`, 'info');
  };

  const handleDeleteBand = (index: number) => {
    if (bands.length <= 1) {
      showToast('حداقل وجود یک باند در فرم الزامی است.', 'warning');
      return;
    }
    const bandToDelete = bands[index];
    const remainingBands = bands.filter((_, i) => i !== index);
    const fallbackBandId = remainingBands[0].id;

    setFields(prev => prev.map(f => f.bandId === bandToDelete.id ? { ...f, bandId: fallbackBandId } : f));
    setBands(remainingBands);
    setSelectedBandIndex(0);
    setSelectedFieldIndex(null);
    showToast('باند حذف گردید و فیلدهای آن به باند دیگر منتقل شدند.', 'info');
  };

  const handleMoveBand = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === bands.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...bands];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setBands(updated);
    if (selectedBandIndex === index) {
      setSelectedBandIndex(targetIndex);
    } else if (selectedBandIndex === targetIndex) {
      setSelectedBandIndex(index);
    }
  };

  const handleBandChange = (index: number, key: string, value: any) => {
    const updated = [...bands];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    setBands(updated);
  };
  const [resizingField, setResizingField] = useState<{
    index: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    handleType: 'width' | 'height' | 'both' | 'left-width';
  } | null>(null);

  useEffect(() => {
    if (!resizingField) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { index, startX, startY, startWidth, startHeight, handleType } = resizingField;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      setFields(prevFields => {
        const updated = [...prevFields];
        if (!updated[index]) return prevFields;

        let newWidth = startWidth;
        let newHeight = startHeight;

        if (handleType === 'width' || handleType === 'both') {
          newWidth = Math.max(120, Math.round(startWidth + deltaX));
        } else if (handleType === 'left-width') {
          newWidth = Math.max(120, Math.round(startWidth - deltaX));
        }

        if (handleType === 'height' || handleType === 'both') {
          newHeight = Math.max(36, Math.round(startHeight + deltaY));
        }

        const currentStyles = updated[index].styles || {};
        updated[index] = {
          ...updated[index],
          width: `${newWidth}px`,
          height: `${newHeight}px`,
          styles: {
            ...currentStyles,
            width: `${newWidth}px`,
            height: `${newHeight}px`,
          },
        };
        return updated;
      });
    };

    const handleMouseUp = () => {
      setResizingField(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingField]);

  const handleResizeStart = (
    e: React.MouseEvent,
    index: number,
    cardEl: HTMLElement,
    handleType: 'width' | 'height' | 'both' | 'left-width'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFieldIndex(index);

    const rect = cardEl.getBoundingClientRect();
    setResizingField({
      index,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      handleType,
    });
  };

  // Menu Placement State
  const [menuGroupId, setMenuGroupId] = useState('general_group');
  const [menuTitle, setMenuTitle] = useState('فرم ساز پویا (DFB)');
  const [isCustomMenuTitle, setIsCustomMenuTitle] = useState(false);
  const [customMenuTitle, setCustomMenuTitle] = useState('');

  const [subMenuTitle, setSubMenuTitle] = useState('فرم‌های ایجاد شده');
  const [isCustomSubMenuTitle, setIsCustomSubMenuTitle] = useState(false);
  const [customSubMenuTitle, setCustomSubMenuTitle] = useState('');

  // Custom Main & Sub Menus State from Zustand Store
  const { 
    customMainMenus, 
    customSubMenus, 
    hiddenMenus, 
    loadFromStorage, 
    setCustomMainMenus, 
    setCustomSubMenus, 
    setHiddenMenus,
    deleteCustomMainMenuNode, 
    deleteCustomSubMenuNode, 
    hideMenuKeys 
  } = useMenuStore();

  const [isMainMenuModalOpen, setIsMainMenuModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [newMenuGroupId, setNewMenuGroupId] = useState('general_group');
  const [newMenuTitle, setNewMenuTitle] = useState('');
  const [newMenuTitleEn, setNewMenuTitleEn] = useState('');
  const [newMenuPriority, setNewMenuPriority] = useState<string>('');
  const [newMenuIcon, setNewMenuIcon] = useState('Folder');
  const [newMenuColor, setNewMenuColor] = useState('#3b82f6');
  const [mainMenuError, setMainMenuError] = useState('');

  // Custom SubMenus Modal State
  const [isSubMenuModalOpen, setIsSubMenuModalOpen] = useState(false);
  const [editingSubMenuId, setEditingSubMenuId] = useState<string | null>(null);
  const [subMenuGroupId, setSubMenuGroupId] = useState('general_group');
  const [subMenuMainTitle, setSubMenuMainTitle] = useState('');
  const [newSubMenuTitleInput, setNewSubMenuTitleInput] = useState('');
  const [subMenuError, setSubMenuError] = useState('');

  // Create Form Modal State
  const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState(false);
  const [createFormTitle, setCreateFormTitle] = useState('');
  const [createFormCode, setCreateFormCode] = useState('');
  const [createFormComponent, setCreateFormComponent] = useState('SimpleForm');
  const [createFormDesc, setCreateFormDesc] = useState('');
  const [createMenuGroupId, setCreateMenuGroupId] = useState('general_group');
  const [createMenuTitle, setCreateMenuTitle] = useState('فرم ساز پویا (DFB)');
  const [createSubMenuTitle, setCreateSubMenuTitle] = useState('فرم‌های ایجاد شده');
  const [createFormError, setCreateFormError] = useState('');

  // Placement Edit Modal State
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);

  // Helper to get the last/highest priority number + 1
  const getNextAvailablePriority = () => {
    const builtinPriorities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const customPriorities = customMainMenus
      .map(m => Number(m.priority))
      .filter(p => !isNaN(p) && p > 0);
    const formPriorities = forms
      .map(f => Number(f.menuConfig?.priority))
      .filter(p => !isNaN(p) && p > 0);

    const allPriorities = [...builtinPriorities, ...customPriorities, ...formPriorities];
    const maxPriority = allPriorities.length > 0 ? Math.max(...allPriorities) : 0;
    return maxPriority + 1;
  };

  // Helper to find selected node in treeData
  const findNodeInTree = (nodes: TreeNodeItem[], id: string | null): TreeNodeItem | null => {
    if (!id) return null;
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children && n.children.length > 0) {
        const found = findNodeInTree(n.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper to open create main menu modal with default last priority
  const handleOpenCreateMainMenuModal = (targetGroupId?: string) => {
    setEditingMenuId(null);
    const targetNode = selectedTreeNodeId ? findNodeInTree(treeData, selectedTreeNodeId) : null;
    const gId = targetGroupId || targetNode?.groupId || menuGroupId || 'general_group';
    setNewMenuGroupId(gId);
    setNewMenuTitle('');
    setNewMenuTitleEn('');
    setNewMenuPriority(String(getNextAvailablePriority()));
    setNewMenuIcon('Folder');
    setNewMenuColor('#3b82f6');
    setMainMenuError('');
    setIsMainMenuModalOpen(true);
  };

  const handleEditMainMenu = (node: TreeNodeItem) => {
    const existingCustom = customMainMenus.find(m => m.id === node.groupId || m.id === node.id || m.title === node.title);
    if (existingCustom) {
      setEditingMenuId(existingCustom.id);
      setNewMenuGroupId(existingCustom.groupId || 'general_group');
      setNewMenuTitle(existingCustom.title);
      setNewMenuTitleEn(existingCustom.titleEn || '');
      setNewMenuPriority(String(existingCustom.priority));
      setNewMenuIcon(existingCustom.icon || 'Folder');
      setNewMenuColor(existingCustom.color || '#3b82f6');
    } else {
      setEditingMenuId(node.id);
      setNewMenuGroupId(node.groupId || 'general_group');
      setNewMenuTitle(node.title);
      setNewMenuTitleEn(node.title);
      setNewMenuPriority(String(getNextAvailablePriority()));
      setNewMenuIcon('Folder');
      setNewMenuColor('#3b82f6');
    }
    setMainMenuError('');
    setIsMainMenuModalOpen(true);
  };

  // Load saved custom menus from localStorage
  const loadSavedMenus = () => {
    try {
      loadFromStorage();
    } catch (e) {
      console.error('Error reading custom menus:', e);
    }
  };

  useEffect(() => {
    loadSavedMenus();

    const handleUpdate = () => {
      loadSavedMenus();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('parsa_custom_menus_updated', handleUpdate);
      window.addEventListener('storage', handleUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('parsa_custom_menus_updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      }
    };
  }, []);

  // Set default priority to last/highest priority + 1 when modal opens
  useEffect(() => {
    if (isMainMenuModalOpen && (!newMenuPriority || newMenuPriority === '0')) {
      setNewMenuPriority(String(getNextAvailablePriority()));
    }
  }, [isMainMenuModalOpen]);

  // Save Main Menu Handler with full validations
  const handleSaveMainMenu = () => {
    setMainMenuError('');

    const title = newMenuTitle.trim();
    const titleEn = newMenuTitleEn.trim();
    const priorityStr = String(newMenuPriority).trim();
    const icon = newMenuIcon.trim();
    const color = newMenuColor.trim();

    // 1. Mandatory Fields Validation
    if (!title || !titleEn || !priorityStr || !icon || !color) {
      setMainMenuError('تمامی فیلدها (عنوان، عنوان انگلیسی، اولویت، آیکون و رنگ) اجباری بوده و باید تکمیل گردند.');
      return;
    }

    const priorityNum = Number(priorityStr);
    if (isNaN(priorityNum) || priorityNum <= 0) {
      setMainMenuError('اولویت نمایش باید یک عدد مثبت معتبر باشد.');
      return;
    }

    // 2. Priority Uniqueness Check
    const otherCustoms = editingMenuId 
      ? customMainMenus.filter(m => m.id !== editingMenuId)
      : customMainMenus;

    const builtinPriorities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const customPriorities = otherCustoms.map(m => Number(m.priority));
    const formPriorities = forms
      .map(f => Number(f.menuConfig?.priority))
      .filter(p => !isNaN(p) && p > 0);

    const allUsedPriorities = new Set([
      ...builtinPriorities,
      ...customPriorities,
      ...formPriorities
    ]);

    if (allUsedPriorities.has(priorityNum)) {
      setMainMenuError(`فیلد اولویت نمایش «${priorityNum}» تکراری است. لطفاً عدد دیگری تعیین کنید.`);
      return;
    }

    let updated: CustomMainMenu[];
    if (editingMenuId) {
      const idx = customMainMenus.findIndex(m => m.id === editingMenuId);
      if (idx >= 0) {
        updated = [...customMainMenus];
        updated[idx] = {
          ...updated[idx],
          groupId: newMenuGroupId,
          title,
          titleEn,
          priority: priorityNum,
          icon,
          color
        };
      } else {
        const editedMenu: CustomMainMenu = {
          id: editingMenuId,
          groupId: newMenuGroupId,
          title,
          titleEn,
          priority: priorityNum,
          icon,
          color
        };
        updated = [...customMainMenus, editedMenu];
      }
      showToast(`منوی اصلی «${title}» با موفقیت ویرایش شد.`, 'success');
    } else {
      const newMenu: CustomMainMenu = {
        id: `custom_menu_${Date.now()}`,
        groupId: newMenuGroupId,
        title,
        titleEn,
        priority: priorityNum,
        icon,
        color
      };
      updated = [...customMainMenus, newMenu];
      setMenuGroupId(newMenu.id);
      setMenuTitle('عملیات');
      setIsCustomMenuTitle(false);
      setCustomMenuTitle('');
      showToast(`منوی اصلی «${title}» با موفقیت ایجاد شد.`, 'success');
    }

    setCustomMainMenus(updated);

    setIsMainMenuModalOpen(false);
    setEditingMenuId(null);
    setNewMenuTitle('');
    setNewMenuTitleEn('');
    setNewMenuPriority('');
    setNewMenuIcon('Folder');
    setNewMenuColor('#3b82f6');
    setMainMenuError('');
  };

  const handleDeleteMainMenu = async (node: TreeNodeItem) => {
    const isConfirmed = await confirm({
      message: `آیا از حذف ${node.title} اطمینان دارید؟`
    });
    if (!isConfirmed) {
      return;
    }

    const hasChildren = node.children && node.children.length > 0;
    if (hasChildren) {
      showToast('امکان حذف این منوی اصلی به دلیل داشتن زیرمنو یا فرم وجود ندارد.', 'error');
      return;
    }

    deleteCustomMainMenuNode(node);
    showToast(`منوی اصلی «${node.title}» با موفقیت حذف شد.`, 'success');
  };

  // Custom SubMenu Handlers
  const handleOpenCreateSubMenuModal = (gId?: string, mTitle?: string) => {
    if (!selectedTreeNodeId) {
      showToast('لطفاً ابتدا یک شاخه از درختواره منوهای سیستم را انتخاب کنید.', 'error');
      return;
    }
    setEditingSubMenuId(null);
    const targetGId = gId || selectedTreeNode?.groupId || 'general_group';
    const targetMTitle = mTitle || selectedTreeNode?.menuTitle || selectedTreeNode?.title || 'اطلاعات پایه';

    setSubMenuGroupId(targetGId);
    setSubMenuMainTitle(targetMTitle);
    setNewSubMenuTitleInput('');
    setSubMenuError('');
    setIsSubMenuModalOpen(true);
  };

  const handleEditSubMenu = (node: TreeNodeItem) => {
    const existing = customSubMenus.find(s => s.id === node.id || (s.groupId === node.groupId && s.menuTitle === node.menuTitle && s.title === node.title));
    if (existing) {
      setEditingSubMenuId(existing.id);
    } else {
      setEditingSubMenuId(node.id);
    }
    setSubMenuGroupId(node.groupId);
    setSubMenuMainTitle(node.menuTitle || node.title);
    setNewSubMenuTitleInput(node.title);
    setSubMenuError('');
    setIsSubMenuModalOpen(true);
  };

  const handleSaveSubMenu = () => {
    setSubMenuError('');
    const title = newSubMenuTitleInput.trim();
    if (!title) {
      setSubMenuError('لطفاً عنوان زیرمنو را وارد کنید.');
      return;
    }

    let updated: CustomSubMenu[];
    if (editingSubMenuId) {
      const idx = customSubMenus.findIndex(s => s.id === editingSubMenuId);
      if (idx >= 0) {
        updated = [...customSubMenus];
        updated[idx] = {
          ...updated[idx],
          title
        };
      } else {
        updated = [
          ...customSubMenus,
          {
            id: editingSubMenuId,
            groupId: subMenuGroupId,
            menuTitle: subMenuMainTitle,
            title
          }
        ];
      }
      showToast(`زیرمنوی «${title}» با موفقیت ویرایش شد.`, 'success');
    } else {
      const newSub: CustomSubMenu = {
        id: `custom_sub_${Date.now()}`,
        groupId: subMenuGroupId,
        menuTitle: subMenuMainTitle,
        title
      };
      updated = [...customSubMenus, newSub];
      showToast(`زیرمنوی «${title}» با موفقیت ایجاد شد.`, 'success');
    }

    setCustomSubMenus(updated);

    setIsSubMenuModalOpen(false);
    setEditingSubMenuId(null);
    setNewSubMenuTitleInput('');
    setSubMenuError('');
  };

  const handleDeleteSubMenu = async (node: TreeNodeItem) => {
    const isConfirmed = await confirm({
      message: `آیا از حذف ${node.title} اطمینان دارید؟`
    });
    if (!isConfirmed) {
      return;
    }

    const hasSubmenuChildren = node.children && node.children.some(c => c.type === 'submenu');
    const hasFormChildren = node.children && node.children.some(c => c.type === 'form');
    const isDeleteDisabled = node.children && node.children.length > 0;

    if (isDeleteDisabled) {
      if (hasSubmenuChildren && hasFormChildren) {
        showToast('امکان حذف این زیرمنو به دلیل داشتن زیرمنو و فرم وجود ندارد.', 'error');
      } else if (hasSubmenuChildren) {
        showToast('امکان حذف این زیرمنو به دلیل داشتن زیرمنو وجود ندارد.', 'error');
      } else if (hasFormChildren) {
        showToast('امکان حذف این زیرمنو به دلیل داشتن فرم وجود ندارد.', 'error');
      } else {
        showToast('امکان حذف این زیرمنو به دلیل داشتن زیرمنو یا فرم وجود ندارد.', 'error');
      }
      return;
    }

    deleteCustomSubMenuNode(node);
    showToast(`زیرمنوی «${node.title}» با موفقیت حذف شد.`, 'success');
  };

  const allDashboardGroups = useMemo(() => {
    const custom = customMainMenus.map(m => ({
      id: m.id,
      name: m.title
    }));
    return [...DASHBOARD_GROUPS, ...custom];
  }, [customMainMenus]);

  const availableGroupMainMenus = useMemo(() => {
    const builtin = GROUP_MAIN_MENUS[menuGroupId] || ['اطلاعات پایه', 'عملیات', 'گزارشات', 'فهرست‌ها', 'فرم‌های ایجاد شده'];
    const customForGroup = customMainMenus
      .filter(m => m.groupId === menuGroupId)
      .map(m => m.title);
    return Array.from(new Set([...builtin, ...customForGroup]));
  }, [menuGroupId, customMainMenus]);

  // Fetch Forms list
  const fetchForms = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/dfb/forms');
      if (res.ok) {
        const json = await res.json();
        const loadedForms = json.data || [];
        setForms(loadedForms);
      } else {
        showToast('خطا در بارگذاری فهرست فرم‌ها', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleOpenCreateFormModal = (gId?: string, mTitle?: string, sTitle?: string) => {
    if (!selectedTreeNodeId) {
      showToast('لطفاً ابتدا یک شاخه از درختواره منوهای سیستم را انتخاب کنید.', 'error');
      return;
    }
    const targetGroup = gId || selectedTreeNode?.groupId || menuGroupId || 'general_group';

    let targetMenu = mTitle;
    if (targetMenu === undefined) {
      if (selectedTreeNode?.type === 'menu') {
        targetMenu = selectedTreeNode.menuTitle || selectedTreeNode.title;
      } else if (selectedTreeNode?.type === 'submenu' || selectedTreeNode?.type === 'form') {
        targetMenu = selectedTreeNode.menuTitle || '';
      } else {
        targetMenu = isCustomMenuTitle ? customMenuTitle : '';
      }
    }

    let targetSub = sTitle;
    if (targetSub === undefined) {
      if (selectedTreeNode?.type === 'submenu') {
        targetSub = selectedTreeNode.subMenuTitle || selectedTreeNode.title;
      } else if (selectedTreeNode?.type === 'form') {
        targetSub = selectedTreeNode.subMenuTitle || '';
      } else {
        targetSub = isCustomSubMenuTitle ? customSubMenuTitle : '';
      }
    }

    setCreateFormTitle('');
    setCreateFormCode('');
    setCreateFormComponent('SimpleForm');
    setCreateFormDesc('');
    setCreateMenuGroupId(targetGroup);
    setCreateMenuTitle(targetMenu || '');
    setCreateSubMenuTitle(targetSub || '');
    setCreateFormError('');
    setIsCreateFormModalOpen(true);
  };

  const handleConfirmCreateFormModal = () => {
    setCreateFormError('');

    const title = createFormTitle.trim();
    if (!title) {
      setCreateFormError('لطفاً عنوان فارسی فرم را وارد کنید.');
      return;
    }

    const code = createFormCode.trim();
    if (!code) {
      setCreateFormError('لطفاً کد اختصاصی فرم (لاتین) را وارد کنید.');
      return;
    }

    const isLatinOnly = /^[a-zA-Z0-9_]+$/.test(code);
    if (!isLatinOnly) {
      setCreateFormError('کد اختصاصی فرم فقط باید شامل حروف انگلیسی، اعداد و خط زیر (_) باشد و حروف فارسی مجاز نیست.');
      return;
    }

    // Check code uniqueness among existing forms
    const codeExists = forms.some(f => f.formCode?.toLowerCase() === code.toLowerCase());
    if (codeExists) {
      setCreateFormError(`فرم دیگری با کد اختصاصی «${code}» قبلاً ثبت شده است. لطفاً کد دیگری وارد کنید.`);
      return;
    }

    // Initial fields based on selected base template structure
    let initialFields: any[] = [];
    if (createFormComponent === 'SimpleFormTwoRow') {
      initialFields = [
        {
          name: 'field_1',
          label: 'کد / شناسه',
          type: 'text',
          required: true,
          placeholder: 'وارد کنید...',
          colSpan: 1,
          styles: { fontFamily: 'font-sans', fontSize: 'text-sm' }
        },
        {
          name: 'field_2',
          label: 'عنوان اطلاعات',
          type: 'text',
          required: true,
          placeholder: 'وارد کنید...',
          colSpan: 1,
          styles: { fontFamily: 'font-sans', fontSize: 'text-sm' }
        },
        {
          name: 'field_3',
          label: 'نوع دسته بندی',
          type: 'select',
          required: false,
          options: [{ value: '1', label: 'عمومی' }, { value: '2', label: 'تخصصی' }],
          colSpan: 1,
          styles: { fontFamily: 'font-sans', fontSize: 'text-sm' }
        },
        {
          name: 'field_4',
          label: 'تاریخ ثبت',
          type: 'date',
          required: false,
          colSpan: 1,
          styles: { fontFamily: 'font-sans', fontSize: 'text-sm' }
        },
      ];
    } else if (createFormComponent === 'SimpleFormTabbed') {
      initialFields = [
        {
          name: 'field_1',
          label: 'عنوان اصلی',
          type: 'text',
          required: true,
          placeholder: 'وارد کنید...',
          colSpan: 1,
          styles: { fontFamily: 'font-sans', fontSize: 'text-sm' }
        },
        {
          name: 'field_2',
          label: 'تاریخ ثبت',
          type: 'date',
          required: false,
          colSpan: 1,
          styles: { fontFamily: 'font-sans', fontSize: 'text-sm' }
        },
        {
          name: 'field_3',
          label: 'توضیحات و یادداشت‌ها',
          type: 'textarea',
          required: false,
          placeholder: 'توضیحات تکمیلی...',
          colSpan: 2,
          styles: { fontFamily: 'font-sans', fontSize: 'text-sm' }
        },
      ];
    } else {
      initialFields = [
        {
          name: 'field_1',
          label: 'عنوان رکورد',
          type: 'text',
          required: true,
          placeholder: 'وارد کنید...',
          colSpan: 1,
          styles: { fontFamily: 'font-sans', fontSize: 'text-sm' }
        },
        {
          name: 'field_2',
          label: 'تاریخ ثبت',
          type: 'date',
          required: false,
          colSpan: 1,
          styles: { fontFamily: 'font-sans', fontSize: 'text-sm' }
        },
      ];
    }

    setSelectedForm(null);
    setFormCode(code);
    setFormTitle(title);
    setFormComponent(createFormComponent);
    setFormDesc(createFormDesc.trim());
    setMenuGroupId(createMenuGroupId);

    const knownMenus = GROUP_MAIN_MENUS[createMenuGroupId] || [];
    if (knownMenus.includes(createMenuTitle)) {
      setMenuTitle(createMenuTitle);
      setIsCustomMenuTitle(false);
      setCustomMenuTitle('');
    } else {
      setMenuTitle('custom');
      setIsCustomMenuTitle(true);
      setCustomMenuTitle(createMenuTitle);
    }

    if (SUBMENU_PRESETS.includes(createSubMenuTitle)) {
      setSubMenuTitle(createSubMenuTitle);
      setIsCustomSubMenuTitle(false);
      setCustomSubMenuTitle('');
    } else {
      setSubMenuTitle('custom');
      setIsCustomSubMenuTitle(true);
      setCustomSubMenuTitle(createSubMenuTitle);
    }

    const loadedBands = [DEFAULT_BAND];
    setBands(loadedBands);
    setSelectedBandIndex(0);

    const fieldsWithBand = initialFields.map(f => ({ ...f, bandId: f.bandId || loadedBands[0].id }));
    setFields(fieldsWithBand);
    setShowPrintList(false);
    setShowVoucherActionbar(false);
    setSelectedFieldIndex(0);
    setEditorTab('canvas');
    setIsCreating(true);
    setIsEditing(true);
    setShowTreePanel(false);
    setIsCreateFormModalOpen(false);

    showToast(`فرم «${title}» با موفقیت ایجاد شد و آماده طراحی است.`, 'success');
  };

  const handleCreateNew = (gId?: string, mTitle?: string, sTitle?: string) => {
    handleOpenCreateFormModal(gId, mTitle, sTitle);
  };

  const handleEditForm = (form: any) => {
    setSelectedForm(form);
    setFormCode(form.formCode);
    setFormTitle(form.title);
    setFormDesc(form.description || '');
    setFormComponent(form.componentName || 'SimpleForm');
    setShowPrintList(!!form.showPrintList || !!form.options?.showPrintList);
    setShowVoucherActionbar(!!form.showVoucherActionbar || !!form.options?.showVoucherActionbar);

    const loadedBands = (form.bands && Array.isArray(form.bands) && form.bands.length > 0) ? form.bands : [DEFAULT_BAND];
    setBands(loadedBands);
    setSelectedBandIndex(0);

    const validBandIds = new Set(loadedBands.map((b: any) => b.id));
    const fallbackBandId = loadedBands[0]?.id || DEFAULT_BAND.id;

    let rawFields = (form.fields && Array.isArray(form.fields) && form.fields.length > 0) ? form.fields : [];
    if (rawFields.length === 0) {
      if (form.formCode === 'CustomerGroup' || form.formCode === 'customer-groups' || form.title?.includes('مشتریان')) {
        rawFields = [
          { name: 'code', label: 'کد (شاخه اصلی)', type: 'text', required: true, colSpan: 1, bandId: fallbackBandId },
          { name: 'title', label: 'عنوان', type: 'text', required: true, colSpan: 1, bandId: fallbackBandId },
          { name: 'description', label: 'توضیحات', type: 'textarea', required: false, colSpan: 2, bandId: fallbackBandId },
        ];
      } else {
        rawFields = [
          { name: 'code', label: 'کد / شناسه', type: 'text', required: true, colSpan: 1, bandId: fallbackBandId },
          { name: 'title', label: 'عنوان رکورد', type: 'text', required: true, colSpan: 1, bandId: fallbackBandId },
          { name: 'date', label: 'تاریخ ثبت', type: 'date', required: false, colSpan: 1, bandId: fallbackBandId },
          { name: 'description', label: 'توضیحات', type: 'textarea', required: false, colSpan: 2, bandId: fallbackBandId },
        ];
      }
    }

    const loadedFields = rawFields.map((f: any) => ({
      ...f,
      bandId: (f.bandId && validBandIds.has(f.bandId)) ? f.bandId : fallbackBandId,
    }));
    setFields(loadedFields);

    setStyles(form.styles || {
      themeColor: 'blue',
      fontSize: 'text-sm',
      fontFamily: 'font-sans',
      headerGradient: 'from-blue-600 to-blue-500',
    });

    const mConfig = form.menuConfig || {};
    const gId = mConfig.groupId || 'general_group';
    const mTitle = mConfig.menuTitle !== undefined ? mConfig.menuTitle : '';
    const sTitle = mConfig.subMenuTitle !== undefined ? mConfig.subMenuTitle : '';

    setMenuGroupId(gId);

    const knownMenus = GROUP_MAIN_MENUS[gId] || [];
    if (knownMenus.includes(mTitle)) {
      setMenuTitle(mTitle);
      setIsCustomMenuTitle(false);
      setCustomMenuTitle('');
    } else {
      setMenuTitle('custom');
      setIsCustomMenuTitle(true);
      setCustomMenuTitle(mTitle);
    }

    if (SUBMENU_PRESETS.includes(sTitle)) {
      setSubMenuTitle(sTitle);
      setIsCustomSubMenuTitle(false);
      setCustomSubMenuTitle('');
    } else {
      setSubMenuTitle('custom');
      setIsCustomSubMenuTitle(true);
      setCustomSubMenuTitle(sTitle);
    }

    setSelectedFieldIndex(null);
    setEditorTab('canvas');
    setIsCreating(false);
    setIsEditing(true);
    setShowTreePanel(false);
  };

  const handleAddField = (targetBandId?: string) => {
    let activeBandId = targetBandId;
    if (!activeBandId) {
      if (selectedBandIndex !== null && bands[selectedBandIndex]) {
        activeBandId = bands[selectedBandIndex].id;
      } else if (bands.length > 0) {
        activeBandId = bands[0].id;
      } else {
        const defaultB = { ...DEFAULT_BAND };
        setBands([defaultB]);
        activeBandId = defaultB.id;
      }
    }

    const newField = {
      name: `field_${Date.now()}`,
      label: 'نام فیلد جدید',
      type: 'text',
      required: false,
      placeholder: 'وارد کنید...',
      colSpan: 1,
      bandId: activeBandId,
      options: [
        { value: 'option1', label: 'گزینه ۱' },
        { value: 'option2', label: 'گزینه ۲' },
      ],
      styles: {
        fontFamily: 'font-sans',
        fontSize: 'text-sm',
        textColor: '#1f2937',
        bgColor: '#ffffff',
      },
    };
    setFields(prev => [...prev, newField]);
    setSelectedFieldIndex(fields.length);
    showToast('فیلد جدید داخل باند قرار گرفت.', 'success');
  };

  const handleDeleteField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
    if (selectedFieldIndex === index) {
      setSelectedFieldIndex(null);
    } else if (selectedFieldIndex !== null && selectedFieldIndex > index) {
      setSelectedFieldIndex(selectedFieldIndex - 1);
    }
    showToast('فیلد حذف شد.', 'success');
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setFields(updated);
    if (selectedFieldIndex === index) {
      setSelectedFieldIndex(targetIndex);
    } else if (selectedFieldIndex === targetIndex) {
      setSelectedFieldIndex(index);
    }
  };

  const handleFieldChange = (index: number, key: string, value: any) => {
    const updated = [...fields];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    setFields(updated);
  };

  const handleFieldStyleChange = (index: number, key: string, value: any) => {
    const updated = [...fields];
    const fieldStyles = updated[index].styles || {};
    updated[index] = {
      ...updated[index],
      styles: {
        ...fieldStyles,
        [key]: value,
      },
    };
    setFields(updated);
  };

  const handleSaveForm = async () => {
    if (!formCode || !formTitle) {
      showToast('لطفا کد فرم و عنوان فرم را وارد کنید.', 'error');
      return;
    }

    const finalMenuTitle = isCustomMenuTitle ? customMenuTitle.trim() : menuTitle;
    const finalSubMenuTitle = isCustomSubMenuTitle ? customSubMenuTitle.trim() : subMenuTitle;

    const payload = {
      formCode,
      title: formTitle,
      description: formDesc,
      componentName: formComponent,
      bands,
      fields,
      styles,
      showPrintList,
      showVoucherActionbar,
      options: {
        showPrintList,
        showVoucherActionbar,
      },
      menuConfig: {
        groupId: menuGroupId,
        menuTitle: finalMenuTitle || 'فرم ساز پویا (DFB)',
        subMenuTitle: finalSubMenuTitle || 'فرم‌های ایجاد شده',
      },
    };

    try {
      let res;
      if (isCreating) {
        res = await apiFetch('/api/dfb/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch(`/api/dfb/forms/${selectedForm.dynamicFormId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const json = await res.json();
        showToast('فرم پویا با موفقیت ذخیره شد.', 'success');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('parsa_custom_menus_updated'));
        }
        fetchForms();
        if (json.data) {
          handleEditForm(json.data);
        }
      } else {
        const json = await res.json();
        showToast(json.message || 'خطا در ذخیره‌سازی فرم', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    }
  };

  const handleDeleteForm = async (targetFormParam?: any) => {
    const formToDelete = targetFormParam || selectedForm;
    if (!formToDelete) return;
    const title = formToDelete.title || 'فرم';
    const isConfirmed = await confirm({
      message: `آیا از حذف ${title} اطمینان دارید؟`
    });
    if (!isConfirmed) return;

    try {
      const res = await apiFetch(`/api/dfb/forms/${formToDelete.dynamicFormId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`فرم «${title}» با موفقیت حذف شد.`, 'success');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('parsa_custom_menus_updated'));
        }
        if (selectedForm?.dynamicFormId === formToDelete.dynamicFormId) {
          setSelectedForm(null);
          handleCreateNew();
        }
        fetchForms();
      } else {
        showToast('خطا در حذف فرم', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    }
  };

  // Construct Full Tree Structure matching Dashboard Sidebar
  const treeData = useMemo(() => {
    const groupsMap = new Map<string, TreeNodeItem>();

    DASHBOARD_GROUPS.forEach(g => {
      const sbGroup = SIDEBAR_STRUCTURE.find(s => s.id === g.id);
      const mainMenusMap = new Map<string, TreeNodeItem>();

      if (sbGroup && sbGroup.items) {
        sbGroup.items.forEach(sbItem => {
          const subMenusMap = new Map<string, TreeNodeItem>();
          if (sbItem.subItems) {
            sbItem.subItems.forEach(sbSub => {
              const subFormChildren: TreeNodeItem[] = [];
              if (sbSub.subItems) {
                sbSub.subItems.forEach((subForm: any) => {
                  subFormChildren.push({
                    id: `form_sys_${subForm.id || subForm.componentName || subForm.title}`,
                    title: t(subForm.id || subForm.componentName || subForm.title, subForm.title),
                    type: 'form',
                    groupId: g.id,
                    menuTitle: t(sbItem.id || sbItem.title, sbItem.title),
                    subMenuTitle: t(sbSub.id || sbSub.title, sbSub.title),
                    form: {
                      title: subForm.title,
                      componentName: subForm.componentName,
                      path: subForm.path,
                      formCode: subForm.id,
                      isSystemForm: true,
                    },
                    children: [],
                    formCount: 1,
                  });
                });
              }

              subMenusMap.set(sbSub.title, {
                id: `sub_${g.id}_${sbItem.title}_${sbSub.title}`,
                title: t(sbSub.id || sbSub.title, sbSub.title),
                type: 'submenu',
                groupId: g.id,
                menuTitle: t(sbItem.id || sbItem.title, sbItem.title),
                subMenuTitle: t(sbSub.id || sbSub.title, sbSub.title),
                children: subFormChildren,
                formCount: subFormChildren.length,
              });
            });
          }

          mainMenusMap.set(sbItem.title, {
            id: `menu_${g.id}_${sbItem.title}`,
            title: t(sbItem.id || sbItem.title, sbItem.title),
            type: 'menu',
            groupId: g.id,
            menuTitle: t(sbItem.id || sbItem.title, sbItem.title),
            subMenuTitle: '',
            children: Array.from(subMenusMap.values()),
            formCount: 0,
          });
        });
      }

      groupsMap.set(g.id, {
        id: `group_${g.id}`,
        title: t(g.id, g.name),
        type: 'group',
        groupId: g.id,
        menuTitle: '',
        subMenuTitle: '',
        children: Array.from(mainMenusMap.values()),
        formCount: 0,
      });
    });

    // Pre-populate custom main menus as standalone top-level root groups (سرشاخه‌های اصلی)
    customMainMenus.forEach(cm => {
      let existingGroup = groupsMap.get(cm.id) || Array.from(groupsMap.values()).find(g => g.id === cm.id || g.groupId === cm.id || g.title === cm.title);
      if (!existingGroup) {
        groupsMap.set(cm.id, {
          id: cm.id,
          title: cm.title,
          type: 'group',
          groupId: cm.id,
          menuTitle: '',
          subMenuTitle: '',
          children: [],
          formCount: 0,
        });
      }
    });

    // Pre-populate custom submenus
    customSubMenus.forEach(cs => {
      // 1. Try to match by cs.menuTitle
      let groupNode = Array.from(groupsMap.values()).find(g => 
        cs.menuTitle && (g.title === cs.menuTitle || g.id === cs.menuTitle || g.groupId === cs.menuTitle || g.id === `group_${cs.menuTitle}`)
      );

      // 2. If no title match, try matching by cs.groupId
      if (!groupNode && cs.groupId) {
        groupNode = Array.from(groupsMap.values()).find(g => 
          g.id === cs.groupId || g.groupId === cs.groupId || g.title === cs.groupId || g.id === `group_${cs.groupId}`
        );
      }

      if (!groupNode) {
        groupNode = groupsMap.get(cs.groupId) || groupsMap.get('general_group');
      }

      if (groupNode) {
        if (cs.menuTitle === groupNode.title || !cs.menuTitle || cs.menuTitle === groupNode.groupId || cs.menuTitle === groupNode.id) {
          // If menuTitle matches groupNode.title or is empty, attach subNode directly under groupNode
          let subNode = groupNode.children.find(c => c.id === cs.id || c.subMenuTitle === cs.title || c.title === cs.title);
          if (!subNode) {
            subNode = {
              id: cs.id || `sub_${cs.groupId}_${cs.menuTitle}_${cs.title}`,
              title: cs.title,
              type: 'submenu',
              groupId: groupNode.groupId || cs.groupId,
              menuTitle: cs.menuTitle || groupNode.title,
              subMenuTitle: cs.title,
              children: [],
              formCount: 0,
            };
            groupNode.children.push(subNode);
          } else {
            if (cs.id && subNode.id !== cs.id) {
              subNode.id = cs.id;
            }
          }
        } else {
          let menuNode = groupNode.children.find(c => c.menuTitle === cs.menuTitle || c.title === cs.menuTitle);
          if (!menuNode) {
            menuNode = {
              id: `menu_${cs.groupId}_${cs.menuTitle}`,
              title: cs.menuTitle,
              type: 'menu',
              groupId: cs.groupId,
              menuTitle: cs.menuTitle,
              subMenuTitle: '',
              children: [],
              formCount: 0,
            };
            groupNode.children.push(menuNode);
          }
          let subNode = menuNode.children.find(c => c.id === cs.id || c.subMenuTitle === cs.title || c.title === cs.title);
          if (!subNode) {
            subNode = {
              id: cs.id || `sub_${cs.groupId}_${cs.menuTitle}_${cs.title}`,
              title: cs.title,
              type: 'submenu',
              groupId: groupNode.groupId,
              menuTitle: cs.menuTitle,
              subMenuTitle: cs.title,
              children: [],
              formCount: 0,
            };
            menuNode.children.push(subNode);
          } else {
            if (cs.id && subNode.id !== cs.id) {
              subNode.id = cs.id;
            }
          }
        }
      }
    });

    // Attach forms
    forms.forEach(form => {
      const mConfig = form.menuConfig || {};
      const gId = mConfig.groupId || 'general_group';
      const mTitle = mConfig.menuTitle || 'فرم ساز پویا (DFB)';
      const sTitle = mConfig.subMenuTitle || 'فرم‌های ایجاد شده';

      // 1. Try to match by mTitle first
      let groupNode = Array.from(groupsMap.values()).find(g => 
        mTitle && (g.title === mTitle || g.id === mTitle || g.groupId === mTitle || g.id === `group_${mTitle}`)
      );

      // 2. If no title match, try matching by gId
      if (!groupNode && gId) {
        groupNode = Array.from(groupsMap.values()).find(g => 
          g.id === gId || g.groupId === gId || g.title === gId || g.id === `group_${gId}`
        );
      }

      if (!groupNode) {
        groupNode = groupsMap.get(gId) || groupsMap.get('general_group')!;
      }

      let targetParent: TreeNodeItem;

      if (mTitle === groupNode.title || !mTitle) {
        if (sTitle) {
          let subNode = groupNode.children.find(c => c.subMenuTitle === sTitle || c.title === sTitle);
          if (!subNode) {
            subNode = {
              id: `sub_${gId}_${mTitle}_${sTitle}`,
              title: sTitle,
              type: 'submenu',
              groupId: gId,
              menuTitle: mTitle,
              subMenuTitle: sTitle,
              children: [],
              formCount: 0,
            };
            groupNode.children.push(subNode);
          }
          targetParent = subNode;
        } else {
          targetParent = groupNode;
        }
      } else {
        let menuNode = groupNode.children.find(c => c.menuTitle === mTitle || c.title === mTitle);
        if (!menuNode) {
          menuNode = {
            id: `menu_${gId}_${mTitle}`,
            title: mTitle,
            type: 'menu',
            groupId: gId,
            menuTitle: mTitle,
            subMenuTitle: '',
            children: [],
            formCount: 0,
          };
          groupNode.children.push(menuNode);
        }

        targetParent = menuNode;

        if (sTitle) {
          let subNode = menuNode.children.find(c => c.subMenuTitle === sTitle || c.title === sTitle);
          if (!subNode) {
            subNode = {
              id: `sub_${gId}_${mTitle}_${sTitle}`,
              title: sTitle,
              type: 'submenu',
              groupId: gId,
              menuTitle: mTitle,
              subMenuTitle: sTitle,
              children: [],
              formCount: 0,
            };
            menuNode.children.push(subNode);
          }
          targetParent = subNode;
        }
      }

      const formNode: TreeNodeItem = {
        id: `form_${form.formCode || form.id}`,
        title: form.title,
        type: 'form',
        groupId: gId,
        menuTitle: mTitle,
        subMenuTitle: sTitle,
        form,
        children: [],
        formCount: 1,
      };

      targetParent.children.push(formNode);
    });

    // Compute Form Counts
    const computeCounts = (node: TreeNodeItem): number => {
      if (node.type === 'form') return 1;
      let count = 0;
      node.children.forEach(child => {
        count += computeCounts(child);
      });
      node.formCount = count;
      return count;
    };

    const treeList = Array.from(groupsMap.values());
    treeList.forEach(g => computeCounts(g));

    const searchQuery = searchTree.trim().toLowerCase();

    const isHidden = (node: TreeNodeItem) => {
      if (!hiddenMenus || hiddenMenus.length === 0) return false;
      return hiddenMenus.includes(node.id);
    };

    const filterNode = (node: TreeNodeItem): TreeNodeItem | null => {
      if (isHidden(node)) return null;

      const matchesQuery = !searchQuery || node.title.toLowerCase().includes(searchQuery) || (node.form && (node.form.formCode?.toLowerCase().includes(searchQuery) || node.form.title?.toLowerCase().includes(searchQuery)));

      const filteredChildren = node.children
        .map(child => filterNode(child))
        .filter((c): c is TreeNodeItem => c !== null);

      if (matchesQuery || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    };

    return treeList
      .map(g => filterNode(g))
      .filter((g): g is TreeNodeItem => g !== null);
  }, [forms, searchTree, customMainMenus, customSubMenus, hiddenMenus, t]);

  const selectedTreeNode = useMemo(() => {
    return findNodeInTree(treeData, selectedTreeNodeId);
  }, [treeData, selectedTreeNodeId]);

  // Toggle node expand/collapse
  const toggleExpandNode = (id: string) => {
    const next = new Set(expandedNodes);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedNodes(next);
  };

  const handleExpandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: TreeNodeItem[]) => {
      nodes.forEach(n => {
        if (n.type !== 'form') {
          allIds.add(n.id);
          collectIds(n.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedNodes(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Render Recursive Tree Node
  const renderTreeNode = (node: TreeNodeItem, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isForm = node.type === 'form';
    const isSelected = isForm 
      ? (selectedForm?.dynamicFormId === node.form?.dynamicFormId || formCode === node.form?.formCode)
      : selectedTreeNodeId === node.id;

    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div 
          onClick={() => {
            if (isForm) {
              handleEditForm(node.form);
            } else {
              setSelectedTreeNodeId(node.id);
              if (hasChildren) {
                toggleExpandNode(node.id);
              }
            }
          }}
          className={cn(
            "group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer my-0.5",
            isSelected && isForm
              ? "bg-blue-600 text-white font-bold shadow-sm"
              : isSelected && !isForm
              ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold border-r-2 border-blue-600"
              : "hover:bg-slate-100 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300"
          )}
          style={{ paddingRight: `${level * 14 + 10}px` }}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Expand / Collapse Icon for Non-Forms */}
            {!isForm ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpandNode(node.id);
                }}
                className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronLeft className="h-3.5 w-3.5" />
                )}
              </button>
            ) : (
              <span className="w-4 shrink-0" />
            )}

            {/* Node Icon */}
            {node.type === 'group' && <FolderTree className="h-4 w-4 text-amber-500 shrink-0" />}
            {(node.type === 'menu' || node.type === 'submenu') && (
              <Folder className={cn("h-3.5 w-3.5 shrink-0 transition-colors", isExpanded ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-500")} />
            )}
            {isForm && <FormInput className={cn("h-3.5 w-3.5 shrink-0", isSelected ? "text-white" : "text-purple-600 dark:text-purple-400")} />}

            {/* Node Title */}
            <span className="truncate text-[11px] leading-snug">
              {node.title}
            </span>

            {/* Code Badge for Forms */}
            {isForm && node.form?.formCode && (
              <span className={cn(
                "text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 dir-ltr",
                isSelected ? "bg-blue-700 text-white" : "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
              )}>
                {node.form.formCode}
              </span>
            )}
          </div>

          {/* Action Buttons for Nodes */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Form Count Badge */}
            {!isForm && node.formCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold ml-1">
                {node.formCount}
              </span>
            )}

            {/* Hover Actions Group */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
              {isForm ? (
                /* 3. Form - ONLY Edit and Delete, NO Create button */
                <>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditForm(node.form);
                    }}
                    className={cn(
                      "p-1 rounded transition-colors",
                      isSelected ? "hover:bg-blue-700 text-white" : "hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300"
                    )}
                    title="ویرایش فرم"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>

                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (node.form) {
                        handleDeleteForm(node.form);
                      }
                    }}
                    className={cn(
                      "p-1 rounded transition-colors cursor-pointer",
                      isSelected ? "hover:bg-rose-700 text-white" : "hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400"
                    )}
                    title="حذف فرم"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              ) : (node.type === 'group' || node.type === 'menu') ? (
                /* 1. Main Menu (Group or Menu) */
                <>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTreeNodeId(node.id);
                      handleOpenCreateSubMenuModal(node.groupId, node.menuTitle || node.title);
                    }}
                    className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded transition-colors cursor-pointer"
                    title="ایجاد زیرمنوی جدید در این شاخه"
                  >
                    <FolderPlus className="h-3 w-3" />
                  </button>

                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTreeNodeId(node.id);
                      handleCreateNew(node.groupId, node.menuTitle || node.title, '');
                    }}
                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded transition-colors cursor-pointer"
                    title="افزودن فرم جدید در این شاخه اصلی"
                  >
                    <FilePlus className="h-3 w-3" />
                  </button>

                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTreeNodeId(node.id);
                      handleEditMainMenu(node);
                    }}
                    className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 rounded transition-colors cursor-pointer"
                    title="ویرایش منوی اصلی"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>

                  <button 
                    type="button"
                    disabled={hasChildren}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasChildren) return;
                      handleDeleteMainMenu(node);
                    }}
                    className={cn(
                      "p-1 rounded transition-colors",
                      hasChildren 
                        ? "opacity-30 cursor-not-allowed text-gray-400 dark:text-gray-600" 
                        : "hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 cursor-pointer"
                    )}
                    title={hasChildren ? "امکان حذف این منوی اصلی به دلیل داشتن زیرمنو یا فرم وجود ندارد." : "حذف منوی اصلی"}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              ) : node.type === 'submenu' ? (
                /* 2. Submenu */
                <>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTreeNodeId(node.id);
                      handleCreateNew(node.groupId, node.menuTitle, node.subMenuTitle);
                    }}
                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 rounded transition-colors cursor-pointer"
                    title="افزودن فرم جدید در این زیرمنو"
                  >
                    <FilePlus className="h-3 w-3" />
                  </button>

                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTreeNodeId(node.id);
                      handleEditSubMenu(node);
                    }}
                    className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded transition-colors cursor-pointer"
                    title="ویرایش زیرمنو"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>

                  <button 
                    type="button"
                    disabled={hasChildren}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasChildren) return;
                      handleDeleteSubMenu(node);
                    }}
                    className={cn(
                      "p-1 rounded transition-colors",
                      hasChildren 
                        ? "opacity-30 cursor-not-allowed text-gray-400 dark:text-gray-600" 
                        : "hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 cursor-pointer"
                    )}
                    title={hasChildren ? "امکان حذف این زیرمنو به دلیل داشتن فرم‌های زیرمجموعه وجود ندارد." : "حذف زیرمنو"}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Children Render */}
        {!isForm && isExpanded && hasChildren && (
          <div className="border-r border-gray-100 dark:border-gray-800/80 mr-3 my-0.5">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-gray-950/50">
      
      {/* 1. Main Action Bar */}
      {!isEditing && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-5 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <ListTree className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                طراحی و مدیریت فرم‌ساز پویا (DFB)
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  درختواره داشبورد
                </span>
              </h1>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center gap-2">
            <Tooltip content="ایجاد منوی اصلی جدید" side="bottom">
              <button 
                type="button"
                onClick={() => handleOpenCreateMainMenuModal(selectedTreeNode?.groupId)}
                className="p-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm cursor-pointer flex items-center justify-center"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </Tooltip>

            <Tooltip content={showTreePanel ? "مخفی کردن درختواره منوهای سیستم" : "نمایش درختواره منوهای سیستم"} side="bottom">
              <button 
                type="button"
                onClick={() => setShowTreePanel(prev => !prev)}
                className={cn(
                  "flex items-center justify-center p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-xs",
                  showTreePanel 
                    ? "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" 
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                )}
              >
                {showTreePanel ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" />
                )}
              </button>
            </Tooltip>

            <Tooltip content="دریافت لیست" side="bottom">
              <button 
                onClick={fetchForms}
                disabled={loading}
                className="p-2 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer flex items-center justify-center"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </button>
            </Tooltip>

            <Tooltip content={!selectedTreeNodeId ? "لطفاً ابتدا یک شاخه از درختواره منوهای سیستم را انتخاب کنید" : "ایجاد فرم جدید در شاخه انتخاب‌شده"} side="bottom">
              <button 
                type="button"
                disabled={!selectedTreeNodeId}
                onClick={() => handleCreateNew()}
                className={cn(
                  "p-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center",
                  !selectedTreeNodeId
                    ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                )}
              >
                <Plus className="h-4 w-4" />
              </button>
            </Tooltip>

            {isEditing && (
              <>
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg gap-0.5 border border-gray-200 dark:border-gray-700">
                  <Tooltip content="لغو آخرین تغییر (Undo - Ctrl+Z)" side="bottom">
                    <button 
                      type="button"
                      onClick={handleUndo}
                      disabled={!canUndo}
                      className={cn(
                        "p-2 rounded-md text-xs font-bold transition-all flex items-center justify-center",
                        canUndo 
                          ? "bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs cursor-pointer" 
                          : "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                      )}
                    >
                      <Undo2 className="h-4 w-4" />
                    </button>
                  </Tooltip>

                  <Tooltip content="اعمال مجدد تغییر (Redo - Ctrl+Y)" side="bottom">
                    <button 
                      type="button"
                      onClick={handleRedo}
                      disabled={!canRedo}
                      className={cn(
                        "p-2 rounded-md text-xs font-bold transition-all flex items-center justify-center",
                        canRedo 
                          ? "bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs cursor-pointer" 
                          : "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                      )}
                    >
                      <Redo2 className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </div>

                <Tooltip content="ذخیره فرم" side="bottom">
                  <button 
                    onClick={handleSaveForm}
                    className="p-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer flex items-center justify-center"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </Tooltip>

                {formCode && (
                  <Tooltip content="پیش‌نمایش" side="bottom">
                    <button 
                      onClick={() => setPreviewFormCode(formCode)}
                      className="p-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm transition-all flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </Tooltip>
                )}

                {selectedForm && (
                  <Tooltip content="حذف فرم" side="bottom">
                    <button 
                      onClick={handleDeleteForm}
                      className="p-2 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 transition-all flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. Split Workspace */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        
        {/* Right Side Panel: Sidebar Tree View */}
        {showTreePanel && (
          <div className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col shrink-0 shadow-sm">
            
            {/* Tree Header */}
            <div className="bg-slate-50 dark:bg-gray-800/40 p-3 border-b border-gray-200 dark:border-gray-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <FolderTree className="h-4 w-4 text-blue-600" />
                  درختواره منوهای سیستم
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                  کل فرم‌ها: {forms.length}
                </span>
              </div>

              {/* Tree Search Box */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-gray-400 absolute right-2.5 top-2.5" />
                <input 
                  type="text"
                  value={searchTree}
                  onChange={(e) => setSearchTree(e.target.value)}
                  placeholder="جستجو در منوها و فرم‌ها..."
                  className="w-full text-xs pr-8 pl-6 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                />
                {searchTree && (
                  <button 
                    onClick={() => setSearchTree('')}
                    className="absolute left-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Tree Branch Selection Helper Banner */}
              {!selectedTreeNodeId ? (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-2 rounded-lg text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5 font-medium">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-ping" />
                  <span>جهت ایجاد منو یا فرم جدید، ابتدا یک شاخه را از درختواره زیر انتخاب کنید.</span>
                </div>
              ) : (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-2 rounded-lg text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center justify-between font-medium">
                  <span className="truncate">
                    ✓ شاخه انتخاب‌شده: <strong className="font-bold">{selectedTreeNode?.title || 'شاخه انتخاب‌شده'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTreeNodeId(null)}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-rose-600 text-[10px] underline shrink-0 mr-1 cursor-pointer"
                  >
                    لغو انتخاب
                  </button>
                </div>
              )}

              {/* Tree Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-2 text-[10px]">
                  <button 
                    onClick={handleExpandAll}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                  >
                    باز کردن همه
                  </button>
                  <span className="text-gray-300 dark:text-gray-700">|</span>
                  <button 
                    onClick={handleCollapseAll}
                    className="text-gray-500 dark:text-gray-400 hover:underline"
                  >
                    بستن همه
                  </button>
                </div>

                <button 
                  type="button"
                  disabled={!selectedTreeNodeId}
                  onClick={() => handleCreateNew()}
                  className={cn(
                    "text-[10px] font-bold flex items-center gap-1 transition-colors",
                    !selectedTreeNodeId
                      ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  )}
                  title={!selectedTreeNodeId ? "لطفاً ابتدا یک شاخه از درختواره منوها را انتخاب کنید" : "ایجاد فرم جدید در شاخه انتخاب‌شده"}
                >
                  <Plus className="h-3 w-3" />
                  فرم جدید
                </button>
              </div>
            </div>

            {/* Tree Tree Content */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="text-center py-10 text-xs text-gray-400 animate-pulse">
                  در حال بارگذاری ساختار منوها...
                </div>
              ) : treeData.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-400">
                  هیچ منو یا فرمی یافت نشد.
                </div>
              ) : (
                <div className="space-y-1">
                  {treeData.map(groupNode => renderTreeNode(groupNode, 0))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Left Side Panel: Form Fields Designer & Style Customizer */}
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
          {!isEditing ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div className="max-w-md space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <FolderTree className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  فرمی از درختواره انتخاب نشده است
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  از پنل سمت راست، یکی از فرم‌های موجود در درختواره را انتخاب کنید یا بر روی دکمه «فرم جدید» کلیک نمایید.
                </p>
                <button 
                  onClick={() => handleCreateNew()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  ایجاد فرم جدید
                </button>
              </div>
            </div>
          ) : selectedForm?.isSystemForm ? (
            <div className="flex-1 flex flex-col p-5 space-y-4 overflow-y-auto">
              <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm overflow-y-auto">
                {(() => {
                  const compName = selectedForm.componentName || selectedForm.formCode;
                  const Comp = SYSTEM_COMPONENT_REGISTRY[compName];
                  if (Comp) {
                    return <Comp />;
                  }
                  return (
                    <div className="text-center py-20 text-gray-500 text-xs">
                      کامپوننت سیستم برای «{compName}» یافت نشد.
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              
              {/* Form Design Center Canvas */}
              <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-5">
                
                {/* Section Header & Tab Switcher Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      {isCreating ? 'طراحی فرم پویای جدید' : `طراحی و ویرایش فرم: ${formTitle || formCode}`}
                    </h2>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 px-2.5 py-1 rounded-md">
                      قالب: {COMPONENT_TEMPLATES.find(t => t.value === formComponent)?.label || formComponent}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Switcher Tabs */}
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditorTab('canvas')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5",
                          editorTab === 'canvas'
                            ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                      >
                        <Layout className="h-3.5 w-3.5" />
                        طراحی قالب فرم
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorTab('settings')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5",
                          editorTab === 'settings'
                            ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        مشخصات پایه و منو
                      </button>
                    </div>

                    {/* Undo / Redo Toolbar */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl gap-1 border border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                          canUndo
                            ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/60"
                            : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                        )}
                        title="لغو آخرین تغییر (Undo - Ctrl+Z)"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        <span>Undo</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRedo}
                        disabled={!canRedo}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                          canRedo
                            ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/60"
                            : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                        )}
                        title="اعمال مجدد تغییر (Redo - Ctrl+Y)"
                      >
                        <Redo2 className="h-3.5 w-3.5" />
                        <span>Redo</span>
                      </button>
                    </div>



                    {/* Save Form */}
                    <button
                      type="button"
                      onClick={handleSaveForm}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      ذخیره فرم
                    </button>

                    {/* Add Band */}
                    <Tooltip content="افزودن باند جدید" side="bottom">
                      <button
                        type="button"
                        onClick={() => handleAddBand()}
                        className="p-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm cursor-pointer flex items-center justify-center"
                      >
                        <Layers className="h-4 w-4" />
                      </button>
                    </Tooltip>

                    {/* Add Field */}
                    <Tooltip content="افزودن فیلد جدید" side="bottom">
                      <button
                        type="button"
                        onClick={() => handleAddField()}
                        className="p-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </Tooltip>

                    {/* Preview Form */}
                    {formCode && (
                      <Tooltip content="پیش‌نمایش فرم" side="bottom">
                        <button
                          type="button"
                          onClick={() => setPreviewFormCode(formCode)}
                          className="p-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white transition-all shadow-sm cursor-pointer flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    )}

                    {/* Exit Design Mode */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setShowTreePanel(true);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-gray-200 dark:border-gray-700"
                      title="خروج از حالت طراحی فرم و بازگشت به درختواره منوها"
                    >
                      <X className="h-4 w-4" />
                      خروج از طراحی
                    </button>
                  </div>
                </div>

                {editorTab === 'settings' ? (
                  /* Form Metadata & Menu Placement Settings View */
                  <div className="space-y-5">
                    {/* Basic Details Box */}
                    <div className="bg-slate-50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 p-5 rounded-xl space-y-4">
                      <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        مشخصات اصلی و کد شناسایی فرم
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">کد اختصاصی فرم (انگلیسی) *</label>
                          <input 
                            type="text"
                            value={formCode}
                            onChange={(e) => setFormCode(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            placeholder="مثلا: leave_request"
                            className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 font-mono dir-ltr"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">عنوان فارسی فرم *</label>
                          <input 
                            type="text"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            placeholder="مثلا: فرم ثبت نام پرسنل"
                            className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">ساختار قالب پایه فرم</label>
                          <select 
                            value={formComponent}
                            onChange={(e) => setFormComponent(e.target.value)}
                            className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                          >
                            {COMPONENT_TEMPLATES.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">توضیحات فرم</label>
                        <textarea 
                          value={formDesc}
                          onChange={(e) => setFormDesc(e.target.value)}
                          placeholder="توضیحات تکمیلی پیرامون این فرم..."
                          rows={2}
                          className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Menu Placement Card */}
                    <div className="bg-slate-50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 p-5 rounded-xl space-y-4">
                      <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <Layout className="h-3.5 w-3.5" />
                        مکان قرارگیری در منوی اصلی و زیرمنوهای داشبورد
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Main Group */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">گروه اصلی / سرشاخه سیستم</label>
                          <select 
                            value={menuGroupId}
                            onChange={(e) => {
                              const newGId = e.target.value;
                              setMenuGroupId(newGId);
                              const knownMenus = GROUP_MAIN_MENUS[newGId] || ['اطلاعات پایه', 'عملیات', 'گزارشات', 'فهرست‌ها', 'فرم‌های ایجاد شده'];
                              if (knownMenus.length > 0) {
                                setMenuTitle(knownMenus[0]);
                                setIsCustomMenuTitle(false);
                                setCustomMenuTitle('');
                              } else {
                                setMenuTitle('عملیات');
                                setIsCustomMenuTitle(false);
                              }
                            }}
                            className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                          >
                            {allDashboardGroups.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Main Menu */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">عنوان منو</label>
                            <button
                              type="button"
                              onClick={() => handleOpenCreateMainMenuModal(menuGroupId)}
                              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <FolderPlus className="h-3 w-3" />
                              + منوی اصلی / سرشاخه جدید
                            </button>
                          </div>
                          <select 
                            value={isCustomMenuTitle ? 'custom' : menuTitle}
                            onChange={(e) => {
                              if (e.target.value === 'custom') {
                                handleOpenCreateMainMenuModal(menuGroupId);
                              } else {
                                setIsCustomMenuTitle(false);
                                setMenuTitle(e.target.value);
                              }
                            }}
                            className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                          >
                            {availableGroupMainMenus.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                            <option value="custom">+ تعریف منوی اصلی جدید...</option>
                          </select>
                          {isCustomMenuTitle && (
                            <input 
                              type="text"
                              value={customMenuTitle}
                              onChange={(e) => setCustomMenuTitle(e.target.value)}
                              placeholder="عنوان منوی اصلی جدید..."
                              className="w-full text-xs border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 mt-2"
                            />
                          )}
                        </div>

                        {/* Submenu */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">زیرمنو</label>
                          <select 
                            value={isCustomSubMenuTitle ? 'custom' : subMenuTitle}
                            onChange={(e) => {
                              if (e.target.value === 'custom') {
                                setIsCustomSubMenuTitle(true);
                                setCustomSubMenuTitle('');
                              } else {
                                setIsCustomSubMenuTitle(false);
                                setSubMenuTitle(e.target.value);
                              }
                            }}
                            className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                          >
                            {SUBMENU_PRESETS.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                            <option value="custom">+ تعریف زیرمنوی جدید...</option>
                          </select>
                          {isCustomSubMenuTitle && (
                            <input 
                              type="text"
                              value={customSubMenuTitle}
                              onChange={(e) => setCustomSubMenuTitle(e.target.value)}
                              placeholder="عنوان زیرمنوی جدید..."
                              className="w-full text-xs border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actionbar and Print/Voucher Settings Card */}
                    <div className="bg-slate-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
                      <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <Sliders className="h-4 w-4 text-blue-600" />
                        تنظیمات اکشن‌بار و دکمه‌های عملیاتی فرم
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        تعیین دکمه‌ها و اکشن‌های فعال در نوار ابزار اصلی فرم
                      </p>

                      <div className="space-y-2.5 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={showPrintList}
                            onChange={(e) => setShowPrintList(e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                              نمایش آیکون کامپوننت پرینت لیستی
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                              افزودن دکمه چاپ و پرینت استاندارد لیستی به اکشن‌بار فرم
                            </span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={showVoucherActionbar}
                            onChange={(e) => setShowVoucherActionbar(e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                              نمایش اکشن بار صدور سند حسابداری
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                              افزودن دکمه‌ها و اکشن‌های اختصاصی صدور سند حسابداری به اکشن‌بار فرم
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form Template Design Canvas View */
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[520px]">
                    
                    {/* 1. Header Bar matching SimpleForm / base template */}
                    <div className={cn(
                      "px-4 py-2.5 text-white flex items-center justify-between shadow-xs select-none",
                      styles.themeColor === 'emerald' ? "bg-gradient-to-r from-emerald-600 to-emerald-500" :
                      styles.themeColor === 'cyan' ? "bg-gradient-to-r from-cyan-600 to-cyan-500" :
                      styles.themeColor === 'rose' ? "bg-gradient-to-r from-rose-600 to-rose-500" :
                      "bg-gradient-to-r from-blue-600 to-blue-500"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-white/10 rounded-md">
                          <FormInput className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-bold tracking-wide">
                          {formTitle || formCode || 'فرم جدید'}
                        </span>
                        {formCode && (
                          <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono dir-ltr">
                            {formCode}
                          </span>
                        )}
                      </div>

                      {/* Header Controls (Help, Fullscreen, Close) */}
                      <div className="flex items-center gap-1 flex-wrap min-w-0">
                        <button type="button" title="راهنما" className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                          <HelpCircle className="h-4 w-4" />
                        </button>
                        <button type="button" title="تمام صفحه" className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                          <Maximize2 className="h-4 w-4" />
                        </button>
                        <button type="button" title="بستن" className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* 2. Actionbar / Standard Toolbar */}
                    <div className="bg-slate-50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <NewButton onClick={() => { setFields([]); setSelectedFieldIndex(null); }} hideLabel />
                        <ListButton onClick={() => setPreviewFormCode(formCode)} hideLabel />
                        <SaveButton onClick={handleSaveForm} hideLabel />
                        <SaveNewButton onClick={handleSaveForm} hideLabel />
                        <SaveCloseButton onClick={handleSaveForm} hideLabel />
                        <DeleteButton onClick={() => handleDeleteForm()} hideLabel />
                        <DeleteAndNewButton onClick={() => handleDeleteForm()} hideLabel />

                        {showPrintList && (
                          <PrintDropdownButton 
                            targetForm={formCode || 'dynamic_form'} 
                            onPrint={() => window.print()} 
                          />
                        )}

                        {showVoucherActionbar && (
                          <VoucherActionButtons 
                            action="insert" 
                            onClick={() => showToast('درخواست صدور سند حسابداری ثبت گردید.', 'info')} 
                          />
                        )}
                      </div>


                    </div>

                    {/* 3. Form Body Canvas (Band Containers) */}
                    <div ref={canvasContainerRef} className="flex-1 p-6 overflow-y-auto flex flex-wrap items-start gap-4 bg-slate-50/30 dark:bg-gray-950/30">
                      
                      {formComponent === 'SimpleFormTabbed' && (
                        <div className="w-full flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                          <div className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-t-lg shadow-xs">
                            اطلاعات اصلی
                          </div>
                          <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-t-lg">
                            سایر اطلاعات
                          </div>
                        </div>
                      )}

                      {(() => {
                        const rootBands = bands.filter(
                          b => !b.parentBandId || !bands.some(p => p.id === b.parentBandId)
                        );

                        const renderCanvasBand = (band: BandConfig, depth = 0) => {
                          const bIdx = bands.findIndex(b => b.id === band.id);
                          if (bIdx === -1) return null;

                          const isBandSelected = selectedBandIndex === bIdx;
                          const bandFields = fields.filter(f => (f.bandId ? f.bandId === band.id : bIdx === 0));
                          const childBands = bands.filter(b => b.parentBandId === band.id);
                          const parentBand = band.parentBandId ? bands.find(b => b.id === band.parentBandId) : undefined;

                          const isDefaultBg = !band.bgColor || band.bgColor === '#f0f7ff' || band.bgColor === '#ffffff' || Object.values(THEME_BG_COLORS).includes(band.bgColor);
                          const isDefaultBorder = !band.borderColor || band.borderColor === '#bfdbfe' || band.borderColor === '#e2e8f0' || Object.values(THEME_BORDER_COLORS).includes(band.borderColor);

                          const flexW = getBandStyleWidth(band.width);

                          const bandStyle: React.CSSProperties = {
                            width: flexW,
                            flexBasis: flexW,
                            flexGrow: 0,
                            flexShrink: 0,
                            boxSizing: 'border-box',
                            height: 'auto',
                            minHeight: '130px',
                            margin: band.margin || '4px 0px',
                            padding: band.padding || '12px',
                            borderWidth: band.borderWidth || '1px',
                            borderStyle: (band.borderStyle as any) || 'solid',
                            borderColor: isDefaultBorder ? undefined : band.borderColor,
                            backgroundColor: isDefaultBg ? undefined : band.bgColor,
                            borderRadius: band.borderRadius || '12px',
                          };

                          const canAcceptDraggedBand =
                            draggedBandIndex !== null &&
                            draggedBandIndex !== bIdx &&
                            bands[draggedBandIndex] &&
                            !isDescendantOf(bands, bands[draggedBandIndex].id, band.id);

                          return (
                            <div
                              key={band.id || bIdx}
                              ref={(el) => { bandRefs.current[bIdx] = el; }}
                              draggable={true}
                              onDragStart={(e) => {
                                e.stopPropagation();
                                setDraggedBandIndex(bIdx);
                                e.dataTransfer.setData('text/plain', `band:${bIdx}`);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (draggedBandIndex !== null && draggedBandIndex !== bIdx) {
                                  handleNestBand(draggedBandIndex, band.id);
                                } else if (draggedBandIndex !== null) {
                                  handleDropBand(bIdx);
                                } else if (draggedFieldIndex !== null) {
                                  handleDropFieldOntoBand(bIdx);
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBandIndex(bIdx);
                                setSelectedFieldIndex(null);
                              }}
                              style={bandStyle}
                              className={cn(
                                "relative transition-all overflow-y-auto group/band flex flex-col justify-start select-none cursor-grab active:cursor-grabbing bg-slate-50/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700",
                                isBandSelected
                                  ? "ring-2 ring-indigo-500 shadow-md border-indigo-400"
                                  : "hover:border-indigo-300 dark:hover:border-indigo-700",
                                draggedBandIndex === bIdx ? "opacity-50 border-dashed border-indigo-500" : "",
                                depth > 0 ? "bg-amber-50/20 dark:bg-amber-950/10 border-amber-200/80 dark:border-amber-800/40" : ""
                              )}
                            >
                              {/* Band Header & Controls */}
                              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-gray-800/80 mb-3 z-10">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="p-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-md">
                                    <Layers className="h-3.5 w-3.5" />
                                  </span>
                                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                    {band.title || `باند شماره ${bIdx + 1}`}
                                  </span>
                                  {parentBand && (
                                    <span className="text-[9px] bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                      زیرباند «{parentBand.title || 'والد'}»
                                    </span>
                                  )}
                                  {depth > 0 && (
                                    <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-mono dir-ltr">
                                      سطح {depth + 1}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 px-2 py-0.5 rounded-full dir-ltr">
                                    {band.width || '100%'}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    ({bandFields.length} فیلد{childBands.length > 0 ? `، ${childBands.length} زیرباند` : ''})
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 opacity-90 group-hover/band:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddBand(band.id);
                                    }}
                                    className="p-1 text-xs bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded font-bold flex items-center gap-0.5 cursor-pointer"
                                    title="افزودن زیرباند جدید داخل این باند"
                                  >
                                    <Plus className="h-3 w-3" />
                                    <span className="text-[10px]">+ زیرباند</span>
                                  </button>

                                  {band.parentBandId && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleNestBand(bIdx, undefined);
                                      }}
                                      className="p-1 text-[10px] bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded font-bold cursor-pointer"
                                      title="خروج از حالت زیرباند و انتقال به سطح اصلی"
                                    >
                                      خروج از والد
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleMoveBand(bIdx, 'up'); }}
                                    disabled={bIdx === 0}
                                    className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded disabled:opacity-20 cursor-pointer"
                                    title="انتقال باند به بالا"
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleMoveBand(bIdx, 'down'); }}
                                    disabled={bIdx === bands.length - 1}
                                    className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded disabled:opacity-20 cursor-pointer"
                                    title="انتقال باند به پایین"
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteBand(bIdx); }}
                                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded cursor-pointer"
                                    title="حذف باند"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Band Fields Grid */}
                              {bandFields.length === 0 && childBands.length === 0 ? (
                                <div 
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (draggedFieldIndex !== null) {
                                      handleDropFieldOntoBand(bIdx);
                                    } else if (draggedBandIndex !== null && draggedBandIndex !== bIdx) {
                                      handleNestBand(draggedBandIndex, band.id);
                                    }
                                  }}
                                  className="border-2 border-dashed border-indigo-200 dark:border-indigo-800/60 rounded-xl p-6 text-center space-y-2 bg-indigo-50/20 dark:bg-indigo-950/10 my-2"
                                >
                                  <p className="text-[11px] text-indigo-500 font-medium">
                                    این باند خالی است. فیلدها را بکشید و در اینجا رها کنید.
                                  </p>
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddField(band.id);
                                      }}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                      افزودن فیلد
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddBand(band.id);
                                      }}
                                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Layers className="h-3.5 w-3.5" />
                                      افزودن زیرباند
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-3 items-start w-full">
                                  {bandFields.map((field) => {
                                    const idx = fields.findIndex(f => f === field);
                                    if (idx === -1) return null;

                                    const isSelected = selectedFieldIndex === idx;
                                    const isTwoCol = field.colSpan === 2 || field.type === 'textarea';

                                    const labelText = field.label ? `${field.label} :` : 'بدون برچسب :';
                                    const commonProps = {
                                      label: labelText,
                                      required: field.required,
                                      placeholder: field.placeholder || 'وارد کنید...',
                                      disabled: true,
                                    };

                                    let inputComponent = null;
                                    switch (field.type) {
                                      case 'number':
                                        inputComponent = <NumberInput {...commonProps} value="" onChange={() => {}} />;
                                        break;
                                      case 'amount':
                                        inputComponent = <AmountInput {...commonProps} value="" onChange={() => {}} />;
                                        break;
                                      case 'textarea':
                                        inputComponent = <TextArea {...commonProps} value="" onChange={() => {}} />;
                                        break;
                                      case 'date':
                                        inputComponent = <DateInput {...commonProps} value="" onChange={() => {}} />;
                                        break;
                                      case 'select':
                                        inputComponent = <Select {...commonProps} options={field.options || []} value="" onChange={() => {}} />;
                                        break;
                                      case 'checkbox':
                                        inputComponent = <Checkbox label={field.label || 'گزینه'} checked={false} onChange={() => {}} disabled />;
                                        break;
                                      case 'radio':
                                        inputComponent = <RadioGroup {...commonProps} name={field.name || 'preview_radio'} options={field.options || []} value="" onChange={() => {}} />;
                                        break;
                                      case 'email':
                                        inputComponent = <EmailInput {...commonProps} value="" onChange={() => {}} />;
                                        break;
                                      case 'website':
                                        inputComponent = <WebsiteInput {...commonProps} value="" onChange={() => {}} />;
                                        break;
                                      case 'file':
                                        inputComponent = <FileUpload {...commonProps} onChange={() => {}} />;
                                        break;
                                      default:
                                        inputComponent = <TextInput {...commonProps} value="" onChange={() => {}} />;
                                        break;
                                    }

                                    const customW = field.styles?.width || field.width;
                                    const customH = field.styles?.height || field.height;

                                    const cardStyle: React.CSSProperties = {
                                      width: customW || undefined,
                                      height: customH || undefined,
                                      minWidth: '160px',
                                      minHeight: '60px',
                                    };

                                    return (
                                      <div 
                                        key={field.name || idx}
                                        ref={(el) => { fieldRefs.current[idx] = el; }}
                                        draggable={true}
                                        onDragStart={(e) => {
                                          e.stopPropagation();
                                          setDraggedFieldIndex(idx);
                                          e.dataTransfer.setData('text/plain', `field:${idx}`);
                                        }}
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (draggedFieldIndex !== null) {
                                            handleDropFieldOntoBand(bIdx, idx);
                                          }
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedFieldIndex(idx);
                                          setSelectedBandIndex(null);
                                        }}
                                        style={cardStyle}
                                        className={cn(
                                          "relative group/field p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none flex flex-col justify-between overflow-hidden",
                                          isTwoCol && !customW ? "col-span-1 md:col-span-2" : "col-span-1",
                                          isSelected 
                                            ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/50 shadow-md" 
                                            : "bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs",
                                          draggedFieldIndex === idx ? "opacity-40 border-dashed border-blue-500" : ""
                                        )}
                                      >
                                        {/* Selection Badge & Action Controls (Top Bar) */}
                                        <div className="flex flex-wrap items-center justify-between gap-1 pb-1 z-10 text-[10px]">
                                          <div className="flex items-center gap-1 flex-wrap min-w-0">
                                            <span className={cn(
                                              "text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shadow-xs",
                                              isSelected ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                            )}>
                                              #{idx + 1}
                                            </span>

                                            {/* Quick Band Switcher Dropdown */}
                                            <select
                                              value={field.bandId || band.id}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                handleFieldChange(idx, 'bandId', e.target.value);
                                                showToast(`فیلد به باند جدید منتقل شد.`, 'success');
                                              }}
                                              onClick={(e) => e.stopPropagation()}
                                              className="text-[9px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 text-gray-700 dark:text-gray-300 font-bold max-w-[80px] truncate cursor-pointer"
                                              title="تغییر باند قرارگیری فیلد"
                                            >
                                              {bands.map((b, bIdx2) => (
                                                <option key={b.id} value={b.id}>
                                                  {b.title || `باند ${bIdx2 + 1}`}
                                                </option>
                                              ))}
                                            </select>

                                            {(customW || customH) && (
                                              <span className="text-[9px] font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 px-1.5 py-0.5 rounded dir-ltr">
                                                {customW || 'خودکار'} × {customH || 'خودکار'}
                                              </span>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-1 opacity-90 group-hover/field:opacity-100 transition-opacity">
                                            <button 
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); handleMoveField(idx, 'up'); }}
                                              disabled={idx === 0}
                                              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded disabled:opacity-20 cursor-pointer"
                                              title="انتقال به بالا"
                                            >
                                              <ArrowUp className="h-3 w-3" />
                                            </button>
                                            <button 
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); handleMoveField(idx, 'down'); }}
                                              disabled={idx === fields.length - 1}
                                              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded disabled:opacity-20 cursor-pointer"
                                              title="انتقال به پایین"
                                            >
                                              <ArrowDown className="h-3 w-3" />
                                            </button>
                                            <button 
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); handleDeleteField(idx); }}
                                              className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded cursor-pointer"
                                              title="حذف فیلد"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Rendered Input Element */}
                                        <div className="pointer-events-none flex-1 flex flex-col justify-center my-1">
                                          {inputComponent}
                                        </div>

                                        {/* Interactive Mouse Drag Resizers for Fields */}
                                        <div 
                                          onMouseDown={(e) => fieldRefs.current[idx] && handleResizeStart(e, idx, fieldRefs.current[idx]!, 'width')}
                                          className="absolute top-0 right-0 bottom-0 w-3 hover:bg-blue-500/50 cursor-ew-resize z-20 rounded-r-xl transition-all group-hover/field:bg-blue-400/30 flex items-center justify-center"
                                          title="تغییر عرض فیلد با موس"
                                        >
                                          <div className="w-0.5 h-6 bg-blue-500/60 rounded-full group-hover/field:bg-blue-600" />
                                        </div>

                                        <div 
                                          onMouseDown={(e) => fieldRefs.current[idx] && handleResizeStart(e, idx, fieldRefs.current[idx]!, 'left-width')}
                                          className="absolute top-0 left-0 bottom-0 w-3 hover:bg-blue-500/50 cursor-ew-resize z-20 rounded-l-xl transition-all group-hover/field:bg-blue-400/30 flex items-center justify-center"
                                          title="تغییر عرض فیلد با موس"
                                        >
                                          <div className="w-0.5 h-6 bg-blue-500/60 rounded-full group-hover/field:bg-blue-600" />
                                        </div>

                                        <div 
                                          onMouseDown={(e) => fieldRefs.current[idx] && handleResizeStart(e, idx, fieldRefs.current[idx]!, 'height')}
                                          className="absolute left-0 right-0 bottom-0 h-3 hover:bg-blue-500/50 cursor-ns-resize z-20 rounded-b-xl transition-all group-hover/field:bg-blue-400/30 flex items-center justify-center"
                                          title="تغییر ارتفاع فیلد با موس"
                                        >
                                          <div className="h-0.5 w-6 bg-blue-500/60 rounded-full group-hover/field:bg-blue-600" />
                                        </div>

                                        <div 
                                          onMouseDown={(e) => fieldRefs.current[idx] && handleResizeStart(e, idx, fieldRefs.current[idx]!, 'both')}
                                          className="absolute bottom-0 right-0 w-5 h-5 hover:bg-blue-600 cursor-nwse-resize z-30 rounded-br-xl bg-blue-500/80 transition-all flex items-center justify-center text-white shadow-xs"
                                          title="تغییر همزمان عرض و ارتفاع فیلد با درگ موس"
                                        >
                                          <Scaling className="h-3 w-3" />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Nested Sub-bands Container */}
                              {childBands.length > 0 && (
                                <div className="mt-4 pt-3 border-t-2 border-dashed border-indigo-200 dark:border-indigo-800/80 space-y-3 w-full pl-2 md:pl-4 border-l-2 border-l-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl p-3 shadow-inner">
                                  <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-2">
                                    <Layers className="h-4 w-4 text-indigo-600" />
                                    زیرباندهای داخلی این باند ({childBands.length}):
                                  </div>
                                  <div className="flex flex-wrap gap-3 items-start w-full">
                                    {childBands.map(cb => renderCanvasBand(cb, depth + 1))}
                                  </div>
                                </div>
                              )}

                              {/* Dropzone for dragging a band into this band */}
                              {canAcceptDraggedBand && (
                                <div 
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleNestBand(draggedBandIndex!, band.id);
                                  }}
                                  className="mt-2 p-2.5 border-2 border-dashed border-amber-400 dark:border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 rounded-xl text-center cursor-pointer transition-all animate-pulse"
                                >
                                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1">
                                    <Layers className="h-3.5 w-3.5" />
                                    باند را در اینجا رها کنید تا به زیرباند «{band.title || 'این باند'}» تبدیل شود
                                  </span>
                                </div>
                              )}

                              {/* Band Mouse Resizer Handles (Right, Left, Bottom, Corner) */}
                              <div 
                                onMouseDown={(e) => bandRefs.current[bIdx] && handleBandResizeStart(e, bIdx, bandRefs.current[bIdx]!, 'width')}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  handleAutoLayoutBandSiblings(bIdx);
                                }}
                                className="absolute top-0 right-0 bottom-0 w-3 hover:bg-indigo-500/50 cursor-ew-resize z-20 rounded-r-xl transition-all group-hover/band:bg-indigo-400/30 flex items-center justify-center"
                                title="تغییر عرض باند با موس یا دبل‌کلیک برای چیدمان خودکار درصدی زیرباندها و فیلدها"
                              >
                                <div className="w-0.5 h-8 bg-indigo-500/60 rounded-full group-hover/band:bg-indigo-600" />
                              </div>

                              <div 
                                onMouseDown={(e) => bandRefs.current[bIdx] && handleBandResizeStart(e, bIdx, bandRefs.current[bIdx]!, 'left-width')}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  handleAutoLayoutBandSiblings(bIdx);
                                }}
                                className="absolute top-0 left-0 bottom-0 w-3 hover:bg-indigo-500/50 cursor-ew-resize z-20 rounded-l-xl transition-all group-hover/band:bg-indigo-400/30 flex items-center justify-center"
                                title="تغییر عرض باند با موس یا دبل‌کلیک برای چیدمان خودکار درصدی زیرباندها و فیلدها"
                              >
                                <div className="w-0.5 h-8 bg-indigo-500/60 rounded-full group-hover/band:bg-indigo-600" />
                              </div>

                              <div 
                                onMouseDown={(e) => bandRefs.current[bIdx] && handleBandResizeStart(e, bIdx, bandRefs.current[bIdx]!, 'height')}
                                className="absolute left-0 right-0 bottom-0 h-3 hover:bg-indigo-500/50 cursor-ns-resize z-20 rounded-b-xl transition-all group-hover/band:bg-indigo-400/30 flex items-center justify-center"
                                title="تغییر ارتفاع باند با موس"
                              >
                                <div className="h-0.5 w-8 bg-indigo-500/60 rounded-full group-hover/band:bg-indigo-600" />
                              </div>

                              <div 
                                onMouseDown={(e) => bandRefs.current[bIdx] && handleBandResizeStart(e, bIdx, bandRefs.current[bIdx]!, 'both')}
                                className="absolute bottom-0 right-0 w-5 h-5 hover:bg-indigo-600 cursor-nwse-resize z-30 rounded-br-xl bg-indigo-500/80 transition-all flex items-center justify-center text-white shadow-xs"
                                title="تغییر ابعاد باند با درگ موس"
                              >
                                <Scaling className="h-3 w-3" />
                              </div>
                            </div>
                          );
                        };

                        return rootBands.map(b => renderCanvasBand(b, 0));
                      })()}

                      {/* Add New Band Dropzone */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleAddBand()}
                          className="w-full py-3 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Layers className="h-4 w-4 text-indigo-500" />
                          + افزودن باند جدید به فرم
                        </button>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* Right Side Panel Inside Editor: Active Field Customizer & Form Styles */}
              <div className="w-80 bg-slate-50/50 dark:bg-gray-900/60 border-r border-gray-100 dark:border-gray-800 overflow-y-auto p-5 space-y-6 shrink-0">
                <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
                  <Settings2 className="h-4 w-4 text-blue-600" />
                  <h2 className="text-xs font-bold text-gray-800 dark:text-gray-200">سفارشی‌سازی استایل و ویژگی‌ها</h2>
                </div>

                {/* Overall Form Layout Styles */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 pb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-blue-500" />
                    استایل کلی پوسته فرم
                  </h3>

                  <div>
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">طرح رنگ کلی (Theme)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['blue', 'emerald', 'cyan', 'rose'].map((col) => {
                        const bgClassMap: Record<string, string> = {
                          blue: 'bg-blue-600',
                          emerald: 'bg-emerald-600',
                          cyan: 'bg-cyan-600',
                          rose: 'bg-rose-600',
                        };
                        const isSel = styles.themeColor === col;
                        return (
                          <button 
                            key={col}
                            onClick={() => handleThemeChange(col)}
                            className={cn(
                              "h-6 rounded-md flex items-center justify-center transition-all border",
                              bgClassMap[col],
                              isSel ? "border-black scale-105 shadow-sm" : "border-transparent opacity-80 hover:opacity-100"
                            )}
                          >
                            {isSel && <Check className="h-3 w-3 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">اندازه فونت پایه فرم</label>
                    <select 
                      value={styles.fontSize || 'text-sm'}
                      onChange={(e) => setStyles({ ...styles, fontSize: e.target.value })}
                      className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      {FONT_SIZE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">قلم پیش‌فرض فرم (Font)</label>
                    <select 
                      value={styles.fontFamily || 'font-sans'}
                      onChange={(e) => setStyles({ ...styles, fontFamily: e.target.value })}
                      className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      {FONT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Field Customizer Panel */}
                {selectedFieldIndex !== null && fields[selectedFieldIndex] ? (
                  <div className="space-y-4 border-t border-gray-200 dark:border-gray-800 pt-5">
                    <h3 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 pb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Wrench className="h-3 w-3 text-emerald-500" />
                        ویژگی‌های فیلد فعال (شماره {selectedFieldIndex + 1})
                      </span>
                      <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                        {fields[selectedFieldIndex].type}
                      </span>
                    </h3>

                    <div>
                      <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">باند قرارگیری فیلد (الزامی)</label>
                      <select 
                        value={fields[selectedFieldIndex].bandId || (bands[0]?.id || '')}
                        onChange={(e) => handleFieldChange(selectedFieldIndex, 'bandId', e.target.value)}
                        className="w-full text-xs border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none"
                      >
                        {bands.map((b, bIdx) => (
                          <option key={b.id} value={b.id}>
                            {b.title || `باند شماره ${bIdx + 1}`} ({b.width || '100%'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">شناسه داده (فقط انگلیسی، تکراری نباشد)</label>
                      <input 
                        type="text"
                        value={fields[selectedFieldIndex].name}
                        onChange={(e) => handleFieldChange(selectedFieldIndex, 'name', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none font-mono dir-ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">برچسب نمایشی فارسی (Label)</label>
                      <input 
                        type="text"
                        value={fields[selectedFieldIndex].label}
                        onChange={(e) => handleFieldChange(selectedFieldIndex, 'label', e.target.value)}
                        className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">نوع فیلد ورودی</label>
                      <select 
                        value={fields[selectedFieldIndex].type}
                        onChange={(e) => handleFieldChange(selectedFieldIndex, 'type', e.target.value)}
                        className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none"
                      >
                        {FIELD_TYPES.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">متن راهنما درون فیلد (Placeholder)</label>
                      <input 
                        type="text"
                        value={fields[selectedFieldIndex].placeholder || ''}
                        onChange={(e) => handleFieldChange(selectedFieldIndex, 'placeholder', e.target.value)}
                        className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none"
                      />
                    </div>

                    {/* Width sizing */}
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">عرض قرارگیری در شبکه اصلی</label>
                      <div className="flex gap-2 mb-3">
                        <button 
                          type="button"
                          onClick={() => handleFieldChange(selectedFieldIndex, 'colSpan', 1)}
                          className={cn(
                            "flex-1 text-xs border py-1.5 rounded-lg transition-all cursor-pointer",
                            fields[selectedFieldIndex].colSpan !== 2 
                              ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900" 
                              : "bg-white border-gray-200 text-gray-500 dark:bg-gray-900 dark:border-gray-700"
                          )}
                        >
                          تک ستونه (۵۰٪)
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleFieldChange(selectedFieldIndex, 'colSpan', 2)}
                          className={cn(
                            "flex-1 text-xs border py-1.5 rounded-lg transition-all cursor-pointer",
                            fields[selectedFieldIndex].colSpan === 2 
                              ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900" 
                              : "bg-white border-gray-200 text-gray-500 dark:bg-gray-900 dark:border-gray-700"
                          )}
                        >
                          دوستونه (۱۰۰٪)
                        </button>
                      </div>
                    </div>

                    {/* Custom Width & Height Sizing Controls */}
                    <div className="space-y-2 bg-amber-50/50 dark:bg-amber-950/10 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                          <Scaling className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          ابعاد دقیق فیلد (پیکسل / درصد)
                        </label>
                        {(fields[selectedFieldIndex].width || fields[selectedFieldIndex].height || fields[selectedFieldIndex].styles?.width || fields[selectedFieldIndex].styles?.height) && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...fields];
                              delete updated[selectedFieldIndex].width;
                              delete updated[selectedFieldIndex].height;
                              if (updated[selectedFieldIndex].styles) {
                                delete updated[selectedFieldIndex].styles.width;
                                delete updated[selectedFieldIndex].styles.height;
                              }
                              setFields(updated);
                            }}
                            className="text-[9px] text-amber-700 dark:text-amber-300 font-bold hover:underline cursor-pointer"
                          >
                            بازنشانی ابعاد (خودکار)
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">عرض فیلد</label>
                          <input 
                            type="text"
                            placeholder="مثال: 280px یا 100%"
                            value={fields[selectedFieldIndex].styles?.width || fields[selectedFieldIndex].width || ''}
                            onChange={(e) => {
                              handleFieldStyleChange(selectedFieldIndex, 'width', e.target.value);
                              handleFieldChange(selectedFieldIndex, 'width', e.target.value);
                            }}
                            className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1 focus:outline-none font-mono text-left dir-ltr"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">ارتفاع فیلد</label>
                          <input 
                            type="text"
                            placeholder="مثال: 55px"
                            value={fields[selectedFieldIndex].styles?.height || fields[selectedFieldIndex].height || ''}
                            onChange={(e) => {
                              handleFieldStyleChange(selectedFieldIndex, 'height', e.target.value);
                              handleFieldChange(selectedFieldIndex, 'height', e.target.value);
                            }}
                            className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1 focus:outline-none font-mono text-left dir-ltr"
                          />
                        </div>
                      </div>
                      <p className="text-[9px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                        💡 می‌توانید روی کانواس وسط هم با درگ موس روی دستگیره‌های آبی، عرض و ارتفاع فیلدها را کم و زیاد کنید.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-gray-500 dark:text-gray-400">ورود اطلاعات اجباری باشد؟</label>
                      <input 
                        type="checkbox"
                        checked={!!fields[selectedFieldIndex].required}
                        onChange={(e) => handleFieldChange(selectedFieldIndex, 'required', e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                    </div>

                    {/* Options manager for select / radio */}
                    {['select', 'radio', 'multi-select', 'multi-checkbox'].includes(fields[selectedFieldIndex].type) && (
                      <div className="space-y-2 bg-slate-100/60 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-gray-600 dark:text-gray-300">مدیریت گزینه‌ها</label>
                          <button 
                            onClick={() => {
                              const opts = fields[selectedFieldIndex].options || [];
                              const newOpt = { value: `val_${Date.now()}`, label: 'گزینه جدید' };
                              handleFieldChange(selectedFieldIndex, 'options', [...opts, newOpt]);
                            }}
                            className="text-[9px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                          >
                            + افزودن گزینه
                          </button>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                          {(fields[selectedFieldIndex].options || []).map((opt: any, optIdx: number) => (
                            <div key={optIdx} className="flex gap-1 items-center">
                              <input 
                                type="text"
                                placeholder="کد"
                                value={opt.value}
                                onChange={(e) => {
                                  const updatedOpts = [...fields[selectedFieldIndex].options];
                                  updatedOpts[optIdx].value = e.target.value;
                                  handleFieldChange(selectedFieldIndex, 'options', updatedOpts);
                                }}
                                className="w-16 text-[9px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-1 py-0.5 rounded focus:outline-none font-mono"
                              />
                              <input 
                                type="text"
                                placeholder="عنوان"
                                value={opt.label}
                                onChange={(e) => {
                                  const updatedOpts = [...fields[selectedFieldIndex].options];
                                  updatedOpts[optIdx].label = e.target.value;
                                  handleFieldChange(selectedFieldIndex, 'options', updatedOpts);
                                }}
                                className="flex-1 text-[9px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-1 py-0.5 rounded focus:outline-none"
                              />
                              <button 
                                onClick={() => {
                                  const updatedOpts = fields[selectedFieldIndex].options.filter((_: any, i: number) => i !== optIdx);
                                  handleFieldChange(selectedFieldIndex, 'options', updatedOpts);
                                }}
                                className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Individual Field Styling */}
                    <div className="space-y-3 bg-blue-50/30 dark:bg-blue-950/10 p-3 rounded-lg border border-blue-100/50 dark:border-blue-900/20">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                        <Type className="h-3 w-3 text-blue-500" />
                        استایل اختصاصی این فیلد
                      </div>

                      <div>
                        <label className="block text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">نوع قلم فیلد (Font)</label>
                        <select 
                          value={fields[selectedFieldIndex].styles?.fontFamily || 'font-sans'}
                          onChange={(e) => handleFieldStyleChange(selectedFieldIndex, 'fontFamily', e.target.value)}
                          className="w-full text-[10px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md px-1.5 py-1 focus:outline-none"
                        >
                          {FONT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">اندازه متن فیلد</label>
                        <select 
                          value={fields[selectedFieldIndex].styles?.fontSize || 'text-sm'}
                          onChange={(e) => handleFieldStyleChange(selectedFieldIndex, 'fontSize', e.target.value)}
                          className="w-full text-[10px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md px-1.5 py-1 focus:outline-none"
                        >
                          {FONT_SIZE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">رنگ متن</label>
                          <input 
                            type="color"
                            value={fields[selectedFieldIndex].styles?.textColor || '#1f2937'}
                            onChange={(e) => handleFieldStyleChange(selectedFieldIndex, 'textColor', e.target.value)}
                            className="w-full h-7 border border-gray-200 dark:border-gray-700 bg-white rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">رنگ پس‌زمینه</label>
                          <input 
                            type="color"
                            value={fields[selectedFieldIndex].styles?.bgColor || '#ffffff'}
                            onChange={(e) => handleFieldStyleChange(selectedFieldIndex, 'bgColor', e.target.value)}
                            className="w-full h-7 border border-gray-200 dark:border-gray-700 bg-white rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center text-[11px] text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-6">
                    برای تنظیم ویژگی‌ها، فونت، عرض و رنگ هر فیلد، بر روی آن فیلد در پنل وسط کلیک کنید.
                  </div>
                )}

                {/* Selected Band Customizer Panel */}
                {selectedBandIndex !== null && bands[selectedBandIndex] && (
                  <div className="space-y-4 border-t border-indigo-200 dark:border-indigo-900/60 pt-5">
                    <h3 className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 border-b border-indigo-100 dark:border-indigo-900/40 pb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-indigo-600" />
                        تنظیمات باند فعال (شماره {selectedBandIndex + 1})
                      </span>
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded dir-ltr font-mono">
                        {bands[selectedBandIndex].width || '100%'}
                      </span>
                    </h3>

                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">عنوان باند</label>
                      <input 
                        type="text"
                        value={bands[selectedBandIndex].title}
                        onChange={(e) => handleBandChange(selectedBandIndex, 'title', e.target.value)}
                        className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1">
                        <FolderTree className="h-3 w-3 text-indigo-500" />
                        باند والد (حالت تو در تو)
                      </label>
                      <select 
                        value={bands[selectedBandIndex].parentBandId || ''}
                        onChange={(e) => {
                          const pId = e.target.value || undefined;
                          handleNestBand(selectedBandIndex, pId);
                        }}
                        className="w-full text-xs border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-lg px-2 py-1.5 focus:outline-none font-medium"
                      >
                        <option value="">بدون والد (باند اصلی / سطح ریشه)</option>
                        {bands
                          .filter(b => b.id !== bands[selectedBandIndex].id && !isDescendantOf(bands, b.id, bands[selectedBandIndex].id))
                          .map((b, pIdx) => (
                            <option key={b.id} value={b.id}>
                              {b.title || `باند شماره ${pIdx + 1}`} ({b.width || '100%'})
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {/* Band Width Presets and Input */}
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">عرض باند (۲۵٪ تا ۱۰۰٪)</label>
                      <div className="flex gap-1.5 mb-2">
                        {['25%', '50%', '100%'].map((wPreset) => (
                          <button
                            key={wPreset}
                            type="button"
                            onClick={() => handleBandChange(selectedBandIndex, 'width', wPreset)}
                            className={cn(
                              "flex-1 text-[11px] font-mono py-1 rounded-lg border transition-all cursor-pointer",
                              bands[selectedBandIndex].width === wPreset
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                            )}
                          >
                            {wPreset}
                          </button>
                        ))}
                      </div>
                      <input 
                        type="text"
                        placeholder="مثال: 75% یا 50%"
                        value={bands[selectedBandIndex].width || '100%'}
                        onChange={(e) => handleBandChange(selectedBandIndex, 'width', e.target.value)}
                        className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none font-mono dir-ltr"
                      />
                    </div>

                    {/* Margin & Padding */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">مارجین (Margin)</label>
                        <input 
                          type="text"
                          placeholder="6px 0px"
                          value={bands[selectedBandIndex].margin || ''}
                          onChange={(e) => handleBandChange(selectedBandIndex, 'margin', e.target.value)}
                          className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none font-mono dir-ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">پدینگ (Padding)</label>
                        <input 
                          type="text"
                          placeholder="12px"
                          value={bands[selectedBandIndex].padding || ''}
                          onChange={(e) => handleBandChange(selectedBandIndex, 'padding', e.target.value)}
                          className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none font-mono dir-ltr"
                        />
                      </div>
                    </div>

                    {/* Colors & Border */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">رنگ بک‌گراند</label>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="color"
                            value={bands[selectedBandIndex].bgColor || '#ffffff'}
                            onChange={(e) => handleBandChange(selectedBandIndex, 'bgColor', e.target.value)}
                            className="w-7 h-7 rounded border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5"
                          />
                          <input 
                            type="text"
                            value={bands[selectedBandIndex].bgColor || '#ffffff'}
                            onChange={(e) => handleBandChange(selectedBandIndex, 'bgColor', e.target.value)}
                            className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1 focus:outline-none font-mono dir-ltr"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">رنگ بوردر</label>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="color"
                            value={bands[selectedBandIndex].borderColor || '#e2e8f0'}
                            onChange={(e) => handleBandChange(selectedBandIndex, 'borderColor', e.target.value)}
                            className="w-7 h-7 rounded border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5"
                          />
                          <input 
                            type="text"
                            value={bands[selectedBandIndex].borderColor || '#e2e8f0'}
                            onChange={(e) => handleBandChange(selectedBandIndex, 'borderColor', e.target.value)}
                            className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1 focus:outline-none font-mono dir-ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Border Width & Style */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">ضخامت بوردر</label>
                        <input 
                          type="text"
                          placeholder="1px"
                          value={bands[selectedBandIndex].borderWidth || '1px'}
                          onChange={(e) => handleBandChange(selectedBandIndex, 'borderWidth', e.target.value)}
                          className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none font-mono dir-ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">انحنای گوشه‌ها (Radius)</label>
                        <input 
                          type="text"
                          placeholder="12px"
                          value={bands[selectedBandIndex].borderRadius || '12px'}
                          onChange={(e) => handleBandChange(selectedBandIndex, 'borderRadius', e.target.value)}
                          className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5 focus:outline-none font-mono dir-ltr"
                        />
                      </div>
                    </div>

                    {/* Delete Band Action */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteBand(selectedBandIndex)}
                        className="flex-1 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all border border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        حذف این باند
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>

      {/* 3. Preview Modal */}
      {previewFormCode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="bg-slate-50 dark:bg-gray-800/80 px-5 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                <Eye className="h-4 w-4 text-cyan-600" />
                پیش‌نمایش فرم پویا ({previewFormCode})
              </div>
              <button 
                onClick={() => setPreviewFormCode(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <DynamicFormRunner 
                formCode={previewFormCode}
                title={formTitle}
                defaultViewMode="form"
                initialConfig={{
                  formCode,
                  formTitle,
                  formComponent,
                  bands,
                  fields,
                  styles,
                  description: formDesc,
                  showPrintList,
                  showVoucherActionbar,
                  dynamicFormId: selectedForm?.dynamicFormId || 0,
                }}
                onClose={() => setPreviewFormCode(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Create Main Menu Modal */}
      {isMainMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FolderPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">
                    {editingMenuId ? 'ویرایش منوی اصلی' : 'ایجاد منوی اصلی جدید'}
                  </h2>
                  <p className="text-[11px] text-indigo-100 opacity-90">
                    تعریف یا ویرایش منوی اصلی سفارشی جهت جای‌گذاری در سایدبار سیستم
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsMainMenuModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* Error Alert */}
              {mainMenuError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{mainMenuError}</span>
                </div>
              )}

              {/* Title & TitleEn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    عنوان منوی اصلی (فارسی) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMenuTitle}
                    onChange={(e) => setNewMenuTitle(e.target.value)}
                    placeholder="مثال: مدیریت بازرگانی"
                    className="w-full text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    عنوان انگلیسی (کد) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMenuTitleEn}
                    onChange={(e) => setNewMenuTitleEn(e.target.value)}
                    placeholder="e.g. Commerce Management"
                    dir="ltr"
                    className="w-full text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left font-mono"
                  />
                </div>
              </div>

              {/* Display Priority */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  اولویت نمایش (غیرتکراری) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={newMenuPriority}
                  onChange={(e) => setNewMenuPriority(e.target.value)}
                  placeholder="مثال: 15"
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  ترتیب نمایش در منو بر اساس این اولویت تنظیم می‌شود. اولویت تکراری مجاز نیست.
                </p>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  انتخاب آیکون منو <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-36 overflow-y-auto p-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                  {AVAILABLE_MENU_ICONS.map(item => {
                    const IconComp = item.IconComp;
                    const isSelected = newMenuIcon === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setNewMenuIcon(item.value)}
                        title={item.label}
                        className={cn(
                          "p-2.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer border",
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        )}
                      >
                        <IconComp className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  انتخاب رنگ نماد <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {PRESET_MENU_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewMenuColor(c.hex)}
                      title={c.label}
                      className={cn(
                        "w-7 h-7 rounded-full transition-transform cursor-pointer border-2 flex items-center justify-center",
                        newMenuColor === c.hex ? "scale-110 border-gray-900 dark:border-white shadow-md" : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: c.hex }}
                    >
                      {newMenuColor === c.hex && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 mr-auto border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-white dark:bg-gray-800">
                    <input
                      type="color"
                      value={newMenuColor}
                      onChange={(e) => setNewMenuColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-gray-600 dark:text-gray-300">{newMenuColor}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-gray-800/80 px-5 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsMainMenuModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSaveMainMenu}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                {editingMenuId ? 'ذخیره تغییرات' : 'ایجاد منوی اصلی'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Create / Edit SubMenu Modal */}
      {isSubMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-emerald-600 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FolderPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">
                    {editingSubMenuId ? 'ویرایش زیرمنو' : 'ایجاد زیرمنوی جدید'}
                  </h2>
                  <p className="text-[11px] text-emerald-100 opacity-90">
                    در منوی اصلی: {subMenuMainTitle}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsSubMenuModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {subMenuError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{subMenuError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  عنوان زیرمنو <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSubMenuTitleInput}
                  onChange={(e) => setNewSubMenuTitleInput(e.target.value)}
                  placeholder="مثال: گزارشات ماهانه"
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-gray-800/80 px-5 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsSubMenuModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSaveSubMenu}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                {editingSubMenuId ? 'ذخیره تغییرات' : 'ایجاد زیرمنو'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {isCreateFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FilePlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">افزودن فرم جدید</h2>
                  <p className="text-[11px] text-blue-100 opacity-90">
                    تعریف مشخصات پایه و کد اختصاصی فرم برای ورود به محیط طراحی
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsCreateFormModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {createFormError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{createFormError}</span>
                </div>
              )}

              {/* Title & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    عنوان فارسی فرم <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createFormTitle}
                    onChange={(e) => setCreateFormTitle(e.target.value)}
                    placeholder="مثال: فرم مرخصی پرسنل"
                    className="w-full text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    کد اختصاصی فرم (لاتین) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createFormCode}
                    onChange={(e) => setCreateFormCode(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="مثال: leave_request"
                    className="w-full text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono dir-ltr"
                  />
                </div>
              </div>

              {/* Base Template Structure */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ساختار قالب پایه فرم <span className="text-rose-500">*</span>
                </label>
                <select
                  value={createFormComponent}
                  onChange={(e) => setCreateFormComponent(e.target.value)}
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600 dark:text-blue-400"
                >
                  {COMPONENT_TEMPLATES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  توضیحات فرم (اختیاری)
                </label>
                <textarea
                  value={createFormDesc}
                  onChange={(e) => setCreateFormDesc(e.target.value)}
                  placeholder="توضیحات تکمیلی پیرامون این فرم..."
                  rows={2}
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Placement Summary */}
              <div className="bg-slate-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <span className="text-gray-500 dark:text-gray-400">مکان ثبت در منو: </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {allDashboardGroups.find(g => g.id === createMenuGroupId)?.name || 'اطلاعات پایه'}
                  {' » '}
                  {createMenuTitle}
                  {' » '}
                  {createSubMenuTitle}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-gray-800/80 px-5 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateFormModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateFormModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                ایجاد فرم و ورود به طراحی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Placement Edit Modal */}
      {isPlacementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-indigo-600 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Layout className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">تغییر مکان قرارگیری فرم در منو</h2>
                  <p className="text-[11px] text-indigo-100 opacity-90">انتخاب گروه اصلی، منوی اصلی و زیرمنو</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsPlacementModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">گروه اصلی سیستم</label>
                <select
                  value={menuGroupId}
                  onChange={(e) => {
                    const newGId = e.target.value;
                    setMenuGroupId(newGId);
                    const knownMenus = GROUP_MAIN_MENUS[newGId] || ['اطلاعات پایه', 'عملیات', 'گزارشات'];
                    if (knownMenus.length > 0) {
                      setMenuTitle(knownMenus[0]);
                      setIsCustomMenuTitle(false);
                      setCustomMenuTitle('');
                    }
                  }}
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200"
                >
                  {allDashboardGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">منوی اصلی</label>
                <select
                  value={isCustomMenuTitle ? 'custom' : menuTitle}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      handleOpenCreateMainMenuModal(menuGroupId);
                    } else {
                      setIsCustomMenuTitle(false);
                      setMenuTitle(e.target.value);
                    }
                  }}
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200"
                >
                  {availableGroupMainMenus.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="custom">+ تعریف منوی اصلی جدید...</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">زیرمنو</label>
                <select
                  value={isCustomSubMenuTitle ? 'custom' : subMenuTitle}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomSubMenuTitle(true);
                      setCustomSubMenuTitle('');
                    } else {
                      setIsCustomSubMenuTitle(false);
                      setSubMenuTitle(e.target.value);
                    }
                  }}
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200"
                >
                  {SUBMENU_PRESETS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="custom">+ تعریف زیرمنوی جدید...</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-800/80 px-5 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPlacementModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
              >
                تایید مکان
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

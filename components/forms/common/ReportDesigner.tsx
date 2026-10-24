/* eslint-disable react-hooks/purity */
"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { apiFetch } from "@/lib/utils";
import { useReportDesignerStore } from "@/lib/stores/reportDesignerStore";
import {
  Save,
  Printer,
  Search,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  PaintBucket,
  Square,
  ZoomIn,
  FileText,
  Database,
  PlusSquare,
  MinusSquare,
  Folder,
  Settings,
  Type,
  Hash,
  Calendar,
  Table2,
  X,
  Trash2,
  Loader2,
  Circle,
  Copy,
  ClipboardPaste,
  Edit2
} from "lucide-react";
import { useLanguage, useCompany } from "@/components/Providers";
import { NewButton } from "@/components/buttons/NewButton";
import { SaveButton } from "@/components/buttons/SaveButton";
import { SaveNewButton } from "@/components/buttons/SaveNewButton";
import { SaveCloseButton } from "@/components/buttons/SaveCloseButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ToastProvider";

export type TElementProps = {
  id: string;
  type?: string; 
  text: string;
  x: number;
  y: number;
  width: number;
  height?: number; // useful for box, image, chart/table
  isAt: boolean;
  sectionId: string;
  fontFamily?: string;
  format?: string;
  [key: string]: any;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  direction?: "rtl" | "ltr";
  color?: string;
  backgroundColor?: string;
  border?: string; // legacy support
  borderTop?: boolean | string;
  borderRight?: boolean | string;
  borderBottom?: boolean | string;
  borderLeft?: boolean | string;
  borderStyle?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  // new dynamic/static element properties
  isDynamic?: boolean;
  isRequired?: boolean;
  dynamicKey?: string;
  dataType?: "string" | "number" | "boolean" | "date";
  options?: string; // Comma separated for dropdowns/lists
};

function DesignerTreeItem({ node, depth = 0 }: { node: any; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const handleDragStart = (e: React.DragEvent) => {
    if (!hasChildren) {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          id: node.id,
          label: node.label,
          type: node.type || "text",
          rawName: node.rawName,
        }),
      );
      e.dataTransfer.effectAllowed = "copy";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (node.onDropNode) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (node.onDropNode) {
      e.preventDefault();
      e.stopPropagation();
      const dataStr = e.dataTransfer.getData("application/json");
      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          node.onDropNode(data);
        } catch (err) {}
      }
    }
  };

  return (
    <div className="select-none">
      <div
        draggable={!hasChildren}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex items-center gap-1 py-0.5 hover:bg-blue-100 cursor-pointer group"
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={(e) => {
          if (node.onClick) {
            node.onClick();
          }
          setExpanded(!expanded);
        }}
      >
        <div 
          className="w-3.5 h-3.5 flex items-center justify-center shrink-0"
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              setExpanded(!expanded);
            }
          }}
        >
          {hasChildren ? (
            expanded ? (
              <MinusSquare className="w-3 h-3 text-gray-500" />
            ) : (
              <PlusSquare className="w-3 h-3 text-gray-500" />
            )
          ) : (
            <div className="w-3 h-3" />
          )}
        </div>
        {node.icon && <div className="shrink-0">{node.icon}</div>}
        <span 
          className="text-[12px] text-gray-800 whitespace-nowrap"
        >
          {node.label}
        </span>
        {node.onEdit && (
           <Edit2 
              className="w-3.5 h-3.5 text-blue-500 ml-auto hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" 
              onClick={(e) => {
                 e.stopPropagation();
                 node.onEdit();
              }} 
           />
        )}
        {node.onDelete && (
           <Trash2 
              className={`w-3.5 h-3.5 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity ${node.onEdit ? 'mx-1' : 'ml-auto mx-2'}`}
              onClick={(e) => {
                 e.stopPropagation();
                 node.onDelete();
              }} 
           />
        )}
      </div>
      {expanded && hasChildren && (
        <div 
          className="flex flex-col"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {node.children.map((child: any) => (
            <DesignerTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportBand({
  title,
  height = 60,
  children,
  sectionId,
  onDropItem,
  onHeightChange,
  onContextMenu,
}: {
  title: string;
  height?: number;
  children?: React.ReactNode;
  sectionId?: string;
  onDropItem?: (
    node: any,
    pos: { x: number; y: number },
    sectionId: string,
  ) => void;
  onHeightChange?: (height: number) => void;
  onContextMenu?: (e: React.MouseEvent, sectionId: string) => void;
}) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!onDropItem || !sectionId) return;
    try {
      const data = e.dataTransfer.getData("application/json");
      if (data) {
        const rect = e.currentTarget.getBoundingClientRect();
        onDropItem(
          JSON.parse(data),
          { x: Math.max(20, e.clientX - rect.left), y: e.clientY - rect.top },
          sectionId,
        );
      }
    } catch (err) {}
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(10, startHeight + deltaY); // Minimum height 10
      if (onHeightChange) {
        onHeightChange(newHeight);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="flex flex-col border-b border-gray-300 relative group">
      {/* Band Header */}
      <div className="bg-[#e4e4e4] border-b border-gray-300 px-2 py-0.5 text-[11px] text-gray-700 font-medium select-none shadow-sm shadow-white inset-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{title}</span>
        </div>
      </div>
      {/* Band Content */}
      <div
        className="bg-white relative flex"
        style={{ height: `${height}px` }}
      >
        {/* Left vertical gray bar with dots */}
        <div className="w-5 bg-[#f0f0f0] border-r border-gray-300 flex flex-col items-center justify-center shrink-0 text-gray-400 text-[8px] leading-[6px] tracking-widest pt-1 overflow-hidden pointer-events-none select-none">
          . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
          .
        </div>
        {/* The canvas grid (optional dotted background) */}
        <div
          className="flex-1 relative bg-grid-pattern"
          data-section-id={sectionId}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onContextMenu={(e) => {
            if (onContextMenu && sectionId) {
              e.preventDefault();
              onContextMenu(e, sectionId);
            }
          }}
        >
          {children}
        </div>
      </div>
      {/* Resizer Handle */}
      {onHeightChange && (
        <div
          className="h-1.5 bg-gray-200 hover:bg-blue-300 cursor-row-resize w-full z-10 transition-colors"
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
}

function FormulaFunctionCategory({ 
  title, 
  icon,
  items,
  onItemDoubleClick
}: { 
  title: string, 
  icon?: React.ReactNode,
  items: (string | { label: string, value: string })[],
  onItemDoubleClick?: (value: string) => void
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2">
      <div 
        className="font-semibold text-gray-800 cursor-pointer flex items-center gap-1 hover:bg-gray-200 px-1 py-0.5 select-none text-xs" 
        onClick={() => setOpen(!open)}
      >
        {open ? <MinusSquare className="w-3.5 h-3.5 text-gray-500" /> : <PlusSquare className="w-3.5 h-3.5 text-gray-500" />}
        {icon && <div className="shrink-0">{icon}</div>}
        <span>{title}</span>
      </div>
      {open && (
        <ul className="flex flex-col">
          {items.map((item, idx) => {
            const label = typeof item === 'string' ? item : item.label;
            const value = typeof item === 'string' ? item : item.value;
            return (
              <li 
                key={idx} 
                className="pr-6 hover:bg-blue-50 cursor-pointer py-0.5 text-gray-700 flex items-center gap-1.5 text-xs"
                onDoubleClick={() => onItemDoubleClick && onItemDoubleClick(value)}
              >
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: "radial-gradient(circle at 3px 3px, #ff9999, #cc0000)" }}></div>
                <span>{label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ReportDesigner({
  reportTitle,
  selectedFields = [],
  groupings = [],
  onGroupingsChange,
  onSave,
  isSaving = false,
  onDirtyChange,
  primaryTable,
  sqlScript,
  initialParamValues,
  startInPreview,
  initialFormulas,
  aggregates,
  onClosePreview,
  onPreviewLoadingChange,
  paperOrientation: propPaperOrientation,
}: {
  reportTitle?: string;
  selectedFields?: any[];
  groupings?: any[];
  aggregates?: any[];
  onGroupingsChange?: (groupings: any[]) => void;
  onSave?: (elements: TElementProps[], paramValues: Record<string, any>, formulas?: {name: string, expression: string}[], layouts?: any) => void;
  isSaving?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  primaryTable?: string;
  sqlScript?: string;
  initialParamValues?: Record<string, any>;
  paperOrientation?: string;
  startInPreview?: boolean;
  initialFormulas?: any[];
  onClosePreview?: () => void;
  onPreviewLoadingChange?: (loading: boolean) => void;
}) {
  const { t } = useLanguage();
  const { currentCompany } = useCompany();
  const {
    showPreview, setShowPreview,
    showBorderToolbar, setShowBorderToolbar,
    previewData, setPreviewData,
    previewError, setPreviewError,
    previewLoading, setPreviewLoading,
    elements, setElements,
    selectedElementIds, setSelectedElementIds,
    showPropertiesPane, setShowPropertiesPane,
    showParamsModal, setShowParamsModal,
    paramValues, setParamValues,
    canUndo, setCanUndo,
    canRedo, setCanRedo,
    formulaToDelete, setFormulaToDelete
  } = useReportDesignerStore();
  
  const [localSqlScript, setLocalSqlScript] = useState<string | undefined>(sqlScript);
  
  const [paperOrientation, setPaperOrientation] = useState<"portrait" | "landscape">(
    (propPaperOrientation as "portrait" | "landscape") || "portrait"
  );
  const [paperSize, setPaperSize] = useState<string>("A4");
  const [customWidth, setCustomWidth] = useState<number>(210); // in mm
  const [customHeight, setCustomHeight] = useState<number>(297); // in mm
  const [margins, setMargins] = useState<{ top: number; right: number; bottom: number; left: number }>({
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  });
  const [showPageSetupModal, setShowPageSetupModal] = useState<boolean>(false);

  useEffect(() => {
    if (propPaperOrientation) {
      setPaperOrientation(propPaperOrientation as "portrait" | "landscape");
    }
  }, [propPaperOrientation]);
  
  useEffect(() => {
    if (sqlScript !== undefined) {
       setLocalSqlScript(sqlScript);
    }
  }, [sqlScript]);

  const initialParamsJson = initialParamValues ? JSON.stringify(initialParamValues) : null;
  
  useEffect(() => {
    if (initialParamsJson) {
      setParamValues(JSON.parse(initialParamsJson));
    }
  }, [initialParamsJson, setParamValues]);

  useEffect(() => {
    if (startInPreview !== undefined) {
      setShowPreview(startInPreview);
    }
  }, [startInPreview, setShowPreview]);
  
  const historyRef = useRef<TElementProps[][]>([]);
  const historyIndexRef = useRef<number>(-1);

  const updateUndoRedoState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, [setCanUndo, setCanRedo]);

  const { showToast } = useToast();

  const addGraphicElement = (type: string) => {
    let lbl = "";
    let width = 100;
    let height = 20;

    switch(type) {
       case 'label': lbl = "Lable"; break;
       case 'text': lbl = "[Text Input]"; break;
       case 'textarea': lbl = "[Text Area]"; height = 40; break;
       case 'checkbox': lbl = "☐"; width = 20; break;
       case 'radio': lbl = "◯"; width = 20; break;
       case 'list': lbl = "[ لیست انتخاب ]"; width = 120; break;
       case 'box': lbl = ""; width = 100; height = 50; break;
       case 'circle': lbl = ""; width = 50; height = 50; break;
       case 'line': lbl = ""; width = 200; height = 2; break;
       case 'image': lbl = "[ Image ]"; width = 50; height = 50; break;
       case 'table': lbl = "[ Table ]"; width = 200; height = 80; break;
    }

    const isDynamicElement = ['text', 'textarea', 'checkbox', 'radio', 'list'].includes(type);

    const newElement: TElementProps = {
      id: `ext_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      type,
      text: lbl,
      x: 10,
      y: 10,
      width,
      height,
      isAt: false,
      sectionId: "Page Header", 
      fontFamily: "Tahoma",
      fontSize: "10",
      backgroundColor: type === 'box' ? 'transparent' : undefined,
      borderColor: type === 'box' || type === 'line' ? '#000000' : undefined,
      border: type === 'box' || type === 'table' ? '1px solid #000' : undefined,
      borderTop: type === 'line' ? '1px solid #000' : undefined,
      borderRadius: type === 'circle' ? '50%' : undefined,
      isDynamic: isDynamicElement,
      dataType: type === 'checkbox' ? 'boolean' : 'string',
      dynamicKey: isDynamicElement ? `field_${Math.floor(Math.random() * 10000)}` : undefined
    };

    setElements(prev => {
       const newE = [...prev, newElement];
       saveHistory(newE);
       return newE;
    });
    notifyChange();
  };

  const saveHistory = useCallback((state: TElementProps[]) => {
    const history = historyRef.current;
    const index = historyIndexRef.current;
    if (index < history.length - 1) {
       history.splice(index + 1);
    }
    history.push(JSON.parse(JSON.stringify(state)));
    if (history.length > 50) {
       history.shift();
    }
    historyIndexRef.current = history.length - 1;
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      setElements(historyRef.current[historyIndexRef.current]);
      notifyChange();
      updateUndoRedoState();
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      setElements(historyRef.current[historyIndexRef.current]);
      notifyChange();
      updateUndoRedoState();
    }
  };
  const [showFormulaNameModal, setShowFormulaNameModal] = useState(false);
  const [formulaName, setFormulaName] = useState("");
  const [formulaExpression, setFormulaExpression] = useState("");
  const [showFormulaEditorModal, setShowFormulaEditorModal] = useState(false);
  const [formulas, setFormulas] = useState<{name: string, expression: string}[]>(() => {
    if (initialFormulas && initialFormulas.length > 0) {
      return initialFormulas.map(f => ({ name: f.formulaName || f.name, expression: f.expression }));
    }
    return [];
  });

  useEffect(() => {
    if (initialFormulas && initialFormulas.length > 0) {
      setFormulas(initialFormulas.map(f => ({ name: f.formulaName || f.name, expression: f.expression })));
    }
  }, [initialFormulas]);

  const [runningTotals, setRunningTotals] = useState<any[]>([]);
  const [showRunningTotalModal, setShowRunningTotalModal] = useState(false);
  const [editingRunningTotal, setEditingRunningTotal] = useState<any>(null);

  useEffect(() => {
    if (aggregates && aggregates.length > 0) {
      setRunningTotals(prev => {
        const fromAgg = aggregates.map(a => ({
          name: `جمع_${a.field.name}`,
          fieldToSummarize: a.field.name,
          summaryType: 'sum',
          evaluateType: 'each_record',
          resetType: a.groupBy ? 'change_of_group' : 'never',
          resetGroup: a.groupBy || undefined
        }));
        // Merge without duplicating names
        const merged = [...prev];
        fromAgg.forEach(newAgg => {
          if (!merged.find(m => m.name === newAgg.name)) {
            merged.push(newAgg);
          }
        });
        return merged;
      });
    }
  }, [aggregates]);

  const initialMount = useRef(true);

  const [bandContextMenu, setBandContextMenu] = useState<{ x: number, y: number, sectionId: string } | null>(null);

  useEffect(() => {
    const closeBandMenu = () => setBandContextMenu(null);
    window.addEventListener("click", closeBandMenu);
    return () => window.removeEventListener("click", closeBandMenu);
  }, []);

  const handleAlignBand = (sectionId: string, align: "top" | "middle" | "bottom") => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    setElements((prev) => {
      const newElements = prev.map((el) => {
        if (el.sectionId === sectionId) {
          if (align === "top") {
            return { ...el, y: 2 };
          } else if (align === "middle") {
            return { ...el, y: Math.max(0, section.height / 2 - Number(el.fontSize || 10)) };
          } else if (align === "bottom") {
            return { ...el, y: Math.max(0, section.height - Number(el.fontSize || 10) - 10) };
          }
        }
        return el;
      });
      saveHistory(newElements);
      return newElements;
    });
    notifyChange();
  };

  const defaultSections = React.useMemo(
    () => [
      { id: "Report Header", title: "Report Header (Section3)", height: 60 },
      { id: "Page Header", title: "Page Header (Section1)", height: 40 },
      ...groupings.map((g, gi) => ({
        id: `Group Header ${gi + 1}`,
        title: `Group Header #${gi + 1}: ${t("field_" + g.name, g.name)} (Section${6 + gi})`,
        height: 30,
      })),
      { id: "Details", title: "Details (Section5)", height: 25 },
      ...[...groupings]
        .reverse()
        .map((g, gi) => ({
          id: `Group Footer ${groupings.length - gi}`,
          title: `Group Footer #${groupings.length - gi}: ${t("field_" + g.name, g.name)} (Section${7 + gi})`,
          height: 30,
        })),
      { id: "Report Footer", title: "Report Footer (Section4)", height: 50 },
      { id: "Page Footer", title: "Page Footer (Section2)", height: 40 },
    ],
    [groupings, t],
  );

  const [sections, setSections] = useState(defaultSections);

  useEffect(() => {
    setSections((prev) => {
      const prevIds = prev.map((s) => s.id);
      const defaultIds = defaultSections.map((s) => s.id);

      let next = prev.filter((s) => defaultIds.includes(s.id));

      const nextIds = next.map((s) => s.id);
      const toAdd = defaultSections.filter((s) => !nextIds.includes(s.id));
      if (toAdd.length) {
        toAdd.forEach((newSec) => {
          const defaultIndex = defaultSections.findIndex(
            (s) => s.id === newSec.id,
          );
          next.splice(defaultIndex, 0, newSec);
        });
      }

      return next.map((s) => ({
        ...s,
        title: defaultSections.find((ds) => ds.id === s.id)?.title || s.title,
      }));
    });
  }, [defaultSections]);

  const moveSection = (index: number, direction: "up" | "down") => {
    setSections((prev) => {
      const newSections = [...prev];
      if (direction === "up" && index > 0) {
        [newSections[index - 1], newSections[index]] = [
          newSections[index],
          newSections[index - 1],
        ];
      } else if (direction === "down" && index < newSections.length - 1) {
        [newSections[index], newSections[index + 1]] = [
          newSections[index + 1],
          newSections[index],
        ];
      }
      return newSections;
    });
    notifyChange();
  };

  useEffect(() => {
    if (showPreview && (primaryTable || localSqlScript)) {
      setPreviewError('');
      setPreviewLoading(true);
      onPreviewLoadingChange?.(true);
      console.log("preview query payload ->", { tableName: primaryTable, sqlScript: localSqlScript, fields: selectedFields });
      apiFetch("/api/reports/db-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getPreviewData",
          tableName: primaryTable,
          script: localSqlScript,
          fields: selectedFields,
          params: paramValues,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error("خطا در ارتباط با سرور");
          }
          return res.json();
        })
        .then((data) => {
          if (data.error) {
             setPreviewError("عدم دسترسی به بانک اطلاعاتی");
             setPreviewData([]);
          } else if (data.valid && data.data) {
             setPreviewData(data.data);
          } else {
             setPreviewData([]);
          }
        })
        .catch(() => {
          setPreviewError("عدم دسترسی به بانک اطلاعاتی");
          setPreviewData([]);
        })
        .finally(() => {
          setPreviewLoading(false);
          onPreviewLoadingChange?.(false);
        });
    } else {
      setPreviewError('');
      setPreviewLoading(false);
      onPreviewLoadingChange?.(false);
    }
  }, [showPreview, primaryTable, localSqlScript, onPreviewLoadingChange, paramValues]);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;

      const loadExistingAndInitialize = async () => {
        if (reportTitle) {
          try {
            const res = await apiFetch(
              `/api/reports/save?reportName=${encodeURIComponent(reportTitle)}&t=${Date.now()}`,
              { cache: "no-store" },
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.input) {
                  setParamValues(prev => ({ ...data.input, ...prev }));
              }
              if (data && data.layouts) {
                const lay = data.layouts;
                if (lay.paperSize) setPaperSize(lay.paperSize);
                if (lay.paperOrientation) setPaperOrientation(lay.paperOrientation);
                if (lay.customWidth) setCustomWidth(lay.customWidth);
                if (lay.customHeight) setCustomHeight(lay.customHeight);
                if (lay.margins) setMargins(lay.margins);
              }
              if (data && data.script) {
                  setLocalSqlScript(data.script);
              } else if (data && data.sqlScript) {
                  setLocalSqlScript(data.sqlScript);
              }
              if (data && data.items && data.items.length > 0) {
                const existingNames = data.items.map((el: any) =>
                  el.text.replace(/@/g, ""),
                );
                const newFields = selectedFields.filter(
                  (f) => !existingNames.includes(t(`field_${f.name}`, f.name)),
                );

                let combinedElements = [...data.items];

                if (newFields.length > 0) {
                  newFields.forEach((f, i) => {
                    const startX = 650 - (existingNames.length + i) * 120;
                    combinedElements.push({
                      id: `int_${Math.random().toString(36).substring(2)}`,
                      text: t(`field_${f.name}`, f.name),
                      x: startX,
                      y: 10,
                      width: 110,
                      isAt: false,
                      sectionId: "Page Header",
                      fontFamily: "Tahoma",
                      fontSize: "10",
                      fontWeight: "bold",
                    });
                    combinedElements.push({
                      id: `int_${Math.random().toString(36).substring(2)}`,
                      text: `@${t(`field_${f.name}`, f.name)}@`,
                      x: startX,
                      y: 2,
                      width: 110,
                      isAt: true,
                      sectionId: "Details",
                      fontFamily: "Tahoma",
                      fontSize: "10",
                    });
                  });
                }
                setElements(combinedElements);
                saveHistory(combinedElements);
                return; // successfully loaded saved layout
              }
            }
          } catch (e) {}
        }

        // fallback to default initialization
        const initialElements: TElementProps[] = [];
        const add = (
          text: string,
          x: number,
          y: number,
          width: number,
          isAt: boolean,
          sectionId: string,
        ) => {
          initialElements.push({
            id: `int_${Math.random().toString(36).substring(2)}`,
            text,
            x,
            y,
            width,
            isAt,
            sectionId,
            fontFamily: "Tahoma",
            fontSize: "10",
          });
        };

        add("نام سازمان", 250, 20, 150, true, "Report Header");
        add("تاریخ گزارش", 20, 10, 100, true, "Page Header");

        if (groupings && groupings.length > 0) {
          groupings.forEach((g, gi) => {
             add(
               t(`field_${g.name}`, g.name) + ": ",
               650,
               5,
               100,
               false,
               `Group Header ${gi + 1}`
             );
             // Make label bold as in handleDrop
             initialElements[initialElements.length - 1].fontWeight = "bold";

             add(
               t(`field_${g.name}`, g.name),
               540,
               5,
               100,
               true, // isAt
               `Group Header ${gi + 1}`
             );
          });
        }

        if (selectedFields.length > 0) {
          selectedFields.forEach((f, i) => {
            add(
              t(`field_${f.name}`, f.name),
              650 - i * 120,
              10,
              110,
              false,
              "Page Header",
            );
            initialElements[initialElements.length - 1].fontWeight = "bold";
            add(
              `@${t(`field_${f.name}`, f.name)}@`,
              650 - i * 120,
              2,
              110,
              true,
              "Details",
            );
          });
        } else {
          add("کد انبار", 550, 20, 60, false, "Page Header");
          add("نام انبار", 450, 20, 80, false, "Page Header");
          add("وضع نوع مالکی", 300, 20, 100, false, "Page Header");
          add("وضع نوع مالکیت", 300, 2, 100, true, "Details");
        }
        setElements(initialElements);
        saveHistory(initialElements);
      };

      loadExistingAndInitialize();
    }
  }, [selectedFields, t, reportTitle]);

  const notifyChange = () => {
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleDropItem = (
    node: any,
    pos: { x: number; y: number },
    sectionId: string,
  ) => {
    if (node.isGraphicElement) {
        const type = node.type;
        let lbl = "";
        let width = 100;
        let height = 20;

        switch(type) {
           case 'label': lbl = "Lable"; break;
           case 'text': lbl = "[Text Input]"; break;
           case 'textarea': lbl = "[Text Area]"; height = 40; break;
           case 'checkbox': lbl = "☐"; width = 20; break;
           case 'radio': lbl = "◯"; width = 20; break;
           case 'list': lbl = "[ لیست انتخاب ]"; width = 120; break;
           case 'box': lbl = ""; width = 100; height = 50; break;
           case 'circle': lbl = ""; width = 50; height = 50; break;
           case 'line': lbl = ""; width = 200; height = 2; break;
           case 'image': lbl = "[ Image ]"; width = 50; height = 50; break;
           case 'table': lbl = "[ Table ]"; width = 200; height = 80; break;
        }

        const isDynamicElement = ['text', 'textarea', 'checkbox', 'radio', 'list'].includes(type);

        const newElement: TElementProps = {
          id: `ext_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          type,
          text: lbl,
          x: pos.x,
          y: pos.y,
          width,
          height,
          isAt: sectionId === "Details",
          sectionId,
          fontFamily: "Tahoma",
          fontSize: "10",
          backgroundColor: type === 'box' ? 'transparent' : undefined,
          borderColor: type === 'box' || type === 'line' ? '#000000' : undefined,
          border: type === 'box' || type === 'table' ? '1px solid #000' : undefined,
          borderTop: type === 'line' ? '1px solid #000' : undefined,
          borderRadius: type === 'circle' ? '50%' : undefined,
          isDynamic: isDynamicElement,
          dataType: type === 'checkbox' ? 'boolean' : 'string',
          dynamicKey: isDynamicElement ? `field_${Math.floor(Math.random() * 10000)}` : undefined
        };

        setElements(prev => {
           const newE = [...prev, newElement];
           saveHistory(newE);
           return newE;
        });
        notifyChange();
        return;
    }

    setElements((prev) => {
      const isGeneral = node.type === "general";
      const isFormula = node.type === "formula";
      
      const dropText = isGeneral && node.rawName 
          ? node.rawName 
          : isFormula 
              ? `@${node.label}@` 
              : `@${t(`field_${node.label}`, node.label)}@`;

      const newElements = [
        ...prev,
        {
          id: `el_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          text: dropText,
          x: pos.x,
          y: pos.y,
          width: 100,
          isAt: sectionId === "Details",
          sectionId,
          fontFamily: "Tahoma",
          fontSize: "10",
        },
      ];

      if (
        sectionId === "Details" &&
        node.id?.startsWith("f_") &&
        node.id !== "f_empty"
      ) {
        const hasGroupHeader = groupings && groupings.length > 0;
        const headerSectionId = hasGroupHeader
          ? `Group Header ${groupings.length}`
          : "Page Header";
        newElements.push({
          id: `el_${Date.now()}_${Math.random().toString(36).substring(2)}_label`,
          text: isFormula ? node.label : t(`field_${node.label}`, node.label),
          x: pos.x,
          y: 10,
          width: 100,
          isAt: false,
          sectionId: headerSectionId,
          fontFamily: "Tahoma",
          fontSize: "10",
          fontWeight: "bold",
        });
      }

      saveHistory(newElements);
      return newElements;
    });
    notifyChange();
  };

  const selectedIdsRef = useRef<string[]>([]);
  useEffect(() => {
    selectedIdsRef.current = selectedElementIds;
  }, [selectedElementIds]);

  const elementsRef = useRef<TElementProps[]>(elements);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const clipboardRef = useRef<TElementProps[]>([]);

  const handleCopy = () => {
    if (selectedElementIds.length > 0) {
      clipboardRef.current = elements.filter((el) => selectedElementIds.includes(el.id));
    }
  };

  const handlePaste = () => {
    if (clipboardRef.current.length > 0) {
       const newlyPastedIds: string[] = [];
       const pasted = clipboardRef.current.map(c => {
           const newId = `paste_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
           newlyPastedIds.push(newId);
           return {
               ...c,
               id: newId,
               x: c.x + 10,
               y: c.y + 10
           };
       });
       
       setElements(prev => {
           const newE = [...prev, ...pasted];
           saveHistory(newE);
           return newE;
       });
       setTimeout(() => setSelectedElementIds(newlyPastedIds), 0);
       notifyChange();
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeIds = selectedIdsRef.current;
      
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && activeIds.length > 0) {
        if (e.key === "Backspace") {
          e.preventDefault();
        }
        setElements((prev) => {
           const newElements = prev.filter((el) => !activeIds.includes(el.id));
           saveHistory(newElements);
           return newElements;
        });
        setSelectedElementIds([]);
        notifyChange();
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'c') {
           if (activeIds.length > 0) {
               clipboardRef.current = elementsRef.current.filter(el => activeIds.includes(el.id));
           }
        }
        if (e.key.toLowerCase() === 'v') {
           if (clipboardRef.current.length > 0) {
               const newlyPastedIds: string[] = [];
               const pasted = clipboardRef.current.map(c => {
                   const newId = `paste_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
                   newlyPastedIds.push(newId);
                   return {
                       ...c,
                       id: newId,
                       x: c.x + 10,
                       y: c.y + 10
                   };
               });
               
               setElements(prev => {
                   const newE = [...prev, ...pasted];
                   saveHistory(newE);
                   return newE;
               });
               setTimeout(() => setSelectedElementIds(newlyPastedIds), 0);
               notifyChange();
           }
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [saveHistory]);

  const handleGraphicDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ isGraphicElement: true, type }));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDeleteSelected = () => {
    if (selectedElementIds.length > 0) {
      setElements((prev) => {
        const newElements = prev.filter((el) => !selectedElementIds.includes(el.id));
        saveHistory(newElements);
        return newElements;
      });
      setSelectedElementIds([]);
      notifyChange();
    }
  };

  const updateElementProps = (propsToUpdate: Partial<TElementProps>) => {
    if (selectedElementIds.length === 0) return;
    setElements((prev) => {
      const newElements = prev.map((el) => {
        if (selectedElementIds.includes(el.id)) {
          return { ...el, ...propsToUpdate };
        }
        return el;
      });
      saveHistory(newElements);
      return newElements;
    });
    notifyChange();
  };

  const selectedElement = elements.find((el) =>
    selectedElementIds.includes(el.id),
  );

  const getFieldIcon = (type?: string) => {
    if (!type) return <Type className="w-3.5 h-3.5 text-blue-500" />;
    const lowerType = type.toLowerCase();
    if (lowerType.includes("date") || lowerType.includes("time"))
      return <Calendar className="w-3.5 h-3.5 text-blue-500" />;
    if (
      lowerType.includes("int") ||
      lowerType.includes("decimal") ||
      lowerType.includes("numeric") ||
      lowerType.includes("float") ||
      lowerType.includes("money") ||
      lowerType.includes("bigint")
    )
      return <Hash className="w-3.5 h-3.5 text-blue-500" />;
    return <Type className="w-3.5 h-3.5 text-blue-500" />;
  };

  const uniqueSelectedFields = React.useMemo(() => {
    return selectedFields.filter(
      (v, i, a) => a.findIndex((t) => t.name === v.name) === i,
    );
  }, [selectedFields]);

  const handleGroupDrop = (data: any) => {
    if (data && data.rawName) {
      const newGroupings = [...groupings];
      if (!newGroupings.some((g) => g.name === data.rawName)) {
        const newGroupIndex = newGroupings.length + 1;
        newGroupings.push({ name: data.rawName, tableName: '' });
        onGroupingsChange?.(newGroupings);
        
        setElements((prev) => {
          const newElements = [
            ...prev,
            {
              id: `el_${Date.now()}_lbl`,
              text: t(`field_${data.rawName}`, data.rawName) + ": ",
              x: 650,
              y: 5,
              width: 100,
              isAt: false,
              sectionId: `Group Header ${newGroupIndex}`,
              fontFamily: "Tahoma",
              fontSize: "10",
              fontWeight: "bold",
            },
            {
              id: `el_${Date.now()}_val_1`,
              text: `@${t(`field_${data.rawName}`, data.rawName)}@`,
              x: 540,
              y: 5,
              width: 100,
              isAt: false,
              sectionId: `Group Header ${newGroupIndex}`,
              fontFamily: "Tahoma",
              fontSize: "10",
            },
          ];
          saveHistory(newElements);
          return newElements;
        });
        notifyChange();
      }
    }
  };

  const TREE_DATA = [
    {
      id: "db_fields",
      label: "Database Fields",
      icon: <Database className="w-4 h-4 text-emerald-600" />,
      children:
        uniqueSelectedFields.length > 0
          ? uniqueSelectedFields.map((f, i) => {
              const baseNode: any = {
                id: `f_${f.name}_${i}`,
                label: t(`field_${f.name}`, f.name),
                rawName: f.name,
                icon: getFieldIcon(f.type),
              };
              if (f.childrenFields && f.childrenFields.length > 0) {
                 baseNode.children = f.childrenFields.map((cf: any, ci: number) => ({
                    id: `f_${f.name}_${cf.name}_${ci}`,
                    label: `${t(`field_${f.name}`, f.name)} - ${t(`field_${cf.name}`, cf.name)}`,
                    rawName: `${f.name}.${cf.name}`,
                    icon: getFieldIcon(cf.type)
                 }));
              }
              return baseNode;
            })
          : [
              {
                id: "f_empty",
                label: "No fields selected",
                icon: <Type className="w-3.5 h-3.5 text-gray-400" />,
              },
            ],
    },
    {
      id: "formula",
      label: "Formula Fields",
      icon: (
        <span className="font-serif italic text-blue-600 font-bold px-1 text-xs">
          f(x)
        </span>
      ),
      children: formulas.map((f, i) => ({
        id: `f_formula_${i}`,
        label: f.name,
        icon: <span className="font-serif italic text-blue-600 text-[10px] px-1">f(x)</span>,
        type: "formula",
        onEdit: () => {
           setFormulaName(f.name);
           setFormulaExpression(f.expression);
           setShowFormulaEditorModal(true);
        },
        onDelete: () => {
           setFormulaToDelete(f.name);
        }
      })),
      onClick: () => {
        setFormulaName("");
        setFormulaExpression("");
        setShowFormulaNameModal(true);
      },
    },
    {
      id: "params",
      label: "[?] Parameter Fields",
      icon: null,
      children: [],
    },
    {
      id: "group",
      label: "Group Name Fields",
      icon: <Folder className="w-4 h-4 text-yellow-500" fill="currentColor" />,
      children:
        groupings.length > 0
          ? groupings.map((g, i) => ({
              id: `g${i}`,
              label: t(`field_${g.name}`, g.name),
              icon: <Type className="w-3.5 h-3.5 text-blue-500" />,
              onDropNode: handleGroupDrop,
              onDelete: () => {
                const newGroupings = groupings.filter(gr => gr.name !== g.name);
                onGroupingsChange?.(newGroupings);
              }
            }))
          : [
              {
                id: "g_empty",
                label: "No grouping selected",
                icon: <Type className="w-3.5 h-3.5 text-gray-400" />,
                onDropNode: handleGroupDrop,
              },
            ],
      onDropNode: handleGroupDrop,
    },
    {
      id: "running",
      label: "Running Total Fields",
      icon: <span className="text-purple-600 font-bold text-xs px-1">Σ</span>,
      children: runningTotals.map((rt, i) => ({
        id: `rt_${i}`,
        label: rt.name,
        icon: <span className="text-purple-600 font-bold text-[10px] px-1">Σ</span>,
        type: "running",
        onEdit: () => {
           setEditingRunningTotal(rt);
           setShowRunningTotalModal(true);
        },
        onDelete: () => {
           setRunningTotals(prev => prev.filter(r => r.name !== rt.name));
        }
      })),
      onClick: () => {
         // Create new running total
         setEditingRunningTotal({
            name: `RTotal${runningTotals.length}`,
            fieldToSummarize: uniqueSelectedFields[0]?.name || '',
            summaryType: 'sum',
            evaluateType: 'each_record',
            resetType: 'never'
         });
         setShowRunningTotalModal(true);
      }
    },
    {
      id: "sql",
      label: "SQL Expression Fields",
      icon: <Database className="w-4 h-4 text-gray-500" />,
      children: [],
    },
    {
      id: "special",
      label: t("special_fields", "Special Fields"),
      icon: <FileText className="w-4 h-4 text-indigo-500" />,
      children: [
        {
          id: "s1",
          label: t("special_print_date", "Print Date"),
          icon: <Calendar className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@PrintDate@",
        },
        {
          id: "s_print_time",
          label: t("special_print_time", "Print Time"),
          icon: <Calendar className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@PrintTime@",
        },
        {
          id: "s_mod_date",
          label: t("special_modification_date", "Modification Date"),
          icon: <Calendar className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@ModificationDate@",
        },
        {
          id: "s_mod_time",
          label: t("special_modification_time", "Modification Time"),
          icon: <Calendar className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@ModificationTime@",
        },
        {
          id: "s_data_date",
          label: t("special_data_date", "Data Date"),
          icon: <Calendar className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@DataDate@",
        },
        {
          id: "s_data_time",
          label: t("special_data_time", "Data Time"),
          icon: <Calendar className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@DataTime@",
        },
        {
          id: "s_record_number",
          label: t("special_record_number", "Record Number"),
          icon: <Hash className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@RecordNumber@",
        },
        {
          id: "s3",
          label: t("special_page_number", "Page Number"),
          icon: <Hash className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@PageNumber@",
        },
        {
          id: "s_group_number",
          label: t("special_group_number", "Group Number"),
          icon: <Hash className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@GroupNumber@",
        },
        {
          id: "s_total_page_count",
          label: t("special_total_page_count", "Total Page Count"),
          icon: <Hash className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@TotalPageCount@",
        },
        {
          id: "s2",
          label: t("special_report_title", "Report Title"),
          icon: <Type className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@ReportTitle@",
        },
        {
          id: "s_report_comments",
          label: t("special_report_comments", "Report Comments"),
          icon: <Type className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@ReportComments@",
        },
        {
          id: "s_record_selection_formula",
          label: t("special_record_selection_formula", "Record Selection Formula"),
          icon: <Type className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@RecordSelectionFormula@",
        },
        {
          id: "s_group_selection_formula",
          label: t("special_group_selection_formula", "Group Selection Formula"),
          icon: <Type className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@GroupSelectionFormula@",
        },
        {
          id: "s_file_path_name",
          label: t("special_file_path_and_name", "File Path and Name"),
          icon: <Type className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@FilePathAndName@",
        },
        {
          id: "s_file_author",
          label: t("special_file_author", "File Author"),
          icon: <Type className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@FileAuthor@",
        },
        {
          id: "s_file_creation_date",
          label: t("special_file_creation_date", "File Creation Date"),
          icon: <Calendar className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@FileCreationDate@",
        },
        {
          id: "s_page_n_of_m",
          label: t("special_page_n_of_m", "Page N of M"),
          icon: <Hash className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@PageNofM@",
        },
        {
          id: "s4",
          label: t("special_business_name", "Business Name"),
          icon: <Type className="w-3.5 h-3.5 text-gray-500" />,
          type: "general",
          rawName: "@BusinessName@",
        },
      ],
    },
    {
      id: "unbound",
      label: "Unbound Fields",
      icon: <Table2 className="w-4 h-4 text-cyan-600" />,
      children: [
        { id: "u1", label: "Boolean", icon: null },
        { id: "u2", label: "Currency", icon: null },
        { id: "u3", label: "Date", icon: null },
        { id: "u4", label: "Number", icon: null },
        { id: "u5", label: "String", icon: null },
      ],
    },
  ];

  const [showElementPropertiesModal, setShowElementPropertiesModal] = useState<TElementProps | null>(null);

  return (
    <div
      className="flex flex-col h-full bg-[#f0f0f0] w-full outline-none"
      dir="ltr"
      tabIndex={0}
      onClick={(e) => {
        if (
          e.target === e.currentTarget ||
          (e.target as HTMLElement).classList.contains("bg-grid-pattern")
        ) {
          setSelectedElementIds([]);
        }
      }}
    >
      {showElementPropertiesModal && (
        <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center font-tahoma" dir="rtl">
           <div className="bg-white rounded shadow-lg p-5 w-[400px] flex flex-col gap-4">
              <h3 className="font-bold text-gray-800 border-b pb-2">ویژگی‌های عنصر</h3>
              
              <div className="flex flex-col gap-3 text-sm">
                 <div>
                    <label className="text-gray-600 block mb-1">متن (Text/Label)</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500"
                      value={showElementPropertiesModal.text || ""}
                      onChange={(e) => setShowElementPropertiesModal({...showElementPropertiesModal, text: e.target.value})}
                      disabled={['box', 'line', 'circle'].includes(showElementPropertiesModal.type || "")}
                    />
                 </div>

                 {['box', 'line', 'table'].includes(showElementPropertiesModal.type || "") && (
                     <div>
                        <label className="text-gray-600 block mb-1">ضخامت حاشیه (Border Width)</label>
                        <select 
                          className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500"
                          value={showElementPropertiesModal.borderWidth || "1px"}
                          onChange={(e) => {
                             let updatedStr = e.target.value;
                             // Update general border style too
                             setShowElementPropertiesModal({
                                ...showElementPropertiesModal, 
                                borderWidth: updatedStr,
                                border: showElementPropertiesModal.type === 'box' || showElementPropertiesModal.type === 'table' ? `${updatedStr} solid ${showElementPropertiesModal.borderColor || "#000000"}` : showElementPropertiesModal.border,
                                borderTop: showElementPropertiesModal.type === 'line' ? `${updatedStr} solid ${showElementPropertiesModal.borderColor || "#000000"}` : showElementPropertiesModal.borderTop
                             });
                          }}
                        >
                          <option value="1px">نازک (1px)</option>
                          <option value="2px">متوسط (2px)</option>
                          <option value="3px">متوسط-ضخیم (3px)</option>
                          <option value="4px">ضخیم (4px)</option>
                          <option value="5px">بسیار ضخیم (5px)</option>
                        </select>
                     </div>
                 )}

                 {showElementPropertiesModal.type && !['line', 'box', 'image', 'label'].includes(showElementPropertiesModal.type) && (
                    <div className="border border-blue-200 bg-blue-50 p-2 rounded flex flex-col gap-2 mt-2">
                       <label className="font-bold text-blue-800 text-xs">تنظیمات ورود اطلاعات داینامیک</label>
                       
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                             type="checkbox" 
                             checked={showElementPropertiesModal.isDynamic || false}
                             onChange={(e) => setShowElementPropertiesModal({...showElementPropertiesModal, isDynamic: e.target.checked})}
                          />
                          <span>فیلد به صورت پویا زمان اجرای گزارش پرسیده شود</span>
                       </label>

                       {showElementPropertiesModal.isDynamic && (
                          <>
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                   type="checkbox" 
                                   checked={showElementPropertiesModal.isRequired || false}
                                   onChange={(e) => setShowElementPropertiesModal({...showElementPropertiesModal, isRequired: e.target.checked})}
                                />
                                <span>ورود این فیلد اجباری است</span>
                             </label>
                             <div>
                                <label className="text-gray-600 block mb-1 text-xs">کلید ذخیره‌سازی (یکتا برای این گزارش):</label>
                                <input 
                                  type="text" 
                                  className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500 text-left font-mono"
                                  dir="ltr"
                                  value={showElementPropertiesModal.dynamicKey || ''}
                                  onChange={(e) => setShowElementPropertiesModal({...showElementPropertiesModal, dynamicKey: e.target.value})}
                                  placeholder="e.g. param1"
                                />
                             </div>
                          </>
                       )}
                    </div>
                 )}
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
                 <button className="px-4 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => setShowElementPropertiesModal(null)}>انصراف</button>
                 <button className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => {
                    setElements(prev => {
                       const next = prev.map(el => el.id === showElementPropertiesModal.id ? showElementPropertiesModal : el);
                       saveHistory(next);
                       return next;
                    });
                    notifyChange();
                    setShowElementPropertiesModal(null);
                 }}>تایید</button>
              </div>
           </div>
        </div>
      )}

      {showParamsModal && (
        <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center font-tahoma" dir="rtl">
           <div className="bg-white rounded shadow-lg p-5 w-[400px] flex flex-col gap-4">
              <h3 className="font-bold text-gray-800 border-b pb-2">ورود اطلاعات گزارش</h3>
              <div className="text-sm text-gray-500 mb-2">لطفا جهت اجرای گزارش اطلاعات زیر را تکمیل نمایید:</div>
              <div className="flex flex-col gap-3 text-sm max-h-[60vh] overflow-y-auto">
                 {elements.filter(el => el.isDynamic && el.dynamicKey).map(el => (
                    <div key={el.id} className="flex flex-col gap-1">
                       <label className="text-gray-700 font-medium">{el.text} {el.isRequired && <span className="text-red-500">*</span>}</label>
                       {el.type === 'textarea' ? (
                          <textarea 
                             className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500"
                             value={paramValues[el.dynamicKey!] || ''}
                             onChange={(e) => setParamValues({...paramValues, [el.dynamicKey!]: e.target.value})}
                          ></textarea>
                       ) : el.type === 'checkbox' ? (
                          <div className="flex items-center">
                             <input 
                                type="checkbox" 
                                className="w-4 h-4"
                                checked={paramValues[el.dynamicKey!] === '☑'}
                                onChange={(e) => setParamValues({...paramValues, [el.dynamicKey!]: e.target.checked ? '☑' : '☐'})}
                             />
                          </div>
                       ) : el.type === 'radio' ? (
                          <div className="flex items-center">
                             <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded-full appearance-none border border-gray-400 checked:bg-blue-500"
                                checked={paramValues[el.dynamicKey!] === '◉'}
                                onChange={(e) => setParamValues({...paramValues, [el.dynamicKey!]: e.target.checked ? '◉' : '◯'})}
                             />
                          </div>
                       ) : (
                          <input 
                             type="text" 
                             className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500"
                             value={paramValues[el.dynamicKey!] || ''}
                             onChange={(e) => setParamValues({...paramValues, [el.dynamicKey!]: e.target.value})}
                          />
                       )}
                    </div>
                 ))}
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
                 <button className="px-4 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => setShowParamsModal(false)}>انصراف</button>
                 <button className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700" onClick={async () => {
                    // Check required
                    const reqStr = elements.filter(el => el.isDynamic && el.dynamicKey && el.isRequired && !paramValues[el.dynamicKey!]);
                    if (reqStr.length > 0) {
                        alert("لطفا فیلدهای اجباری را پر کنید.");
                        return;
                    }

                    // Save to database
                    if (reportTitle) {
                      try {
                        const dynamicData = Object.entries(paramValues).filter(([k, v]) => !!k).map(([k, v]) => ({ dynamicKey: k, value: String(v) }));
                        await apiFetch('/api/report-user-data', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ reportName: reportTitle, data: dynamicData })
                        });
                      } catch (err) {
                        console.error("Failed to save report user data", err);
                      }
                    }

                    setShowParamsModal(false);
                    setShowPreview(true);
                 }}>مشاهده پیش‌نمایش</button>
              </div>
           </div>
        </div>
      )}

      {bandContextMenu && (
        <div 
          className="fixed bg-white border border-gray-300 shadow-md py-1 w-48 z-[2000] text-sm text-gray-800"
          style={{ left: bandContextMenu.x, top: bandContextMenu.y }}
          onContextMenu={(e) => e.preventDefault()}
          dir="rtl"
        >
          <div className="px-3 py-1 text-gray-500 font-bold text-xs border-b border-gray-200 mb-1 leading-relaxed">
            تراز فیلدها در باند
          </div>
          <div 
            className="px-3 py-1.5 hover:bg-blue-100 cursor-pointer flex items-center"
            onClick={() => handleAlignBand(bandContextMenu.sectionId, "top")}
          >
            تراز با بالای باند
          </div>
          <div 
            className="px-3 py-1.5 hover:bg-blue-100 cursor-pointer flex items-center"
            onClick={() => handleAlignBand(bandContextMenu.sectionId, "middle")}
          >
            تراز وسط باند
          </div>
          <div 
            className="px-3 py-1.5 hover:bg-blue-100 cursor-pointer flex items-center"
            onClick={() => handleAlignBand(bandContextMenu.sectionId, "bottom")}
          >
            تراز پایین باند
          </div>
        </div>
      )}
      {/* Running Total Modal */}
      {showRunningTotalModal && editingRunningTotal && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center font-tahoma" dir="rtl">
           <div className="bg-white rounded shadow-lg p-5 w-[500px] flex flex-col gap-4">
              <h3 className="font-bold text-gray-800 border-b pb-2">Create Running Total Field</h3>
              
              <div className="flex flex-col gap-3 text-sm max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                 <div>
                    <label className="text-gray-600 block mb-1">Running Total Name:</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500 font-mono text-left"
                      dir="ltr"
                      value={editingRunningTotal.name}
                      onChange={(e) => setEditingRunningTotal({...editingRunningTotal, name: e.target.value})}
                    />
                 </div>
                 
                 <div className="border p-2 rounded bg-gray-50 flex flex-col gap-2">
                    <label className="font-bold text-xs text-gray-700 block">Summary</label>
                    <div>
                       <label className="text-gray-600 block mb-1 text-xs">Field to summarize:</label>
                       <select 
                         className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500"
                         value={editingRunningTotal.fieldToSummarize}
                         onChange={(e) => setEditingRunningTotal({...editingRunningTotal, fieldToSummarize: e.target.value})}
                       >
                          {uniqueSelectedFields.map(f => (
                             <option key={f.name} value={f.name}>{t(`field_${f.name}`, f.name)}</option>
                          ))}
                       </select>
                    </div>
                    <div>
                       <label className="text-gray-600 block mb-1 text-xs">Type of summary:</label>
                       <select 
                         className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500"
                         value={editingRunningTotal.summaryType}
                         onChange={(e) => setEditingRunningTotal({...editingRunningTotal, summaryType: e.target.value})}
                       >
                          <option value="sum">sum</option>
                          <option value="average">average</option>
                          <option value="sample_variance">sample variance</option>
                          <option value="sample_standard_deviation">sample standard deviation</option>
                          <option value="maximum">maximum</option>
                          <option value="minimum">minimum</option>
                          <option value="count">count</option>
                          <option value="population_variance">population variance</option>
                          <option value="population_standard_deviation">population standard deviation</option>
                          <option value="distinct_count">distinct count</option>
                          <option value="correlation">correlation</option>
                          <option value="covariance">covariance</option>
                          <option value="weighted_average">weighted average</option>
                          <option value="median">median</option>
                          <option value="pth_percentile">Pth percentile</option>
                          <option value="nth_largest">Nth largest</option>
                          <option value="nth_smallest">Nth smallest</option>
                          <option value="mode">mode</option>
                       </select>
                    </div>
                    
                    {['correlation', 'covariance', 'weighted_average'].includes(editingRunningTotal.summaryType) && (
                       <div>
                          <label className="text-gray-600 block mb-1 text-xs">Secondary Field (Weight/Compare):</label>
                          <select 
                             className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500"
                             value={editingRunningTotal.secondaryField || ''}
                             onChange={(e) => setEditingRunningTotal({...editingRunningTotal, secondaryField: e.target.value})}
                          >
                             <option value="" disabled>-- انتخاب فیلد --</option>
                             {uniqueSelectedFields.map(f => (
                                <option key={f.name} value={f.name}>{t(`field_${f.name}`, f.name)}</option>
                             ))}
                          </select>
                       </div>
                    )}
                    
                    {['pth_percentile'].includes(editingRunningTotal.summaryType) && (
                       <div>
                          <label className="text-gray-600 block mb-1 text-xs">P (Percentile 0-100):</label>
                          <input 
                             type="number"
                             className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500"
                             value={editingRunningTotal.p_value ?? 50}
                             onChange={(e) => setEditingRunningTotal({...editingRunningTotal, p_value: Number(e.target.value)})}
                          />
                       </div>
                    )}
                    
                    {['nth_largest', 'nth_smallest'].includes(editingRunningTotal.summaryType) && (
                       <div>
                          <label className="text-gray-600 block mb-1 text-xs">N (Nth Item):</label>
                          <input 
                             type="number"
                             min="1"
                             className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500"
                             value={editingRunningTotal.n_value ?? 1}
                             onChange={(e) => setEditingRunningTotal({...editingRunningTotal, n_value: Number(e.target.value)})}
                          />
                       </div>
                    )}
                 </div>

                 <div className="border p-2 rounded bg-gray-50 flex flex-col gap-2">
                    <label className="font-bold text-xs text-gray-700 block">Evaluate</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                       <input 
                          type="radio" 
                          name="evalType"
                          checked={editingRunningTotal.evaluateType === 'each_record'}
                          onChange={() => setEditingRunningTotal({...editingRunningTotal, evaluateType: 'each_record'})}
                       />
                       <span>For each record</span>
                    </label>
                    <div className="flex flex-col gap-1 pr-5">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                             type="radio" 
                             name="evalType"
                             checked={editingRunningTotal.evaluateType === 'change_of_field'}
                             onChange={() => setEditingRunningTotal({...editingRunningTotal, evaluateType: 'change_of_field'})}
                          />
                          <span>On change of field</span>
                       </label>
                       {editingRunningTotal.evaluateType === 'change_of_field' && (
                          <select 
                             className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500 text-xs mt-1"
                             value={editingRunningTotal.evaluateField || ''}
                             onChange={(e) => setEditingRunningTotal({...editingRunningTotal, evaluateField: e.target.value})}
                          >
                             <option value="" disabled>-- انتخاب فیلد --</option>
                             {uniqueSelectedFields.map(f => (
                                <option key={f.name} value={f.name}>{t(`field_${f.name}`, f.name)}</option>
                             ))}
                          </select>
                       )}
                       
                       <label className="flex items-center gap-2 cursor-pointer mt-1">
                          <input 
                             type="radio" 
                             name="evalType"
                             checked={editingRunningTotal.evaluateType === 'change_of_group'}
                             onChange={() => setEditingRunningTotal({...editingRunningTotal, evaluateType: 'change_of_group'})}
                          />
                          <span>On change of group</span>
                       </label>
                       {editingRunningTotal.evaluateType === 'change_of_group' && (
                          <select 
                             className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500 text-xs mt-1"
                             value={editingRunningTotal.evaluateGroup || ''}
                             onChange={(e) => setEditingRunningTotal({...editingRunningTotal, evaluateGroup: e.target.value})}
                          >
                             <option value="" disabled>-- انتخاب گروه --</option>
                             {groupings.map(g => (
                                <option key={g.name} value={g.name}>{t(`field_${g.name}`, g.name)}</option>
                             ))}
                          </select>
                       )}
                    </div>
                 </div>

                 <div className="border p-2 rounded bg-gray-50 flex flex-col gap-2">
                    <label className="font-bold text-xs text-gray-700 block">Reset</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                       <input 
                          type="radio" 
                          name="resetType"
                          checked={editingRunningTotal.resetType === 'never'}
                          onChange={() => setEditingRunningTotal({...editingRunningTotal, resetType: 'never'})}
                       />
                       <span>Never</span>
                    </label>
                    <div className="flex flex-col gap-1 pr-5">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                             type="radio" 
                             name="resetType"
                             checked={editingRunningTotal.resetType === 'change_of_field'}
                             onChange={() => setEditingRunningTotal({...editingRunningTotal, resetType: 'change_of_field'})}
                          />
                          <span>On change of field</span>
                       </label>
                       {editingRunningTotal.resetType === 'change_of_field' && (
                          <select 
                             className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500 text-xs mt-1"
                             value={editingRunningTotal.resetField || ''}
                             onChange={(e) => setEditingRunningTotal({...editingRunningTotal, resetField: e.target.value})}
                          >
                             <option value="" disabled>-- انتخاب فیلد --</option>
                             {uniqueSelectedFields.map(f => (
                                <option key={f.name} value={f.name}>{t(`field_${f.name}`, f.name)}</option>
                             ))}
                          </select>
                       )}
                       
                       <label className="flex items-center gap-2 cursor-pointer mt-1">
                          <input 
                             type="radio" 
                             name="resetType"
                             checked={editingRunningTotal.resetType === 'change_of_group'}
                             onChange={() => setEditingRunningTotal({...editingRunningTotal, resetType: 'change_of_group'})}
                          />
                          <span>On change of group</span>
                       </label>
                       {editingRunningTotal.resetType === 'change_of_group' && (
                          <select 
                             className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500 text-xs mt-1"
                             value={editingRunningTotal.resetGroup || ''}
                             onChange={(e) => setEditingRunningTotal({...editingRunningTotal, resetGroup: e.target.value})}
                          >
                             <option value="" disabled>-- انتخاب گروه --</option>
                             {groupings.map(g => (
                                <option key={g.name} value={g.name}>{t(`field_${g.name}`, g.name)}</option>
                             ))}
                          </select>
                       )}
                    </div>
                 </div>
              </div>

              <div className="flex justify-end gap-2 mt-2 border-t pt-2">
                 <button className="px-4 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => setShowRunningTotalModal(false)}>انصراف</button>
                 <button className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => {
                    const isEdit = runningTotals.find((rt: any) => rt.name === editingRunningTotal.name);
                    if (isEdit) {
                       setRunningTotals(prev => prev.map(rt => rt.name === editingRunningTotal.name ? editingRunningTotal : rt));
                    } else {
                       if (runningTotals.some((rt: any) => rt.name === editingRunningTotal.name)) {
                          alert("نام تکراری است");
                          return;
                       }
                       setRunningTotals(prev => [...prev, editingRunningTotal]);
                    }
                    setShowRunningTotalModal(false);
                 }}>تایید</button>
              </div>
           </div>
        </div>
      )}

      {/* Formula Name Modal */}
      {showFormulaNameModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center font-tahoma" dir="rtl">
          <div className="bg-white rounded shadow-lg p-4 w-96 flex flex-col gap-4">
            <h3 className="font-bold text-gray-800 border-b pb-2">تعریف فرمول جدید</h3>
            <div>
              <label className="text-sm text-gray-600 block mb-1">عنوان فرمول را وارد کنید:</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-blue-500"
                value={formulaName}
                onChange={(e) => setFormulaName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-4 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setShowFormulaNameModal(false)}
              >
                انصراف
              </button>
              <button
                className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={!formulaName.trim()}
                onClick={() => {
                  if (formulas.some(f => f.name.trim() === formulaName.trim())) {
                    showToast("یک گزارش نمی تواند عنوان فرمول تکراری داشته باشد.", "error");
                    return;
                  }
                  setShowFormulaNameModal(false);
                  setShowFormulaEditorModal(true);
                }}
              >
                تایید
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formula Editor Modal */}
      {showFormulaEditorModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center font-tahoma p-8" dir="rtl">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-full max-h-[80vh] flex flex-col overflow-hidden" onKeyDown={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
              <h3 className="font-bold text-sm">ویرایشگر فرمول: {formulaName}</h3>
              <button onClick={() => setShowFormulaEditorModal(false)} className="text-white hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 flex flex-col p-2 gap-2 bg-gray-50 overflow-hidden">
              {/* Action Bar */}
              <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-sm">
                <NewButton 
                  onClick={() => {
                    setFormulaName("");
                    setFormulaExpression("");
                    setShowFormulaEditorModal(false);
                    setShowFormulaNameModal(true);
                  }} 
                  hideLabel 
                  disabled={false}
                />
                <SaveButton 
                  onClick={() => {
                    if (formulaName.trim() && formulaExpression.trim()) {
                      setFormulas(prev => [...prev.filter(f => f.name !== formulaName), { name: formulaName, expression: formulaExpression }]);
                      showToast("فرمول با موفقیت ذخیره شد", "success");
                    }
                  }} 
                  hideLabel 
                  disabled={!formulaName.trim() || !formulaExpression.trim()}
                />
                <SaveNewButton 
                  onClick={() => {
                    if (formulaName.trim() && formulaExpression.trim()) {
                      setFormulas(prev => [...prev.filter(f => f.name !== formulaName), { name: formulaName, expression: formulaExpression }]);
                      showToast("فرمول با موفقیت ذخیره شد", "success");
                    }
                    setFormulaName("");
                    setFormulaExpression("");
                    setShowFormulaEditorModal(false);
                    setShowFormulaNameModal(true);
                  }} 
                  hideLabel 
                  disabled={!formulaName.trim() || !formulaExpression.trim()}
                />
                <SaveCloseButton 
                  onClick={() => {
                    if (formulaName.trim() && formulaExpression.trim()) {
                      setFormulas(prev => [...prev.filter(f => f.name !== formulaName), { name: formulaName, expression: formulaExpression }]);
                      showToast("فرمول با موفقیت ذخیره شد", "success");
                    }
                    setShowFormulaEditorModal(false);
                  }} 
                  hideLabel 
                  disabled={!formulaName.trim() || !formulaExpression.trim()}
                />
                
                <div className="flex items-center mr-auto gap-1 bg-white border border-gray-300 rounded px-1 text-gray-700">
                  <button onClick={() => setFormulaExpression(prev => prev + (prev && !prev.endsWith(" ") ? " " : "") + "+ ")} className="px-3 py-1 text-lg font-bold hover:bg-gray-100 rounded" title="جمع (+)">+</button>
                  <button onClick={() => setFormulaExpression(prev => prev + (prev && !prev.endsWith(" ") ? " " : "") + "- ")} className="px-3 py-1 text-lg font-bold hover:bg-gray-100 rounded" title="تفریق (-)">−</button>
                  <button onClick={() => setFormulaExpression(prev => prev + (prev && !prev.endsWith(" ") ? " " : "") + "* ")} className="px-3 py-1 text-lg font-bold hover:bg-gray-100 rounded" title="ضرب (*)">×</button>
                  <button onClick={() => setFormulaExpression(prev => prev + (prev && !prev.endsWith(" ") ? " " : "") + "/ ")} className="px-3 py-1 text-lg font-bold hover:bg-gray-100 rounded" title="تقسیم (/)">÷</button>
                </div>
              </div>

              {/* Top Row: Functions & Fields */}
              <div className="flex h-1/2 gap-2">
                {/* Left Box: Functions */}
                <div className="flex-1 bg-white border border-gray-300 flex flex-col overflow-hidden">
                  <div className="bg-gray-100 px-2 py-1 border-b border-gray-300 text-xs font-bold text-gray-700">توابع (Functions)</div>
                  <div className="flex-1 p-2 overflow-auto text-sm text-right font-tahoma custom-scrollbar" dir="rtl">
                      <FormulaFunctionCategory 
                        title="توابع عمومی" 
                        icon={<Settings className="w-4 h-4 text-yellow-600" fill="currentColor" />}
                        onItemDoubleClick={(val) => setFormulaExpression(prev => prev + (prev && !prev.endsWith(" ") ? " " : "") + val)}
                        items={[
                          { label: "تاریخ گزارش", value: "ReportDate" },
                          { label: "نام سازمان", value: "OrgName" },
                          { label: "شماره صفحه", value: "PageNumber" },
                          { label: "صفحه از صفحه", value: "PageOfPages" }
                        ]} 
                      />
                      <FormulaFunctionCategory 
                        title="توابع تاریخ و زمان" 
                        icon={<Settings className="w-4 h-4 text-yellow-600" fill="currentColor" />}
                        onItemDoubleClick={(val) => setFormulaExpression(prev => prev + (prev && !prev.endsWith(" ") ? " " : "") + val)}
                        items={[
                            { label: "تاریخ جاری", value: "GETDATE()" },
                            { label: "تاریخ جاری میلادی", value: "GETDATE_GREGORIAN()" },
                            { label: "زمان جاری", value: "GETTIME()" },
                            { label: "(Field) تاریخ شمسی", value: "TODATESHAMSI()" },
                            { label: "(Field) تاریخ میلادی", value: "TODATEGREGORIAN()" },
                            { label: "(D) ساعت", value: "HOUR()" },
                            { label: "(D) سال", value: "YEAR()" },
                            { label: "(D) ماه", value: "MONTH()" },
                            { label: "(D) روز", value: "DAY()" },
                            { label: "(D) نام ماه تاریخ", value: "DATEMONTHNAME()" },
                            { label: "(N) نام ماه", value: "MONTHNAME()" },
                            { label: "(D) تاریخ به حروف", value: "DATETOWORDS()" }
                        ]} 
                      />
                      <FormulaFunctionCategory 
                        title="توابع ریاضی" 
                        icon={<Settings className="w-4 h-4 text-yellow-600" fill="currentColor" />}
                        onItemDoubleClick={(val) => setFormulaExpression(prev => prev + (prev && !prev.endsWith(" ") ? " " : "") + val)}
                        items={[
                            { label: "(N) قدر مطلق", value: "ABS()" },
                            { label: "(N) مقدار صحیح", value: "INT()" },
                            { label: "(N) روند", value: "ROUND()" },
                            { label: "(N, P) روند", value: "ROUND( , )" },
                            { label: "(N) عدد به حروف", value: "NUMTOWORDS()" },
                            { label: "(N...) جمع", value: "SUM()" },
                            { label: "(N1, N2) تفریق", value: "SUBTRACT()" },
                            { label: "(N1, N2) تقسیم", value: "DIVIDE()" },
                            { label: "(N...) میانگین", value: "AVG()" },
                            { label: "(N...) بیشترین", value: "MAX()" },
                            { label: "(N...) کمترین", value: "MIN()" }
                        ]} 
                      />
                      <FormulaFunctionCategory 
                        title="توابع رشته‌ای" 
                        icon={<Settings className="w-4 h-4 text-yellow-600" fill="currentColor" />}
                        onItemDoubleClick={(val) => setFormulaExpression(prev => prev + (prev && !prev.endsWith(" ") ? " " : "") + val)}
                        items={[
                            { label: "(D) تاریخ به رشته", value: "DATETOSTR()" },
                            { label: "(D) عدد به رشته", value: "NUMTOSTR()" },
                            { label: "(S) رشته به عدد", value: "STRTONUM()" },
                            { label: "(S) طول", value: "LEN()" },
                            { label: "(S) تریم", value: "TRIM()" },
                            { label: "(S) تریم چپ", value: "LTRIM()" },
                            { label: "(S) تریم راست", value: "RTRIM()" },
                            { label: "(S) معکوس", value: "REVERSE()" },
                            { label: "(S, Fs, Rs) جایگزینی", value: "REPLACE()" },
                            { label: "(S, n) کاراکترهای سمت چپ", value: "LEFT()" },
                            { label: "(S, n) کاراکترهای سمت راست", value: "RIGHT()" },
                            { label: "(S) مقدار عددی", value: "VAL()" }
                        ]} 
                      />
                  </div>
                </div>
                
                {/* Right Box: Fields */}
                <div className="flex-1 bg-white border border-gray-300 flex flex-col overflow-hidden">
                  <div className="bg-gray-100 px-2 py-1 border-b border-gray-300 text-xs font-bold text-gray-700">فیلدهای گزارش (Database Fields)</div>
                  <div className="flex-1 p-2 overflow-auto text-sm custom-scrollbar">
                      {uniqueSelectedFields.map(f => (
                          <div 
                            key={f.name} 
                            className="flex items-center gap-1 hover:bg-blue-50 cursor-pointer py-1 text-gray-800 select-none"
                            onDoubleClick={() => setFormulaExpression(prev => prev + (prev && !prev.endsWith(" ") ? " " : "") + `{${f.name}}`)}
                          >
                            {getFieldIcon(f.type)}
                            <span>{t(`field_${f.name}`, f.name)}</span>
                          </div>
                      ))}
                      {formulas.map((f, i) => (
                          <div 
                            key={`formula_${i}`} 
                            className="flex items-center gap-1 hover:bg-blue-50 cursor-pointer py-1 text-blue-700 select-none"
                            onDoubleClick={() => setFormulaExpression(prev => prev + (prev && !prev.endsWith(" ") ? " " : "") + `f(${f.name})`)}
                          >
                            <span className="font-serif italic text-blue-600 font-bold px-1 text-xs">f(x)</span>
                            <span>{f.name}</span>
                          </div>
                      ))}
                  </div>
                </div>
              </div>
              
              {/* Bottom Area: Formula Editor text area */}
              <div className="flex flex-col flex-1 bg-white border border-gray-300">
                 <div className="bg-gray-100 px-2 py-1 border-b border-gray-300 text-xs font-bold text-gray-700 flex justify-between items-center">
                     <span>متن فرمول</span>
                 </div>
                 <textarea 
                   className="w-full h-full p-2 text-left font-mono text-sm resize-none outline-none custom-scrollbar"
                   dir="ltr"
                   placeholder="Write formula here... (e.g. {Table.FieldName} * 2)"
                   value={formulaExpression}
                   onChange={(e) => setFormulaExpression(e.target.value)}
                   onKeyDown={(e) => e.stopPropagation()}
                 ></textarea>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div
          className="absolute inset-0 bg-white z-[999] flex flex-col font-tahoma text-right"
          dir="rtl"
        >
          <div className="flex items-center justify-between p-2 border-b bg-gray-100 shadow">
            <span className="font-bold text-sm">
              {startInPreview ? "اجرای گزارش" : "پیش‌نمایش گزارش"}
              {reportTitle ? ` : ${reportTitle}` : ""}
            </span>
            <button
              onClick={() => {
                setShowPreview(false);
                if (onClosePreview) {
                   onClosePreview();
                }
              }}
              className="p-1 hover:bg-gray-300 rounded text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-8 bg-gray-200 flex justify-center">
            {(() => {
              const previewWidthPx = Math.round((
                paperSize === 'A4' ? (paperOrientation === 'landscape' ? 297 : 210) :
                paperSize === 'A5' ? (paperOrientation === 'landscape' ? 210 : 148) :
                paperSize === 'Letter' ? (paperOrientation === 'landscape' ? 279.4 : 215.9) :
                customWidth
              ) * 3.78);
              return (
                <div 
                  className="bg-white shadow-lg flex flex-col print:w-full print:shadow-none relative"
                  style={{
                    width: `${previewWidthPx}px`,
                    maxWidth: `${previewWidthPx}px`,
                    minHeight: `${paperOrientation === 'landscape' ? 800 : 1000}px`
                  }}
                >
              {(() => {
                const numberToWords = (n: number | string): string => {
                  const persianNumbersToEnglish = (str: string) => {
                    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                    return str.replace(/[۰-۹]/g, (w) => persianNumbers.indexOf(w).toString());
                  };
                  const normalizedStr = typeof n === 'string' ? persianNumbersToEnglish(n) : String(n);
                  const number = Number(normalizedStr);
                  if (isNaN(number)) return String(n);
                  const ones = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
                  const tens = ["", "ده", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
                  const teens = ["ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
                  const hundreds = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
                  const thousands = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

                  if (number === 0) return "صفر";
                  if (number < 0) return "منفی " + numberToWords(Math.abs(number));

                  let word = "";
                  let t = 0;
                  let temp = number;
                  while (temp > 0) {
                      let n_rem = temp % 1000;
                      if (n_rem !== 0) {
                          let part = "";
                          let h = Math.floor(n_rem / 100);
                          let t_tens = Math.floor((n_rem % 100) / 10);
                          let o = n_rem % 10;
                          
                          if (h > 0) part += hundreds[h];
                          if (t_tens === 1) {
                              if (part !== "") part += " و ";
                              part += teens[o];
                          } else {
                              if (t_tens > 1) {
                                  if (part !== "") part += " و ";
                                  part += tens[t_tens];
                              }
                              if (o > 0) {
                                  if (part !== "") part += " و ";
                                  part += ones[o];
                              }
                          }
                          if (t > 0) {
                              if (part !== "") part += " " + thousands[t];
                              else part = thousands[t];
                          }
                          if (word !== "") word = part + " و " + word;
                          else word = part;
                      }
                      t++;
                      temp = Math.floor(temp / 1000);
                  }
                  return word.trim();
                };

                const dateToWords = (dateStr: string): string => {
                  if (!dateStr) return dateStr;
                  const persianNumbersToEnglish = (str: string) => {
                    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                    return str.replace(/[۰-۹]/g, (w) => persianNumbers.indexOf(w).toString());
                  };
                  const normalizedDateStr = persianNumbersToEnglish(dateStr);
                  const parts = normalizedDateStr.split('/');
                  if (parts.length !== 3) return dateStr;
                  const [y, m, d] = parts;
                  
                  const monthNames = [
                    "", "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", 
                    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
                  ];
                  
                  const ordinalDays = [
                    "", "یکم", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم",
                    "یازدهم", "دوازدهم", "سیزدهم", "چهاردهم", "پانزدهم", "شانزدهم", "هفدهم", "هجدهم", "نوزدهم",
                    "بیستم", "بیست و یکم", "بیست و دوم", "بیست و سوم", "بیست و چهارم", "بیست و پنجم", 
                    "بیست و ششم", "بیست و هفتم", "بیست و هشتم", "بیست و نهم", "سی‌ام", "سی و یکم"
                  ];

                  const dayNum = parseInt(d, 10);
                  const monthNum = parseInt(m, 10);
                  const yearNum = parseInt(y, 10);

                  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return dateStr;
                  if (monthNum < 1 || monthNum > 12) return dateStr;
                  if (dayNum < 1 || dayNum > 31) return dateStr;

                  const dayStr = ordinalDays[dayNum];
                  const monthStr = monthNames[monthNum];
                  const yearStr = numberToWords(yearNum);

                  return `${dayStr} ${monthStr} ${yearStr}`;
                };

                const substituteText = (
                  text: string,
                  rowData?: any,
                  rowIndex?: number,
                  element?: TElementProps
                ) => {
                  const processFormulaFunctions = (val: string) => {
                      if (!val) return val;
                      let result = String(val);

                      let expanded = true;
                      let loopCount = 0;
                      // loop to resolve nested functions from inside out
                      while (expanded && loopCount < 10) {
                          expanded = false;
                          let prevResult = result;

                          // We use regexes that match innermost parenthesis blocks first: \([^()]*\) matches a block with no nested parens
                          
                          // String and Number formatting
                          result = result.replace(/(?:NUMTOSTR|NUMTOWORDS)\(([^()]+)\)/gi, (match, p1) => {
                              return numberToWords(p1);
                          });
                          result = result.replace(/(?:DATETOSTR|DATETOWORDS)\(([^()]+)\)/gi, (match, p1) => {
                              return dateToWords(p1);
                          });
                          result = result.replace(/(?:STRTONUM|VAL)\(([^()]+)\)/gi, (match, p1) => {
                              if (!p1 || p1.trim() === '') return "0";
                              const englishDigits = p1.replace(/[۰-۹]/g, (w: string) => ['0','1','2','3','4','5','6','7','8','9']['۰۱۲۳۴۵۶۷۸۹'.indexOf(w)]).replace(/,/g, '');
                              const num = Number(englishDigits);
                              return !isNaN(num) ? String(num) : "0";
                          });

                          // String functions
                          result = result.replace(/LEN\(([^()]*)\)/gi, (m, p1) => String(p1 ? p1.trim().length : 0));
                          result = result.replace(/LTRIM\(([^()]*)\)/gi, (m, p1) => p1 ? p1.replace(/^\s+/, '') : "");
                          result = result.replace(/RTRIM\(([^()]*)\)/gi, (m, p1) => p1 ? p1.replace(/\s+$/, '') : "");
                          result = result.replace(/TRIM\(([^()]*)\)/gi, (m, p1) => p1 ? p1.trim() : "");
                          result = result.replace(/REVERSE\(([^()]*)\)/gi, (m, p1) => p1 ? p1.split('').reverse().join('') : "");

                          // Math functions
                          const parseNumber = (str: string) => Number(str.replace(/[۰-۹]/g, (w) => ['0','1','2','3','4','5','6','7','8','9']['۰۱۲۳۴۵۶۷۸۹'.indexOf(w)]).replace(/,/g, ''));
                          
                          result = result.replace(/ABS\(([^()]+)\)/gi, (m, p1) => {
                              const n = parseNumber(p1);
                              return !isNaN(n) ? String(Math.abs(n)) : m;
                          });
                          result = result.replace(/INT\(([^()]+)\)/gi, (m, p1) => {
                              const n = parseNumber(p1);
                              return !isNaN(n) ? String(Math.trunc(n)) : m;
                          });
                          result = result.replace(/ROUND\(([^()]+)\)/gi, (m, p1) => {
                              const parts = p1.split(',');
                              if (parts.length === 1) {
                                  const n = parseNumber(parts[0]);
                                  return !isNaN(n) ? String(Math.round(n)) : m;
                              }
                              const n = parseNumber(parts[0]);
                              const precision = parseNumber(parts[1]);
                              return (!isNaN(n) && !isNaN(precision)) ? (Math.round(n * Math.pow(10, precision)) / Math.pow(10, precision)).toString() : m;
                          });

                          if (result !== prevResult) expanded = true;
                          loopCount++;
                      }

                      return result;
                  };

                  if (element?.isDynamic && element?.dynamicKey && paramValues[element.dynamicKey]) {
                     return processFormulaFunctions(paramValues[element.dynamicKey]);
                  }

                  const applyFormulas = (expr: string, maxDepth: number = 5): string => {
                      if (!formulas || formulas.length === 0 || maxDepth <= 0) return expr;
                      let changed = false;
                      let res = expr.replace(/@([^@]+)@/g, (match, p1) => {
                          const f = formulas.find(x => x.name === p1);
                          if (f) { changed = true; return f.expression; }
                          return match;
                      });
                      res = res.replace(/\{([^}]+)\}/g, (match, p1) => {
                          const f = formulas.find(x => x.name === p1);
                          if (f) { changed = true; return f.expression; }
                          return match;
                      });
                      return changed ? applyFormulas(res, maxDepth - 1) : res;
                  };

                  let output = text;
                  const now = new Date();
                  
                  output = output.replace(
                    /@PrintDate@|@تاريخ گزارش@|@تاريخ@|@تاریخ گزارش@/gi,
                    now.toLocaleDateString("fa-IR"),
                  );
                  output = output.replace(
                    /@PrintTime@/gi,
                    now.toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' })
                  );
                  output = output.replace(/@ModificationDate@/gi, now.toLocaleDateString("fa-IR"));
                  output = output.replace(/@ModificationTime@/gi, now.toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' }));
                  output = output.replace(/@DataDate@/gi, now.toLocaleDateString("fa-IR"));
                  output = output.replace(/@DataTime@/gi, now.toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' }));
                  
                  output = output.replace(/@RecordNumber@/gi, rowIndex !== undefined ? String(rowIndex + 1) : "1");
                  output = output.replace(/@GroupNumber@/gi, "1");

                  output = output.replace(
                    /@ReportTitle@|@عنوان گزارش@/gi,
                    reportTitle || "گزارش جدید",
                  );
                  // Allow matching standalone numbering and structured string
                  output = output.replace(/@PageNumber@|@شماره صفحه@/gi, "1");
                  output = output.replace(/@TotalPageCount@|@تعداد صفحات@/gi, "1");
                  output = output.replace(/@PageNofM@/gi, "1 از 1");
                  
                  output = output.replace(/@ReportComments@/gi, "");
                  output = output.replace(/@RecordSelectionFormula@/gi, "");
                  output = output.replace(/@GroupSelectionFormula@/gi, "");
                  output = output.replace(/@FilePathAndName@/gi, "");
                  output = output.replace(/@FileAuthor@/gi, "شخصی‌سازی شده");
                  output = output.replace(/@FileCreationDate@/gi, now.toLocaleDateString("fa-IR"));

                  output = output.replace(
                    /@CompanyName@|@نام سازمان@|@سازمان@|@BusinessName@|@نام کسب و کار@/gi,
                    currentCompany?.title || "سازمان نمونه",
                  );

                  let hasTokens = false;
                  
                  // 1. Expand all inline formulas (recursive)
                  if (formulas && formulas.length > 0) {
                     let expansionCount = 0;
                     let prevOutput = "";
                     // loop to handle nested formulas
                     while (output !== prevOutput && expansionCount < 5) {
                         prevOutput = output;
                         output = output.replace(/@([^@]+)@|f\(([^)]+)\)/gi, (match, p1_at, p1_f) => {
                             const fName = p1_at || p1_f;
                             const fMatch = formulas.find(f => f.name === fName);
                             if (fMatch) {
                               hasTokens = true;
                               return fMatch.expression;
                             }
                             return match;
                         });
                         expansionCount++;
                     }
                  }

                  // 2. Expand all inline row fields
                  if (rowData) {
                     output = output.replace(/\{([^}]+)\}|@([^@]+)@/gi, (match, p1_brace, p1_at) => {
                         const fieldName = p1_brace || p1_at;
                         // If it's a known placeholder we already handled, skip
                         if (["PageNumber", "PageOfPages", "ReportDate", "OrgName"].includes(fieldName)) return match;
                         
                         hasTokens = true;
                         if (fieldName in rowData) {
                             let val = rowData[fieldName];
                             if (element?.format === 'money' && val !== null && val !== undefined && val !== "" && !isNaN(Number(val))) {
                                 val = Number(val).toLocaleString();
                             }
                             return val !== null && val !== undefined ? String(val) : "";
                         }

                         let originalKey = selectedFields?.find(
                           (sf: any) => t(`field_${sf.name}`, sf.name) === fieldName,
                         )?.name;
                         
                         if (!originalKey) {
                           for (const sf of selectedFields) {
                             if (sf.childrenFields) {
                               const cfMatch = sf.childrenFields.find((cf: any) => 
                                 t(`field_${cf.name}`, cf.name) === fieldName ||
                                 `${sf.name}.${cf.name}` === fieldName ||
                                 `${t(`field_${sf.name}`, sf.name)} - ${t(`field_${cf.name}`, cf.name)}` === fieldName
                               );
                               if (cfMatch) {
                                 originalKey = `${sf.name}.${cfMatch.name}`;
                                 break;
                               }
                             }
                           }
                         }

                         if (originalKey) {
                           let val = rowData[originalKey] !== undefined ? rowData[originalKey] : (originalKey.includes('.') ? (rowData[originalKey.split('.')[0]] !== undefined ? String(rowData[originalKey.split('.')[0]]) + " (تستی)" : undefined) : undefined);
                           if (element?.format === 'money' && val !== null && val !== undefined && val !== "" && !isNaN(Number(val))) {
                               val = Number(val).toLocaleString();
                           }
                           if (val !== null && val !== undefined) return String(val);
                         }
                         
                         return match; // If field not found, leave as is
                     });
                     
                     // Also handle exact match fallback if text is exactly the field localized name or formula name
                     if (!hasTokens && element?.isAt !== false && selectedFields && selectedFields.length > 0) {
                      for (const sf of selectedFields) {
                        const transName = t(`field_${sf.name}`, sf.name);
                        if (output === transName || output === sf.name) {
                          let val = rowData[sf.name];
                          if (element?.format === 'money' && val !== null && val !== undefined && val !== "" && !isNaN(Number(val))) {
                              val = Number(val).toLocaleString();
                          }
                          return processFormulaFunctions(val !== null && val !== undefined ? String(val) : "-");
                        }
                        if (sf.childrenFields) {
                           for (const cf of sf.childrenFields) {
                             const cfTransName = t(`field_${cf.name}`, cf.name);
                             const combinedTransName = `${t(`field_${sf.name}`, sf.name)} - ${cfTransName}`;
                             if (output === cfTransName || output === combinedTransName || output === cf.name || output === `${sf.name}.${cf.name}`) {
                               const compoundKey = `${sf.name}.${cf.name}`;
                               let val = rowData[compoundKey] !== undefined ? rowData[compoundKey] : (rowData[sf.name] !== undefined ? String(rowData[sf.name]) + " (تستی)" : undefined);
                               if (element?.format === 'money' && val !== null && val !== undefined && val !== "" && !isNaN(Number(val))) {
                                   val = Number(val).toLocaleString();
                               }
                               return processFormulaFunctions(val !== null && val !== undefined ? String(val) : "-");
                             }
                           }
                        }
                      }
                      
                      // Also handle exact match fallback for formulas
                      if (formulas && formulas.length > 0) {
                        const fMatch = formulas.find(f => f.name === output);
                        if (fMatch) {
                           let out = fMatch.expression;
                           out = out.replace(/PageNumber|@PageNumber@|@شماره\s*صفحه@/gi, "1");
                           out = out.replace(/ReportDate|@ReportDate@|@تاریخ\s*گزارش@/gi, new Date().toLocaleDateString("fa-IR"));
                           out = out.replace(/OrgName|@OrgName@|@نام\s*سازمان@/gi, currentCompany?.title || "سازمان نمونه");
                           out = out.replace(/PageOfPages|@PageOfPages@|@صفحه\s*از\s*صفحه@/gi, "1 از 1");
                           for (const key in rowData) {
                               out = out.replace(new RegExp(`\\{${key}\\}|@${key}@`, 'gi'), rowData[key] !== null && rowData[key] !== undefined ? String(rowData[key]) : '');
                           }
                           return processFormulaFunctions(out);
                        }
                      }
                    }
                  }

                  // Standard static replacements for built-in tokens
                  output = output.replace(/PageNumber|@PageNumber@|@شماره\s*صفحه@/gi, "1");
                  output = output.replace(/ReportDate|@ReportDate@|@تاریخ\s*گزارش@/gi, new Date().toLocaleDateString("fa-IR"));
                  output = output.replace(/OrgName|@OrgName@|@نام\s*سازمان@/gi, currentCompany?.title || "سازمان نمونه");
                  output = output.replace(/PageOfPages|@PageOfPages@|@صفحه\s*از\s*صفحه@/gi, "1 از 1");

                  return processFormulaFunctions(output);
                };

                const renderSection = (
                  sectionId: string,
                  height: number,
                  rowData?: any,
                  rowIndex?: number,
                ) => {
                  const sectionElements = elements.filter(
                    (e) => e.sectionId === sectionId,
                  );
                  if (sectionElements.length === 0 && sectionId !== "Details")
                    return null;

                  return (
                    <div
                      key={`${sectionId}-${rowIndex || 0}`}
                      style={{
                        height: `${height}px`,
                        position: "relative",
                        borderBottom: "1px dashed #eee",
                        zIndex: sectionId === "Report Header" || sectionId === "Page Header" ? 10 : 1
                      }}
                    >
                      {sectionElements.map((el) => (
                        <div
                          key={el.id}
                          style={{
                            position: "absolute",
                            left: `${el.x}px`,
                            top: `${el.y}px`,
                            width: `${el.width}px`,
                            height: el.height ? `${el.height}px` : undefined,
                            fontFamily: el.fontFamily || "Tahoma",
                            fontSize: `${el.fontSize || 10}px`,
                            fontWeight: el.fontWeight,
                            fontStyle: el.fontStyle,
                            textDecoration: el.textDecoration,
                            textAlign: el.textAlign || "right",
                            color: el.color,
                            backgroundColor: el.backgroundColor,
                            border: el.type === 'box' || el.type === 'table' ? (el.border || `${el.borderWidth || "1px"} ${el.borderStyle || "solid"} ${el.borderColor || "#000000"}`) : el.border,
                            zIndex: el.type === 'box' ? 1 : 10,
                            borderTop: el.borderTop ? `${el.borderWidth || "1px"} ${el.borderStyle || "solid"} ${el.borderColor || "#000000"}` : undefined,
                            borderRight: el.borderRight ? `${el.borderWidth || "1px"} ${el.borderStyle || "solid"} ${el.borderColor || "#000000"}` : undefined,
                            borderBottom: el.borderBottom ? `${el.borderWidth || "1px"} ${el.borderStyle || "solid"} ${el.borderColor || "#000000"}` : undefined,
                            borderLeft: el.borderLeft ? `${el.borderWidth || "1px"} ${el.borderStyle || "solid"} ${el.borderColor || "#000000"}` : undefined,
                            borderRadius: el.borderRadius,
                            direction: el.direction || "rtl",
                            whiteSpace: el.type === 'textarea' ? "normal" : "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {el.type === 'image' ? (
                             <img src={substituteText(el.text, rowData, rowIndex, el)} alt="img" style={{width: '100%', height: '100%', objectFit: 'cover'}} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                             substituteText(el.text, rowData, rowIndex, el)
                          )}
                        </div>
                      ))}
                    </div>
                  );
                };

                let displayData = [...previewData];

                if (previewError) {
                  return (
                    <div className="flex flex-col items-center justify-center p-12 mt-20 text-red-500 bg-red-50 rounded-lg border border-red-100 max-w-lg mx-auto">
                      <span className="text-xl font-bold mb-2">خطا در دریافت اطلاعات</span>
                      <span>{previewError}</span>
                    </div>
                  );
                }

                if (previewLoading) {
                  return (
                    <div className="flex flex-col items-center justify-center mt-20 text-blue-600">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <span>در حال دریافت اطلاعات...</span>
                    </div>
                  );
                }

                if (displayData.length === 0 && (selectedFields.length > 0 || sqlScript)) {
                  return (
                    <div className="text-center text-gray-500 mt-20">
                      داده‌ای برای نمایش یافت نشد.
                    </div>
                  );
                }

                if (selectedFields.length === 0 && elements.length === 0) {
                  return (
                    <div className="text-center text-gray-500 mt-20">
                      بدون فیلد، اطلاعاتی برای نمایش نیست.
                    </div>
                  );
                }

                if (groupings && groupings.length > 0 && displayData.length > 0) {
                    displayData.sort((a, b) => {
                        for (let g of groupings) {
                            const field = g.name;
                            const valA = a[field] !== null && a[field] !== undefined ? a[field] : '';
                            const valB = b[field] !== null && b[field] !== undefined ? b[field] : '';
                            if (valA < valB) return -1;
                            if (valA > valB) return 1;
                        }
                        return 0;
                    });
                }

                // Process Running Totals
                if (runningTotals && runningTotals.length > 0 && displayData.length > 0) {
                    let runningTotalStates = runningTotals.map(rt => ({
                        name: rt.name,
                        type: rt.summaryType,
                        field: rt.fieldToSummarize,
                        secondaryField: rt.secondaryField,
                        p_value: rt.p_value ?? 50,
                        n_value: rt.n_value ?? 1,
                        evaluateType: rt.evaluateType || 'each_record',
                        evaluateField: rt.evaluateField,
                        evaluateGroup: rt.evaluateGroup,
                        resetType: rt.resetType || 'never',
                        resetField: rt.resetField,
                        resetGroup: rt.resetGroup,
                        accumulator: 0,
                        count: 0,
                        values: [] as number[],
                        secondaryValues: [] as number[],
                        currentValue: 0
                    }));

                    for(let i = 0; i < displayData.length; i++) {
                        const row = displayData[i];
                        const prevRow = i > 0 ? displayData[i-1] : null;

                        for (let s of runningTotalStates) {
                            let shouldReset = false;
                            if (s.resetType === 'change_of_field' && s.resetField && prevRow && row[s.resetField] !== prevRow[s.resetField]) {
                                shouldReset = true;
                            } else if (s.resetType === 'change_of_group' && s.resetGroup && prevRow && row[s.resetGroup] !== prevRow[s.resetGroup]) {
                                shouldReset = true;
                            }

                            if (shouldReset) {
                                s.accumulator = 0;
                                s.count = 0;
                                s.values = [];
                                s.secondaryValues = [];
                            }

                            let shouldEvaluate = false;
                            if (s.evaluateType === 'each_record') {
                                shouldEvaluate = true;
                            } else if (s.evaluateType === 'change_of_field' && s.evaluateField) {
                                if (!prevRow || row[s.evaluateField] !== prevRow[s.evaluateField]) shouldEvaluate = true;
                            } else if (s.evaluateType === 'change_of_group' && s.evaluateGroup) {
                                if (!prevRow || row[s.evaluateGroup] !== prevRow[s.evaluateGroup]) shouldEvaluate = true;
                            }

                            if (shouldEvaluate) {
                                let rawVal = row[s.field];
                                let numVal = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal || 0);
                                if(isNaN(numVal)) numVal = 0;
                                
                                let rawSec = s.secondaryField ? row[s.secondaryField] : null;
                                let secVal = typeof rawSec === 'number' ? rawSec : parseFloat(rawSec || 0);
                                if(isNaN(secVal)) secVal = 0;

                                s.count++;
                                s.values.push(numVal);
                                if (s.secondaryField) s.secondaryValues.push(secVal);
                                s.accumulator += numVal;
                                
                                switch(s.type) {
                                    case 'sum':
                                        s.currentValue = s.accumulator;
                                        break;
                                    case 'average':
                                        s.currentValue = s.count > 0 ? s.accumulator / s.count : 0;
                                        break;
                                    case 'count':
                                        s.currentValue = s.count;
                                        break;
                                    case 'maximum':
                                        s.currentValue = s.count === 1 ? numVal : Math.max(s.currentValue, numVal);
                                        break;
                                    case 'minimum':
                                        s.currentValue = s.count === 1 ? numVal : Math.min(s.currentValue, numVal);
                                        break;
                                    case 'sample_variance':
                                    case 'population_variance':
                                    case 'sample_standard_deviation':
                                    case 'population_standard_deviation': {
                                        if (s.count < 1) {
                                            s.currentValue = 0;
                                        } else {
                                            let mean = s.accumulator / s.count;
                                            let varianceSum = s.values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
                                            let isSample = s.type.startsWith('sample');
                                            let divisor = isSample ? (s.count > 1 ? s.count - 1 : 1) : s.count;
                                            let variance = varianceSum / divisor;
                                            s.currentValue = s.type.includes('standard_deviation') ? Math.sqrt(variance) : variance;
                                        }
                                        break;
                                    }
                                    case 'distinct_count':
                                        s.currentValue = new Set(s.values).size;
                                        break;
                                    case 'correlation': {
                                        if (s.count < 2) { s.currentValue = 0; break; }
                                        let sumX = s.values.reduce((a,b)=>a+b,0);
                                        let sumY = s.secondaryValues.reduce((a,b)=>a+b,0);
                                        let sumXY = 0, sumX2 = 0, sumY2 = 0;
                                        for(let k=0; k<s.count; k++) {
                                            sumXY += s.values[k] * s.secondaryValues[k];
                                            sumX2 += s.values[k] * s.values[k];
                                            sumY2 += s.secondaryValues[k] * s.secondaryValues[k];
                                        }
                                        let num = s.count * sumXY - sumX * sumY;
                                        let den = Math.sqrt((s.count * sumX2 - sumX * sumX) * (s.count * sumY2 - sumY * sumY));
                                        s.currentValue = den === 0 ? 0 : num / den;
                                        break;
                                    }
                                    case 'covariance': {
                                        if (s.count < 2) { s.currentValue = 0; break; }
                                        let sumX = s.values.reduce((a,b)=>a+b,0);
                                        let sumY = s.secondaryValues.reduce((a,b)=>a+b,0);
                                        let meanX = sumX / s.count;
                                        let meanY = sumY / s.count;
                                        let covSum = 0;
                                        for(let k=0; k<s.count; k++) {
                                            covSum += (s.values[k] - meanX) * (s.secondaryValues[k] - meanY);
                                        }
                                        s.currentValue = covSum / (s.count - 1);
                                        break;
                                    }
                                    case 'weighted_average': {
                                        if (s.count < 1) { s.currentValue = 0; break; }
                                        let sumWX = 0, sumW = 0;
                                        for(let k=0; k<s.count; k++) {
                                            sumWX += s.values[k] * s.secondaryValues[k];
                                            sumW += s.secondaryValues[k];
                                        }
                                        s.currentValue = sumW === 0 ? 0 : sumWX / sumW;
                                        break;
                                    }
                                    case 'median': {
                                        if (s.count < 1) { s.currentValue = 0; break; }
                                        let sorted = [...s.values].sort((a,b)=>a-b);
                                        let mid = Math.floor(sorted.length / 2);
                                        if (sorted.length % 2 !== 0) s.currentValue = sorted[mid];
                                        else s.currentValue = (sorted[mid - 1] + sorted[mid]) / 2;
                                        break;
                                    }
                                    case 'pth_percentile': {
                                        if (s.count < 1) { s.currentValue = 0; break; }
                                        let sorted = [...s.values].sort((a,b)=>a-b);
                                        let p = s.p_value / 100;
                                        let idx = p * (sorted.length - 1);
                                        let i1 = Math.floor(idx);
                                        let i2 = Math.ceil(idx);
                                        if (i1 === i2) s.currentValue = sorted[i1];
                                        else s.currentValue = sorted[i1] + (sorted[i2] - sorted[i1]) * (idx - i1);
                                        break;
                                    }
                                    case 'nth_largest': {
                                        if (s.count < 1) { s.currentValue = 0; break; }
                                        let sorted = [...s.values].sort((a,b)=>b-a);
                                        let n = Math.min(s.n_value, sorted.length) - 1;
                                        s.currentValue = sorted[n];
                                        break;
                                    }
                                    case 'nth_smallest': {
                                        if (s.count < 1) { s.currentValue = 0; break; }
                                        let sorted = [...s.values].sort((a,b)=>a-b);
                                        let n = Math.min(s.n_value, sorted.length) - 1;
                                        s.currentValue = sorted[n];
                                        break;
                                    }
                                    case 'mode': {
                                        if (s.count < 1) { s.currentValue = 0; break; }
                                        let freq: Record<number, number> = {};
                                        let maxFreq = 0;
                                        let modeVal = s.values[0];
                                        for(let v of s.values) {
                                            freq[v] = (freq[v]||0) + 1;
                                            if (freq[v] > maxFreq) { maxFreq = freq[v]; modeVal = v; }
                                        }
                                        s.currentValue = modeVal;
                                        break;
                                    }
                                }
                            }
                            
                            displayData[i] = { ...displayData[i], [s.name]: s.currentValue };
                        }
                    }
                }

                const renderElements: React.ReactNode[] = [];
                let outputIndex = 0;

                // Top bands
                for (const section of sections) {
                    if (section.id === "Report Header" || section.id === "Page Header") {
                        const content = renderSection(section.id, section.height, displayData.length > 0 ? displayData[0] : undefined, 0);
                        if (content) renderElements.push(<React.Fragment key={`top-${outputIndex++}`}>{content}</React.Fragment>);
                    }
                }

                // Data bands
                if (displayData.length > 0) {
                    let lastRow: any = null;
                    for (let rowIndex = 0; rowIndex < displayData.length; rowIndex++) {
                        const row = displayData[rowIndex];
                        
                        let changedGroupLoc = -1;
                        if (groupings && groupings.length > 0) {
                            for (let i = 0; i < groupings.length; i++) {
                                const gField = groupings[i].name;
                                if (!lastRow || lastRow[gField] !== row[gField]) {
                                    changedGroupLoc = i;
                                    break;
                                }
                            }
                        }
                        
                        // Footers for broken groups (from innermost to outermost)
                        if (changedGroupLoc !== -1 && lastRow && groupings) {
                            for (let i = groupings.length - 1; i >= changedGroupLoc; i--) {
                                const footerId = `Group Footer ${i + 1}`;
                                const footerSection = sections.find(s => s.id === footerId);
                                if (footerSection) {
                                    const content = renderSection(footerSection.id, footerSection.height, lastRow, rowIndex - 1);
                                    if (content) renderElements.push(<React.Fragment key={`gf-${outputIndex++}`}>{content}</React.Fragment>);
                                }
                            }
                        }
                        
                        // Headers for new groups (from outermost to innermost)
                        if (changedGroupLoc !== -1 && groupings) {
                            for (let i = changedGroupLoc; i < groupings.length; i++) {
                                const headerId = `Group Header ${i + 1}`;
                                const headerSection = sections.find(s => s.id === headerId);
                                if (headerSection) {
                                    const content = renderSection(headerSection.id, headerSection.height, row, rowIndex);
                                    if (content) renderElements.push(<React.Fragment key={`gh-${outputIndex++}`}>{content}</React.Fragment>);
                                }
                            }
                        }
                        
                        // Details
                        const detailsSection = sections.find(s => s.id === "Details");
                        if (detailsSection) {
                            const content = renderSection(detailsSection.id, detailsSection.height, row, rowIndex);
                            if (content) renderElements.push(<React.Fragment key={`dt-${outputIndex++}`}>{content}</React.Fragment>);
                        }
                        
                        lastRow = row;
                    }
                    
                    // Footers for remaining groups
                    if (lastRow && groupings && groupings.length > 0) {
                        for (let i = groupings.length - 1; i >= 0; i--) {
                            const footerId = `Group Footer ${i + 1}`;
                            const footerSection = sections.find(s => s.id === footerId);
                            if (footerSection) {
                                const content = renderSection(footerSection.id, footerSection.height, lastRow, displayData.length - 1);
                                if (content) renderElements.push(<React.Fragment key={`gf-end-${outputIndex++}`}>{content}</React.Fragment>);
                            }
                        }
                    }
                } else if (sections.some(s => s.id === "Details")) {
                    const detailsSection = sections.find(s => s.id === "Details");
                    if (detailsSection) {
                        const content = renderSection(detailsSection.id, detailsSection.height);
                        if (content) renderElements.push(<React.Fragment key={`dt-dummy-${outputIndex++}`}>{content}</React.Fragment>);
                    }
                }

                // Bottom bands
                for (const section of sections) {
                    if (section.id === "Report Footer" || section.id === "Page Footer") {
                        const lastRow = displayData.length > 0 ? displayData[displayData.length - 1] : undefined;
                        const content = renderSection(section.id, section.height, lastRow, displayData.length - 1);
                        if (content) renderElements.push(<React.Fragment key={`bot-${outputIndex++}`}>{content}</React.Fragment>);
                    }
                }

                return (
                  <div className="flex flex-col w-full h-full">
                     {renderElements}
                  </div>
                );
              })()}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Menu Bar */}
      <div className="bg-[#f0f0f0] flex items-center px-2 py-1 gap-4 text-[12px] text-gray-800 border-b border-gray-300 select-none">
        <span className="cursor-pointer hover:bg-gray-200 px-1.5 py-0.5 rounded">
          File
        </span>
        <div className="relative group">
          <span className="cursor-pointer hover:bg-gray-200 px-1.5 py-0.5 rounded">
            Edit
          </span>
          <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-300 shadow-md py-1 w-32 z-50">
            <div
              className="px-3 py-1 hover:bg-blue-100 cursor-pointer flex items-center gap-2"
              onClick={() => setShowBorderToolbar(!showBorderToolbar)}
            >
              <div className="w-4 flex justify-center">
                {showBorderToolbar && <span>✓</span>}
              </div>
              Border Toolbar
            </div>
          </div>
        </div>
        <span className="cursor-pointer hover:bg-gray-200 px-1.5 py-0.5 rounded">
          View
        </span>
        <span className="cursor-pointer hover:bg-gray-200 px-1.5 py-0.5 rounded">
          Insert
        </span>
        <span className="cursor-pointer hover:bg-gray-200 px-1.5 py-0.5 rounded">
          Format
        </span>
        <span className="cursor-pointer hover:bg-gray-200 px-1.5 py-0.5 rounded">
          Database
        </span>
        <span className="cursor-pointer hover:bg-gray-200 px-1.5 py-0.5 rounded">
          Report
        </span>
        <span className="cursor-pointer hover:bg-gray-200 px-1.5 py-0.5 rounded">
          Window
        </span>
        <span className="cursor-pointer hover:bg-gray-200 px-1.5 py-0.5 rounded">
          Help
        </span>
      </div>

      {/* Toolbars */}
      <div className="bg-[#f0f0f0] flex items-center px-2 py-1 gap-1 border-b border-white shadow-sm shadow-gray-300 select-none">
        <button
          type="button"
          onClick={() => {
            const layoutsObj = {
              paperSize,
              paperOrientation,
              customWidth,
              customHeight,
              margins
            };
            console.log("Save button clicked in ReportDesigner", {
              elements,
              paramValues,
              formulas,
              layoutsObj,
              onSave,
            });
            onSave?.(elements, paramValues, formulas, layoutsObj);
          }}
          disabled={isSaving}
          title="ذخیره طراحی"
          className={`p-1 border border-transparent rounded z-50 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}`}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 text-blue-700 animate-spin pointer-events-none" />
          ) : (
            <Save className="w-4 h-4 text-blue-700 pointer-events-none" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            window.print();
          }}
          title="چاپ گزارش (Print Layout)"
          className="p-1 hover:border-gray-400 border border-transparent rounded cursor-pointer z-50"
        >
          <Printer className="w-4 h-4 text-gray-700 pointer-events-none" />
        </button>
        <button
          type="button"
          onClick={() => {
             const dynamicParams = elements.filter(el => el.isDynamic && el.dynamicKey);
             if (dynamicParams.length > 0) {
                 setShowParamsModal(true);
             } else {
                 setShowPreview(true);
             }
          }}
          title="پیش‌نمایش چاپ"
          className="p-1 hover:border-gray-400 border border-transparent rounded cursor-pointer z-50"
        >
          <Search className="w-4 h-4 text-gray-700 pointer-events-none" />
        </button>
        <button
          type="button"
          onClick={() => setShowPageSetupModal(true)}
          title="تنظیمات صفحه (Page Setup)"
          className="p-1 hover:border-gray-400 border border-transparent rounded cursor-pointer z-50 text-gray-700"
        >
          <Settings className="w-4 h-4 text-gray-700 pointer-events-none" />
        </button>

        <div className="w-[1px] h-5 bg-gray-400 mx-1"></div>

        <button 
          className={`p-1 border border-transparent rounded hover:border-gray-400 cursor-pointer ${selectedElementIds.length > 0 ? "" : "opacity-50 cursor-not-allowed"}`}
          onClick={handleCopy}
          disabled={selectedElementIds.length === 0}
          title="کپی (Ctrl+C)"
        >
          <Copy className="w-4 h-4 text-blue-600" />
        </button>
        <button 
          className="p-1 border border-transparent rounded hover:border-gray-400 cursor-pointer"
          onClick={handlePaste}
          title="پیست (Ctrl+V)"
        >
          <ClipboardPaste className="w-4 h-4 text-green-600" />
        </button>
        <button 
          className={`p-1 border border-transparent rounded ${canUndo ? "hover:border-gray-400 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
          onClick={undo}
          disabled={!canUndo}
        >
          <Undo className="w-4 h-4 text-blue-600" />
        </button>
        <button 
          className={`p-1 border border-transparent rounded ${canRedo ? "hover:border-gray-400 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
          onClick={redo}
          disabled={!canRedo}
        >
          <Redo className="w-4 h-4 text-blue-600" />
        </button>

        <div className="w-[1px] h-5 bg-gray-400 mx-1"></div>

        <select className="border border-gray-300 bg-white text-[11px] px-1 h-6 outline-none">
          <option>100%</option>
          <option>75%</option>
          <option>50%</option>
          <option>Fit Page</option>
        </select>

        <div className="w-[1px] h-5 bg-gray-400 mx-1"></div>

        <button className="p-1 hover:border-gray-400 border border-transparent rounded">
          <span className="text-purple-600 font-bold text-[14px] leading-[14px]">
            Σ
          </span>
        </button>
        <button
          onClick={handleDeleteSelected}
          disabled={selectedElementIds.length === 0}
          className={`p-1 hover:border-gray-400 border border-transparent rounded ${selectedElementIds.length === 0 ? "opacity-50 cursor-not-allowed" : "text-red-600"}`}
          title="Delete selected fields"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {showBorderToolbar && (
        <div className="bg-[#f0f0f0] flex items-center px-2 py-1 gap-1 border-b border-white shadow-sm select-none">
          {/* Border None */}
          <button
            onClick={() => updateElementProps({ borderTop: false, borderRight: false, borderBottom: false, borderLeft: false })}
            className="p-1 hover:border-gray-400 border border-transparent rounded flex items-center justify-center"
            title="No Border"
          >
            <div className="w-4 h-4 border border-dotted border-gray-400"></div>
          </button>
          
          <div className="w-[1px] h-5 bg-gray-400 mx-1"></div>

          {/* Border Left */}
          <button
            onClick={() => updateElementProps({ borderLeft: !selectedElement?.borderLeft })}
            className={`p-1 hover:border-gray-400 border rounded flex items-center justify-center ${selectedElement?.borderLeft ? "bg-gray-200 border-gray-400" : "border-transparent"}`}
            title="Border Left"
          >
            <div className="w-4 h-4 border border-dotted border-gray-400 border-l-2 border-l-solid border-l-gray-900"></div>
          </button>
          
          {/* Border Top */}
          <button
            onClick={() => updateElementProps({ borderTop: !selectedElement?.borderTop })}
            className={`p-1 hover:border-gray-400 border rounded flex items-center justify-center ${selectedElement?.borderTop ? "bg-gray-200 border-gray-400" : "border-transparent"}`}
            title="Border Top"
          >
            <div className="w-4 h-4 border border-dotted border-gray-400 border-t-2 border-t-solid border-t-gray-900"></div>
          </button>

          {/* Border Right */}
          <button
            onClick={() => updateElementProps({ borderRight: !selectedElement?.borderRight })}
            className={`p-1 hover:border-gray-400 border rounded flex items-center justify-center ${selectedElement?.borderRight ? "bg-gray-200 border-gray-400" : "border-transparent"}`}
            title="Border Right"
          >
            <div className="w-4 h-4 border border-dotted border-gray-400 border-r-2 border-r-solid border-r-gray-900"></div>
          </button>

          {/* Border Bottom */}
          <button
            onClick={() => updateElementProps({ borderBottom: !selectedElement?.borderBottom })}
            className={`p-1 hover:border-gray-400 border rounded flex items-center justify-center ${selectedElement?.borderBottom ? "bg-gray-200 border-gray-400" : "border-transparent"}`}
            title="Border Bottom"
          >
            <div className="w-4 h-4 border border-dotted border-gray-400 border-b-2 border-b-solid border-b-gray-900"></div>
          </button>

          {/* Border All */}
          <button
            onClick={() => updateElementProps({ borderTop: true, borderRight: true, borderBottom: true, borderLeft: true })}
            className={`p-1 hover:border-gray-400 border rounded flex items-center justify-center border-transparent`}
            title="All Borders"
          >
            <div className="w-4 h-4 border-2 border-solid border-gray-900"></div>
          </button>

          <div className="w-[1px] h-5 bg-gray-400 mx-1"></div>

          <label className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 p-1 rounded" title="Border Color">
            <PaintBucket className="w-4 h-4 text-gray-700" />
            <input
              type="color"
              value={selectedElement?.borderColor || "#000000"}
              onChange={(e) => updateElementProps({ borderColor: e.target.value })}
              className="w-5 h-5 p-0 border-0 cursor-pointer rounded overflow-hidden"
            />
          </label>

          <div className="w-[1px] h-5 bg-gray-400 mx-1"></div>
          
          <select
            value={selectedElement?.borderStyle || "solid"}
            onChange={(e) => updateElementProps({ borderStyle: e.target.value })}
            className="border border-gray-300 bg-white text-[11px] px-1 h-6 outline-none"
            title="Border Style"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
          </select>

          <div className="w-[1px] h-5 bg-gray-400 mx-1"></div>

          <select
            value={selectedElement?.borderWidth || "1px"}
            onChange={(e) => updateElementProps({ borderWidth: e.target.value })}
            className="border border-gray-300 bg-white text-[11px] px-1 h-6 outline-none"
            title="Border Width"
          >
            <option value="1px">1px</option>
            <option value="2px">2px</option>
            <option value="3px">3px</option>
            <option value="4px">4px</option>
            <option value="5px">5px</option>
          </select>
        </div>
      )}

      <div className="bg-[#f0f0f0] flex items-center px-2 py-1 gap-1 border-b border-gray-300 shadow-sm select-none">
        <select
          value={selectedElement?.fontFamily || "Tahoma"}
          onChange={(e) => updateElementProps({ fontFamily: e.target.value })}
          className="border border-gray-300 bg-white text-[11px] px-1 h-6 outline-none w-32"
        >
          <option>Tahoma</option>
          <option>Vazirmatn</option>
          <option>Arial</option>
          <option>Times New Roman</option>
        </select>
        <select
          value={selectedElement?.fontSize || "10"}
          onChange={(e) => updateElementProps({ fontSize: e.target.value })}
          className="border border-gray-300 bg-white text-[11px] px-1 h-6 outline-none w-12"
        >
          <option>8</option>
          <option>10</option>
          <option>11</option>
          <option>12</option>
          <option>14</option>
          <option>16</option>
          <option>20</option>
          <option>24</option>
        </select>

        <div className="w-[1px] h-5 bg-gray-400 mx-1"></div>

        <button
          onClick={() =>
            updateElementProps({
              fontWeight:
                selectedElement?.fontWeight === "bold" ? "normal" : "bold",
            })
          }
          className={`p-1 hover:border-gray-400 border rounded ${selectedElement?.fontWeight === "bold" ? "bg-[#ddd] border-gray-400" : "border-transparent bg-transparent"}`}
        >
          <Bold className="w-4 h-4 text-gray-800" />
        </button>
        <button
          onClick={() =>
            updateElementProps({
              fontStyle:
                selectedElement?.fontStyle === "italic" ? "normal" : "italic",
            })
          }
          className={`p-1 hover:border-gray-400 border rounded ${selectedElement?.fontStyle === "italic" ? "bg-[#ddd] border-gray-400" : "border-transparent bg-transparent"}`}
        >
          <Italic className="w-4 h-4 text-gray-800" />
        </button>
        <button
          onClick={() =>
            updateElementProps({
              textDecoration:
                selectedElement?.textDecoration === "underline"
                  ? "none"
                  : "underline",
            })
          }
          className={`p-1 hover:border-gray-400 border rounded ${selectedElement?.textDecoration === "underline" ? "bg-[#ddd] border-gray-400" : "border-transparent bg-transparent"}`}
        >
          <Underline className="w-4 h-4 text-gray-800" />
        </button>

        <div className="w-[1px] h-5 bg-gray-400 mx-1"></div>

        <button
          onClick={() => updateElementProps({ textAlign: "left" })}
          className={`p-1 hover:border-gray-400 border rounded ${selectedElement?.textAlign === "left" ? "bg-[#ddd] border-gray-400" : "border-transparent bg-transparent"}`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4 text-gray-800" />
        </button>
        <button
          onClick={() => updateElementProps({ textAlign: "center" })}
          className={`p-1 hover:border-gray-400 border rounded ${selectedElement?.textAlign === "center" ? "bg-[#ddd] border-gray-400" : "border-transparent bg-transparent"}`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4 text-gray-800" />
        </button>
        <button
          onClick={() => updateElementProps({ textAlign: "right" })}
          className={`p-1 hover:border-gray-400 border rounded ${selectedElement?.textAlign === "right" || !selectedElement?.textAlign ? "bg-[#ddd] border-gray-400" : "border-transparent bg-transparent"}`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4 text-gray-800" />
        </button>
        <button
          onClick={() => updateElementProps({ textAlign: "justify" })}
          className={`p-1 hover:border-gray-400 border rounded ${selectedElement?.textAlign === "justify" ? "bg-[#ddd] border-gray-400" : "border-transparent bg-transparent"}`}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4 text-gray-800" />
        </button>

        <div className="w-[1px] h-5 bg-gray-400 mx-1"></div>

        <button
          onClick={() => updateElementProps({ direction: "rtl" })}
          className={`p-1 hover:border-gray-400 border rounded ${selectedElement?.direction === "rtl" || !selectedElement?.direction ? "bg-[#ddd] border-gray-400" : "border-transparent bg-transparent"}`}
          title="Right-to-Left"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-800"
          >
            <path d="M10 22 6 18l4-4" />
            <path d="M22 18H6" />
            <path d="M14 6h-6a4 4 0 0 0 0 8h2" />
            <path d="M10 6v8" />
            <path d="M14 6v8" />
          </svg>
        </button>
        <button
          onClick={() => updateElementProps({ direction: "ltr" })}
          className={`p-1 hover:border-gray-400 border rounded ${selectedElement?.direction === "ltr" ? "bg-[#ddd] border-gray-400" : "border-transparent bg-transparent"}`}
          title="Left-to-Right"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-800"
          >
            <path d="m14 14 4 4-4 4" />
            <path d="M2 18h16" />
            <path d="M10 6h6a4 4 0 0 1 0 8h-2" />
            <path d="M14 6v8" />
            <path d="M10 6v8" />
          </svg>
        </button>

        <div className="w-[1px] h-5 bg-gray-400 mx-1"></div>

        <label
          className="p-1 hover:border-gray-400 border rounded border-transparent bg-transparent cursor-pointer flex items-center relative"
          title="Background Color"
        >
          <PaintBucket className="w-4 h-4 text-gray-800" />
          <input
            type="color"
            value={selectedElement?.backgroundColor && selectedElement?.backgroundColor !== 'transparent' ? selectedElement?.backgroundColor : "#ffffff"}
            onChange={(e) =>
              updateElementProps({ backgroundColor: e.target.value })
            }
            className="absolute opacity-0 w-full h-full cursor-pointer"
          />
        </label>

        <label
          className="p-1 hover:border-gray-400 border rounded border-transparent bg-transparent cursor-pointer flex items-center relative"
          title="Text Color"
        >
          <div className="flex flex-col items-center leading-none">
            <span
              className="text-[12px] font-bold text-gray-800"
              style={{ height: "12px" }}
            >
              A
            </span>
            <div
              className="w-3 h-[2px] mt-[1px]"
              style={{ backgroundColor: selectedElement?.color || "#000000" }}
            ></div>
          </div>
          <input
            type="color"
            value={selectedElement?.color || "#000000"}
            onChange={(e) => updateElementProps({ color: e.target.value })}
            className="absolute opacity-0 w-full h-full cursor-pointer"
          />
        </label>

        <div className="w-[1px] h-5 bg-gray-400 mx-1"></div>

        <button
          onClick={() =>
            updateElementProps({
              border: selectedElement?.border ? "" : "1px solid #000",
            })
          }
          className={`p-1 hover:border-gray-400 border rounded ${selectedElement?.border ? "bg-[#ddd] border-gray-400" : "border-transparent bg-transparent"}`}
          title="Toggle Border"
        >
          <Square className="w-4 h-4 text-gray-800" />
        </button>
      </div>

      {/* Main Area */}
      <div
        className="flex flex-1 overflow-hidden"
        onClick={() => { setSelectedElementIds([]); setShowPropertiesPane(false); }}
      >
        {/* Left Sidebar (Data Dictionary) */}
        <div
          className="w-64 border-r border-gray-300 bg-white flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#f0f0f0] p-1 border-b border-gray-300">
            <div className="bg-white border text-[11px] border-gray-300 px-2 py-0.5 flex items-center justify-between shadow-inner">
              <span className="text-gray-700">Main Report</span>
              <MinusSquare className="w-3 h-3 text-gray-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
            {/* eslint-disable-next-line */}
            {TREE_DATA.map((node) => (
              <DesignerTreeItem key={node.id} node={node} />
            ))}
          </div>
        </div>

        {/* Elements Toolbar */}
        <div 
          className="w-10 bg-[#f0f0f0] border-r border-gray-300 flex flex-col items-center py-2 space-y-2 z-10"
          onClick={(e) => e.stopPropagation()}
        >
           <button draggable onDragStart={(e) => handleGraphicDragStart(e, 'label')} onClick={() => addGraphicElement('label')} className="p-1.5 hover:bg-white rounded hover:shadow text-gray-700 cursor-grab active:cursor-grabbing" title="Label (Title)"><Type className="w-4 h-4" /></button>
           <button draggable onDragStart={(e) => handleGraphicDragStart(e, 'text')} onClick={() => addGraphicElement('text')} className="p-1.5 hover:bg-white rounded hover:shadow text-gray-700 cursor-grab active:cursor-grabbing" title="Text Input (Dynamic)"><FileText className="w-4 h-4" /></button>
           <button draggable onDragStart={(e) => handleGraphicDragStart(e, 'textarea')} onClick={() => addGraphicElement('textarea')} className="p-1.5 hover:bg-white rounded hover:shadow text-gray-700 cursor-grab active:cursor-grabbing" title="TextArea (Dynamic)"><AlignJustify className="w-4 h-4" /></button>
           <div className="w-6 h-px bg-gray-300 my-1"></div>
           <button draggable onDragStart={(e) => handleGraphicDragStart(e, 'checkbox')} onClick={() => addGraphicElement('checkbox')} className="p-1.5 hover:bg-white rounded hover:shadow text-gray-700 cursor-grab active:cursor-grabbing" title="Checkbox"><Square className="w-4 h-4" /></button>
           <button draggable onDragStart={(e) => handleGraphicDragStart(e, 'radio')} onClick={() => addGraphicElement('radio')} className="p-1.5 hover:bg-white rounded hover:shadow text-gray-700 cursor-grab active:cursor-grabbing" title="Radio Button"><Circle className="w-4 h-4" /></button>
           <button draggable onDragStart={(e) => handleGraphicDragStart(e, 'list')} onClick={() => addGraphicElement('list')} className="p-1.5 hover:bg-white rounded hover:shadow text-gray-700 cursor-grab active:cursor-grabbing" title="List/Combo"><Database className="w-4 h-4" /></button>
           <div className="w-6 h-px bg-gray-300 my-1"></div>
           <button draggable onDragStart={(e) => handleGraphicDragStart(e, 'box')} onClick={() => addGraphicElement('box')} className="p-1.5 hover:bg-white rounded hover:shadow text-gray-700 cursor-grab active:cursor-grabbing" title="Square/Box"><Square className="w-4 h-4 opacity-50" /></button>
           <button draggable onDragStart={(e) => handleGraphicDragStart(e, 'circle')} onClick={() => addGraphicElement('circle')} className="p-1.5 hover:bg-white rounded hover:shadow text-gray-700 cursor-grab active:cursor-grabbing" title="Circle"><Circle className="w-4 h-4 opacity-50" /></button>
           <button draggable onDragStart={(e) => handleGraphicDragStart(e, 'line')} onClick={() => addGraphicElement('line')} className="p-1.5 hover:bg-white rounded hover:shadow text-gray-700 cursor-grab active:cursor-grabbing" title="Line"><div className="w-4 h-0.5 bg-gray-700 rotate-45 transform"></div></button>
           <button draggable onDragStart={(e) => handleGraphicDragStart(e, 'image')} onClick={() => addGraphicElement('image')} className="p-1.5 hover:bg-white rounded hover:shadow text-gray-700 cursor-grab active:cursor-grabbing" title="Image"><div className="w-4 h-4 border border-gray-700 rounded-sm flex items-center justify-center">i</div></button>
           <button draggable onDragStart={(e) => handleGraphicDragStart(e, 'table')} onClick={() => addGraphicElement('table')} className="p-1.5 hover:bg-white rounded hover:shadow text-gray-700 cursor-grab active:cursor-grabbing" title="Table"><Table2 className="w-4 h-4" /></button>
        </div>

        {/* Canvas Area */}
        <div
          className="flex-1 bg-[#a0a0a0] overflow-auto flex flex-col p-4 shadow-inner relative"
          onClick={(e) => { e.stopPropagation(); setShowPropertiesPane(false); }}
        >
          {(() => {
            const canvasWidthPx = Math.round((
              paperSize === 'A4' ? (paperOrientation === 'landscape' ? 297 : 210) :
              paperSize === 'A5' ? (paperOrientation === 'landscape' ? 210 : 148) :
              paperSize === 'Letter' ? (paperOrientation === 'landscape' ? 279.4 : 215.9) :
              customWidth
            ) * 3.78);
            return (
              <div
                className="bg-white shadow-md border border-gray-500 mx-auto flex flex-col relative"
                style={{
                  width: `${canvasWidthPx}px`,
                  maxWidth: `${canvasWidthPx}px`,
                  minHeight: `${paperOrientation === 'landscape' ? 600 : 800}px`
                }}
                onClick={() => { setSelectedElementIds([]); setShowPropertiesPane(false); }}
              >
                {/* Margin Guides */}
                <div 
                  className="absolute pointer-events-none border-l border-dashed border-blue-400/40 z-30" 
                  style={{
                    left: `${margins.left * 3.78}px`,
                    top: 0,
                    bottom: 0,
                  }}
                  title="حاشیه چپ (Left Margin)"
                />
                <div 
                  className="absolute pointer-events-none border-r border-dashed border-blue-400/40 z-30" 
                  style={{
                    right: `${margins.right * 3.78}px`,
                    top: 0,
                    bottom: 0,
                  }}
                  title="حاشیه راست (Right Margin)"
                />
            {/* Horizontal Ruler */}
            <div className="h-4 border-b border-gray-300 bg-[#f0f0f0] text-[9px] text-gray-600 flex items-end tracking-[0.3em] overflow-hidden select-none px-5 leading-none whitespace-nowrap">
              {
                "1 . . . 2 . . . 3 . . . 4 . . . 5 . . . 6 . . . 7 . . . 8 . . . 9 . . . 10. . . 11. . . 12. . . 13. . . 14. . . 15. . . 16. . . 17. . . 18. . . 19. . . 20"
              }
            </div>

            {/* Bands */}
            {sections.map((section, index) => (
              <ReportBand
                key={`band-${section.id}`}
                title={section.title}
                height={section.height}
                sectionId={section.id}
                onDropItem={handleDropItem}
                onHeightChange={(newHeight) => {
                  setSections((prev) => {
                    const next = [...prev];
                    next[index] = { ...next[index], height: newHeight };
                    return next;
                  });
                  notifyChange();
                }}
                onContextMenu={(e, id) => {
                  setBandContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    sectionId: id
                  });
                }}
              >
                {elements
                  .filter((e) => e.sectionId === section.id)
                  .map((el) => (
                    <ElementNode
                      key={el.id}
                      el={el}
                      selected={selectedElementIds.includes(el.id)}
                      onSelect={(e) => {
                        e.stopPropagation();
                        if (e.shiftKey || e.ctrlKey || e.metaKey) {
                          setSelectedElementIds((prev) =>
                            prev.includes(el.id)
                              ? prev.filter((id) => id !== el.id)
                              : [...prev, el.id],
                          );
                        } else {
                          setSelectedElementIds([el.id]);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setShowPropertiesPane(true);
                      }}
                      onChange={(updates) => {
                        setElements((prev) =>
                          prev.map((p) =>
                            p.id === el.id ? { ...p, ...updates } : p,
                          ),
                        );
                        notifyChange();
                      }}
                      onCommit={() => {
                        setElements(prev => { saveHistory(prev); return prev; });
                      }}
                    />
                  ))}
              </ReportBand>
            ))}
              </div>
            );
          })()}
        </div>

        {/* Properties Pane (Right Sidebar) */}
        {selectedElementIds.length === 1 && showPropertiesPane && (
          <div className="w-52 border-l border-gray-300 bg-white flex flex-col p-3 overflow-y-auto shadow-lg z-10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold border-b pb-2 mb-2 text-gray-800">خصوصیات (Properties)</h3>
            {(() => {
              const selectedEl = elements.find((e) => e.id === selectedElementIds[0]);
              if (!selectedEl) return null;

              const isDynamicInput = ["text", "textarea", "checkbox", "radio", "list"].includes(selectedEl.type as string);

              const updateProp = (updates: Partial<TElementProps>) => {
                setElements((prev) =>
                  prev.map((p) => (p.id === selectedEl.id ? { ...p, ...updates } : p)),
                );
                notifyChange();
              };

              return (
                <div className="space-y-2">
                  {/* General Properties */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">متن / عنوان / مقدار پیشفرض</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded p-1 text-xs outline-none focus:border-blue-500"
                      value={selectedEl.text}
                      onChange={(e) => updateProp({ text: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">موقعیت X</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded p-1 text-xs text-left outline-none focus:border-blue-500"
                        value={selectedEl.x}
                        onChange={(e) => updateProp({ x: Number(e.target.value) })}
                        dir="ltr"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">موقعیت Y</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded p-1 text-xs text-left outline-none focus:border-blue-500"
                        value={selectedEl.y}
                        onChange={(e) => updateProp({ y: Number(e.target.value) })}
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">طول (Width)</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded p-1 text-xs text-left outline-none focus:border-blue-500"
                        value={selectedEl.width}
                        onChange={(e) => updateProp({ width: Number(e.target.value) })}
                        dir="ltr"
                      />
                    </div>
                    {["box", "image", "table", "textarea", "list", "radio", "checkbox"].includes(selectedEl.type as string) && (
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">ارتفاع (Height)</label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded p-1 text-xs text-left outline-none focus:border-blue-500"
                          value={selectedEl.height || 20}
                          onChange={(e) => updateProp({ height: Number(e.target.value) })}
                          dir="ltr"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                     <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">متن (Text)</label>
                        <input type="color" value={selectedEl.color || "#000000"} onChange={(e) => updateProp({ color: e.target.value })} className="w-full h-6 rounded cursor-pointer" title="رنگ متن" />
                     </div>
                     <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">پس‌زمینه (Bg)</label>
                        <div className="flex flex-col gap-1">
                           <input 
                              type="color" 
                              value={selectedEl.backgroundColor && selectedEl.backgroundColor !== 'transparent' ? selectedEl.backgroundColor : "#ffffff"} 
                              onChange={(e) => updateProp({ backgroundColor: e.target.value })} 
                              className="w-full h-6 rounded cursor-pointer" 
                              title="رنگ پس‌زمینه" 
                           />
                           <button
                              type="button"
                              onClick={() => updateProp({ backgroundColor: 'transparent' })}
                              className={`text-[10px] py-0.5 px-0.5 border rounded transition-colors text-center ${selectedEl.backgroundColor === 'transparent' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'}`}
                              title="بدون رنگ (شفاف)"
                           >
                              شفاف (Transparent)
                           </button>
                        </div>
                     </div>
                     <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">حاشیه (Border)</label>
                        <input type="color" value={selectedEl.borderColor || "#000000"} onChange={(e) => {
                           updateProp({ 
                             borderColor: e.target.value, 
                             border: `1px solid ${e.target.value}` 
                           });
                        }} className="w-full h-6 rounded cursor-pointer" title="رنگ حاشیه" />
                     </div>
                  </div>

                  {isDynamicInput && (
                    <>
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <h4 className="text-xs font-bold text-blue-700 mb-2">اطلاعات ورودی (کاربر)</h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="prop-is-dynamic"
                          checked={!!selectedEl.isDynamic}
                          onChange={(e) => updateProp({ 
                            isDynamic: e.target.checked,
                            dynamicKey: (e.target.checked && !selectedEl.dynamicKey) ? `field_${Math.floor(Math.random() * 10000)}` : selectedEl.dynamicKey 
                          })}
                          className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 shrink-0"
                        />
                        <label htmlFor="prop-is-dynamic" className="text-xs cursor-pointer text-gray-800 font-medium leading-tight">ذخیره در دیتابیس / دریافت از کاربر</label>
                      </div>

                      {selectedEl.isDynamic && (
                        <div className="space-y-2 bg-blue-50 p-2 rounded-md border border-blue-200">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-800 mb-1" title="نام فیلد برای ذخیره سازی در پایگاه داده">شناسه فیلد پایگاه داده (Key)*</label>
                            <input
                              type="text"
                              className="w-full border border-blue-300 rounded p-1 text-xs text-left outline-none focus:border-blue-500 bg-white font-mono"
                              value={selectedEl.dynamicKey || ""}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                                updateProp({ dynamicKey: val });
                              }}
                              dir="ltr"
                              placeholder="e.g. customer_name"
                            />
                            <span className="text-[9px] text-gray-500 block mt-0.5 leading-tight">از این نام در یافتن مقدار استفاده می‌شود. فقط حروف انگلیسی، اعداد و خط تیره.</span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-800 mb-1">نوع داده (Data Type)</label>
                            <select
                              className="w-full border border-blue-300 rounded p-1 text-xs outline-none focus:border-blue-500 bg-white"
                              value={selectedEl.dataType || "string"}
                              onChange={(e) => updateProp({ dataType: e.target.value as any })}
                            >
                              <option value="string">متن (String)</option>
                              <option value="number">عدد (Number)</option>
                              <option value="boolean">تیک بله/خیر (Boolean)</option>
                              <option value="date">تاریخ (Date)</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5 mt-1">
                            <input
                              type="checkbox"
                              id="prop-is-req"
                              checked={!!selectedEl.isRequired}
                              onChange={(e) => updateProp({ isRequired: e.target.checked })}
                              className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 shrink-0"
                            />
                            <label htmlFor="prop-is-req" className="text-xs cursor-pointer text-gray-800 leading-tight">پر کردن این فیلد اجباری است</label>
                          </div>

                          {(selectedEl.type === "list" || selectedEl.type === "radio") && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-800 mb-1">گزینه‌ها</label>
                              <textarea
                                className="w-full border border-blue-300 rounded p-1.5 text-sm outline-none focus:border-blue-500 bg-white h-20"
                                value={selectedEl.options || ""}
                                onChange={(e) => updateProp({ options: e.target.value })}
                                placeholder="گزینه ها را با خط جدید (Enter) یا کاما جدا کنید..."
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Background pattern style */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bg-grid-pattern {
          background-size: 10px 10px;
          background-image: radial-gradient(circle, #d0d0d0 1px, transparent 1px);
        }
      `,
        }}
      />
      <ConfirmDialog 
         isOpen={!!formulaToDelete}
         title="حذف فرمول"
         message="از حذف فرمول اطمینان دارید؟"
         onConfirm={() => {
            if (formulaToDelete) {
              setFormulas(prev => prev.filter(f => f.name !== formulaToDelete));
              showToast("فرمول با موفقیت حذف شد.", "success");
              setFormulaToDelete(null);
            }
         }}
         onCancel={() => setFormulaToDelete(null)}
      />

      {/* Dynamic Style Sheet for PDF/Paper Printing layout */}
      <style>{`
        @media print {
          @page {
            size: ${paperSize === 'Custom' ? `${customWidth}mm ${customHeight}mm` : paperSize} ${paperOrientation};
            margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
          }
          body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Ensure print area fits fully */
          .print\\:w-full {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {showPageSetupModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-[4000] flex items-center justify-center font-tahoma text-right" 
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded shadow-xl border border-gray-300 w-[420px] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#f0f0f0] border-b border-gray-300 px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: '8s' }} />
                تنظیمات صفحه (Page Setup)
              </span>
              <button 
                onClick={() => setShowPageSetupModal(false)}
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4 text-sm">
              {/* Paper Size */}
              <div>
                <label className="text-gray-700 font-bold block mb-1 text-right">اندازه کاغذ (Paper Size):</label>
                <select 
                  className="w-full border border-gray-300 rounded px-2 py-1.5 outline-blue-500 bg-white"
                  value={paperSize}
                  onChange={(e) => {
                    const size = e.target.value;
                    setPaperSize(size);
                    // Automatically update default custom dimensions for paper sizes
                    if (size === 'A4') {
                      setCustomWidth(210);
                      setCustomHeight(297);
                    } else if (size === 'A5') {
                      setCustomWidth(148);
                      setCustomHeight(210);
                    } else if (size === 'Letter') {
                      setCustomWidth(215.9);
                      setCustomHeight(279.4);
                    }
                  }}
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="A5">A5 (148 × 210 mm)</option>
                  <option value="Letter">Letter (215.9 × 279.4 mm)</option>
                  <option value="Custom">Custom (اندازه دلخواه)</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="text-gray-700 font-bold block mb-1 text-right">جهت کاغذ (Orientation):</label>
                <div className="flex gap-4 justify-start">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="orientation" 
                      value="portrait" 
                      checked={paperOrientation === 'portrait'} 
                      onChange={() => setPaperOrientation('portrait')} 
                      className="w-4 h-4" 
                    />
                    <span>عمودی (Portrait)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="orientation" 
                      value="landscape" 
                      checked={paperOrientation === 'landscape'} 
                      onChange={() => setPaperOrientation('landscape')} 
                      className="w-4 h-4" 
                    />
                    <span>افقی (Landscape)</span>
                  </label>
                </div>
              </div>

              {/* Custom Width and Height (only relevant or enabled for Custom paper size) */}
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-gray-100">
                <div>
                  <label className="text-gray-600 font-medium block mb-1 text-xs text-right">عرض صفحه (mm):</label>
                  <input 
                    type="number" 
                    disabled={paperSize !== 'Custom'}
                    className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 outline-blue-500 text-left"
                    value={customWidth}
                    dir="ltr"
                    onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-medium block mb-1 text-xs text-right">ارتفاع صفحه (mm):</label>
                  <input 
                    type="number" 
                    disabled={paperSize !== 'Custom'}
                    className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 outline-blue-500 text-left"
                    value={customHeight}
                    dir="ltr"
                    onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Margins */}
              <div>
                <label className="text-gray-700 font-bold block mb-2 text-right">حاشیه‌ها (Margins) - برحسب میلی‌متر:</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-600 block mb-1 text-xs text-right">حاشیه بالا (Top):</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500 text-left"
                      value={margins.top}
                      dir="ltr"
                      onChange={(e) => setMargins({ ...margins, top: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-1 text-xs text-right">حاشیه راست (Right):</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500 text-left"
                      value={margins.right}
                      dir="ltr"
                      onChange={(e) => setMargins({ ...margins, right: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-1 text-xs text-right">حاشیه پایین (Bottom):</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500 text-left"
                      value={margins.bottom}
                      dir="ltr"
                      onChange={(e) => setMargins({ ...margins, bottom: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-1 text-xs text-right">حاشیه چپ (Left):</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded px-2 py-1 outline-blue-500 text-left"
                      value={margins.left}
                      dir="ltr"
                      onChange={(e) => setMargins({ ...margins, left: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-300 px-4 py-3 flex items-center justify-end gap-2 text-sm font-medium">
              <button 
                onClick={() => {
                  setShowPageSetupModal(false);
                  notifyChange();
                }}
                className="bg-[#2463eb] hover:bg-[#1d4ed8] text-white px-4 py-1.5 rounded shadow cursor-pointer active:scale-[0.98] transition-all"
              >
                تایید و اعمال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ElementNode({
  el,
  selected,
  onSelect,
  onDoubleClick,
  onChange,
  onCommit,
}: {
  el: TElementProps;
  selected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onChange: (updates: Partial<TElementProps>) => void;
  onCommit?: () => void;
}) {
  const [activeResizing, setActiveResizing] = useState<string | null>(null);
  const [activeDragging, setActiveDragging] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editText, setEditText] = useState(el.text);

  useEffect(() => {
    setEditText(el.text);
  }, [el.text]);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPos: { x: number; y: number };
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const handleDoubleClickInternal = (e: React.MouseEvent) => {
    if (el.type === 'label' || !el.type) {
      e.stopPropagation();
      setIsEditingMode(true);
    }
    if (onDoubleClick) onDoubleClick(e);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditingMode) return;
    onSelect(e as any);
    e.stopPropagation();
    const target = e.target as HTMLElement;
    let resizeDir = null;
    if (target.classList.contains("resize-handle-e")) resizeDir = "e";
    else if (target.classList.contains("resize-handle-s")) resizeDir = "s";
    else if (target.classList.contains("resize-handle-w")) resizeDir = "w";
    else if (target.classList.contains("resize-handle-n")) resizeDir = "n";
    else if (target.classList.contains("resize-handle-se")) resizeDir = "se";
    else if (target.closest(".resize-handle")) resizeDir = "e"; // legacy support

    if (resizeDir) {
      setActiveResizing(resizeDir);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPos: { x: el.x, y: el.y },
        startWidth: el.width,
        startHeight: el.height || 20,
      };
    } else {
      setActiveDragging(true);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPos: { x: el.x, y: el.y },
        startWidth: el.width,
        startHeight: el.height || 20,
      };
    }

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;

    if (activeResizing) {
       let newWidth = dragRef.current.startWidth;
       let newHeight = dragRef.current.startHeight;
       let newX = dragRef.current.startPos.x;
       let newY = dragRef.current.startPos.y;
       const dx = e.clientX - dragRef.current.startX;
       const dy = e.clientY - dragRef.current.startY;

       if (activeResizing.includes("e")) newWidth = Math.max(20, dragRef.current.startWidth + dx);
       if (activeResizing.includes("s")) newHeight = Math.max(10, dragRef.current.startHeight + dy);
       if (activeResizing.includes("w")) {
          newWidth = Math.max(20, dragRef.current.startWidth - dx);
          newX = dragRef.current.startPos.x + (dragRef.current.startWidth - newWidth);
       }
       if (activeResizing.includes("n")) {
          newHeight = Math.max(10, dragRef.current.startHeight - dy);
          newY = dragRef.current.startPos.y + (dragRef.current.startHeight - newHeight);
       }

       onChange({ width: newWidth, height: newHeight, x: newX, y: newY });
    } else if (activeDragging) {
      onChange({
        x: dragRef.current.startPos.x + (e.clientX - dragRef.current.startX),
        y: dragRef.current.startPos.y + (e.clientY - dragRef.current.startY),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragging) {
      const elementsUnder = document.elementsFromPoint(e.clientX, e.clientY);
      const bandEl = elementsUnder.find((elem) => elem.getAttribute("data-section-id"));
      
      if (bandEl) {
        const newSectionId = bandEl.getAttribute("data-section-id");
        if (newSectionId && newSectionId !== el.sectionId) {
          const rect = bandEl.getBoundingClientRect();
          onChange({ 
             sectionId: newSectionId, 
             y: Math.max(0, e.clientY - rect.top - 10) 
          });
        }
      }
    }

    setActiveDragging(false);
    setActiveResizing(null);
    dragRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (onCommit) onCommit();
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={handleDoubleClickInternal}
      className={`absolute flex items-center px-1 select-none overflow-hidden group/el
                  ${el.isAt ? "text-gray-800" : "text-gray-900"}
                  ${el.type === 'box' 
                    ? (selected ? "ring-2 ring-blue-500" : "hover:ring-1 hover:ring-gray-300") 
                    : (selected 
                        ? (el.isAt ? "bg-blue-100 ring-1 ring-blue-500" : "bg-blue-50 ring-1 ring-blue-500") 
                        : (el.isAt ? "border border-transparent hover:border-gray-500 hover:bg-white" : "border border-gray-800 bg-white")
                      )
                  }
                  ${activeDragging ? "cursor-move opacity-80 shadow-md ring-2 ring-blue-400" : "cursor-move"}
                  ${activeResizing ? "ring-2 ring-blue-400" : ""}`}
      style={{
        left: `${el.x}px`,
        top: `${el.y}px`,
        width: `${el.width}px`,
        height: el.height ? `${el.height}px` : "20px",
        touchAction: "none",
        zIndex: activeDragging || activeResizing ? 50 : (el.type === 'box' ? 1 : 10),
        fontFamily: el.fontFamily || "Tahoma",
        fontSize: `${el.fontSize || 10}px`,
        fontWeight: el.fontWeight || "normal",
        fontStyle: el.fontStyle || "normal",
        textDecoration: el.textDecoration || "none",
        textAlign: el.textAlign || "right",
        color: el.color,
        backgroundColor: el.backgroundColor,
        border: el.border,
        borderTop: el.borderTop ? `${el.borderWidth || "1px"} ${el.borderStyle || "solid"} ${el.borderColor || "#000000"}` : undefined,
        borderRight: el.borderRight ? `${el.borderWidth || "1px"} ${el.borderStyle || "solid"} ${el.borderColor || "#000000"}` : undefined,
        borderBottom: el.borderBottom ? `${el.borderWidth || "1px"} ${el.borderStyle || "solid"} ${el.borderColor || "#000000"}` : undefined,
        borderLeft: el.borderLeft ? `${el.borderWidth || "1px"} ${el.borderStyle || "solid"} ${el.borderColor || "#000000"}` : undefined,
        borderRadius: el.borderRadius,
        direction: el.direction || "rtl",
        justifyContent:
          el.textAlign === "center"
            ? "center"
            : el.textAlign === "left"
              ? "flex-start"
              : "flex-end",
      }}
    >
      <div
        className={`flex-1 overflow-hidden whitespace-nowrap ${isEditingMode ? '' : 'pointer-events-none'}`}
        style={{ textOverflow: "clip" }}
      >
        {isEditingMode ? (
          <input
            autoFocus
            className="w-full h-[18px] bg-transparent outline-none m-0 p-0"
            value={editText}
            style={{ 
              color: 'inherit', 
              fontFamily: 'inherit', 
              fontSize: 'inherit', 
              fontWeight: 'inherit', 
              fontStyle: 'inherit', 
              textAlign: el.textAlign || "right"
            }}
            onChange={e => setEditText(e.target.value)}
            onBlur={() => {
                setIsEditingMode(false);
                if (editText !== el.text) {
                    onChange({ text: editText });
                    if (onCommit) onCommit();
                }
            }}
            onKeyDown={e => {
                if (e.key === 'Enter') {
                    setIsEditingMode(false);
                    if (editText !== el.text) {
                        onChange({ text: editText });
                        if (onCommit) onCommit();
                    }
                }
                e.stopPropagation();
            }}
            onPointerDown={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            {el.isAt && "@"}
            {el.text}
            {el.isAt && "@"}
          </>
        )}
      </div>

      {/* Resize handle */}
      {!selected && (
         <div className="resize-handle w-2.5 h-full absolute right-0 top-0 cursor-ew-resize opacity-0 group-hover/el:opacity-100 flex items-center justify-center hover:bg-blue-500/20 active:bg-blue-500/40">
           <div
             className={`w-0.5 h-3 rounded-full pointer-events-none bg-gray-400`}
           ></div>
         </div>
      )}
      
      {selected && (
        <>
          <div className="resize-handle-e w-1.5 h-full absolute right-0 top-0 cursor-ew-resize bg-blue-500 z-10" />
          <div className="resize-handle-w w-1.5 h-full absolute left-0 top-0 cursor-ew-resize bg-blue-500 z-10" />
          <div className="resize-handle-s w-full h-1.5 absolute left-0 bottom-0 cursor-ns-resize bg-blue-500 z-10" />
          <div className="resize-handle-n w-full h-1.5 absolute left-0 top-0 cursor-ns-resize bg-blue-500 z-10" />
          <div className="resize-handle-se w-2.5 h-2.5 absolute right-0 bottom-0 cursor-nwse-resize bg-blue-700 z-20" />
        </>
      )}
    </div>
  );
}

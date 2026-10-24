import React from 'react';
import { clsx } from 'clsx';

export interface ClassicToolbarProps {
  onSave?: () => void;
  onSaveNew?: () => void;
  onSaveClose?: () => void;
  onNew?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  onList?: () => void;
  onPrintPdf?: () => void;
  onDeleteCross?: () => void;
  onDeleteNew?: () => void;
  onSaveCross?: () => void;
  disableSave?: boolean;
  disableNew?: boolean;
  disableDelete?: boolean;
}

export const ClassicToolbar = ({
  onSave,
  onSaveNew,
  onSaveClose,
  onNew,
  onDelete,
  onPrint,
  onList,
  onPrintPdf,
  onDeleteCross,
  onDeleteNew,
  onSaveCross,
  disableSave,
  disableNew,
  disableDelete,
}: ClassicToolbarProps) => {
    return (
        <div 
           className="inline-flex items-center text-sm h-8 bg-transparent divide-x divide-gray-300 dark:divide-gray-600" 
           dir="ltr" 
        >
            <div className="flex p-[2px] items-center h-full">
                <ToolButton icon={<NewFileIcon />} onClick={onNew} disabled={disableNew} title="جدید" />
            </div>

            <div className="flex p-[2px] items-center h-full border-r border-gray-300">
                <ToolButton icon={<SaveIcon />} onClick={onSave} disabled={!onSave || disableSave} title="ذخیره" />
                <ToolButton icon={<SaveCrossIcon />} onClick={onSaveClose} disabled={!onSaveClose || disableSave} title="ذخیره و بستن" />
                <ToolButton icon={<SaveDocIcon />} onClick={onSaveNew} disabled={!onSaveNew || disableSave} title="ذخیره و جدید" />
            </div>

            <div className="flex p-[2px] h-full border-r border-gray-300">
                <ToolButton icon={<TrashDocIcon />} disabled={!onDeleteNew || disableDelete} onClick={onDeleteNew} title="حذف و جدید" />
                <ToolButton icon={<TrashCrossIcon />} disabled={!onDeleteCross || disableDelete} onClick={onDeleteCross} title="حذف و بستن" />
                <ToolButton icon={<TrashIcon />} disabled={!onDelete || disableDelete} onClick={onDelete} title="حذف" />
            </div>

            <div className="flex p-[2px] items-center h-full border-r border-gray-300">
                <ToolButton icon={<PrinterIcon />} onClick={onPrint} disabled={!onPrint} title="چاپ" />
                <button 
                  type="button" 
                  onClick={onPrintPdf} 
                  disabled={!onPrintPdf} 
                  title="PDF"
                  className={clsx(
                    "w-[30px] h-[26px] mx-[1px] flex items-center justify-center text-[10px] rounded-[2px] border transition-none", 
                    onPrintPdf ? "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#a0b0d0] hover:bg-[#d5e1f2] dark:hover:border-blue-800 dark:hover:bg-blue-900/30" : "border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 opacity-40 grayscale pointer-events-none"
                  )}>
                  PDF
                </button>
            </div>

            <div className="flex items-center p-[2px] h-full border-r border-gray-300">
                <ToolButton icon={<FolderOpenIcon />} onClick={onList} disabled={false} title="لیست" />
            </div>
        </div>
    );
};

const ToolButton = ({ icon, disabled, size = 'md', onClick, title }: any) => {
    return (
        <button 
           type="button"
           disabled={disabled}
           onClick={onClick}
           title={title}
           style={{ width: size === 'sm' ? 16 : 30, height: 26 }}
           className={clsx(
               "flex items-center justify-center rounded-[2px] transition-none mx-[1px] border border-transparent",
               !disabled && "hover:border-[#a0b0d0] hover:bg-[#d5e1f2] dark:hover:border-blue-800 dark:hover:bg-blue-900/30 active:bg-[#c1d2eb] dark:active:bg-blue-900/50",
               disabled && "opacity-40 grayscale pointer-events-none"
           )}
        >
            {icon}
        </button>
    )
}

// ----------------- SVG ICONS -----------------

const PrinterIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5 11h14v7H5z" fill="#b0b5be" stroke="#555" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M7 11V4h10v7" fill="#fff" stroke="#555" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M6 13.5h12" stroke="#555" strokeWidth="1"/>
        <path d="M8 15v6h8v-6z" fill="#fff" stroke="#555" strokeWidth="1" strokeLinejoin="round"/>
        <rect x="10" y="17" width="4" height="2" fill="#3b82f6" />
        <path d="M10 20h4" stroke="#a0aab5" strokeWidth="1"/>
        <circle cx="16" cy="12.5" r="1.5" fill="#facc15" stroke="#a16207" strokeWidth="0.5"/>
    </svg>
)

const TrashBase = () => (
    <>
        <path d="M7 6l1 14h8l1-14H7z" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M5 6h14" stroke="#6b7280" strokeWidth="1"/>
        <path d="M9 6V4h6v2" fill="#d1d5db" stroke="#6b7280" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M10 9v8M14 9v8" stroke="#9ca3af" strokeWidth="1"/>
    </>
);

const TrashIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <TrashBase />
    </svg>
);

const TrashDocIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <TrashBase />
        <path d="M13 13h7v8h-7z" fill="#f8fafc" stroke="#6b7280" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M17 13l3 3h-3v-3z" fill="#e2e8f0" stroke="#6b7280" strokeWidth="1" strokeLinejoin="round"/>
    </svg>
);

const TrashCrossIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <TrashBase />
        <rect x="13" y="13" width="9" height="9" rx="1" fill="#d4a39b" stroke="#78350f" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M15 15l5 5M20 15l-5 5" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);

const SaveBase = () => (
    <>
        <path d="M4 4h13l4 4v12H4V4z" fill="#5c6dc0" stroke="#1e265c" strokeWidth="1" strokeLinejoin="round"/>
        <rect x="7" y="4" width="10" height="6" fill="#cbd5e1" stroke="#1e265c" strokeWidth="1" strokeLinejoin="round"/>
        <rect x="5" y="13" width="14" height="7" fill="#fff" stroke="#1e265c" strokeWidth="1" strokeLinejoin="round"/>
        <rect x="14" y="5" width="2" height="4" fill="#64748b"/>
    </>
);

const SaveIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <SaveBase />
    </svg>
);

const SaveDocIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <SaveBase />
        <path d="M13 13h8v9h-8z" fill="#fff" stroke="#475569" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M18 13l3 3h-3v-3z" fill="#cbd5e1" stroke="#475569" strokeWidth="1" strokeLinejoin="round"/>
    </svg>
)

const SaveCrossIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <SaveBase />
        <rect x="13" y="13" width="9" height="9" rx="1" fill="#c48a7f" stroke="#5c261e" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M15 15l5 5M20 15l-5 5" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
)

const FolderOpenIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 7h6l2 2h10v10H3V7z" fill="#eab308" stroke="#713f12" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M2 12h20l-2 7H4L2 12z" fill="#fde047" stroke="#713f12" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M10 16 c0 -5, 5 -6, 7 -5" stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
        <polygon points="15,9 19,11 15,13" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="0.5"/>
    </svg>
)

const NewFileIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6 3h8l5 5v13H6V3z" fill="#fff" stroke="#475569" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M14 3v5h5" fill="#f1f5f9" stroke="#475569" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M13 16h6M16 13v6" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"/>
    </svg>
)

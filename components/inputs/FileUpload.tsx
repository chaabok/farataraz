"use client";

import React, { useRef, useState, useEffect } from "react";
import { Upload, X, File } from "lucide-react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label?: string;
  onChange: (file: File | null) => void;
  required?: boolean;
  error?: string;
  accept?: string;
  selectedFile?: File | null;
  existingUrl?: string | null;
  labelWidth?: string;
  alignVertical?: boolean;
}

export function FileUpload({ label, onChange, required, error, accept, selectedFile, existingUrl, labelWidth, alignVertical }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(existingUrl || null);
      if (!existingUrl) {
         setInternalError(null);
      }
      return;
    }

    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile, existingUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const restrictedExtensions = ['.exe', '.com', '.bat', '.sh', '.cmd', '.vbs', '.scr', '.js', '.ps1', '.hta', '.dll', '.msi', '.pif', '.jar'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (restrictedExtensions.includes(fileExtension)) {
        setInternalError('آپلود فایل‌های سیستمی و اجرایی مجاز نمی‌باشد.');
        onChange(null);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }

      // Check for malicious file signatures (Magic Numbers)
      try {
        const isMalicious = await new Promise<boolean>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = (e) => {
            if (e.target?.readyState === FileReader.DONE) {
              const arr = new Uint8Array(e.target.result as ArrayBuffer);
              let header = "";
              for (let i = 0; i < arr.length; i++) {
                header += arr[i].toString(16).padStart(2, '0');
              }
              
              // Known malicious/executable magic numbers
              const maliciousSignatures = [
                "4d5a", // MZ (Windows Executables: .exe, .dll)
                "7f454c46", // ELF (Linux Executables)
                "2321", // #! (Shell Scripts)
                "cafebabe" // Java Class / Mach-O
              ];
              
              const malicious = maliciousSignatures.some(sig => header.startsWith(sig));
              resolve(malicious);
            } else {
              resolve(false);
            }
          };
          reader.onerror = () => resolve(true); // If cannot read, treat as error
          reader.readAsArrayBuffer(file.slice(0, 4));
        });

        if (isMalicious) {
          setInternalError('محتوای فایل نامعتبر یا مخرب است.');
          onChange(null);
          if (inputRef.current) {
            inputRef.current.value = '';
          }
          return;
        }
      } catch (err) {
        setInternalError('خطا در بررسی محتوای فایل.');
        return;
      }
    }

    setInternalError(null);
    onChange(file);
  };

  const handleRemoveExisting = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null); // This implies the parent should handle clearing existingUrl too, or pass a flag
    // Workaround: We'll dispatch a custom event or let parent clear it.
  };

  return (
    <FormFieldWrapper label={label} required={required} error={internalError || error} labelWidth={labelWidth} alignVertical={alignVertical}>
      <div 
        onClick={() => !selectedFile && !existingUrl && inputRef.current?.click()}
        className={cn(
          "w-full overflow-hidden border-2 border-dashed rounded-xl transition-all",
          error 
            ? "border-rose-500 bg-rose-50/10" 
            : (selectedFile || existingUrl)
              ? 'border-indigo-100 bg-indigo-50/20 dark:border-indigo-900/30' 
              : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 cursor-pointer'
        )}
      >
        <input 
          type="file" 
          ref={inputRef} 
          onChange={handleFileChange} 
          accept={accept}
          className="hidden" 
        />
        
        <div className="p-4 flex flex-col items-center justify-center text-center">
          {selectedFile ? (
            <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg overflow-hidden border border-indigo-200 dark:border-indigo-800">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <File className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 text-start overflow-hidden">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onChange(null); }}
                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : existingUrl ? (
            <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg overflow-hidden border border-indigo-200 dark:border-indigo-800">
                <img src={existingUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-start overflow-hidden">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">فایل آپلود شده</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onChange(null); }}
                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 mb-2 flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-500 transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-0.5">برای انتخاب فایل کلیک کنید</p>
              <p className="text-xs text-gray-400">حداکثر حجم فایل 5 مگابایت</p>
            </>
          )}
        </div>
      </div>
    </FormFieldWrapper>
  );
}

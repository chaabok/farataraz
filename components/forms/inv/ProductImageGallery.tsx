"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  X,
  Play,
  Pause,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export interface ItemImage {
  id: string;
  name: string;
  isMain: boolean;
  thumbnailUrl: string; // 150x150 square
  mediumUrl: string;    // max 600x600
  originalUrl: string;  // max 1200x1200
  size: number;
  createdAt: string;
}

interface ProductImageGalleryProps {
  value: ItemImage[];
  onChange: (images: ItemImage[]) => void;
  isReadonly?: boolean;
}

const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve((e.target?.result as string) || "");
        }
      };
      img.src = (e.target?.result as string) || "";
    };
    reader.readAsDataURL(file);
  });
};

const createSquareThumbnail = (
  file: File,
  size = 150,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve((e.target?.result as string) || "");
        }
      };
      img.src = (e.target?.result as string) || "";
    };
    reader.readAsDataURL(file);
  });
};

export function ProductImageGallery({
  value = [],
  onChange,
  isReadonly = false,
}: ProductImageGalleryProps) {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState<ItemImage | null>(null);
  const [previewSize, setPreviewSize] = useState<"thumbnail" | "medium" | "original">("medium");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto Slider Timer (2 seconds)
  useEffect(() => {
    if (!isAutoPlay || isHovered || value.length <= 1) return;

    const interval = setInterval(() => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;
      
      // In RTL layout, scrollLeft can be negative or positive depending on browser implementation
      const itemWidth = 220; // approximate width of image card + gap
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // Check current scroll position
      const currentScroll = Math.abs(container.scrollLeft);
      if (currentScroll >= maxScroll - 10) {
        // Wrap around to start
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Scroll left (in RTL, moving forward)
        container.scrollBy({ left: -itemWidth, behavior: "smooth" });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, value.length]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImages: ItemImage[] = [];
      const hasExistingMain = value.some((img) => img.isMain);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          showToast(`فایل ${file.name} یک تصویر معتبر نیست`, "error");
          continue;
        }

        // Generate 3 sizes
        const [thumbnailUrl, mediumUrl, originalUrl] = await Promise.all([
          createSquareThumbnail(file, 150, 0.8),
          resizeImage(file, 600, 600, 0.85),
          resizeImage(file, 1200, 1200, 0.9),
        ]);

        const isMain = !hasExistingMain && i === 0 && value.length === 0 && newImages.length === 0;

        newImages.push({
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          isMain,
          thumbnailUrl,
          mediumUrl,
          originalUrl,
          size: file.size,
          createdAt: new Date().toLocaleDateString("fa-IR"),
        });
      }

      if (newImages.length > 0) {
        const updatedList = [...value, ...newImages];
        onChange(updatedList);
        showToast(`${newImages.length} تصویر با موفقیت در ۳ سایز بارگذاری شد`, "success");
      }
    } catch (err) {
      console.error(err);
      showToast("خطا در بارگذاری تصاویر", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetMain = (id: string) => {
    if (isReadonly) return;
    const updated = value.map((img) => ({
      ...img,
      isMain: img.id === id,
    }));
    onChange(updated);
    showToast("تصویر شاخص تعیین گردید", "success");
  };

  const handleDelete = (id: string) => {
    if (isReadonly) return;
    const targetImg = value.find((img) => img.id === id);
    const updated = value.filter((img) => img.id !== id);

    // If deleted image was main image, make the first item main
    if (targetImg?.isMain && updated.length > 0) {
      updated[0].isMain = true;
    }

    onChange(updated);
    showToast("تصویر حذف گردید", "success");
  };

  const scrollLeftNav = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const delta = 240;
    const startScroll = container.scrollLeft;
    container.scrollBy({ left: -delta, behavior: "smooth" });
    
    setTimeout(() => {
      if (Math.abs(container.scrollLeft - startScroll) < 2) {
        container.scrollBy({ left: delta, behavior: "smooth" });
      }
    }, 60);
  };

  const scrollRightNav = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const delta = 240;
    const startScroll = container.scrollLeft;
    container.scrollBy({ left: delta, behavior: "smooth" });
    
    setTimeout(() => {
      if (Math.abs(container.scrollLeft - startScroll) < 2) {
        container.scrollBy({ left: -delta, behavior: "smooth" });
      }
    }, 60);
  };

  return (
    <div dir="rtl" className="flex flex-col h-full w-full bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 text-slate-100 select-none overflow-hidden">
      {/* Top Header & Actions Bar */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/80 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm text-slate-200">گالری تصاویر کالا</span>
          <span className="bg-slate-800 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-500/30 font-mono">
            {value.length} تصویر
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto Slider Toggle Button */}
          {value.length > 1 && (
            <button
              type="button"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-colors ${
                isAutoPlay
                  ? "bg-blue-600/30 border-blue-500 text-blue-300 hover:bg-blue-600/40"
                  : "bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700"
              }`}
              title={isAutoPlay ? "توقف اسلایدر خودکار (۲ ثانیه)" : "شروع اسلایدر خودکار"}
            >
              {isAutoPlay ? <Pause className="w-3.5 h-3.5 text-blue-400" /> : <Play className="w-3.5 h-3.5" />}
              <span>اسلایدر (۲ ثانیه‌ای)</span>
            </button>
          )}

          {/* Upload Button */}
          {!isReadonly && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? "در حال پردازش..." : "آپلود تصویر جدید"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Gallery Carousel Area */}
      <div
        className="relative flex-1 min-h-[170px] flex items-center justify-center bg-slate-950/80 rounded-md border border-slate-800 p-2 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {value.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-500 gap-2 p-6 text-center">
            <ImageIcon className="w-12 h-12 text-slate-600/80 stroke-1" />
            <p className="text-xs text-slate-400">هیچ تصاویری برای این کالا بارگذاری نشده است.</p>
            {!isReadonly && (
              <p className="text-[11px] text-slate-500">
                جهت افزودن، روی دکمه "آپلود تصویر جدید" کلیک کرده یا فایل‌ها را انتخاب نمایید.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Scroll Right Button */}
            {value.length > 1 && (
              <button
                type="button"
                onClick={scrollRightNav}
                className="absolute right-2 z-30 p-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600/80 shadow-lg transition-all active:scale-95 cursor-pointer"
                title="نمایش تصویر بعدی"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Scrollable Container (Horizontal RTL) */}
            <div
              ref={scrollContainerRef}
              dir="rtl"
              className="flex items-center gap-3 overflow-x-auto scrollbar-none scroll-smooth w-full py-1 px-8"
              style={{ direction: "rtl", scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {value.map((img) => (
                <div
                  key={img.id}
                  className={`relative flex-shrink-0 w-44 h-40 rounded-lg overflow-hidden border transition-all duration-200 group bg-slate-900 ${
                    img.isMain
                      ? "border-amber-400/90 ring-2 ring-amber-400/30 shadow-lg shadow-amber-950/40"
                      : "border-slate-700 hover:border-blue-500/70"
                  }`}
                >
                  {/* Image Preview */}
                  <img
                    src={img.mediumUrl || img.thumbnailUrl || img.originalUrl}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Main Image Badge */}
                  {img.isMain && (
                    <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md z-10">
                      <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                      <span>تصویر شاخص</span>
                    </div>
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                    <div className="flex items-center justify-between gap-1">
                      {/* Set Main Button */}
                      {!isReadonly && !img.isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMain(img.id)}
                          className="bg-amber-500/90 hover:bg-amber-400 text-slate-950 p-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-transform active:scale-95"
                          title="تنظیم به عنوان تصویر شاخص"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>شاخص</span>
                        </button>
                      )}

                      {/* View Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedImageModal(img)}
                        className="bg-slate-800/90 hover:bg-blue-600 text-slate-100 p-1.5 rounded-md transition-transform active:scale-95 mr-auto"
                        title="مشاهده بزرگتر"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      {!isReadonly && (
                        <button
                          type="button"
                          onClick={() => handleDelete(img.id)}
                          className="bg-red-600/90 hover:bg-red-500 text-white p-1.5 rounded-md transition-transform active:scale-95"
                          title="حذف تصویر"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Bottom File Info */}
                    <div className="bg-slate-900/90 p-1 rounded text-[10px] text-slate-300 truncate">
                      <p className="truncate font-medium">{img.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll Left Button */}
            {value.length > 1 && (
              <button
                type="button"
                onClick={scrollLeftNav}
                className="absolute left-2 z-30 p-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600/80 shadow-lg transition-all active:scale-95 cursor-pointer"
                title="نمایش تصویر قبلی"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Size Info Footer */}
      <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between px-1">
        <span>تصاویر به صورت خودکار در ۳ اندازه (کوچک، متوسط و بزرگ) بهینه‌سازی و ذخیره می‌گردند.</span>
        {isAutoPlay && value.length > 1 && (
          <span className="text-blue-400/90 animate-pulse flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> اسلایدر فعال (هر ۲ ثانیه)
          </span>
        )}
      </div>

      {/* Image Preview Modal with Size Switcher */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-4 flex flex-col gap-3 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100">{selectedImageModal.name}</h3>
                {selectedImageModal.isMain && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/40 px-2 py-0.5 rounded">
                    تصویر شاخص
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedImageModal(null)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Size Switcher Tabs */}
            <div className="flex items-center justify-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 ml-2">نمایش سایز ذخیره‌شده:</span>
              <button
                type="button"
                onClick={() => setPreviewSize("thumbnail")}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  previewSize === "thumbnail"
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                کوچک (150x150)
              </button>
              <button
                type="button"
                onClick={() => setPreviewSize("medium")}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  previewSize === "medium"
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                متوسط (600x600)
              </button>
              <button
                type="button"
                onClick={() => setPreviewSize("original")}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  previewSize === "original"
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                اصلی / بزرگ (1200x1200)
              </button>
            </div>

            {/* Display Image */}
            <div className="flex items-center justify-center bg-slate-950 rounded-lg p-2 min-h-[280px] max-h-[420px] overflow-hidden border border-slate-800">
              <img
                src={
                  previewSize === "thumbnail"
                    ? selectedImageModal.thumbnailUrl
                    : previewSize === "medium"
                    ? selectedImageModal.mediumUrl
                    : selectedImageModal.originalUrl
                }
                alt={selectedImageModal.name}
                className="max-h-[380px] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

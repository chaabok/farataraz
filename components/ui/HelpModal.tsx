"use client";

import React, { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { X, HelpCircle, Plus, Save, List, Trash2, Printer, LayoutGrid, FileText, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../Providers";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  title?: string;
}

const ActionBarItem = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => (
  <div className="flex flex-col gap-2 p-4 bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{title}</h4>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pr-2">
      {desc}
    </p>
  </div>
);

export function HelpModal({ isOpen, onClose, topic, title }: HelpModalProps) {
  const { t } = useLanguage();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && topic) {
      setLoading(true);
      fetch(`/api/help?topic=${encodeURIComponent(topic)}`)
        .then((res) => {
           if (res.ok) return res.text();
           throw new Error("Not found");
        })
        .then((text) => setContent(text))
        .catch(() => setContent("هیچ راهنمایی برای این بخش یافت نشد.\nلطفا با پشتیبانی سیستم تماس بگیرید."))
        .finally(() => setLoading(false));
    }
  }, [isOpen, topic]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200/50 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex bg-white dark:bg-gray-900 items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
              <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t("help_guide" as any) || "راهنمای فرم"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {title || topic}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 rtl text-right">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Universal Action Bar Guide Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <LayoutGrid className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    امکانات نوار ابزار (عمومی)
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ActionBarItem 
                    icon={Plus} 
                    title="جدید (+)" 
                    desc="پاک کردن فرم و آماده‌سازی برای ثبت اطلاعات و یک رکورد جدید."
                    color="text-emerald-600 dark:text-emerald-400 bg-emerald-500" 
                  />
                  <ActionBarItem 
                    icon={List} 
                    title="لیست اطلاعات" 
                    desc="باز کردن فهرستی از رکوردهای قبلی ثبت شده مرتبط با این فرم جهت جستجو."
                    color="text-blue-600 dark:text-blue-400 bg-blue-500" 
                  />
                  <ActionBarItem 
                    icon={Save} 
                    title="ذخیره" 
                    desc="اطلاعات وارد شده را ثبت کرده و شما را در همین صفحه نگه می‌دارد."
                    color="text-indigo-600 dark:text-indigo-400 bg-indigo-500" 
                  />
                  <ActionBarItem 
                    icon={CheckCircle2} 
                    title="ذخیره و جدید" 
                    desc="بلافاصله پس از ذخیره موفق، فرم را برای ثبت رکورد بعدی خالی می‌کند."
                    color="text-teal-600 dark:text-teal-400 bg-teal-500" 
                  />
                  <ActionBarItem 
                    icon={Trash2} 
                    title="حذف (زباله‌دان)" 
                    desc="در صورت عدم استفاده از این رکورد در سایر بخش‌ها، آن را حذف می‌کند."
                    color="text-red-600 dark:text-red-400 bg-red-500" 
                  />
                  <ActionBarItem 
                    icon={Printer} 
                    title="چاپ / پرینت" 
                    desc="پس از ذخیره امکان چاپ فرم فعلی در قالب‌های مختلف را فراهم می‌کند."
                    color="text-purple-600 dark:text-purple-400 bg-purple-500" 
                  />
                </div>
              </section>

              <hr className="border-gray-200 dark:border-gray-800" />

              {/* Form-specific Guide Section (Markdown) */}
              <section>
                 <div className="flex items-center gap-2 mb-5">
                   <FileText className="w-5 h-5 text-gray-400" />
                   <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                     راهنمای اختصاصی فرم
                  </h3>
                 </div>
                 <div className="bg-white dark:bg-gray-800/80 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                   <div className="markdown-body prose prose-slate dark:prose-invert max-w-none text-[14.5px] leading-loose">
                     <Markdown>{content}</Markdown>
                   </div>
                 </div>
              </section>

            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end bg-white dark:bg-gray-900 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
          >
            {t("close" as any) || "تایید و بستن"}
          </button>
        </div>
      </div>
    </div>
  );
}

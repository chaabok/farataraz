import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans" dir="rtl">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-center">
        <h1 className="text-6xl font-black text-rose-500 mb-4">۴۰۴</h1>
        <h2 className="text-xl font-bold mb-2">صفحه مورد نظر یافت نشد</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          متاسفانه صفحه‌ای که به دنبال آن بودید پیدا نشد یا حذف شده است.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium transition shadow-md hover:shadow-lg"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}

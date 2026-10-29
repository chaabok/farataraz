'use client';

// ---------------------------------------------------------------------------
// Task 118: Global Error Boundary — آخرین لایه دفاعی در برابر صفحه سفید.
// وقتی خودِ اپ React در رندر اولیه کرش کند (مثلاً به‌خاطر state خراب localStorage
// یا chunk قدیمی)، این صفحه جای کل ریشه را می‌گیرد و به کاربر امکان
// «تلاش مجدد» یا «پاک‌سازی کامل داده‌ها» می‌دهد.
// نکته: global-error باید خودش تگ‌های html و body را رندر کند.
// ---------------------------------------------------------------------------

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ثبت خطا در کنسول برای عیب‌یابی
    console.error('[GlobalError]', error);
  }, [error]);

  const hardReset = () => {
    try {
      localStorage.clear();
    } catch {}
    try {
      sessionStorage.clear();
    } catch {}
    try {
      if (window.caches && caches.keys) {
        caches
          .keys()
          .then((keys) => keys.forEach((k) => caches.delete(k)))
          .catch(() => {});
      }
    } catch {}
    setTimeout(() => window.location.reload(), 120);
  };

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f5f9',
          fontFamily: 'Tahoma, Vazirmatn, sans-serif',
          padding: 16,
        }}
      >
        <div
          style={{
            maxWidth: 430,
            width: '100%',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            padding: 28,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              margin: '0 auto 14px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
            }}
          >
            ⚠️
          </div>
          <h1 style={{ fontSize: 16, color: '#0f172a', margin: '0 0 8px' }}>
            خطای غیرمنتظره در برنامه
          </h1>
          <p
            style={{
              fontSize: 13,
              color: '#64748b',
              lineHeight: 1.9,
              margin: '0 0 18px',
            }}
          >
            برنامه با خطایی مواجه شد که مانع از نمایش آن می‌شود. ابتدا «تلاش مجدد» را
            بزنید؛ اگر مشکل تکرار شد، «پاک‌سازی کامل» داده‌های ذخیره‌شده مرورگر را پاک و
            برنامه را از نو بارگذاری می‌کند.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '10px 22px',
              border: 0,
              borderRadius: 10,
              background: '#2563eb',
              color: '#fff',
              fontSize: 13,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            تلاش مجدد
          </button>
          <br />
          <button
            type="button"
            onClick={hardReset}
            style={{
              marginTop: 8,
              padding: '10px 22px',
              border: '1px solid #cbd5e1',
              borderRadius: 10,
              background: '#fff',
              color: '#334155',
              fontSize: 13,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            پاک‌سازی کامل و شروع مجدد
          </button>
          {error?.digest ? (
            <p
              style={{
                fontSize: 11,
                color: '#94a3b8',
                margin: '16px 0 0',
                direction: 'ltr',
              }}
            >
              کد خطا: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}

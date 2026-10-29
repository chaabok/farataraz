'use client';

// ---------------------------------------------------------------------------
// Task 118: Route Error Boundary — خطاهای رندر سمت کلاینت در سطح صفحه را
// می‌گیرد تا به‌جای صفحه سفید، پیام فارسی بازیابی نشان داده شود.
// (برخلاف global-error، داخل layout ریشه رندر می‌شود)
// ---------------------------------------------------------------------------

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[RouteError]', error);
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
    <div
      dir="rtl"
      style={{
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
          خطای غیرمنتظره در صفحه
        </h1>
        <p
          style={{
            fontSize: 13,
            color: '#64748b',
            lineHeight: 1.9,
            margin: '0 0 18px',
          }}
        >
          نمایش این صفحه با مشکل مواجه شد. با «تلاش مجدد» صفحه دوباره بارگذاری می‌شود؛
          در صورت تکرار مشکل از «پاک‌سازی کامل» استفاده کنید.
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
    </div>
  );
}

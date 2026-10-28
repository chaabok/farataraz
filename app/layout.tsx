import React from 'react';
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import ActivationModal from '@/components/layout/ActivationModal';
import { AiChatWidget } from '@/components/ai/AiChatWidget';

export const metadata: Metadata = {
  title: 'Parsa ERP Dashboard',
  description: 'Parsa ERP Dashboard',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  // Let the Providers set the dir and lang dynamically via use-effect/client component
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        {/*
          Task 118: Boot Guard — لایه بازیابی قبل از هایدریشن.
          اگر فایل‌های JS کش‌شده قدیمی (پس از ری‌استارت سرور) کرش کنند یا chunk ای لود نشود،
          این اسکریپت (که قبل از باندل‌های Next اجرا می‌شود) یک بار صفحه را رفرش می‌کند و
          در صورت تکرار، صفحه بازیابی فارسی را نشان می‌دهد تا کاربر هرگز صفحه سفید نبیند.
        */}
        <script
          id="parsa-boot-guard"
          dangerouslySetInnerHTML={{ __html: BOOT_GUARD_SCRIPT }}
        />
        <Providers>
          {/* <ActivationModal /> */}
          {/* <AiChatWidget /> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}

// ---------------------------------------------------------------------------
// Task 118: Boot Guard script — pure vanilla, runs before Next.js bundles.
// 1) resource errors from /_next/static/  2) ChunkLoadError / dynamic import
// failures  → one automatic reload (sessionStorage cooldown) → after 2 failed
// attempts a standalone Persian recovery screen (no React needed) with soft /
// hard (clear storage + caches) restart buttons.
// ---------------------------------------------------------------------------
const BOOT_GUARD_SCRIPT = `(function(){
  try {
    var K='parsa:boot-reload', KT='parsa:boot-reload-at', MAX=2, CD=15000;
    var RX=/Loading chunk .* failed|ChunkLoadError|Failed to fetch dynamically imported module/i;
    function num(x){ return parseInt(x||'0',10)||0; }
    function show(){
      try {
        if(document.getElementById('parsa-boot-recovery')) return;
        var css='position:fixed;inset:0;z-index:2147483647;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-family:Tahoma,Vazirmatn,sans-serif;padding:16px';
        var box='max-width:430px;width:100%;background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.08);padding:28px;text-align:center';
        var b1='margin:0 6px;padding:10px 22px;border:0;border-radius:10px;background:#2563eb;color:#fff;font-size:13px;font-family:inherit;cursor:pointer';
        var b2='margin:8px 6px 0;padding:10px 22px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#334155;font-size:13px;font-family:inherit;cursor:pointer';
        var d=document.createElement('div'); d.id='parsa-boot-recovery'; d.setAttribute('dir','rtl'); d.style.cssText=css;
        d.innerHTML='<div style="'+box+'">'
          +'<div style="width:52px;height:52px;margin:0 auto 14px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;font-size:26px">⚠️</div>'
          +'<h1 style="font-size:16px;color:#0f172a;margin:0 0 8px">خطا در بارگذاری برنامه</h1>'
          +'<p style="font-size:13px;color:#64748b;line-height:1.9;margin:0 0 18px">دریافت فایل‌های برنامه با مشکل مواجه شد. معمولاً رفرش صفحه مشکل را حل می‌کند؛ اگر تکرار شد، داده‌های ذخیره‌شده مرورگر را پاک کنید.</p>'
          +'<button id="parsa-boot-soft" type="button" style="'+b1+'">رفرش صفحه</button>'
          +'<br/><button id="parsa-boot-hard" type="button" style="'+b2+'">پاک‌سازی کامل و شروع مجدد</button>'
          +'</div>';
        (document.body||document.documentElement).appendChild(d);
        var s=document.getElementById('parsa-boot-soft'); if(s) s.onclick=function(){ try{ location.reload(); }catch(e){} };
        var h=document.getElementById('parsa-boot-hard');
        if(h) h.onclick=function(){
          try{ localStorage.clear(); }catch(e){}
          try{ sessionStorage.clear(); }catch(e){}
          try{ if(window.caches&&caches.keys){ caches.keys().then(function(ks){ ks.forEach(function(k){ caches.delete(k); }); }).catch(function(){}); } }catch(e){}
          setTimeout(function(){ location.reload(); },120);
        };
      } catch(e){}
    }
    function recover(){
      try {
        var n=num(sessionStorage.getItem(K));
        if(n>=MAX || (Date.now()-num(sessionStorage.getItem(KT)))<CD){ show(); return; }
        sessionStorage.setItem(K,String(n+1)); sessionStorage.setItem(KT,String(Date.now()));
        location.reload();
      } catch(e){ show(); }
    }
    window.addEventListener('error',function(e){
      var t=e.target, src=(t&&t.src)?String(t.src):'';
      if(/_next\\/static/.test(src) || RX.test(e.message||'')) recover();
    },true);
    window.addEventListener('unhandledrejection',function(e){
      var r=e&&e.reason, m=(r&&(r.message||r))||'';
      if(RX.test(String(m))){ if(e.preventDefault) e.preventDefault(); recover(); }
    },true);
  } catch(e){}
})();`;

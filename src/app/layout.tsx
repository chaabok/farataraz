import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Z.ai Code Scaffold - AI-Powered Development",
  description: "Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
    url: "https://chat.z.ai",
    siteName: "Z.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}

// Task 83: font wiring (comment trigger)

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

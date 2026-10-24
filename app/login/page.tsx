'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, LayoutDashboard, Loader2, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, useLanguage } from '@/components/Providers';
import { FlagIcon } from '@/components/icons/Flags';
import { safeStringify, apiFetch } from '@/lib/utils';

const features = [
  {
    icon: <LayoutDashboard size={48} className="text-blue-500 mb-6 flex-shrink-0" />,
    title: 'سیستم جامع مدیریت',
    description: 'تمامی ابزارهای لازم برای مدیریت کامل فرآیندها به صورت یکپارچه.',
    color: 'from-blue-500/20 to-blue-600/5'
  },
  {
    icon: <ShieldCheck size={48} className="text-emerald-500 mb-6 flex-shrink-0" />,
    title: 'امنیت پیشرفته',
    description: 'حفاظت کامل از داده‌ها با رمزنگاری پیشرفته و لایه‌های امنیتی چندگانه.',
    color: 'from-emerald-500/20 to-emerald-600/5'
  },
  {
    icon: <Zap size={48} className="text-amber-500 mb-6 flex-shrink-0" />,
    title: 'سرعت و پایداری',
    description: 'عملکرد بی‌نظیر و دسترسی سریع به اطلاعات در هر زمان و مکان.',
    color: 'from-amber-500/20 to-amber-600/5'
  }
];

const toEnglishDigits = (str: string) => {
  return str
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useAuth();
  const { language, setLanguage, direction } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [twoFaMethod, setTwoFaMethod] = useState<'sms' | 'email' | 'app'>('sms');
  const [userId, setUserId] = useState<number | null>(null);
  const [twoFaToken, setTwoFaToken] = useState('');

  React.useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await apiFetch('/api/health');
        if (res.ok) setBackendStatus('ok');
        else setBackendStatus('error');
      } catch (err) {
        setBackendStatus('error');
      }
    };
    checkHealth();
    // Poll every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const enUsername = toEnglishDigits(username.trim()).toLowerCase();
      const enPassword = toEnglishDigits(password);
      
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify({ username: enUsername, password: enPassword })
      });
      if (!res.ok) throw new Error('ورود ناموفق');
      const data = await res.json();
      
      if (data.requires_2fa) {
        setUserId(data.userId);
        setTwoFaMethod(data.twofa_method || 'app');
        setStep('2fa');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.access_token);
      
      // Update currentUser in context
      try {
        const base64Url = data.access_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        setCurrentUser(JSON.parse(jsonPayload));
      } catch (e) {
        console.error('Failed to parse token', e);
      }

      router.push('/');
    } catch(err: any) {
      if (err.message && err.message !== 'ورود ناموفق' && !err.message.includes('Url:')) {
         setErrorMsg(err.message);
      } else {
         setErrorMsg('نام کاربری یا رمز عبور اشتباه است و یا ارتباط با سرور برقرار نشد.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e?: React.FormEvent, tokenOverride?: string) => {
    if (e) e.preventDefault();
    const tokenToVerify = tokenOverride || twoFaToken;
    if (tokenToVerify.length !== 6) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiFetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify({ userId, token: toEnglishDigits(tokenToVerify) })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'کد نامعتبر است');
      }
      const data = await res.json();
      
      localStorage.setItem('token', data.access_token);
      
      try {
        const base64Url = data.access_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        setCurrentUser(JSON.parse(jsonPayload));
      } catch (e) {
        console.error('Failed to parse token', e);
      }

      router.push('/');
    } catch(err: any) {
      setErrorMsg(err.message || 'کد وارد شده نامعتبر است.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FaTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTwoFaToken(val);
    if (val.length === 6 && !loading) {
      handle2FASubmit(undefined, val);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900" dir={direction}>
      {/* Absolute Language Switcher */}
      <div className="absolute top-4 ltr:right-4 rtl:left-4 z-50" ref={languageDropdownRef}>
        <button
          onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
          className="flex h-10 px-3 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          <FlagIcon lang={language} />
          <span className="text-xs font-medium uppercase">{language}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
        
        <AnimatePresence>
          {isLanguageDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950 ltr:right-0 rtl:left-0"
            >
              <div className="flex flex-col gap-1">
                {[
                  { id: 'fa', name: 'فارسی', code: 'IR' },
                  { id: 'en', name: 'English', code: 'EN' },
                  { id: 'ar', name: 'العربية', code: 'AR' },
                  { id: 'zh', name: '中文', code: 'ZH' },
                  { id: 'ku', name: 'کوردی', code: 'KU' },
                  { id: 'de', name: 'Deutsch', code: 'DE' },
                  { id: 'fr', name: 'Français', code: 'FR' },
                  { id: 'hi', name: 'हिन्दी', code: 'HI' },
                  { id: 'ru', name: 'Русский', code: 'RU' },
                  { id: 'af', name: 'دری/پښتو', code: 'AF' }
                ].map((langItem) => (
                  <button
                    key={langItem.id}
                    onClick={() => { setLanguage(langItem.id as any); setIsLanguageDropdownOpen(false); }}
                    className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-sm transition-colors ${language === langItem.id ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'}`}
                  >
                    <div className="flex items-center gap-3">
                      <FlagIcon lang={langItem.id} />
                      <span>{langItem.name}</span>
                    </div>
                    {language === langItem.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-16 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800"
        >
            <div className="text-center">
              <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">ورود به سیستم</h1>
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="text-slate-500 dark:text-slate-400">وضعیت سرور:</p>
                <div className={`w-2 h-2 rounded-full ${
                  backendStatus === 'ok' ? 'bg-emerald-500' : 
                  backendStatus === 'error' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'
                }`} />
                <span className="text-xs text-slate-400">
                  {backendStatus === 'ok' ? 'فعال' : backendStatus === 'error' ? 'غیرفعال' : 'در حال بررسی...'}
                </span>
              </div>
              <p className="text-xs text-slate-400">(نام کاربری: admin / رمز عبور: 1234)</p>
            </div>

          {step === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                {errorMsg}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">نام کاربری</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                placeholder="نام کاربری خود را وارد کنید"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">رمز عبور</label>
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)} 
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ورود به حساب کاربری'}
            </button>
          </form>
          ) : (
          <form onSubmit={handle2FASubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                {errorMsg}
              </div>
            )}
            <div className="space-y-2 text-center text-sm text-slate-600 dark:text-slate-400 mb-4">
              {twoFaMethod === 'sms' && <p>یک کد ۶ رقمی به شماره موبایل شما پیامک شد. (برای تست: ۱۲۳۴۵۶)</p>}
              {twoFaMethod === 'email' && <p>یک کد ۶ رقمی به ایمیل شما ارسال شد. (برای تست: ۱۲۳۴۵۶)</p>}
              {twoFaMethod === 'app' && <p>کد تایید را از اپلیکیشن احراز هویت (مانند Google Authenticator) وارد کنید. (برای تست: ۱۲۳۴۵۶)</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">کد تایید</label>
              <input 
                type="text" 
                value={twoFaToken}
                onChange={handle2FaTokenChange}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white text-center tracking-widest text-lg"
                placeholder="123456"
                dir="ltr"
                maxLength={6}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'بررسی و ورود'}
            </button>
            <button
              type="button"
              onClick={() => setStep('login')}
              className="w-full py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
            >
              بازگشت به صفحه ورود
            </button>
          </form>
          )}
        </motion.div>
      </div>

      {/* Left side - Banner */}
      <div className="hidden md:flex flex-col justify-center p-12 bg-slate-900 border-r border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-transparent to-transparent" />
        <div className="relative z-10 space-y-12 max-w-xl mx-auto">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="flex gap-6"
            >
              {feature.icon}
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

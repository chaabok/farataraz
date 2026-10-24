'use client';
import React from 'react';

import { useLanguage } from '@/components/Providers';
import { TrendingUp, Activity, Wallet, DollarSign, Box, Clock, BarChart3, ListChecks } from 'lucide-react';
import { clsx } from 'clsx';

export function StatCards() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        <GradientCard 
          title={t('net_profit')}
          value="% 89,550,000"
          subtitle="96% فارسی"
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          gradient="from-cyan-400 to-blue-500"
        />
        
        <GradientCard 
          title={t('total_expenses')}
          value="% 59,590,000"
          subtitle="-1.6% فارسی"
          icon={<Activity className="h-6 w-6 text-white" />}
          gradient="from-pink-400 to-rose-500"
        />

        <WhiteCard 
          title={t('total_expenses')}
          value="% 132,800,000"
          tags={['فاکتور ابطال', '-138.3% فارسی']}
          icon={<Wallet className="h-6 w-6 text-rose-500" />}
          iconColor="bg-rose-100"
        />

        <WhiteCard 
          title={t('total_income')}
          value="% 138,000,000"
          tags={['فاکتور قبول', '+12.6% فارسی']}
          icon={<DollarSign className="h-6 w-6 text-blue-500" />}
          iconColor="bg-blue-100"
        />

      </div>

      {/* Secondary Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        
        <SolidCard 
           title={t('inventory_supply')}
           value="-126"
           icon={<Box className="h-5 w-5" />}
           color="bg-emerald-500"
        />
        
        <SolidCard 
           title={t('department_performance')}
           value="% 35"
           icon={<Clock className="h-5 w-5" />}
           color="bg-orange-500"
        />

        <SolidCard 
           title={t('kpi_index')}
           value="% 37"
           icon={<BarChart3 className="h-5 w-5" />}
           color="bg-purple-500"
        />

        <SolidCard 
           title={t('financial_reports')}
           value="174"
           icon={<ListChecks className="h-5 w-5" />}
           color="bg-indigo-500"
        />

        {/* The last requested stats box is a bit different */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 flex flex-col justify-center">
            <div className="flex justify-between items-start">
               <div>
                 <div className="text-2xl font-bold">136,000,000</div>
                 <div className="text-xs text-gray-500">دریاب احتیاطی</div>
               </div>
               <div className="text-right">
                 <div className="text-sm font-bold text-gray-600">% 875,000</div>
                 <div className="text-xs text-gray-500">معمولی الزام</div>
               </div>
            </div>
            <div className="mt-2 text-right text-xs font-bold text-gray-600">
               {t('requested_stats')}
               <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded ml-2">39 پاسخگو</span>
            </div>
        </div>

      </div>
    </div>
  );
}

function GradientCard({ title, value, subtitle, icon, gradient }: { title: string, value: string, subtitle: string, icon: React.ReactNode, gradient: string }) {
  return (
    <div className={clsx("relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br", gradient)}>
       <div className="flex justify-between items-start">
         <div className="space-y-4">
            <h3 className="text-sm font-medium opacity-90">{title}</h3>
            <p className="text-3xl font-bold">{value}</p>
         </div>
         <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
           {icon}
         </div>
       </div>
       <div className="mt-6 flex items-center">
          <span className="text-sm opacity-80">{subtitle}</span>
       </div>
       
       {/* Decorative Wave/Graph pseudo-elements could go here */}
       <div className="absolute -bottom-4 left-0 right-0 h-16 opacity-30">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full fill-white/20 stroke-white">
            <path fill="none" strokeWidth="1" d="M0 10 Q 10 20, 20 10 T 40 10 T 60 10 T 80 10 T 100 10" />
          </svg>
       </div>
    </div>
  );
}

function WhiteCard({ title, value, tags, icon, iconColor }: { title: string, value: string, tags: string[], icon: React.ReactNode, iconColor: string }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
       <div className="flex justify-between items-start">
         <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
         </div>
         <div className={clsx("rounded-xl p-3", iconColor)}>
           {icon}
         </div>
       </div>
       <div className="mt-6 flex gap-2">
         {tags.map((tag, i) => (
           <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
             {tag}
           </span>
         ))}
       </div>
    </div>
  );
}

function SolidCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className={clsx("flex items-center justify-between rounded-xl p-4 text-white shadow-md", color)}>
       <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
         {icon}
       </div>
       <div className="text-right">
          <h3 className="text-sm opacity-90 font-medium">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
       </div>
    </div>
  );
}

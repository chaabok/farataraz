'use client';

import { useLanguage } from '@/components/Providers';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const areaData = [
  { name: '1000', uv: 1000, pv: 1500 },
  { name: '2000', uv: 2000, pv: 1800 },
  { name: '3000', uv: 1800, pv: 2500 },
  { name: '4000', uv: 2800, pv: 1800 },
  { name: '5000', uv: 2500, pv: 4000 },
];

const barData = [
  { name: 'A', value1: 30, value2: 60, value3: 10 },
  { name: 'B', value1: 45, value2: 20, value3: 35 },
  { name: 'C', value1: 20, value2: 80, value3: 15 },
  { name: 'D', value1: 60, value2: 30, value3: 40 },
  { name: 'E', value1: 40, value2: 50, value3: 25 },
  { name: 'F', value1: 70, value2: 20, value3: 10 },
  { name: 'G', value1: 30, value2: 50, value3: 20 },
];

export function ChartsSection() {
  const { t } = useLanguage();

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      
      {/* Area Chart Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h3 className="mb-6 text-center lg:text-start text-lg font-bold text-gray-800 dark:text-gray-100">{t('monthly_income')}</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip />
              <Area type="monotone" dataKey="uv" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
              <Area type="monotone" dataKey="pv" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Stats Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 flex flex-col justify-between">
        <h3 className="text-center text-lg font-bold text-gray-800 dark:text-gray-100">{t('accounting_requests')}</h3>
        
        <div className="my-auto space-y-8">
           <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <ArrowUpRight className="h-5 w-5" />
             </div>
             <div className="text-right">
                <p className="text-sm text-gray-500">صورت پرداخت</p>
                <p className="text-xl font-bold">+ 53,000,000</p>
             </div>
           </div>

           <div className="flex items-center justify-between">
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <ArrowDownRight className="h-5 w-5" />
             </div>
             <div className="text-right">
                <p className="text-sm text-gray-500">دارایی ثابت</p>
                <p className="text-xl font-bold">- 138,000,000</p>
             </div>
           </div>
        </div>
      </div>

      {/* Bar Chart Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('estimated_monthly_income')}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
               <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
               {t('monthly_income')}
            </div>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barSize={10} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value1" stackId="a" fill="#eab308" radius={[0, 0, 4, 4]} />
              <Bar dataKey="value2" stackId="a" fill="#0ea5e9" />
              <Bar dataKey="value3" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

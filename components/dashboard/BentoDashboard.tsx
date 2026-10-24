'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/Providers';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';

const areaData = [
  { name: '100', uv: 100, pv: 150 },
  { name: '200', uv: 250, pv: 180 },
  { name: '300', uv: 180, pv: 350 },
  { name: '400', uv: 320, pv: 280 },
  { name: '500', uv: 280, pv: 420 },
  { name: '600', uv: 450, pv: 380 },
];

const barData = [
  { name: 'A', value: 30 },
  { name: 'B', value: 45 },
  { name: 'C', value: 20 },
  { name: 'D', value: 60 },
  { name: 'E', value: 40 },
  { name: 'F', value: 70 },
  { name: 'G', value: 50 },
  { name: 'H', value: 80 },
  { name: 'I', value: 30 },
];

const pieData = [
  { name: 'A', value: 400 },
  { name: 'B', value: 300 },
  { name: 'C', value: 300 },
  { name: 'D', value: 200 },
];
const pieColors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

function BentoBox({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={clsx("rounded-[32px] overflow-hidden transition-all duration-300 hover:shadow-xl relative", className)}>
       {children}
    </div>
  );
}

export function BentoDashboard() {
  const { t } = useLanguage();
  const [barcodeData, setBarcodeData] = useState<{w: string, h: string}[]>([]);

  useEffect(() => {
    setBarcodeData(Array.from({length: 40}).map(() => ({
      w: Math.random() > 0.5 ? '2px' : '4px',
      h: Math.random() > 0.8 ? '100%' : '70%'
    })));
  }, []);

  return (
    <div className="p-2 lg:p-6 lg:max-w-[1400px] mx-auto w-full" dir="ltr">
      <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-auto md:auto-rows-[120px] lg:auto-rows-[100px] gap-4 lg:gap-5 w-full">
        
        {/* Card 1: White Discount / Margin (Target: C1, R1-R3) */}
        <BentoBox className="col-span-1 min-h-[250px] md:min-h-0 md:col-start-1 md:row-start-1 md:row-span-3 bg-white p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">UPGRADE DISCOUNT</div>
            <div className="text-sm lg:text-base font-medium text-gray-800 leading-snug">
              Upgrade today to enable unlimited projects.
            </div>
            <div className="text-4xl lg:text-5xl font-semibold text-[#10b981] mt-6 tracking-tight">
              $12.99
            </div>
          </div>
          <div className="mt-8 relative">
            <div className="flex justify-between items-center text-[9px] lg:text-[10px] text-gray-400 font-mono mb-1">
              <span>DISCOUNT CODE</span>
              <span>G152FG35</span>
            </div>
            <div className="w-full h-8 flex gap-[2px] items-end justify-between">
               {barcodeData.map((d, i) => <div key={i} style={{ width: d.w, height: d.h, backgroundColor: '#475569' }} />)}
            </div>
          </div>
        </BentoBox>

        {/* Card 2: Green Aa (Target: C2, R1-R2) */}
        <BentoBox className="col-span-1 min-h-[200px] md:min-h-0 md:col-start-2 md:row-start-1 md:row-span-2 bg-[#10b981] p-6 lg:p-8 flex flex-col justify-between text-white">
          <div className="text-xl font-medium leading-tight">Urbanist<br/>typeface</div>
          <div className="text-6xl font-semibold tracking-tight">Aa</div>
          <div className="flex w-full h-3 mt-4 rounded-full overflow-hidden">
            <div className="w-1/3 bg-[#34d399]"></div>
            <div className="w-1/3 bg-white"></div>
            <div className="w-1/3 bg-[#064e3b]"></div>
          </div>
        </BentoBox>

        {/* Card 3: Small Dark Chart (Target: C3, R1-R2) */}
        <BentoBox className="col-span-1 min-h-[150px] md:min-h-0 md:col-start-3 md:row-start-1 md:row-span-2 bg-[#0f172a] text-white p-5 relative flex flex-col">
          <div className="text-xs uppercase font-bold tracking-widest mb-2 z-10 text-slate-400">Analysis</div>
          <div className="flex-1 min-h-0 absolute -inset-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={areaData}>
                 <Line type="monotone" dataKey="uv" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </BentoBox>

        {/* Card 4: Tall Phone Chart (Target: C4, R1-R4) */}
        <BentoBox className="col-span-1 min-h-[300px] md:min-h-0 md:col-start-4 md:row-start-1 md:row-span-4 bg-[#064e3b] text-white p-6 relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 z-0 opacity-40">
            <div className="absolute top-4 left-4 w-32 h-32 bg-[#10b981] rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-4 w-40 h-40 bg-[#34d399] rounded-full blur-3xl"></div>
          </div>
          <div className="z-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-[32px] w-full flex-1 flex flex-col overflow-hidden shadow-2xl p-4 mt-8">
            <div className="flex justify-between items-center text-xs opacity-50 mb-2">
              <span>11:52</span>
              <div className="w-4 h-2 bg-white/50 rounded-sm"></div>
            </div>
            <div className="flex-1 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <Area type="monotone" dataKey="pv" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </BentoBox>

        {/* Card 5: Tech Logo Wide (Target: C2-C3, R3-R5) */}
        <BentoBox className="col-span-1 min-h-[200px] md:min-h-0 md:col-start-2 md:col-span-2 md:row-start-3 md:row-span-3 bg-white p-0 relative flex flex-col justify-center items-center overflow-hidden">
          
          <div className="w-full h-full absolute inset-0 z-0">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                   <Area type="monotone" dataKey="uv" stroke="#10b981" fill="#10b981" fillOpacity={0.05} strokeWidth={2} />
                </AreaChart>
             </ResponsiveContainer>
          </div>

          <div className="z-10 flex flex-col items-center pointer-events-none mt-4">
             <div className="grid grid-cols-3 gap-[6px] mb-4">
                <div className="w-5 h-5 bg-[#10b981] rounded-full"></div>
                <div className="w-5 h-5 bg-[#064e3b] justify-self-end rounded-tl-full rounded-tr-full rounded-bl-full"></div>
                <div className="w-5 h-5 bg-[#10b981] rounded-full"></div>
                <div className="w-5 h-5 bg-[#064e3b] rounded-full"></div>
                <div className="w-5 h-5 bg-[#10b981] rounded-full"></div>
                <div className="w-5 h-5 bg-[#10b981] rounded-full"></div>
             </div>
             <div className="text-3xl font-bold tracking-tight text-gray-900">technexus</div>
          </div>
        </BentoBox>

        {/* Card 6: App Screen (Target: C1, R4-R5) */}
        <BentoBox className="col-span-1 min-h-[250px] md:min-h-0 md:col-start-1 md:row-start-4 md:row-span-2 bg-black text-white p-5 flex flex-col relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#10b981]/20 rounded-full blur-3xl"></div>
          <div className="flex justify-between items-center text-[10px] font-medium opacity-70 mb-4 z-10 w-full">
            <span>11:52</span>
            <div className="flex space-x-1">
               <div className="w-3 h-2 bg-white/50 rounded-[1px]"></div>
               <div className="w-4 h-2 bg-white/80 rounded-[1px]"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1 z-10">
            <div className="bg-[#1c1c1c] rounded-2xl flex items-center justify-center p-2 relative overflow-hidden">
               <div className="grid grid-cols-3 gap-1 absolute inset-3">
                 <div className="w-full h-full bg-[#10b981] rounded-[2px] opacity-70"></div>
                 <div className="w-full h-full bg-[#10b981] rounded-[2px] opacity-90"></div>
                 <div className="w-full h-full bg-[#10b981] rounded-[2px] opacity-50"></div>
                 <div className="w-full h-full bg-[#10b981] rounded-[2px] opacity-100"></div>
                 <div className="w-full h-full bg-[#10b981] rounded-[2px] opacity-30"></div>
                 <div className="w-full h-full bg-[#10b981] rounded-[2px] opacity-60"></div>
               </div>
            </div>
            <div className="bg-white text-black rounded-2xl p-2 flex flex-col justify-center items-center text-center">
               <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1">Friday</span>
               <span className="text-3xl font-semibold -mt-2">26</span>
            </div>
            <div className="bg-[#1c1c1c] rounded-2xl flex items-center justify-center p-3">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius="50%" outerRadius="100%" stroke="none">
                       {pieData.map((e, index) => <Cell key={index} fill={pieColors[index]} />)}
                    </Pie>
                 </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="bg-[#1c1c1c] rounded-2xl flex flex-col items-center justify-center">
               <div className="w-8 h-8 rounded-full border-2 border-white/20 relative">
                  <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-[1px] h-3 bg-white rotate-45 origin-bottom"></div>
                  <div className="absolute top-[30%] left-1/2 translate-x-[-50%] translate-y-[-50%] w-[1px] h-2 bg-white/50"></div>
               </div>
            </div>
          </div>
        </BentoBox>

        {/* Card 7: Billboard (Target: C1-C2, R6-R8) */}
        <BentoBox className="col-span-1 min-h-[250px] md:min-h-0 md:col-start-1 md:col-span-2 md:row-start-6 md:row-span-3 bg-[#e2e8f0] p-6 lg:p-10 flex items-center justify-center relative overflow-hidden">
           <div className="w-full h-full bg-white shadow-xl p-5 border border-gray-200 flex flex-col relative z-10">
              <div className="flex gap-[3px] absolute top-5 left-5">
                 <div className="w-[5px] h-[5px] bg-[#064e3b] rounded-full"></div>
                 <div className="w-[5px] h-[5px] bg-[#064e3b] rounded-full"></div>
                 <div className="w-[5px] h-[5px] bg-[#064e3b] rounded-full"></div>
              </div>
              <div className="text-[9px] font-bold absolute top-4 left-10 text-gray-800">technexus</div>
              
              <div className="flex h-full mt-4">
                <div className="w-1/2 flex flex-col justify-end">
                   <h3 className="text-xl lg:text-2xl font-medium leading-tight text-gray-800 tracking-tight">
                      Connecting Ideas.<br/>Empowering Innovation
                   </h3>
                </div>
                <div className="w-1/2 relative flex items-center justify-center pl-4">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={areaData}>
                         <Line type="monotone" dataKey="uv" stroke="#10b981" strokeWidth={5} dot={{ r: 6, fill: '#10b981', strokeWidth: 0 }} />
                      </LineChart>
                   </ResponsiveContainer>
                </div>
              </div>
           </div>
           <div className="absolute right-0 bottom-0 top-0 w-8 bg-black/5 blur-md z-0 pointer-events-none" />
        </BentoBox>

        {/* Card 8: Green Connecting (Target: C3, R6-R8) */}
        <BentoBox className="col-span-1 min-h-[200px] md:min-h-0 md:col-start-3 md:col-span-1 md:row-start-6 md:row-span-3 bg-gradient-to-br from-[#34d399] to-[#10b981] p-6 flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/20 rounded-full blur-3xl shadow-[0_0_80px_rgba(255,255,255,0.4)]"></div>
          <div className="absolute bottom-4 -left-12 w-32 h-32 bg-[#064e3b]/30 rounded-full blur-2xl"></div>
          <h3 className="text-[26px] font-semibold leading-tight z-10 tracking-tight">
            Connecting<br/>o Ideas<br/><span className="font-bold">Empowering</span><br/>Innovation
          </h3>
        </BentoBox>

        {/* Card 9: Bottle (Target: C4, R5-R8) */}
        <BentoBox className="col-span-1 min-h-[250px] md:min-h-0 md:col-start-4 md:row-start-5 md:row-span-4 bg-[#10b981] p-0 flex flex-col relative overflow-hidden text-white shadow-xl shadow-emerald-900/20">
          <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b]/80 to-transparent z-10 pointer-events-none"></div>
          
          <div className="absolute inset-x-0 bottom-0 top-10 opacity-70 z-0">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{top: 0, right: 0, left: 0, bottom: -10}}>
                   <Bar dataKey="value" fill="#ffffff" radius={[8,8,0,0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>

          <div className="z-20 h-full flex flex-col justify-end p-8 w-full">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] rotate-[-90deg] origin-center w-64 text-center">
                <div className="flex items-center justify-center gap-2">
                   <div className="grid grid-cols-2 gap-[2px] rotate-[90deg]">
                      <div className="w-2 h-2 bg-[#064e3b] rounded-full"></div>
                      <div className="w-2 h-2 bg-[#064e3b] justify-self-end rounded-tl-full rounded-tr-full rounded-bl-full"></div>
                      <div className="w-2 h-2 bg-[#064e3b] rounded-full"></div>
                      <div className="w-2 h-2 bg-[#064e3b] rounded-full"></div>
                   </div>
                   <h3 className="text-3xl font-bold tracking-widest text-[#064e3b]">
                      technexus
                   </h3>
                </div>
             </div>
             
             <div className="bg-white/10 backdrop-blur-md rounded-[20px] p-5 w-full border border-white/30 text-center shadow-lg">
                <div className="text-4xl font-bold">92%</div>
                <div className="text-sm font-medium tracking-wide mt-1 text-emerald-100">Efficiency</div>
             </div>
          </div>
        </BentoBox>

      </div>
    </div>
  );
}



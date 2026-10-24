import { TrendingUp, TrendingDown } from "lucide-react";
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
  icon: React.ElementType;
}

export function StatCard({ title, value, trend, trendDirection, icon: Icon }: StatCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-semibold tracking-tight text-gray-900 font-mono">{value}</h3>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`inline-flex items-center gap-x-1 font-medium ${trendDirection === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trendDirection === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {trend}
        </span>
        <span className="ml-2 text-gray-500">vs last month</span>
      </div>
    </div>
  );
}

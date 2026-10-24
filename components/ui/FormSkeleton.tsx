'use client';

import React from 'react';

interface FormSkeletonProps {
  type?: 'list' | 'tree' | 'form';
}

export function FormSkeleton({ type = 'form' }: FormSkeletonProps) {
  return (
    <div className="w-full h-full min-h-[400px] p-4 bg-[#f4f7fe] dark:bg-gray-950/20 animate-pulse flex flex-col gap-4" dir="rtl">
      {/* Skeleton Header / Breadcrumb & Action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {/* Form Icon Placeholder */}
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="flex flex-col gap-2">
            {/* Title Line */}
            <div className="w-36 h-5 bg-gray-200 dark:bg-gray-800 rounded" />
            {/* Subtitle Line */}
            <div className="w-24 h-3 bg-gray-100 dark:bg-gray-800/60 rounded" />
          </div>
        </div>
        
        {/* Action Buttons Placeholder */}
        <div className="flex items-center gap-2">
          <div className="w-20 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="w-24 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="w-10 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>

      {/* Main Content Area Based on Type */}
      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {type === 'list' && (
          /* LIST AND GRID LAYOUT SKELETON */
          <div className="flex-1 flex flex-col gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-0">
            {/* Search and Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2 w-full md:w-auto">
                {/* Search input placeholder */}
                <div className="w-full md:w-64 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                {/* Filter button */}
                <div className="w-20 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                {/* Excel, PDF, Print icons */}
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
              </div>
            </div>

            {/* Data Grid / Table Header */}
            <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg font-bold">
              <div className="col-span-1 h-4 bg-gray-200 dark:bg-gray-800 rounded w-6" />
              <div className="col-span-3 h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
              <div className="col-span-2 h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" />
              <div className="col-span-2 h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
              <div className="col-span-3 h-4 bg-gray-200 dark:bg-gray-800 rounded w-28" />
              <div className="col-span-1 h-4 bg-gray-200 dark:bg-gray-800 rounded w-8 justify-self-end" />
            </div>

            {/* Table Rows (5 Rows) */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-4 p-3 border-b border-gray-50 dark:border-gray-800/50 items-center hover:bg-gray-50/55 dark:hover:bg-gray-800/10"
                >
                  {/* Checkbox column */}
                  <div className="col-span-1 h-4 bg-gray-150 dark:bg-gray-800 rounded-md w-4" />
                  {/* Column 1 */}
                  <div className="col-span-3 flex flex-col gap-1.5">
                    <div className="h-3.5 bg-gray-150 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800/40 rounded w-1/2" />
                  </div>
                  {/* Column 2 */}
                  <div className="col-span-2 h-3.5 bg-gray-150 dark:bg-gray-800 rounded w-1/2" />
                  {/* Column 3 */}
                  <div className="col-span-2 h-3.5 bg-gray-150 dark:bg-gray-800 rounded w-2/3" />
                  {/* Column 4 */}
                  <div className="col-span-3 h-3.5 bg-gray-150 dark:bg-gray-800 rounded w-5/6" />
                  {/* Action Column */}
                  <div className="col-span-1 flex gap-2 justify-end">
                    <div className="w-6 h-6 bg-gray-150 dark:bg-gray-800 rounded" />
                    <div className="w-6 h-6 bg-gray-150 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
              <div className="w-32 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="w-8 h-8 bg-gray-250 dark:bg-gray-700 rounded font-bold" />
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            </div>
          </div>
        )}

        {type === 'tree' && (
          /* TREE LAYOUT SKELETON */
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Right Side - Tree structure panel (RTL right-aligned) */}
            <div className="w-72 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
              <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                {/* Simulated hierarchy */}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="w-40 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
                <div className="flex items-center gap-2 mr-4">
                  <div className="w-4 h-4 bg-gray-150 dark:bg-gray-800 rounded" />
                  <div className="w-32 h-3.5 bg-gray-150 dark:bg-gray-800 rounded" />
                </div>
                <div className="flex items-center gap-2 mr-8">
                  <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800/60 rounded" />
                  <div className="w-24 h-3 bg-gray-100 dark:bg-gray-800/60 rounded" />
                </div>
                <div className="flex items-center gap-2 mr-8">
                  <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800/60 rounded" />
                  <div className="w-28 h-3 bg-gray-100 dark:bg-gray-800/60 rounded" />
                </div>
                <div className="flex items-center gap-2 mr-4 mt-2">
                  <div className="w-4 h-4 bg-gray-150 dark:bg-gray-800 rounded" />
                  <div className="w-36 h-3.5 bg-gray-150 dark:bg-gray-800 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="w-44 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
            </div>

            {/* Left Side - Details form panel */}
            <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col gap-6 overflow-y-auto">
              <div className="w-44 h-5 bg-gray-200 dark:bg-gray-800 rounded border-b pb-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="w-20 h-3 bg-gray-100 dark:bg-gray-800/60 rounded" />
                    <div className="w-full h-9 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800/50" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <div className="w-24 h-3 bg-gray-100 dark:bg-gray-800/60 rounded" />
                <div className="w-full h-24 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800/50" />
              </div>
            </div>
          </div>
        )}

        {type === 'form' && (
          /* STANDARD FORM SKELETON */
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col gap-6 overflow-y-auto">
            {/* Form Tabs simulation */}
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="w-24 h-8 bg-gray-200 dark:bg-gray-800 rounded-t-lg" />
              <div className="w-24 h-8 bg-gray-100 dark:bg-gray-800/60 rounded-t-lg" />
              <div className="w-24 h-8 bg-gray-100 dark:bg-gray-800/60 rounded-t-lg" />
            </div>

            {/* Grid of form fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="w-24 h-3 bg-gray-150 dark:bg-gray-800 rounded" />
                  <div className="w-full h-9 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800/50" />
                </div>
              ))}
            </div>

            {/* Separator */}
            <div className="border-t border-gray-100 dark:border-gray-800 my-2" />

            {/* Text area fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <div className="w-28 h-3 bg-gray-150 dark:bg-gray-800 rounded" />
                <div className="w-full h-20 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800/50" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-28 h-3 bg-gray-150 dark:bg-gray-800 rounded" />
                <div className="w-full h-20 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800/50" />
              </div>
            </div>

            {/* Sub-table or details grid simulation (typical for complex ERP forms) */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="w-36 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
                <div className="h-10 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800" />
                <div className="h-12 border-b border-gray-50 dark:border-gray-800/50" />
                <div className="h-12" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

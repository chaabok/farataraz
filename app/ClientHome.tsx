'use client';

import dynamic from 'next/dynamic';

const PageContainer = dynamic(() => import('@/components/layout/PageContainer').then(mod => mod.PageContainer), { ssr: false });
const BentoDashboard = dynamic(() => import('@/components/dashboard/BentoDashboard').then(mod => mod.BentoDashboard), { ssr: false });

export default function ClientHome() {
  return (
    <PageContainer>
      <div className="bg-slate-50 dark:bg-slate-900/40 p-6 min-h-full">
        <BentoDashboard />
      </div>
    </PageContainer>
  );
}

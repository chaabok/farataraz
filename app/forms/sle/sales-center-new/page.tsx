'use client';

import { use } from 'react';
import { SalesCenterForm } from '@/components/forms/sle/SalesCenter';

export default function SalesCenterNewPage({ searchParams }: { searchParams?: { id?: string } }) {
  const params = use(searchParams as Promise<{ id?: string }> | undefined);
  const recordId = params?.id;
  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 p-2">
      <SalesCenterForm id={recordId} />
    </div>
  );
}

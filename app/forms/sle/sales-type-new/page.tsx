'use client';

import { use } from 'react';
import SalesTypeForm from '@/components/forms/sle/SalesType';

export default function SalesTypeNewPage({ searchParams }: { searchParams?: { id?: string } }) {
  const params = use(searchParams as Promise<{ id?: string }> | undefined);
  const recordId = params?.id;
  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 p-2">
      <SalesTypeForm recordId={recordId} />
    </div>
  );
}

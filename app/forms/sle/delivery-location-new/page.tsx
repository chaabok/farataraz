'use client';

import { use } from 'react';
import { DeliveryLocationForm } from '@/components/forms/sle/DeliveryLocation';

export default function DeliveryLocationNewPage({ searchParams }: { searchParams?: { id?: string } }) {
  const params = use(searchParams as Promise<{ id?: string }> | undefined);
  const recordId = params?.id;
  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 p-2">
      <DeliveryLocationForm id={recordId} />
    </div>
  );
}

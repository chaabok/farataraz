'use client';

import React from 'react';
import { DeliveryLocationForm } from '@/components/forms/sle/DeliveryLocation';

export default function DeliveryLocationNewPage({ searchParams }: { searchParams?: { id?: string } }) {
  const recordId = searchParams?.id;
  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 p-2">
      <DeliveryLocationForm id={recordId} />
    </div>
  );
}

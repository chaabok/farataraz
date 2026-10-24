"use client";

import { use } from 'react';
import { CustomerForm } from '@/components/forms/sle/Customer';

export default function Page({ searchParams }: { searchParams?: { id?: string } }) {
  const params = use(searchParams as Promise<{ id?: string }> | undefined);
  const id = params?.id;
  return <CustomerForm id={id} />;
}

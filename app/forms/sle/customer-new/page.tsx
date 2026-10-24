"use client";

import React from 'react';
import { CustomerForm } from '@/components/forms/sle/Customer';

export default function Page({ searchParams }: { searchParams?: { id?: string } }) {
  const id = searchParams?.id;
  return <CustomerForm id={id} />;
}

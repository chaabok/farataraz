"use client";

import React, { use } from "react";
import { SalesItemGroup } from "@/components/forms/sle/SalesItemGroup";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id ? Number(resolvedParams.id) : undefined;
  return <SalesItemGroup id={id} />;
}

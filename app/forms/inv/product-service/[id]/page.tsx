"use client";

import { use } from "react";
import { ProductService } from "@/components/forms/inv/ProductService";

export default function ProductServicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id ? parseInt(resolvedParams.id, 10) : undefined;

  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <ProductService id={id} />
    </div>
  );
}

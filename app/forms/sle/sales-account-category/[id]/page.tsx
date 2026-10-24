"use client";

import { use } from "react";
import SalesAccountCategory from "@/components/forms/sle/SalesAccountCategory";

export default function EditSalesAccountCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const idNum = resolvedParams.id ? parseInt(resolvedParams.id, 10) : undefined;

  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <SalesAccountCategory id={idNum} />
    </div>
  );
}

"use client";

import React from "react";
import { SalesItemGroupList } from "@/components/forms/sle/SalesItemGroupList";

export default function Page() {
  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <SalesItemGroupList />
    </div>
  );
}

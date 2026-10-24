"use client";

import React from "react";
import { BarcodeLabelForm } from "@/components/forms/inv/BarcodeLabelForm";

export const dynamic = "force-dynamic";

export default function BarcodeLabelPage() {
  return (
    <div className="w-full min-h-full p-2">
      <BarcodeLabelForm />
    </div>
  );
}

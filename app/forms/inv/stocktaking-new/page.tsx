"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PageContainer } from "@/components/layout/PageContainer";
import { FormSkeleton } from "@/components/ui/FormSkeleton";

const StocktakingForm = dynamic(
  () => import("@/components/forms/inv/StocktakingForm").then((mod) => mod.StocktakingForm),
  {
    ssr: false,
    loading: () => <FormSkeleton type="form" />,
  }
);

export default function StocktakingNewPage() {
  return (
    <PageContainer>
      <StocktakingForm />
    </PageContainer>
  );
}

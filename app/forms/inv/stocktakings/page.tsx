"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PageContainer } from "@/components/layout/PageContainer";
import { FormSkeleton } from "@/components/ui/FormSkeleton";

const StocktakingList = dynamic(
  () => import("@/components/forms/inv/StocktakingList").then((mod) => mod.StocktakingList),
  {
    ssr: false,
    loading: () => <FormSkeleton type="list" />,
  }
);

export default function StocktakingsPage() {
  return (
    <PageContainer>
      <StocktakingList />
    </PageContainer>
  );
}

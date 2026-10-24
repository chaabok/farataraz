"use client";
import { PageContainer } from "@/components/layout/PageContainer";
import PettyCashRequestList from "@/components/forms/rap/PettyCashRequestList";
export default function PettyCashRequestsListPage() {
  return (
    <PageContainer>
      <div className="h-[calc(100vh-6rem)]">
        <PettyCashRequestList />
      </div>
    </PageContainer>
  );
}

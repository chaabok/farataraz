"use client";
import ChequebookForm from "@/components/forms/rap/Chequebook";
export default function EditChequebookPage() {
  const params = useParams();
  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <ChequebookForm id={params.id as string} />
    </div>
  );
}

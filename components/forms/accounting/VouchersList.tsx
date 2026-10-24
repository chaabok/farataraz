import React, { useEffect, useState } from 'react';
import { MainDataGrid } from '@/components/ui/MainDataGrid';
import { useTabs } from '@/components/TabsProvider';
import { useToast } from '@/components/ToastProvider';
import { apiFetch } from '@/lib/utils';
import { DocumentStateLabels } from '@/components/inputs/StateListInput';

export function VouchersList() {
  const { addTab } = useTabs();
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch('/api/accounting/vouchers');
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to fetch data: ${res.status} ${res.statusText} ${text}`);
      }
      const json = await res.json();
      setData(json.data || json);
    } catch (error) {
      console.error(error);
      showToast('خطا در دریافت اطلاعات اسناد حسابداری', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const columns = [
    { key: 'voucherNumber', header: 'شماره سند', type: 'number', width: 70 },
    { key: 'voucherDate', header: 'تاریخ سند', width: 70 },
    { key: 'description', header: 'شرح' },
    { key: 'totalDebit', header: 'جمع بدهکار', type: 'number', cell: ({ row }: any) => Number(row.original?.totalDebit || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }) },
    { key: 'totalCredit', header: 'جمع بستانکار', type: 'number', cell: ({ row }: any) => Number(row.original?.totalCredit || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }) },
    { 
      key: 'status', 
      header: 'وضعیت', 
      cell: ({ row }: any) => {
        const s = row.original?.status;
        return DocumentStateLabels[Number(s) as keyof typeof DocumentStateLabels] || s || '';
      }
    },
    { key: 'referenceNumber', header: 'شماره عطف', type: 'number' },
    { key: 'subNumber', header: 'شماره فرعی', type: 'number' },
    { key: 'voucherTypeTitle', header: 'نوع سند' },
    { key: 'dailyNumber', header: 'شماره روزانه', type: 'number' },
    { key: 'creatorName', header: 'کاربر صادر کننده' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-900 rounded-lg">
      <MainDataGrid
        entityName="Voucher"
        title="فهرست اسناد حسابداری"
        data={data}
        isLoading={isLoading}
        columns={columns}
        onRefresh={fetchVouchers}
        onAdd={() => {
          addTab('سند حسابداری جدید', 'accounting', null, 'Voucher');
        }}
        onEdit={(item: any) => {
          const finalId = item.voucherId || item.id || item._id;
          addTab(`ویرایش سند ${item.voucherNumber || finalId}`, 'accounting', null, 'Voucher', { id: finalId });
        }}
        onDelete={async (item: any) => {
          try {
            const id = item.voucherId || item.id || item._id;
            const res = await apiFetch(`/api/accounting/vouchers/${id}`, { method: 'DELETE' });
            if (!res.ok) {
               const text = await res.text().catch(() => '');
               throw new Error(text || 'خطا در حذف سند');
            }
            showToast('سند با موفقیت حذف شد', 'success');
            fetchVouchers();
          } catch (error: any) {
            console.error(error);
            showToast(error.message || 'خطا در حذف سند', 'error');
          }
        }}
      />
    </div>
  );
}

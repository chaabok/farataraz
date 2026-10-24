import React from 'react';

const statuses = {
  Completed: 'text-emerald-700 bg-emerald-50 ring-emerald-600/20',
  Pending: 'text-amber-700 bg-amber-50 ring-amber-600/20',
  Processing: 'text-blue-700 bg-blue-50 ring-blue-600/20',
  Failed: 'text-rose-700 bg-rose-50 ring-rose-600/20',
};

const orders = [
  {
    id: '#ORD-001',
    client: 'Stark Industries',
    amount: '$14,500.00',
    date: 'Today, 2:45 PM',
    status: 'Completed',
  },
  {
    id: '#ORD-002',
    client: 'Acme Corp',
    amount: '$3,200.00',
    date: 'Today, 10:20 AM',
    status: 'Processing',
  },
  {
    id: '#ORD-003',
    client: 'Globex Corporation',
    amount: '$45,000.00',
    date: 'Yesterday',
    status: 'Pending',
  },
  {
    id: '#ORD-004',
    client: 'Soylent Corp',
    amount: '$1,050.00',
    date: 'Sep 24, 2023',
    status: 'Completed',
  },
  {
    id: '#ORD-005',
    client: 'Initech',
    amount: '$8,900.00',
    date: 'Sep 22, 2023',
    status: 'Failed',
  },
];

export function RecentOrders() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      <div className="border-b border-gray-200 p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium tracking-tight">
            <tr>
              <th scope="col" className="px-6 py-3">Order ID</th>
              <th scope="col" className="px-6 py-3">Client</th>
              <th scope="col" className="px-6 py-3">Amount</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-gray-900 font-medium">
                  {order.id}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {order.client}
                </td>
                <td className="px-6 py-4 font-mono font-medium text-gray-900">
                  {order.amount}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {order.date}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      statuses[order.status as keyof typeof statuses]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

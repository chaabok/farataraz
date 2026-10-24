import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const backendUrl = `http://127.0.0.1:3005/api/accounting/account-review/voucher-bounds${url.search}`;

    const headers = new Headers();
    const headersToForward = [
      'authorization',
      'x-company-id',
      'x-branch-id',
      'x-agency-id',
      'x-fiscal-year-id',
      'content-type',
      'accept'
    ];

    for (const h of headersToForward) {
      const val = req.headers.get(h);
      if (val) {
        headers.set(h, val);
      }
    }

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const fromYear = url.searchParams.get('fromYear') || '1405';
    const toYear = url.searchParams.get('toYear') || '1405';
    return NextResponse.json({
      success: true,
      fromMonth: 'فروردین',
      toMonth: 'اسفند',
      fromDate: `${fromYear}/01/01`,
      toDate: `${toYear}/12/29`,
      fromVoucher: '1',
      toVoucher: '9999'
    });
  } catch (err: any) {
    console.error('Failed to proxy voucher-bounds to NestJS backend:', err);
    return NextResponse.json({
      success: false,
      message: err?.message || 'Error fetching bounds'
    }, { status: 500 });
  }
}

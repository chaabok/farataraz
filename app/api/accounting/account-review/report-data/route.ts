import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const backendUrl = `http://127.0.0.1:3005/api/accounting/account-review/report-data${url.search}`;

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

    // FIX: propagate backend failures instead of faking an empty successful
    // report (an outage must never look like an empty financial report).
    const errorText = await res.text();
    console.error('NestJS backend report-data error response:', res.status, errorText);
    let message = 'خطا در دریافت داده‌های گزارش از سرور';
    try {
      const parsed = JSON.parse(errorText);
      message = parsed?.message || parsed?.error || message;
    } catch {}
    return NextResponse.json({ success: false, message }, { status: res.status });
  } catch (err: any) {
    console.error('Failed to proxy report-data request to NestJS backend:', err);
    return NextResponse.json({ success: false, message: 'اتصال به سرور برقرار نشد' }, { status: 502 });
  }
}

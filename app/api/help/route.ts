import { NextResponse } from 'next/server';
import { helpContents } from '@/lib/help-content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic') || '';
  
  let content = helpContents[topic];
  
  if (!content && topic) {
    // try partial matching or fallback
    const matchedKey = Object.keys(helpContents).find(k => topic.includes(k) || k.includes(topic));
    if (matchedKey) {
      content = helpContents[matchedKey];
    } else {
      content = helpContents['default'];
    }
  }

  if (!content) {
    content = helpContents['default'];
  }

  return new NextResponse(content || 'هیچ راهنمایی برای این بخش یافت نشد.', {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}

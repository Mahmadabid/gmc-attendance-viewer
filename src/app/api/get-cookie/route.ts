import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const response = await fetch('https://gmcg.edu.pk/cms/site/userlogin', {
    method: 'GET',
    headers: {
      'Accept': 'text/html',
      'User-Agent': req.headers.get('user-agent') || '',
    },
  });

  const setCookie = response.headers.get('set-cookie');

  // Return only the set-cookie value as plain text
  return new NextResponse(setCookie || '', { status: 200 });
}

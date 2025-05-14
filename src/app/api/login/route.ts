// pages/api/login.ts (or route handler)
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;

  const sessionCookie = (await cookies()).get('ci_session')?.value;
  console.log('Session Cookie:', sessionCookie);

  const response = await fetch('https://gmcg.edu.pk/cms/site/userlogin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': `ci_session=${sessionCookie}`,
      'User-Agent': req.headers.get('user-agent') || '',
      'Accept': 'text/html',
    },
    body: new URLSearchParams({
      username, // replace with actual form field name
      password, // replace with actual form field name
    }).toString(),
    redirect: 'manual',
  });

  const location = response.headers.get('location');
  if (location?.includes('dashboard')) {
    return NextResponse.json({ success: true, redirect: location });
  }

  return NextResponse.json({ success: false, error: 'Login failed' });
}

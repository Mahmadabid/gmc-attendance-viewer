import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://gmcg.edu.pk/cms/site/userlogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': req.headers.get('user-agent') || '',
        'Accept': 'text/html',
      },
      body: new URLSearchParams({
        username,
        password,
      }).toString(),
      redirect: 'manual',
    });    // Check if the response was successful
    // HTTP 302 and 303 are both valid redirect codes that may indicate successful login
    const validRedirectCodes = [302, 303];
    if (!response.ok && !validRedirectCodes.includes(response.status)) {
      return NextResponse.json(
        { success: false, error: `Login failed with status: ${response.status}` },
        { status: response.status }
      );
    }

    const setCookie = response.headers.get('set-cookie');
    
    // Check if we received a cookie, which indicates successful authentication
    if (!setCookie) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed - no session cookie received' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ success: true }, { status: 200 });
    res.headers.set('Set-Cookie', setCookie);
    return res;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}

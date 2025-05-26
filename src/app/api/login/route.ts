import { NextRequest, NextResponse } from 'next/server';
import { CREDENTIAL_COOKIE_NAME } from '@/components/lib/utils';
import { encrypt } from '@/components/lib/encryption';

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
    });

    // Always read the response body as text to check for error messages
    const responseBody = await response.text();
    // Check for invalid credentials in the response body
    const invalidLogin = responseBody.includes('Invalid Username or Password') || responseBody.includes('Invalid username or password');

    // HTTP 302 and 303 are both valid redirect codes that may indicate successful login
    const validRedirectCodes = [302, 303];
    if ((!response.ok && !validRedirectCodes.includes(response.status)) || invalidLogin) {
      return NextResponse.json(
        { success: false, error: invalidLogin ? 'Invalid Username or Password' : `Login failed with status: ${response.status}` },
        { status: invalidLogin ? 401 : response.status }
      );
    }

    const sessionCookie = response.headers.get('set-cookie');
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed - no session cookie received' },
        { status: 401 }
      );
    }

    // const updatedSessionCookie = updateCookieMaxAgeAndExpires(sessionCookie, 350);

    const encrypted = encrypt(JSON.stringify({ username, password }));
     // Create secure HTTP-only cookie for credentials
    const secureCredentialCookie = `${CREDENTIAL_COOKIE_NAME}=${encodeURIComponent(encrypted)}; Path=/; Max-Age=${350 * 24 * 60 * 60}; HttpOnly; SameSite=Strict; Secure`;

    const res = NextResponse.json({ success: true }, { status: 200 });

    res.headers.append('Set-Cookie', sessionCookie);
    res.headers.append('Set-Cookie', secureCredentialCookie);

    return res;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Extract all cookies from the incoming request
    const allCookies = req.headers.get('cookie') || ''

    // Parse and extract only the ci_session cookie
    const ciSession = allCookies
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('ci_session='))
    console.log('ciSession:', ciSession)
    // Make the external request with only ci_session forwarded
    const res = await fetch('https://gmcg.edu.pk/cms/site/userlogin', {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'User-Agent': req.headers.get('user-agent') || '',
        'Cookie': ciSession ? ciSession : '', // ✅ Only send ci_session
      },
    })

    const setCookie = res.headers.get('set-cookie');
    const html = await res.text()

    // Check if the HTML contains the login form (Student Login)
    let loggedIn = true;
    if (html.includes('<h2 class="font-white bolds">Student Login</h2>') || html.includes('name="username"') || html.includes('name="password"')) {
      loggedIn = false;
    }

    // Create the JSON response and set headers
    const jsonResponse = NextResponse.json({ loggedIn }, { status: res.status });
    if (setCookie) {
      jsonResponse.headers.set('set-cookie', setCookie);
    }
    return jsonResponse;
    // If you want to return HTML instead, comment the above and uncomment below:
    // return response;
  } catch (err) {
    console.error('Error fetching login page:', err)
    return NextResponse.json({ error: 'Failed to fetch login page' }, { status: 500 })
  }
}

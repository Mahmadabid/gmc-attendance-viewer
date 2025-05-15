import { NextResponse } from 'next/server';

export async function GET() {
  // Create a response object
  const response = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Clear cookies by appending separate Set-Cookie headers
  response.headers.append('Set-Cookie', 'ci_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');

  return response;
}

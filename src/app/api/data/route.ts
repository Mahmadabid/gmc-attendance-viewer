import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { AttendanceRow } from '@/components/Attendance';
import { CREDENTIAL_COOKIE_NAME } from '@/components/lib/utils';
import { decrypt } from '@/components/lib/encryption';

export async function GET(req: NextRequest) {
    try {
        let sessionCookie: any = req.cookies.get('ci_session');
        let encryptedCredentials = req.cookies.get(CREDENTIAL_COOKIE_NAME)?.value;

        const userAgent = req.headers.get('user-agent') || '';

        let sessionCookieBoolean = false;

        if (!encryptedCredentials) {
            return NextResponse.json({ loggedIn: false, attendance: [] }, { status: 200 });
        }

        const decrypted = decrypt(decodeURIComponent(encryptedCredentials));
        const { username, password } = JSON.parse(decrypted);

        if (!sessionCookie) {
            sessionCookieBoolean = true;
            // call /api/login to check if the user is logged in
            const loginRes = await fetch(`${req.nextUrl.origin}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': userAgent,
                },
                body: JSON.stringify({ username, password }),
            });

            if (!loginRes.ok) {
                return NextResponse.json({
                    loggedIn: false,
                    error: 'Auto login failed',
                }, { status: loginRes.status });
            }

            // Get new session cookie from response
            const setCookie = loginRes.headers.get('set-cookie');
            if (!setCookie || !setCookie.includes('ci_session')) {
                return NextResponse.json({
                    loggedIn: false,
                    error: 'Login did not return a valid session cookie',
                }, { status: 500 });
            }

            // Parse all cookies from set-cookie header with their complete attributes
            const parseCookies = (setCookieHeader: string) => {
                const cookies: { [key: string]: { value: string; attributes: string } } = {};

                // Split by ', ' only if it is followed by a word and '=' (start of a new cookie)
                // Handles cases like: ci_session=...;..., user-auth=...;...
                const cookieParts = setCookieHeader.split(/, (?=[^;]+?=)/);
                const cookiePattern = /(\w+(?:-\w+)*)=([^;]+)((?:;\s*[^;=]+(?:=[^;]*)?)*)/g;
                for (const part of cookieParts) {
                    let match;
                    while ((match = cookiePattern.exec(part)) !== null) {
                        const [, name, value, attributes] = match;
                        cookies[name] = {
                            value: value,
                            attributes: attributes
                        };
                    }
                }
                return cookies;
            };

            const parsedCookies = parseCookies(setCookie);

            // Extract ci_session cookie
            if (!parsedCookies['ci_session']) {
                return NextResponse.json({
                    loggedIn: false,
                    error: 'ci_session cookie not found in login response',
                }, { status: 500 });
            }

            const ciSessionCookie = parsedCookies['ci_session'];
            sessionCookie = { name: 'ci_session', ...ciSessionCookie };
        }

        // If session exists, fetch attendance page
        const attendanceRes = await fetch('https://gmcg.edu.pk/cms/user/attendence', {
            method: 'GET',
            headers: {
                'Accept': 'text/html',
                'Cookie': `ci_session=${sessionCookie.value}`,
                'User-Agent': userAgent,
            },
        });

        if (!attendanceRes.ok) {
            return NextResponse.json({
                loggedIn: false,
                error: 'Failed to fetch attendance page',
                status: attendanceRes.status
            }, { status: attendanceRes.status });
        }

        const html = await attendanceRes.text();

        const $ = cheerio.load(html);

        // Extract attendance table rows
        const attendance: AttendanceRow[] = [];
        $('table.table tbody tr').each((_, row) => {
            const cols = $(row).find('td').map((_, td) => $(td).text().trim()).get();
            if (cols.length >= 7) {
                attendance.push({
                    subject: cols[1],
                    lectureType: cols[2],
                    teacher: cols[3],
                    lectureTime: cols[4].replace(/^Lecture Time\s*/i, '') || cols[4],
                    date: cols[5],
                    status: cols[6],
                });
            }
        });

        // Efficient feedback question removal
        const feedbackSubjects = new Set([
            'Objectives of the sessions were achieved.',
            'Learning experiences were relevant to the objectives.',
            'Sessions were relevant to my educational needs.',
            'The facilitator demonstrated command over subject matter.',
            'Time management of the sessions by the facilitator was appropriate.',
            'Reading material provided was relevant to the session.',
            'Tasks (individual and group) were relevant and appropriate.',
            'Opportunities for interaction were provided.',
            'Queries were clarified',
            'Key points were summarized at the end.'
        ]);

        if (attendance.length >= 10) {
            const lastTen = attendance.slice(-10);
            if (lastTen.every(row => feedbackSubjects.has(row.subject))) {
                attendance.length -= 10; // Efficient splice
            }
        }

        // If attendance is empty, check for login failure only if login elements are present
        if (attendance.length === 0) {
            const loginElementsPresent = (
                $('h2.font-white.bolds:contains("Student Login")').length > 0 ||
                $('input[name="username"], input[name="password"]').length > 0
            );
            if (loginElementsPresent) {
                return NextResponse.json({ loggedIn: false }, { status: attendanceRes.status });
            }

            // If attendance is empty but login elements are not present, user is logged in but has no attendance yet
            const res = NextResponse.json({ loggedIn: true, attendance: [] }, { status: 200 });
            sessionCookieBoolean && res.headers.append('Set-Cookie', sessionCookie.name + '=' + sessionCookie.value + '; ' + sessionCookie.attributes);

            return res;
        }

        const res = NextResponse.json({ loggedIn: true, attendance }, { status: 200 });
        sessionCookieBoolean && res.headers.append('Set-Cookie', sessionCookie.name + '=' + sessionCookie.value + '; ' + sessionCookie.attributes);

        return res;
        
    } catch (error: any) {
        // Log error for debugging (optional: use a logger)
        console.error('API error in /api/data:', error);
        return NextResponse.json({
            loggedIn: false,
            error: error?.message || 'Internal server error',
        }, { status: 500 });
    }
}

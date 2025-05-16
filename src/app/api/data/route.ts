import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { AttendanceRow } from '@/components/Attendance';

export async function GET(req: NextRequest) {
    const sessionCookie = req.cookies.get('ci_session')?.value;
    const userAgent = req.headers.get('user-agent') || '';

    // If no session cookie, try to get one
    if (!sessionCookie) {
        const loginRes = await fetch('https://gmcg.edu.pk/cms/site/userlogin', {
            method: 'GET',
            headers: {
                'Accept': 'text/html',
                'User-Agent': userAgent,
            },
        });

        const setCookie = loginRes.headers.get('set-cookie');
        const res = NextResponse.json({ loggedIn: false });

        if (setCookie) {
            res.headers.set('Set-Cookie', setCookie);
        }

        return res;
    }

    // If session exists, fetch attendance page
    const attendanceRes = await fetch('https://gmcg.edu.pk/cms/user/attendence', {
        method: 'GET',
        headers: {
            'Accept': 'text/html',
            'Cookie': `ci_session=${sessionCookie}`,
            'User-Agent': userAgent,
        },
    });

    const html = await attendanceRes.text();
    const setCookie = attendanceRes.headers.get('set-cookie');
    const $ = cheerio.load(html);

    // Fast login check via unique elements
    const loggedIn = !(
        $('h2.font-white.bolds:contains("Student Login")').length > 0 ||
        $('input[name="username"], input[name="password"]').length > 0
    );

    if (!loggedIn) {
        const res = NextResponse.json({ loggedIn }, { status: attendanceRes.status });
        if (setCookie) res.headers.set('Set-Cookie', setCookie);
        return res;
    }

    // Extract attendance table rows
    const attendance: AttendanceRow[] = [];
    $('table.table tbody tr').each((_, row) => {
        const cols = $(row).find('td').map((_, td) => $(td).text().trim()).get();
        if (cols.length >= 7) {
            attendance.push({
                subject: cols[1],
                lectureType: cols[2],
                teacher: cols[3],
                lectureTime: cols[4],
                date: cols[5],
                status: cols[6].toLowerCase(),
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

    const res = NextResponse.json({ loggedIn: true, attendance }, { status: 200 });
    if (setCookie) res.headers.set('Set-Cookie', setCookie);
    return res;
}

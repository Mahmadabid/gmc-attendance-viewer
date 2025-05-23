import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { AttendanceRow } from '@/components/Attendance';

export async function GET(req: NextRequest) {
    try {
        const sessionCookie = req.cookies.get('ci_session')?.value;
        const userAgent = req.headers.get('user-agent') || '';

        if (!sessionCookie) {
            return NextResponse.json({ loggedIn: false, attendance: [] }, { status: 200 });
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
            return NextResponse.json({ loggedIn: true, attendance: [] }, { status: 200 });
        }

        return NextResponse.json({ loggedIn: true, attendance }, { status: 200 });
    } catch (error: any) {
        // Log error for debugging (optional: use a logger)
        console.error('API error in /api/data:', error);
        return NextResponse.json({
            loggedIn: false,
            error: error?.message || 'Internal server error',
        }, { status: 500 });
    }
}

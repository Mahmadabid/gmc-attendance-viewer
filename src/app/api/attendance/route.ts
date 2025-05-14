import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
    const sessionCookie = req.cookies.get('ci_session')?.value;

    if (!sessionCookie) {
        return NextResponse.json({ error: 'Missing session cookie' }, { status: 401 });
    }

    const response = await fetch('https://gmcg.edu.pk/cms/user/attendence', {
        method: 'GET',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cookie': `ci_session=${sessionCookie}`,
            'Referer': 'https://gmcg.edu.pk/cms/user/user/dashboard',
            'User-Agent': req.headers.get('user-agent') || '',
            'Upgrade-Insecure-Requests': '1',
        },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const rows = $('table.table.table-striped.table-bordered.table-hover tbody tr');
    const attendance: Array<{
        rowNumber: string;
        subject: string;
        lectureType: string;
        teacher: string;
        lectureTime: string;
        date: string;
        status: string;
    }> = [];

    rows.each((_, row) => {
        const cols = $(row).find('td').map((_, td) => $(td).text().trim()).get();

        if (cols.length >= 7) {
            attendance.push({
                rowNumber: cols[0],
                subject: cols[1],
                lectureType: cols[2],
                teacher: cols[3],
                lectureTime: cols[4],
                date: cols[5],
                status: cols[6].toLowerCase(),
            });
        }
    });

    // Remove last 10 rows if they match the feedback questions
    const feedbackQuestions = [
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
    ];

    if (attendance.length >= 10) {
        const lastTen = attendance.slice(-10);
        const allMatch = lastTen.every((row, idx) => row.subject === feedbackQuestions[idx]);
        if (allMatch) {
            attendance.splice(-10, 10);
        }
    }

    return NextResponse.json({ attendance }, { status: 200 });
}

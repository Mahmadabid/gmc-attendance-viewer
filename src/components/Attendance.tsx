'use client';

import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';
import SubjectFilterButtons from './attendance/SubjectFilterButtons';
import AttendanceSummaryTable from './attendance/AttendanceSummaryTable';
import AttendanceTable from './attendance/AttendanceTable';
import QuarterFilterButtons from './attendance/QuarterFilterButtons';
import Login from './Login';
import { isDateInRange } from './lib/dateUtils';
import { ArrowPathIcon, WifiIcon } from '@heroicons/react/24/outline';
import { useIsOnline } from './lib/context/IsOnlineContext';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { FetchStatus, FetchURL } from './lib/utils';

export interface AttendanceRow {
  subject: string;
  lectureType: string;
  teacher: string;
  lectureTime: string;
  date: string;
  status: string;
}

interface Quarter {
  start: string; // ISO date string
  end: string;   // ISO date string
}

const keyMap = {
  subject: 'Subject',
  lectureType: 'Lecture Type',
  teacher: 'Teacher',
  lectureTime: 'Lecture Time',
  date: 'Date',
  status: 'Status',
}

const Attendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedQuarterIdx, setSelectedQuarterIdx] = useState<number>(-1); // -1 means whole year
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const isOnline = useIsOnline();

  // Load quarters from localStorage on mount and when quarters change
  useEffect(() => {
    const loadQuarters = () => {
      const stored = localStorage.getItem('quarters');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setQuarters(parsed);
        } catch { }
      }
    };
    loadQuarters();
    // Listen for quarters-changed event
    const handler = () => loadQuarters();
    window.addEventListener('quarters-changed', handler);
    return () => window.removeEventListener('quarters-changed', handler);
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        // Always add refresh=true when refresh button is pressed
        const refreshParam = refreshCount > 0 ? '?refresh=true' : '';
        const res = await fetch(`${FetchURL}${refreshParam}`, {
          method: 'GET',
          credentials: 'include',
          // Always use no-cache to ensure service worker intercepts the request
          cache: 'no-cache',
        });
        if (!res.ok) throw new Error('Failed to fetch attendance');
        const data = await res.json();

        setLoggedIn(data.loggedIn);
        setAttendance((data.attendance || []).slice().reverse());
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [refreshCount]);

  // Filter attendance by quarter if quarters are present
  let attendanceInQuarter = attendance;
  let currentQuarter = null;
  if (quarters && quarters.length > 0 && selectedQuarterIdx !== -1) {
    currentQuarter = quarters[selectedQuarterIdx] || quarters[0];
    const { start, end } = currentQuarter; attendanceInQuarter = attendance.filter(row => {
      if (!row.date) return false;
      // Use the date directly - our isDateInRange function will parse it
      return isDateInRange(row.date, start, end);
    });
  }

  if (loading) return <div className='flex justify-center items-center min-h-[50vh]'><Spinner /></div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!loggedIn) return <Login onRefresh={() => setRefreshCount(c => c + 1)} />;

  // Calculate stats
  const totalLectures = attendanceInQuarter.length;
  const absent = attendanceInQuarter.filter(row => row.status && row.status.toLowerCase() === 'absent').length;
  const leave = attendanceInQuarter.filter(row => row.status && row.status.toLowerCase() === 'leave').length;
  const present = attendanceInQuarter.filter(row => row.status && row.status.toLowerCase() === 'present').length;
  const percentage = totalLectures > 0 ? (present / (totalLectures - leave) * 100).toFixed(2) : '0.00';

  // Group by subject
  const subjects = Array.from(new Set(attendanceInQuarter.map(row => row.subject)));
  // Calculate percentage for each subject
  const subjectPercentages: Record<string, string> = {};
  subjects.forEach(subject => {
    const subjectRows = attendanceInQuarter.filter(row => row.subject === subject);
    const total = subjectRows.length;
    const present = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'present').length;
    const leave = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'leave').length;
    subjectPercentages[subject] = total > 0 ? (present / (total - leave) * 100).toFixed(2) : '0.00';
  });

  // Calculate summary stats for selected subject
  let selectedStats = null;
  if (selectedSubject) {
    const subjectRows = attendanceInQuarter.filter(row => row.subject === selectedSubject);
    const total = subjectRows.length;
    const present = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'present').length;
    const absent = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'absent').length;
    const leave = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'leave').length;
    const percentage = total > 0 ? (present / (total - leave) * 100).toFixed(2) : '0.00';
    selectedStats = { subject: selectedSubject, total, present, absent, leave, percentage };
  }

  // Filtered attendance for selected subject
  const filteredAttendance = selectedSubject
    ? attendanceInQuarter.filter(row => row.subject === selectedSubject)
    : attendanceInQuarter;

  // Calculate percentage for each quarter
  const quarterPercentages: Record<number, string> = {};
  if (quarters && quarters.length > 0) {
    quarters.forEach((q, idx) => {
      const { start, end } = q;
      const quarterRows = attendance.filter(row => {
        if (!row.date) return false;

        // Use the date directly with our improved isDateInRange function
        return isDateInRange(row.date, start, end);
      });
      const total = quarterRows.length;
      const present = quarterRows.filter(row => row.status && row.status.toLowerCase() === 'present').length;
      const leave = quarterRows.filter(row => row.status && row.status.toLowerCase() === 'leave').length;
      quarterPercentages[idx] = total > 0 ? (present / (total - leave) * 100).toFixed(2) : '0.00';
    });
  }

  return (
    <div className="mt-8 mx-1 mb-4">
      {!isOnline && (
        <div className="flex justify-center items-center mx-2 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-2 mb-6 font-semibold">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-700 mr-2" />
          You are in offline mode. Data may be outdated.
        </div>
      )}
      <div className="flex justify-center mb-4">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-4xl font-bold text-secondary text-center">Attendance</h1>
          {/* Refresh or Offline button styled as icon button */}
          {isOnline ? (
            <button
              className="flex items-center gap-2 px-4 max-[520px]:px-2 py-2 rounded bg-accent text-white font-semibold hover:bg-secondary/80 transition-colors shadow-md"
              onClick={() => setRefreshCount(c => c + 1)}
              title="Refresh attendance"
            >
              <ArrowPathIcon className="w-6 h-6" />
              <span className="hidden min-[520px]:inline">Refresh</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 max-[520px]:px-2 py-2 rounded bg-red-400 text-white font-semibold shadow-md cursor-not-allowed select-none" title="Offline mode">
              <WifiIcon className="w-6 h-6" />
              <span className="hidden min-[520px]:inline">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Quarter filter buttons */}
      {quarters && quarters.length > 0 && (
        <QuarterFilterButtons
          quarters={quarters}
          selectedQuarterIdx={selectedQuarterIdx}
          setSelectedQuarterIdx={setSelectedQuarterIdx}
          quarterPercentages={quarterPercentages}
        />
      )}

      {attendanceInQuarter.length === 0 ? (
        < div className="text-center text-2xl mt-20 font-semibold flex flex-col gap-5 text-secondary/80">
          <span className='text-red-700'>No attendance yet</span>
          <span className='text-xl'>Your attendance record will appear here once uploaded.</span>
        </div>
      ) :
        <>
          {/* Subject filter buttons */}
          <SubjectFilterButtons
            subjects={subjects}
            subjectPercentages={subjectPercentages}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
          />

          <div className='mt-10'>
            <h2 className="text-3xl max-[450px]:text-2xl pt-5 font-bold mb-2 text-secondary text-center border-t border-secondary/20 py-2">{selectedStats?.subject ? selectedStats.subject : 'Total'} Attendance</h2>
          </div>

          {/* Vertical summary table for selected subject only */}
          {
            selectedSubject && selectedStats && (
              <AttendanceSummaryTable stats={selectedStats} />
            )
          }

          {/* Vertical summary table for all subjects */}
          {
            selectedSubject === null && (
              <AttendanceSummaryTable stats={{ total: totalLectures, present, absent, leave, percentage }} />
            )
          }

          <AttendanceTable attendance={filteredAttendance} keyMap={keyMap} />
        </>
      }
    </div >
  );
};

export default Attendance;
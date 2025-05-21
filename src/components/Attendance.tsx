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
import { FetchURL } from './lib/utils';
import { CheckCircleIcon } from '@heroicons/react/16/solid';

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
  const [backgroundFetching, setBackgroundFetching] = useState(false);
  const [refreshClicked, setRefreshClicked] = useState(false);
  const [dataUpdated, setDataUpdated] = useState(false);
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

  const getMatchingCache = async (prefix: string) => {
    if (!('caches' in window)) return null;

    const cacheNames = await caches.keys();
    const matchingName = cacheNames.find(name => name.startsWith(prefix));

    if (matchingName) {
      return await caches.open(matchingName);
    }

    return null;
  };

  const getCachedAttendance = async () => {
    const cache = await getMatchingCache('apis');
    if (cache) {
      const cachedResponse = await cache.match(FetchURL);
      if (cachedResponse) {
        const data = await cachedResponse.json();
        return data;
      }
    }
    return null;
  };

  useEffect(() => {
    const actuallyOnline = typeof navigator !== 'undefined' ? navigator.onLine : isOnline;
    const FetchOnFirstPageLoad = sessionStorage.getItem("FetchOnFirstPageLoad");
    let hasCachedData = false;

    const loadFromCacheIfAvailable = async () => {
      const cachedData = await getCachedAttendance();

      if (cachedData?.attendance) {
        setAttendance(cachedData.attendance.slice().reverse());
        setLoggedIn(cachedData.loggedIn ?? true);
        hasCachedData = true;
      }
    };

    const fetchFreshAttendance = async () => {
      if ((refreshClicked || FetchOnFirstPageLoad === null) && actuallyOnline) {
        try {
          setBackgroundFetching(true);
          const res = await fetch(`${FetchURL}`, {
            method: 'GET',
            credentials: 'include',
          });

          if (!res.ok) throw new Error('Failed to fetch attendance');
          const data = await res.json();

          if (data.attendance && data.loggedIn) {
            setLoggedIn(data.loggedIn);
            setAttendance(data.attendance.slice().reverse());
            sessionStorage.setItem("FetchOnFirstPageLoad", "false");
            setDataUpdated(true);

            // if ('caches' in window) {
            //   const cache = await caches.open('data-cache-v1');
            //   await cache.put(
            //     FetchURL,
            //     new Response(JSON.stringify(data), {
            //       headers: { 'Content-Type': 'application/json' },
            //     })
            //   );
            // }
          } else {
            setLoggedIn(false);
            setAttendance([]);
          }
        } catch (err: any) {
          setError(err.message || 'Unknown error');
        } finally {
          setLoading(false);
          setBackgroundFetching(false);
          setRefreshClicked(false);
        }
      } else {
        await loadFromCacheIfAvailable();
        setLoading(false);
      }
    };

    const load = async () => {

      if (FetchOnFirstPageLoad === null) {
        // Show cache quickly (if available), then fetch fresh in background
        await loadFromCacheIfAvailable();
        setLoading(hasCachedData ? false : true);
        fetchFreshAttendance(); // no await — fire and forget
      } else {
        await fetchFreshAttendance();
      }
    };

    load();
  }, [refreshClicked]);

  // Add useEffect to auto-hide the message after 2 seconds
  useEffect(() => {
    if (dataUpdated) {
      const timer = setTimeout(() => setDataUpdated(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [dataUpdated]);

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
  if (error) {
    return (
      <div className='flex flex-col gap-3 justify-center items-center'>
        <div className="text-center font-semibold text-2xl mt-8 text-red-500">{error}</div>
        <button className="mt-4 px-2 py-1 bg-primary text-white rounded hover:bg-secondary/80 transition-colors shadow-md"
          onClick={() => {
            sessionStorage.removeItem("FetchOnFirstPageLoad");
            window.location.reload()
          }}
        >
          Retry
        </button>
        {/* Add other button to clear everything */}
        <button
          className="px-2 py-1 mt-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors shadow-md"
          onClick={() => {
            sessionStorage.clear();
            localStorage.clear();
            if ('caches' in window) {
              caches.keys().then(names => {
                for (const name of names) caches.delete(name);
              });
            }
            window.location.reload();
          }}
        >
          Clear All Data
        </button>
      </div>
    );
  }
  if (!loggedIn) return <Login onRefresh={() => {
    setLoading(true);
    setRefreshClicked(true);
  }} />;

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
      {/* Data Updated message */}
      {dataUpdated && (
        <div className="fixed left-1/2 -translate-x-1/2 flex items-center justify-center w-auto top-7 z-[102]">
          <div className='flex flex-row gap-x-2 min-w-[250px] items-center justify-center bg-green-200 text-green-700 px-4 py-3 rounded-lg shadow-xl font-semibold animate-fade-in-out'>Data updated successfully <CheckCircleIcon className="w-5 h-5 text-green-700" /></div>
        </div>
      )}

      {!isOnline && (
        <div className="flex justify-center items-center mx-2 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-2 mb-6 font-semibold">
          <ExclamationTriangleIcon className="min-w-6 min-h-6 text-yellow-700 mr-2" />
          You are in offline mode. Data may be outdated.
        </div>
      )}
      <div className="flex justify-center mb-4">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-4xl font-bold text-secondary text-center">Attendance</h1>
          {/* Refresh or Offline button styled as icon button */}
          {isOnline ? (
            <button
              className="flex items-center gap-2 px-4 max-[520px]:px-2 py-2 rounded bg-accent disabled:bg-accent/70 text-white font-semibold hover:bg-secondary/80 transition-colors shadow-md"
              onClick={() => {
                setRefreshClicked(true);
              }}
              title="Refresh attendance"
              disabled={backgroundFetching}
            >
              <ArrowPathIcon className={`w-6 h-6 ${backgroundFetching && 'animate-spin'}`} />
              <span className="hidden min-[520px]:inline">{backgroundFetching ? 'Refreshing...' : 'Refresh'}</span>
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

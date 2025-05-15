'use client';

import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';

export interface AttendanceRow {
  rowNumber: string;
  subject: string;
  lectureType: string;
  teacher: string;
  lectureTime: string;
  date: string;
  status: string;
}

const keyMap = {
  rowNumber: 'Sr#',
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch('/api/attendance', {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch attendance');
        const attendancejson = await res.json();
        setAttendance(attendancejson.attendance || []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) return <div className='flex justify-center items-center min-h-[50vh]'><Spinner /></div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (attendance.length === 0) return <div className="text-center mt-8">No attendance data found.</div>;

  // Calculate stats
  const totalLectures = attendance.length;
  const absent = attendance.filter(row => row.status && row.status.toLowerCase() === 'absent').length;
  const leave = attendance.filter(row => row.status && row.status.toLowerCase() === 'leave').length;
  const present = attendance.filter(row => row.status && row.status.toLowerCase() === 'present').length;
  const percentage = totalLectures > 0 ? ((present + leave) / totalLectures * 100).toFixed(2) : '0.00';

  return (
    <div className="mt-8 mx-1 mb-4">
      <h1 className="text-4xl font-bold mb-4 text-secondary text-center">Attendance</h1>

      {/* Summary Table (now the only summary display) */}
      <div className="overflow-x-auto rounded-lg shadow border border-secondary/30 bg-white mb-6 max-w-md mx-auto">
        <table className="min-w-full divide-y divide-secondary/20">
          <thead className="bg-secondary/10">
            <tr>
              <th className="p-2 text-left text-xs font-extrabold tracking-wider text-white border-b bg-secondary border-secondary/20">Type</th>
              <th className="p-2 text-left text-xs font-extrabold tracking-wider text-white border-b bg-secondary border-secondary/20">Count</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary/10">
            <tr className="border-b border-secondary/20">
              <td className="p-2 text-sm text-primary">Total Lectures</td>
              <td className="p-2 text-sm text-primary">{totalLectures}</td>
            </tr>
            <tr className="border-b border-secondary/20">
              <td className="p-2 text-sm text-primary">Present</td>
              <td className="p-2 text-sm text-primary">{present}</td>
            </tr>
            <tr className="border-b border-secondary/20">
              <td className="p-2 text-sm text-primary">Absent</td>
              <td className="p-2 text-sm text-primary">{absent}</td>
            </tr>
            <tr className="border-b border-secondary/20">
              <td className="p-2 text-sm text-primary">Leave</td>
              <td className="p-2 text-sm text-primary">{leave}</td>
            </tr>
            <tr>
              <td className="p-2 text-sm text-primary">Percentage</td>
              <td className="p-2 text-sm text-primary">{percentage}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto rounded-lg shadow-lg border border-secondary/30 bg-white">
        <table className="min-w-full divide-y divide-secondary/20">
          <thead className="bg-secondary/10 sticky top-0 z-10">
            <tr>
              {Object.keys(attendance[0]).map((key, index, arr) => {
                // Use keyMap for header display, fallback to raw key if not found
                const formattedKey = (keyMap as Record<string, string>)[key] || key;
                return (
                  <th
                    key={key}
                    className={`p-2 text-left text-xs font-extrabold tracking-wider text-white border-b bg-secondary border-secondary/20 ${index < arr.length - 1 ? 'border-r border-secondary/20' : ''}`}
                  >
                    {formattedKey}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary/10">
            {attendance.map((row, idx) => {
              // Determine if the status is 'absent' (case-insensitive)
              const statusValue = row.status ? String(row.status).toLowerCase() : '';
              const isAbsent = statusValue === 'absent';
              const isLeave = statusValue === 'leave';

              const rowClass = isAbsent
                ? 'bg-red-100 hover:bg-red-200 transition-colors' // Absent rows
                : isLeave
                  ? 'bg-green-100 hover:bg-green-200 transition-colors' // Leave rows
                  : 'bg-white hover:bg-accent/10 transition-colors'; // Other rows

              return (
                <tr
                  key={idx}
                  className={rowClass}
                >
                  {Object.values(row).map((val, i, arr) => (
                    <td
                      key={i}
                      className={`p-2 text-sm text-primary border-b border-secondary/10 ${i < arr.length - 1 ? 'border-r border-secondary/10' : ''}`}
                    >
                      {String(val)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;

'use client';

import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';

export interface AttendanceRow {
  subject: string;
  lectureType: string;
  teacher: string;
  lectureTime: string;
  date: string;
  status: string;
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
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

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

  // Group by subject
  const subjects = Array.from(new Set(attendance.map(row => row.subject)));
  // Calculate percentage for each subject
  const subjectPercentages: Record<string, string> = {};
  subjects.forEach(subject => {
    const subjectRows = attendance.filter(row => row.subject === subject);
    const total = subjectRows.length;
    const present = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'present').length;
    const leave = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'leave').length;
    subjectPercentages[subject] = total > 0 ? ((present + leave) / total * 100).toFixed(2) : '0.00';
  });

  // Calculate summary stats for selected subject
  let selectedStats = null;
  if (selectedSubject) {
    const subjectRows = attendance.filter(row => row.subject === selectedSubject);
    const total = subjectRows.length;
    const present = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'present').length;
    const absent = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'absent').length;
    const leave = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'leave').length;
    const percentage = total > 0 ? ((present + leave) / total * 100).toFixed(2) : '0.00';
    selectedStats = { subject: selectedSubject, total, present, absent, leave, percentage };
  }

  // Filtered attendance for selected subject
  const filteredAttendance = selectedSubject
    ? attendance.filter(row => row.subject === selectedSubject)
    : attendance;

  return (
    <div className="mt-8 mx-1 mb-4">
      <h1 className="text-4xl font-bold mb-4 text-secondary text-center">Attendance</h1>

      {/* Subject filter buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded font-semibold border transition-colors ${selectedSubject === null ? 'bg-secondary text-white border-secondary' : 'bg-white text-secondary border-secondary/50 hover:bg-secondary/10'}`}
          onClick={() => setSelectedSubject(null)}
        >
          All Subjects
        </button>
        {subjects.map(subject => {
          const percent = parseFloat(subjectPercentages[subject]);
          const isLow = percent < 85;
          return (
            <button
              key={subject}
              className={`px-4 py-2 rounded font-semibold border transition-colors ${selectedSubject === subject
                ? 'bg-secondary text-white border-secondary'
                : isLow
                  ? 'bg-red-300 text-white border-red-500 hover:bg-red-600'
                  : 'bg-white text-secondary border-secondary/50 hover:bg-secondary/10'}`}
              onClick={() => setSelectedSubject(subject)}
            >
              {subject} <span className={`ml-2 text-xs ${selectedSubject === subject ? 'text-white' : isLow ? 'text-white' : 'text-secondary'}`}>({subjectPercentages[subject]}%)</span>
            </button>
          );
        })}
      </div>

      <div className='mt-10'>
        <h2 className="text-3xl max-[450px]:text-2xl pt-5 font-bold mb-2 text-secondary text-center border-t border-secondary/20 py-2">{selectedStats?.subject ? selectedStats.subject : 'Total'} Attendance</h2>
      </div>

      {/* Vertical summary table for selected subject only */}
      {selectedSubject && selectedStats && (
        <div className="flex justify-center mb-6">
          <div className="overflow-x-auto rounded-lg shadow border border-secondary/30 bg-white min-w-[260px]">
            <table className="min-w-[260px] divide-y divide-secondary/20">
              <thead className="bg-secondary">
                <tr>
                  <th className="p-2 text-left text-xs font-extrabold tracking-wider text-white border-b border-secondary/20 border-r-gray-400 border-r-2">Type</th>
                  <th className="p-2 text-left text-xs font-extrabold tracking-wider text-white border-b border-secondary/20">Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary/10">
                <tr>
                  <td className="p-2 text-sm font-bold text-primary border-r-2 border-secondary/20">Total</td>
                  <td className="p-2 text-sm text-primary">{selectedStats.total}</td>
                </tr>
                <tr>
                  <td className="p-2 text-sm font-bold text-primary border-r-2 border-secondary/20">Present</td>
                  <td className="p-2 text-sm text-primary">{selectedStats.present}</td>
                </tr>
                <tr>
                  <td className="p-2 text-sm font-bold text-primary border-r-2 border-secondary/20">Absent</td>
                  <td className="p-2 text-sm text-primary">{selectedStats.absent}</td>
                </tr>
                <tr>
                  <td className="p-2 text-sm font-bold text-primary border-r-2 border-secondary/20">Leave</td>
                  <td className="p-2 text-sm text-primary">{selectedStats.leave}</td>
                </tr>
                <tr>
                  <td className="p-2 text-sm font-bold text-primary border-r-2 border-secondary/20">%</td>
                  <td className="p-2 text-sm text-primary">{selectedStats.percentage}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vertical summary table for all subjects */}
      {selectedSubject === null && (
        <div className="flex justify-center mb-6">
          <div className="overflow-x-auto rounded-lg shadow border border-secondary/30 bg-white min-w-[260px]">
            <table className="min-w-[260px] divide-y divide-secondary/20">
              <thead className="bg-secondary">
                <tr>
                  <th className="p-2 text-left text-xs font-extrabold tracking-wider text-white border-b border-secondary/20 border-r-gray-400 border-r-2">Type</th>
                  <th className="p-2 text-left text-xs font-extrabold tracking-wider text-white border-b border-secondary/20">Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary/10">
                <tr>
                  <td className="p-2 text-sm font-bold text-primary border-r-2 border-secondary/20">Total</td>
                  <td className="p-2 text-sm text-primary">{totalLectures}</td>
                </tr>
                <tr>
                  <td className="p-2 text-sm font-bold text-primary border-r-2 border-secondary/20">Present</td>
                  <td className="p-2 text-sm text-primary">{present}</td>
                </tr>
                <tr>
                  <td className="p-2 text-sm font-bold text-primary border-r-2 border-secondary/20">Absent</td>
                  <td className="p-2 text-sm text-primary">{absent}</td>
                </tr>
                <tr>
                  <td className="p-2 text-sm font-bold text-primary border-r-2 border-secondary/20">Leave</td>
                  <td className="p-2 text-sm text-primary">{leave}</td>
                </tr>
                <tr>
                  <td className="p-2 text-sm font-bold text-primary border-r-2 border-secondary/20">%</td>
                  <td className="p-2 text-sm text-primary">{percentage}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg shadow-lg border border-secondary/30 bg-white">
        <table className="min-w-full divide-y divide-secondary/20">
          <thead className="bg-secondary/10 sticky top-0 z-10">
            <tr>
              <th className="p-1 text-center font-extrabold tracking-wider text-white border-b bg-secondary border-secondary/20 border-r">#</th>
              {Object.keys(filteredAttendance[0] || attendance[0] || {}).map((key, index, arr) => {
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
            {filteredAttendance.map((row, idx) => {
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
                  <td
                    className="p-1 text-sm text-primary border-b border-secondary/10 border-r font-bold text-center"
                  >
                    {idx + 1}
                  </td>
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

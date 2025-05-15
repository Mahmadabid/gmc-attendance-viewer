'use client';

import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';
import SubjectFilterButtons from './attendance/SubjectFilterButtons';
import AttendanceSummaryTable from './attendance/AttendanceSummaryTable';
import AttendanceTable from './attendance/AttendanceTable';

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
  const percentage = totalLectures > 0 ? (present / (totalLectures - leave) * 100).toFixed(2) : '0.00';

  // Group by subject
  const subjects = Array.from(new Set(attendance.map(row => row.subject)));
  // Calculate percentage for each subject
  const subjectPercentages: Record<string, string> = {};
  subjects.forEach(subject => {
    const subjectRows = attendance.filter(row => row.subject === subject);
    const total = subjectRows.length;
    const present = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'present').length;
    const leave = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'leave').length;
    subjectPercentages[subject] = total > 0 ? (present / (total - leave) * 100).toFixed(2) : '0.00';
  });

  // Calculate summary stats for selected subject
  let selectedStats = null;
  if (selectedSubject) {
    const subjectRows = attendance.filter(row => row.subject === selectedSubject);
    const total = subjectRows.length;
    const present = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'present').length;
    const absent = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'absent').length;
    const leave = subjectRows.filter(row => row.status && row.status.toLowerCase() === 'leave').length;
    const percentage = total > 0 ? (present / (total - leave) * 100).toFixed(2) : '0.00';
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
      {selectedSubject && selectedStats && (
        <AttendanceSummaryTable stats={selectedStats} />
      )}

      {/* Vertical summary table for all subjects */}
      {selectedSubject === null && (
        <AttendanceSummaryTable stats={{ total: totalLectures, present, absent, leave, percentage }} />
      )}

      <AttendanceTable attendance={filteredAttendance} keyMap={keyMap} />
    </div>
  );
};

export default Attendance;

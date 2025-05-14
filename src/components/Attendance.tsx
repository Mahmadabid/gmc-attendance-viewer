import React, { useEffect, useState } from 'react';

const Attendance: React.FC = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
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

  if (loading) return <div className="text-center mt-8">Loading attendance...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (attendance.length === 0) return <div className="text-center mt-8">No attendance data found.</div>;

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4 text-secondary text-center">Attendance</h3>
      <div className="overflow-x-auto rounded-lg shadow-lg border border-secondary/30 bg-white">
        <table className="min-w-full divide-y divide-secondary/20">
          <thead className="bg-secondary/10">
            <tr>
              {Object.keys(attendance[0]).map((key) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-secondary border-b border-secondary/20"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary/10">
            {attendance.map((row, idx) => (
              <tr
                key={idx}
                className={
                  idx % 2 === 0
                    ? 'bg-secondary/5 hover:bg-accent/10 transition-colors'
                    : 'bg-white hover:bg-accent/10 transition-colors'
                }
              >
                {Object.values(row).map((val, i) => (
                  <td
                    key={i}
                    className="px-6 py-3 text-sm text-primary border-b border-secondary/10"
                  >
                    {String(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;

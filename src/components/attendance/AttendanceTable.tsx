// AttendanceTable.tsx
import React from 'react';
import { AttendanceRow } from '../Attendance';

interface AttendanceTableProps {
  attendance: AttendanceRow[];
  keyMap: Record<string, string>;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ attendance, keyMap }) => {
  if (!attendance.length) return null;
  return (
    <div className="overflow-x-auto rounded-lg shadow-lg border border-secondary/30 bg-white">
      <table className="min-w-full divide-y divide-secondary/20">
        <thead className="bg-secondary/10 sticky top-0 z-10">
          <tr>
            <th className="p-1 text-center font-extrabold tracking-wider text-white border-b bg-secondary border-secondary/20 border-r">#</th>
            {Object.keys(attendance[0] || {}).map((key, index, arr) => {
              const formattedKey = keyMap[key] || key;
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
            const statusValue = row.status ? String(row.status).toLowerCase() : '';
            const isAbsent = statusValue === 'absent';
            const isLeave = statusValue === 'leave';
            const rowClass = isAbsent
              ? 'bg-red-100 hover:bg-red-200 transition-colors'
              : isLeave
                ? 'bg-green-100 hover:bg-green-200 transition-colors'
                : 'bg-white hover:bg-accent/10 transition-colors';
            return (
              <tr key={idx} className={rowClass}>
                <td className="p-1 text-sm text-primary border-b border-secondary/10 border-r font-bold text-center">{idx + 1}</td>
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
  );
};

export default AttendanceTable;

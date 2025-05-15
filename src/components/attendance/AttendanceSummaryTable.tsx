// AttendanceSummaryTable.tsx
import React from 'react';

interface AttendanceSummaryTableProps {
  stats: { total: number; present: number; absent: number; leave: number; percentage: string; subject?: string };
}

const AttendanceSummaryTable: React.FC<AttendanceSummaryTableProps> = ({ stats }) => (
  <div className="flex justify-center mb-6">
    <div className="overflow-x-auto rounded-lg shadow border border-secondary/30 bg-white min-w-[260px]">
      <table className="min-w-[260px] divide-y divide-secondary/20">
        <thead className="bg-secondary">
          <tr>
            <th className="p-2 text-left text-xs font-extrabold tracking-wider text-white border-b border-secondary/20 border-r-gray-400 border-r">Type</th>
            <th className="p-2 text-left text-xs font-extrabold tracking-wider text-white border-b border-secondary/20">Count</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-secondary/10">
          <tr>
            <td className="p-2 text-sm font-bold text-primary border-r border-secondary/20">Total</td>
            <td className="p-2 text-sm text-primary">{stats.total}</td>
          </tr>
          <tr>
            <td className="p-2 text-sm font-bold text-primary border-r border-secondary/20">Present</td>
            <td className="p-2 text-sm text-primary">{stats.present}</td>
          </tr>
          <tr>
            <td className="p-2 text-sm font-bold text-primary border-r border-secondary/20">Absent</td>
            <td className="p-2 text-sm text-primary">{stats.absent}</td>
          </tr>
          <tr>
            <td className="p-2 text-sm font-bold text-primary border-r border-secondary/20">Leave</td>
            <td className="p-2 text-sm text-primary">{stats.leave}</td>
          </tr>
          <tr>
            <td className="p-2 text-sm font-bold text-primary border-r border-secondary/20">%</td>
            <td className="p-2 text-sm text-primary">{stats.percentage}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default AttendanceSummaryTable;

// AttendanceTable.tsx
import React from 'react';
import { AttendanceRow } from '../Attendance';

interface AttendanceTableProps {
  attendance: AttendanceRow[];
  keyMap: Record<string, string>;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ attendance, keyMap }) => {
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(100);
  const pageCount = Math.ceil(attendance.length / pageSize);
  const paginatedAttendance = attendance.slice(page * pageSize, (page + 1) * pageSize);

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
          {paginatedAttendance.map((row, idx) => {
            const statusValue = row.status ? String(row.status).toLowerCase() : '';
            const isAbsent = statusValue === 'absent';
            const isLeave = statusValue === 'leave';
            const rowClass = isAbsent
              ? 'bg-red-100 hover:bg-red-200 transition-colors'
              : isLeave
                ? 'bg-emerald-50 hover:bg-emerald-100 transition-colors'
                : 'bg-white hover:bg-sky-50 transition-colors';
            return (
              <tr key={idx + page * pageSize} className={rowClass}>
                <td className="p-1 text-sm text-primary border-b border-secondary/10 border-r font-bold text-center">{idx + 1 + page * pageSize}</td>
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
      <div className="flex flex-col min-[580px]:flex-row justify-between mx-1 items-center gap-4 py-3 px-2 bg-gray-50 border-t border-secondary/20">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-gray-700">
            Records: {page * pageSize + 1} to {Math.min((page + 1) * pageSize, attendance.length)} of {attendance.length}
          </span>
          <div className="flex items-center ml-2 gap-2">
            <label htmlFor="pageSize" className="font-medium text-secondary">Show:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setPageSize(newSize);
                setPage(0); // Reset to first page when changing page size
              }}
              className="border border-secondary/30 rounded px-2 py-1 outline-0 focus:ring-0 bg-white text-secondary cursor-pointer"
            >
              {[50, 100, 200, 500].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex text-sm items-center gap-2">
          <button
            className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-white font-medium disabled:opacity-40 transition-colors"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            title="Previous page"
          >
            Previous
          </button>

          {/* Smart pagination with ellipsis */}
          {(() => {
            const visiblePages = 5; // Number of pages to show at once
            const pages = [];

            // Always show first page
            if (pageCount > 0) {
              pages.push(
                <button
                  key={0}
                  className={`w-6 h-6 rounded-md font-medium transition-colors ${0 === page ? 'bg-secondary text-white shadow-sm' : 'bg-gray-200 hover:bg-accent hover:text-white text-secondary'}`}
                  onClick={() => setPage(0)}
                >
                  1
                </button>
              );
            }

            // Calculate range of pages to show
            let startPage = Math.max(1, page - Math.floor(visiblePages / 2));
            let endPage = Math.min(pageCount - 2, startPage + visiblePages - 3);

            if (endPage - startPage < visiblePages - 3) {
              startPage = Math.max(1, endPage - visiblePages + 3);
            }

            // Show ellipsis after first page if needed
            if (startPage > 1) {
              pages.push(<span key="ellipsis1" className="px-1 text-gray-500">...</span>);
            }

            // Show middle pages
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  className={`w-6 h-6 rounded-md font-medium transition-colors ${i === page ? 'bg-secondary text-white shadow-sm' : 'bg-gray-200 hover:bg-accent hover:text-white text-secondary'}`}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              );
            }

            // Show ellipsis before last page if needed
            if (endPage < pageCount - 2) {
              pages.push(<span key="ellipsis2" className="px-1 text-gray-500">...</span>);
            }

            // Always show last page if there is more than one page
            if (pageCount > 1) {
              pages.push(
                <button
                  key={pageCount - 1}
                  className={`w-6 h-6 rounded-md font-medium transition-colors ${pageCount - 1 === page ? 'bg-secondary text-white shadow-sm' : 'bg-gray-200 hover:bg-accent hover:text-white text-secondary'}`}
                  onClick={() => setPage(pageCount - 1)}
                >
                  {pageCount}
                </button>
              );
            }

            return pages;
          })()}

          <button
            className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-white font-medium disabled:opacity-40 transition-colors"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            title="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;

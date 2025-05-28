// AttendanceTable.tsx
import React from 'react';
import { AttendanceRow } from '../Attendance';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AttendanceTableProps {
  attendance: AttendanceRow[];
  keyMap: Record<string, string>;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ attendance, keyMap }) => {
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('attendanceTablePageSize');
      return saved ? parseInt(saved, 10) : 100;
    }
    return 100;
  }); const [searchTerm, setSearchTerm] = React.useState('');
  const [searchAll, setSearchAll] = React.useState(false);

  // Filter attendance based on search
  const filteredAttendance = React.useMemo(() => {
    if (!searchTerm.trim()) return attendance;

    const searchLower = searchTerm.toLowerCase();

    return attendance.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }, [attendance, searchTerm]);

  // Get data to paginate - use filtered data only when "Search all" is checked
  const dataToShow = searchTerm.trim() && searchAll ? filteredAttendance : attendance;
  const pageCount = Math.ceil(dataToShow.length / pageSize);
  // Get current page data
  const paginatedAttendance = React.useMemo(() => {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;

    if (searchTerm.trim() && !searchAll) {
      // Search only within current page
      const currentPageData = dataToShow.slice(startIndex, endIndex);
      const searchLower = searchTerm.toLowerCase();

      // Filter and keep track of original indices
      return currentPageData
        .map((row, originalIdx) => ({ row, originalIndex: startIndex + originalIdx }))
        .filter(({ row }) =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchLower)
          )
        );
    }

    // For normal pagination or "search all" mode
    return dataToShow.slice(startIndex, endIndex).map((row, idx) => ({
      row,
      originalIndex: searchTerm.trim() && searchAll ? -1 : startIndex + idx // -1 indicates filtered data with new indices
    }));
  }, [dataToShow, page, pageSize, searchTerm, searchAll]);// Reset page when search changes or pageSize changes

  React.useEffect(() => {
    setPage(0);
  }, [pageSize, searchAll]);

  // Save pageSize to localStorage when it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('attendanceTablePageSize', pageSize.toString());
    }
  }, [pageSize]);

  if (!attendance.length) return null;
  return (
    <div className="overflow-x-auto rounded-lg shadow-lg border border-secondary/30 bg-white">      {/* Search Controls */}
      <div className="p-4 bg-gray-50 border-b border-secondary/20">
        <div className="flex flex-row max-[400px]:flex-col gap-3 justify-start">
          <div className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search attendance records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 bg-white py-2 border border-secondary/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 text-gray-400"
                title="Clear search"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <input
              type="checkbox"
              id="searchAll"
              checked={searchAll}
              onChange={(e) => setSearchAll(e.target.checked)}
              className="rounded border-secondary/40 text-accent focus:ring-accent cursor-pointer"
            />
            <label htmlFor="searchAll" className="cursor-pointer text-gray-700 font-medium">
              Search all
            </label>
          </div>
        </div>
        {searchTerm.trim() && (
          <div className="mt-2 text-xs text-gray-600">
            {searchAll ? (
              <>Searching all {filteredAttendance.length} records (filtered from {attendance.length} total)</>
            ) : (
              <>Searching within current page only • {paginatedAttendance.length} matches found</>
            )}
          </div>
        )}
      </div>

      <table className="min-w-full divide-y divide-secondary/20">
        <thead className="bg-secondary/10 sticky top-0 z-10"><tr>
          <th className="p-1 text-center font-extrabold tracking-wider text-white border-b bg-secondary border-secondary/20 border-r">#</th>{Object.keys(attendance[0] || {}).map((key, index, arr) => {
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
        <tbody className="bg-white divide-y divide-secondary/10">{paginatedAttendance.map(({ row, originalIndex }, idx) => {
          const statusValue = row.status ? String(row.status).toLowerCase() : '';
          const isAbsent = statusValue === 'absent';
          const isLeave = statusValue === 'leave';
          const rowClass = isAbsent
            ? 'bg-red-100 hover:bg-red-200 transition-colors'
            : isLeave
              ? 'bg-emerald-50 hover:bg-emerald-100 transition-colors'
              : 'bg-white hover:bg-sky-50 transition-colors';
          // Calculate display number: use originalIndex when available, otherwise use standard pagination numbering
          const displayNumber = originalIndex >= 0 ? originalIndex + 1 : idx + 1 + page * pageSize;
          return (
            <tr key={originalIndex >= 0 ? originalIndex : idx + page * pageSize} className={rowClass}><td className="p-1 text-sm text-primary border-b border-secondary/10 border-r font-bold text-center">{displayNumber}</td>{Object.values(row).map((val, i, arr) => (
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
            Records: {page * pageSize + 1} to {Math.min((page + 1) * pageSize, dataToShow.length)} of {dataToShow.length}
            {searchTerm.trim() && dataToShow.length !== attendance.length && (
              <span className="text-gray-500 ml-1">(filtered from {attendance.length})</span>
            )}
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
            const currentPageCount = searchTerm.trim() && searchAll ? Math.ceil(filteredAttendance.length / pageSize) : pageCount;

            // Always show first page
            if (currentPageCount > 0) {
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
            let endPage = Math.min(currentPageCount - 2, startPage + visiblePages - 3);

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
            if (endPage < currentPageCount - 2) {
              pages.push(<span key="ellipsis2" className="px-1 text-gray-500">...</span>);
            }

            // Always show last page if there is more than one page
            if (currentPageCount > 1) {
              pages.push(
                <button
                  key={currentPageCount - 1}
                  className={`w-6 h-6 rounded-md font-medium transition-colors ${currentPageCount - 1 === page ? 'bg-secondary text-white shadow-sm' : 'bg-gray-200 hover:bg-accent hover:text-white text-secondary'}`}
                  onClick={() => setPage(currentPageCount - 1)}
                >
                  {currentPageCount}
                </button>
              );
            }

            return pages;
          })()}
          <button
            className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-white font-medium disabled:opacity-40 transition-colors"
            onClick={() => setPage((p) => Math.min((searchTerm.trim() && searchAll ? Math.ceil(filteredAttendance.length / pageSize) : pageCount) - 1, p + 1))}
            disabled={page >= (searchTerm.trim() && searchAll ? Math.ceil(filteredAttendance.length / pageSize) : pageCount) - 1}
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

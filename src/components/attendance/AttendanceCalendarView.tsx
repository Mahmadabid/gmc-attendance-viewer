// AttendanceCalendarView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { AttendanceRow } from '../Attendance';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AttendanceCalendarViewProps {
    attendance: AttendanceRow[];
    selectedSubject?: string | null;
}

interface DayAttendance {
    date: string;
    attendanceRecords: AttendanceRow[];
    totalClasses: number;
    presentClasses: number;
    absentClasses: number;
    leaveClasses: number;
    status: 'present' | 'absent' | 'mixed' | 'leave-only' | 'no-classes';
}

interface DayDetailModalProps {
    dayAttendance: DayAttendance | null;
    onClose: () => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ dayAttendance, onClose }) => {
    if (!dayAttendance) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Attendance for {dayAttendance.date}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="mb-4 text-sm text-gray-600">
                        Total Classes: {dayAttendance.totalClasses} |
                        Present: {dayAttendance.presentClasses} |
                        Absent: {dayAttendance.absentClasses} |
                        Leave: {dayAttendance.leaveClasses}
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {dayAttendance.attendanceRecords.map((record, idx) => (
                            <div
                                key={idx} className={`p-3 rounded-md border ${record.status.toLowerCase() === 'present'
                                        ? 'bg-green-50 border-green-200'
                                        : record.status.toLowerCase() === 'absent'
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-blue-50 border-blue-200'
                                    }`}
                            >
                                <div className="font-medium text-gray-900">{record.subject}</div>
                                <div className="text-sm text-gray-600">
                                    {record.lectureType} • {record.teacher}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {record.lectureTime}
                                </div>
                                <div className={`text-sm font-medium mt-1 ${record.status.toLowerCase() === 'present'
                                        ? 'text-green-700'
                                        : record.status.toLowerCase() === 'absent'
                                            ? 'text-red-700'
                                            : 'text-blue-700'
                                    }`}>
                                    {record.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AttendanceCalendarView: React.FC<AttendanceCalendarViewProps> = ({ attendance, selectedSubject }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(null);

    // Effect to navigate to a month with data when subject filter changes
    useEffect(() => {
        if (selectedSubject && attendance.length > 0) {
            // Find the most recent date in the filtered attendance
            const sortedDates = attendance
                .map(record => parseDate(record.date))
                .filter((date): date is Date => date !== null)
                .sort((a, b) => b.getTime() - a.getTime()); // Sort descending (newest first)
            
            if (sortedDates.length > 0) {
                setCurrentDate(sortedDates[0]);
            }
        }
    }, [selectedSubject, attendance]);

    // Parse date from DD/MM/YYYY format
    const parseDate = (dateStr: string): Date | null => {
        try {
            const parts = dateStr.split('/');
            if (parts.length !== 3) return null;

            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(parts[2], 10);

            return new Date(year, month, day);
        } catch {
            return null;
        }
    };
    // Get calendar data for current month
    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

        // Group attendance by date
        const attendanceByDate: Record<string, AttendanceRow[]> = {};

        // Process the attendance data (which should already be filtered)
        attendance.forEach(record => {
            const recordDate = parseDate(record.date);
            if (recordDate && recordDate.getMonth() === month && recordDate.getFullYear() === year) {
                const dateKey = recordDate.getDate().toString();
                if (!attendanceByDate[dateKey]) {
                    attendanceByDate[dateKey] = [];
                }
                attendanceByDate[dateKey].push(record);
            }
        });

        // Create calendar grid
        const weeks: (DayAttendance | null)[][] = [];
        let currentWeek: (DayAttendance | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            currentWeek.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayRecords = attendanceByDate[day.toString()] || [];
            const totalClasses = dayRecords.length;
            const presentClasses = dayRecords.filter(r => r.status.toLowerCase() === 'present').length;
            const absentClasses = dayRecords.filter(r => r.status.toLowerCase() === 'absent').length;
            const leaveClasses = dayRecords.filter(r => r.status.toLowerCase() === 'leave').length;

            let status: DayAttendance['status'] = 'no-classes';
            if (totalClasses > 0) {
                if (leaveClasses === totalClasses) {
                    status = 'leave-only';
                } else if (presentClasses > 0 && absentClasses > 0) {
                    status = 'mixed';
                } else if (presentClasses > 0) {
                    status = 'present';
                } else if (absentClasses > 0) {
                    status = 'absent';
                }
            }

            const dayAttendance: DayAttendance = {
                date: `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`,
                attendanceRecords: dayRecords,
                totalClasses,
                presentClasses,
                absentClasses,
                leaveClasses,
                status
            };

            currentWeek.push(dayAttendance);

            // If week is complete, add to weeks array
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Add remaining days to complete the last week
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        return weeks;
    }, [attendance, currentDate]);

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const getDayClassName = (status: DayAttendance['status']) => {
        const baseClasses = "w-full h-10 sm:h-12 rounded-md border-2 transition-all duration-200"; // Added rounded-md and border-2

        switch (status) {
            case 'present':
                return `${baseClasses} bg-green-100 border-green-300 hover:bg-green-200 cursor-pointer hover:scale-105 hover:shadow-md`;
            case 'absent':
                return `${baseClasses} bg-red-100 border-red-300 hover:bg-red-200 cursor-pointer hover:scale-105 hover:shadow-md`;
            case 'mixed':
                return `${baseClasses} bg-yellow-100 border-yellow-300 hover:bg-yellow-200 cursor-pointer hover:scale-105 hover:shadow-md`;
            case 'leave-only':
                return `${baseClasses} bg-blue-100 border-blue-300 hover:bg-blue-200 cursor-pointer hover:scale-105 hover:shadow-md`;
            case 'no-classes':
                return `${baseClasses} bg-gray-50 border-gray-200`; // No hover effects, inherits border-2 and rounded-md
            default:
                return baseClasses;
        }
    };    const getDayNumber = (dayAttendance: DayAttendance) => {
        return dayAttendance.date.split('/')[0];
    };
    
    return (
        <div className="bg-white rounded-lg shadow-lg border border-secondary/30 max-[400px]:p-1 p-3 sm:p-6">            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div className="text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-secondary">{monthName}</h2>
                    {selectedSubject && (
                        <p className="text-sm text-secondary/70 mt-1">
                            Showing: {selectedSubject} ({attendance.length} records)
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 rounded-md bg-secondary hover:bg-secondary/80 text-white transition-colors"
                    >
                        <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 rounded-md bg-secondary hover:bg-secondary/80 text-white transition-colors"
                    >
                        <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="mb-4 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                    <span className="whitespace-nowrap">Present</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                    <span className="whitespace-nowrap">Absent</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                    <span className="whitespace-nowrap">Mixed</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
                    <span className="whitespace-nowrap">Leave</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-50 border-2 border-gray-200 rounded"></div>
                    <span className="whitespace-nowrap">No Classes</span>
                </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-0 mb-2 border-b border-gray-300">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-gray-600 py-1 sm:py-2 text-xs sm:text-sm">
                        {day}
                    </div>
                ))}
            </div>
            {/* Calendar Grid */}
            <div className="space-y-1 sm:space-y-2"> {/* Restored space-y */} 
                {calendarData.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7 gap-1 max-[350px]:gap-0.5 sm:gap-2"> {/* Restored gap and removed borders */}
                        {week.map((dayAttendance, dayIdx) => (
                            <div key={dayIdx} className="h-10 sm:h-12"> {/* Removed cell-specific borders */}
                                {dayAttendance ? (
                                    <div
                                        className={getDayClassName(dayAttendance.status)} // Removed .replace() calls
                                        onClick={() => dayAttendance.totalClasses > 0 && setSelectedDay(dayAttendance)}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <span className="font-semibold text-xs sm:text-sm">
                                                {getDayNumber(dayAttendance)}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-10 sm:h-12"></div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Day Detail Modal */}
            <DayDetailModal
                dayAttendance={selectedDay}
                onClose={() => setSelectedDay(null)}
            />
        </div>
    );
};

export default AttendanceCalendarView;

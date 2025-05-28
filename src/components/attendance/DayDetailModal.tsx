import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AttendanceRow } from '../Attendance';

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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-2 sm:px-4 md:px-6 py-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-xl shadow-lg w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center max-[320px]:p-2 max-[300px]:p-1 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate pr-2">
                        Attendance for {dayAttendance.date}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                    >
                        <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-grow max-[330px]:p-2 px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {/* Summary */}
                    <div className="bg-gray-50 text-sm text-gray-700 rounded-lg px-3 py-2 flex flex-wrap gap-3 justify-around">
                        <div><span className="font-medium">Total:</span> {dayAttendance.totalClasses}</div>
                        <div><span className="font-medium text-green-700">Present:</span> {dayAttendance.presentClasses}</div>
                        <div><span className="font-medium text-red-700">Absent:</span> {dayAttendance.absentClasses}</div>
                        <div><span className="font-medium text-blue-700">Leave:</span> {dayAttendance.leaveClasses}</div>
                    </div>

                    {/* Records */}
                    {dayAttendance.attendanceRecords.map((record, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all ${record.status.toLowerCase() === 'present'
                                    ? 'bg-green-50 border-green-400 hover:bg-green-100'
                                    : record.status.toLowerCase() === 'absent'
                                        ? 'bg-red-50 border-red-400 hover:bg-red-100'
                                        : 'bg-blue-50 border-blue-400 hover:bg-blue-100'
                                }`}
                        >
                            <div className="flex flex-col gap-1">
                                <div className="font-medium text-gray-900 text-sm">{record.subject}</div>
                                <div className="text-sm text-gray-600 flex flex-wrap gap-1 items-center">
                                    <span className="font-medium">{record.lectureType}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{record.teacher}</span>
                                </div>
                                <div className="text-xs text-gray-500">{record.lectureTime}</div>
                                <div
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${record.status.toLowerCase() === 'present'
                                            ? 'bg-green-100 text-green-800'
                                            : record.status.toLowerCase() === 'absent'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}
                                >
                                    {record.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export type { DayAttendance, DayDetailModalProps };
export default DayDetailModal;

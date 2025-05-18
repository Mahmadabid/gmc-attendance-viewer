import { CalendarDaysIcon, TrashIcon } from "@heroicons/react/24/outline";
import React from "react";

interface QuarterRowProps {
  index: number;
  quarter: { start: string; end: string };
  total: number;
  skipFirstStart: boolean;
  skipLastEnd: boolean;
  onDateChange: (idx: number, field: "start" | "end", value: string) => void;
  onRemove: (idx: number) => void;
  setSkipFirstStart: (val: boolean) => void;
  setSkipLastEnd: (val: boolean) => void;
}

const QuarterRow: React.FC<QuarterRowProps> = ({
  index,
  quarter,
  total,
  skipFirstStart,
  skipLastEnd,
  onDateChange,
  onRemove,
  setSkipFirstStart,
  setSkipLastEnd,
}) => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg border border-secondary/30 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-primary">Quarter {index + 1}</div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 rounded-full hover:bg-danger/10 text-danger transition-colors"
        >
          <TrashIcon className="w-5 h-5 stroke-2" />
        </button>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Start Date */}
        <div className="flex flex-col w-full">
          <label className="flex flex-col text-sm font-medium text-foreground">
            <div className="flex items-center gap-1 mb-1">
              <CalendarDaysIcon className="w-4 h-4 text-secondary" />
              <span>Start Date</span>
            </div>
            {index === 0 && skipFirstStart ? (
              <span className="px-2 py-1.5 rounded bg-secondary/5 text-primary w-full border border-dashed border-secondary/20">
                Start from day 1
              </span>
            ) : (
              <input
                type="date"
                className="px-2 py-1.5 rounded border border-secondary/40 bg-white text-primary focus:outline-none focus:ring-1 focus:ring-primary w-full cursor-pointer"
                value={quarter.start}
                onChange={e => onDateChange(index, 'start', e.target.value)}
                disabled={index === 0 && skipFirstStart}
              />
            )}
          </label>
          {index === 0 && (
            <div className="flex items-center gap-2 mt-1 text-xs">
              <input
                type="checkbox"
                checked={skipFirstStart}
                onChange={e => setSkipFirstStart(e.target.checked)}
                className="cursor-pointer rounded border-secondary/40 text-primary focus:ring-primary"
              />
              <label className="cursor-pointer">Skip first quarter start date</label>
            </div>
          )}
        </div>
        {/* End Date */}
        <div className="flex flex-col w-full">
          <label className="flex flex-col text-sm font-medium text-foreground">
            <div className="flex items-center gap-1 mb-1">
              <CalendarDaysIcon className="w-4 h-4 text-secondary" />
              <span>End Date</span>
            </div>
            {index === total - 1 && total > 1 && skipLastEnd ? (
              <span className="px-2 py-1.5 rounded bg-secondary/5 text-primary w-full border border-dashed border-secondary/20">
                Till last day
              </span>
            ) : (
              <input
                type="date"
                className="px-2 py-1.5 rounded border border-secondary/40 bg-white text-primary focus:outline-none focus:ring-1 focus:ring-primary w-full cursor-pointer"
                value={quarter.end}
                min={quarter.start || undefined}
                onChange={e => onDateChange(index, 'end', e.target.value)}
                disabled={index === total - 1 && total > 1 && skipLastEnd}
              />
            )}
          </label>
          {index === total - 1 && total > 1 && (
            <div className="flex items-center gap-2 mt-1 text-xs">
              <input
                type="checkbox"
                checked={skipLastEnd}
                onChange={e => setSkipLastEnd(e.target.checked)}
                className="cursor-pointer rounded border-secondary/40 text-primary focus:ring-primary"
              />
              <label className="cursor-pointer">Skip last quarter end date</label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuarterRow;

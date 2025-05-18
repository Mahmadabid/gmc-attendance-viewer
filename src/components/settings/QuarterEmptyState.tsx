import { CalendarDaysIcon } from "@heroicons/react/24/solid";
import React from "react";

interface QuarterEmptyStateProps {
  onAddQuarter: () => void;
}

const QuarterEmptyState: React.FC<QuarterEmptyStateProps> = ({ onAddQuarter }) => (
  <div className="text-center py-8 border-2 border-dashed border-secondary/30 rounded-lg">
    <CalendarDaysIcon className="w-12 h-12 mx-auto text-secondary/30 mb-2" />
    <p className="text-secondary/70">No quarters defined yet</p>
    <button
      type="button"
      onClick={onAddQuarter}
      className="mt-4 px-4 py-2 rounded bg-primary text-white hover:bg-secondary transition-colors"
    >
      Add First Quarter
    </button>
  </div>
);

export default QuarterEmptyState;

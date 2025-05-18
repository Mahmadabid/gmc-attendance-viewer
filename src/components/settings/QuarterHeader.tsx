import { ArrowDownOnSquareIcon, ArrowUpOnSquareIcon } from "@heroicons/react/24/solid";
import React from "react";

interface QuarterHeaderProps {
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  hasQuarters: boolean;
}

const QuarterHeader: React.FC<QuarterHeaderProps> = ({ onImport, onExport, hasQuarters }) => (
  <div className="flex justify-between items-center">
    <h2 className="text-lg font-semibold text-primary">Quarter Management</h2>
    <div className="flex gap-2">
      <label className="group cursor-pointer px-3 py-1.5 flex items-center gap-1.5 rounded bg-white text-primary border border-blue-400 hover:bg-blue-500 hover:text-white transition-colors">
        <ArrowDownOnSquareIcon className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
        <span>Import</span>
        <input type="file" accept=".json" className="hidden" onChange={onImport} />
      </label>
      <button
        type="button"
        onClick={onExport}
        disabled={!hasQuarters}
        className="px-3 py-1.5 group flex items-center gap-1.5 rounded bg-white text-primary border border-green-500 font-medium hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowUpOnSquareIcon className="w-4 h-4 text-green-500 group-hover:text-white transition-colors" />
        Export
      </button>
    </div>
  </div>
);

export default QuarterHeader;

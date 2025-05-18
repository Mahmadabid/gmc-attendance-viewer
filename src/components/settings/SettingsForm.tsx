'use client';

import { TrashIcon } from "@heroicons/react/24/outline";
import { PlusCircleIcon, ArrowDownOnSquareIcon, ArrowUpOnSquareIcon, ArrowPathIcon, CalendarDaysIcon } from "@heroicons/react/24/solid";
import { useEffect, useState, useCallback } from "react";
import Spinner from "../Spinner";
import { motion, AnimatePresence } from "framer-motion";
import QuarterHeader from "./QuarterHeader";
import QuarterList from "./QuarterList";
import QuarterEmptyState from "./QuarterEmptyState";

export default function SettingsForm() {
  const [quarters, setQuarters] = useState<{ start: string; end: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [skipFirstStart, setSkipFirstStart] = useState(true);
  const [skipLastEnd, setSkipLastEnd] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>("");
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("quarters");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setQuarters(parsed);
        }
      } catch { }
    }
    setLoading(false);
  }, []);

  function getNextDay(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }

  const handleDateChange = useCallback((idx: number, field: "start" | "end", value: string) => {
    setQuarters(qs => {
      const updated = [...qs];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "end" && idx < updated.length - 1 && value) {
        updated[idx + 1] = { ...updated[idx + 1], start: getNextDay(value) };
      }
      return updated;
    });
    setSaved(false);
    setError("");
  }, []);

  const handleAddQuarter = () => {
    setQuarters(qs => {
      if (qs.length === 0) return [{ start: "", end: "" }];
      const last = qs[qs.length - 1];
      return [...qs, { start: last.end ? getNextDay(last.end) : "", end: "" }];
    });
    setSaved(false);
    setError("");
  };

  const handleRemoveQuarter = (idx: number) => {
    setQuarters(qs => qs.filter((_, i) => i !== idx));
    setSaved(false);
    setDeleted(true);
  };

  // Import handler
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = JSON.parse(text);
        if (Array.isArray(imported) && imported.every(q => typeof q.start === 'string' && typeof q.end === 'string')) {
          setQuarters(imported);
          setSaved(false);
          setError("");
        } else {
          setError("Invalid file format. Please select a valid quarters JSON file.");
        }
      } catch {
        setError("Failed to import. Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Export handler
  const handleExport = () => {
    if (quarters.length === 0) {
      setError("No quarters to export.");
      return;
    }
    if (quarters.length === 1) {
      if (!quarters[0].end) {
        setError("End date for Quarter 1 is required.");
        return;
      }
    } else {
      for (let i = 0; i < quarters.length; i++) {
        if (i !== 0 && !quarters[i].start && !skipFirstStart) {
          setError(`Start date for Quarter ${i + 1} is required.`);
          return;
        }
        if (i !== quarters.length - 1 && !quarters[i].end) {
          setError(`End date for Quarter ${i + 1} is required.`);
          return;
        }
      }
    }
    setError("");
    try {
      const data = JSON.stringify(quarters, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quarters.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch {
      setError("Failed to export quarters.");
    }
  };

  const broadcastQuartersChange = () => {
    window.dispatchEvent(new Event('quarters-changed'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (quarters.length === 0 && !deleted) {
      setError("No quarters to save.");
      return;
    }
    if (quarters.length === 1) {
      if (!quarters[0].end) {
        setError("End date for Quarter 1 is required.");
        return;
      }
    } else {
      for (let i = 0; i < quarters.length; i++) {
        if (i !== 0 && !quarters[i].start && !skipFirstStart) {
          setError(`Start date for Quarter ${i + 1} is required.`);
          return;
        }
        if (i !== quarters.length - 1 && !quarters[i].end) {
          setError(`End date for Quarter ${i + 1} is required.`);
          return;
        }
      }
    }
    setError("");
    localStorage.setItem("quarters", JSON.stringify(quarters));
    broadcastQuartersChange();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6 w-full max-w-xl" onSubmit={handleSave}>
      {/* Quarters Header */}
      <QuarterHeader onImport={handleImport} onExport={handleExport} hasQuarters={quarters.length > 0} />
      <div className="flex flex-col gap-4 w-full">
        <AnimatePresence mode="wait">
          {quarters.length === 0 ? (
            <QuarterEmptyState onAddQuarter={handleAddQuarter} />
          ) : (
            <QuarterList
              quarters={quarters}
              skipFirstStart={skipFirstStart}
              skipLastEnd={skipLastEnd}
              onDateChange={handleDateChange}
              onRemove={handleRemoveQuarter}
              setSkipFirstStart={setSkipFirstStart}
              setSkipLastEnd={setSkipLastEnd}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Add and Save Buttons */}
      <div className="flex flex-col items-center gap-4">
        {quarters.length > 0 && (
          <button
            type="button"
            onClick={handleAddQuarter}
            className="flex items-center gap-1.5 px-3 py-1.5 group rounded bg-white text-primary border border-secondary hover:bg-secondary hover:text-white transition-colors"
          >
            <PlusCircleIcon className="w-5 h-5 group-hover:text-white text-secondary" />
            <span>Add Quarter</span>
          </button>
        )}

        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }} className="flex items-center gap-2 text-green-800 bg-green-100 rounded p-2 text-sm font-medium border border-green-200">
              <ArrowPathIcon className="w-4 h-4 animate-pulse" />
              Quarters saved successfully!
            </motion.div>
          )}
          {!saved && error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }} className="flex items-center gap-2 text-red-800 bg-red-100 rounded p-2 text-sm font-medium border border-red-200">
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="submit"
          className={`px-5 py-2 ${saved || error ? '' : 'mt-3'} rounded bg-primary text-white font-semibold hover:bg-secondary transition-colors shadow-sm`}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

'use client';

import { TrashIcon } from "@heroicons/react/24/outline";
import { PlusCircleIcon, ArrowDownOnSquareIcon, ArrowUpOnSquareIcon, ArrowPathIcon, CalendarDaysIcon } from "@heroicons/react/24/solid";
import { useEffect, useState, useCallback } from "react";
import Spinner from "../Spinner";
import { motion, AnimatePresence } from "framer-motion";

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

  // Placeholder import handler
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: implement import functionality
    e.target.value = "";
  };

  // Placeholder export handler
  const handleExport = () => {
    // TODO: implement export functionality
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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-primary">Quarter Management</h2>
        <div className="flex gap-2">
          <label className="group cursor-pointer px-3 py-1.5 flex items-center gap-1.5 rounded bg-white text-primary border border-blue-400 hover:bg-blue-500 hover:text-white transition-colors">
            <ArrowDownOnSquareIcon className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
            <span>Import</span>
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button
            type="button"
            onClick={handleExport}
            disabled={quarters.length === 0}
            className="px-3 py-1.5 group flex items-center gap-1.5 rounded bg-white text-primary border border-green-500 font-medium hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpOnSquareIcon className="w-4 h-4 text-green-500 group-hover:text-white transition-colors" />
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <AnimatePresence mode="wait">
          {quarters.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 border-2 border-dashed border-secondary/30 rounded-lg"
            >
              <CalendarDaysIcon className="w-12 h-12 mx-auto text-secondary/30 mb-2" />
              <p className="text-secondary/70">No quarters defined yet</p>
              <button
                type="button"
                onClick={handleAddQuarter}
                className="mt-4 px-4 py-2 rounded bg-primary text-white hover:bg-secondary transition-colors"
              >
                Add First Quarter
              </button>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
              {quarters.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-2 p-4 bg-white rounded-lg border border-secondary/30 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-primary">Quarter {i + 1}</div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuarter(i)}
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
                        {i === 0 && skipFirstStart ? (
                          <span className="px-2 py-1.5 rounded bg-secondary/5 text-primary w-full border border-dashed border-secondary/20">
                            Start from day 1
                          </span>
                        ) : (
                          <input
                            type="date"
                            className="px-2 py-1.5 rounded border border-secondary/40 bg-white text-primary focus:outline-none focus:ring-1 focus:ring-primary w-full cursor-pointer"
                            value={q.start}
                            onChange={e => handleDateChange(i, 'start', e.target.value)}
                            disabled={i === 0 && skipFirstStart}
                          />
                        )}
                      </label>
                      {i === 0 && (
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
                        {i === quarters.length - 1 && quarters.length > 1 && skipLastEnd ? (
                          <span className="px-2 py-1.5 rounded bg-secondary/5 text-primary w-full border border-dashed border-secondary/20">
                            Till last day
                          </span>
                        ) : (
                          <input
                            type="date"
                            className="px-2 py-1.5 rounded border border-secondary/40 bg-white text-primary focus:outline-none focus:ring-1 focus:ring-primary w-full cursor-pointer"
                            value={q.end}
                            min={q.start || undefined}
                            onChange={e => handleDateChange(i, 'end', e.target.value)}
                            disabled={i === quarters.length - 1 && quarters.length > 1 && skipLastEnd}
                          />
                        )}
                      </label>
                      {i === quarters.length - 1 && quarters.length > 1 && (
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
                </motion.div>
              ))}
            </motion.div>
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

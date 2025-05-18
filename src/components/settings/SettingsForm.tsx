'use client';

import { TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Spinner from "../Spinner";
import { PlusCircleIcon } from "@heroicons/react/16/solid";
import { useQuarters } from "../lib/QuartersContext";

export default function SettingsForm() {
  const { quarters, setQuarters, reloadQuarters } = useQuarters();
  const [loading, setLoading] = useState(true);
  const [skipFirstStart, setSkipFirstStart] = useState(true);
  const [skipLastEnd, setSkipLastEnd] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>("");
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    reloadQuarters();
    setLoading(false);
  }, [reloadQuarters]);

  function getNextDay(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }

  const handleDateChange = (idx: number, field: "start" | "end", value: string) => {
    setQuarters(qs => {
      const updated = [...qs];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "end" && idx < updated.length - 1 && value) {
        const nextStart = getNextDay(value);
        updated[idx + 1] = { ...updated[idx + 1], start: nextStart };
      }
      return updated;
    });
    setSaved(false);
  };

  const handleAddQuarter = () => {
    setQuarters(qs => {
      if (qs.length === 0) {
        return [{ start: "", end: "" }];
      }
      const last = qs[qs.length - 1];
      const newStart = last && last.end ? getNextDay(last.end) : "";
      return [...qs, { start: newStart, end: "" }];
    });
    setSaved(false);
  };

  const handleRemoveQuarter = (idx: number) => {
    setQuarters(qs => qs.filter((_, i) => i !== idx));
    setSaved(false);
    setDeleted(true);
  };

  // Add a custom event to notify other tabs/components
  const broadcastQuartersChange = () => {
    window.dispatchEvent(new Event('quarters-changed'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (quarters.length === 0 && !deleted) {
      setError("No quarters to save.");
      setSaved(false);
      return;
    }
    if (quarters.length === 1) {
      if (!quarters[0].end) {
        setError("End date for Quarter 1 is required.");
        setSaved(false);
        return;
      }
    } else {
      for (let i = 0; i < quarters.length; i++) {
        if (i !== 0 && !quarters[i].start) {
          setError(`Start date for Quarter ${i + 1} is required.`);
          setSaved(false);
          return;
        }
        if (i !== quarters.length - 1 && !quarters[i].end) {
          setError(`End date for Quarter ${i + 1} is required.`);
          setSaved(false);
          return;
        }
      }
    }
    setError("");
    localStorage.setItem("quarters", JSON.stringify(quarters));
    setSaved(true);
    broadcastQuartersChange(); // Notify listeners
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return <div className=""><span><Spinner /></span></div>;
  }

  return (
    <form className="flex flex-col gap-4 w-full max-w-md" onSubmit={handleSave}>
      <div className="flex flex-col gap-4 w-full">
        {quarters.map((q: any, i: number) => (
          <div key={i} className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-primary">Quarter {i + 1}</div>
              <button
                type="button"
                aria-label="Remove quarter"
                onClick={() => handleRemoveQuarter(i)}
                className="ml-2 p-1 rounded hover:bg-danger/10 text-danger transition-colors"
              >
                <TrashIcon className="w-5 h-5 stroke-2" />
              </button>
            </div>
            <div className="flex flex-row max-[420px]:flex-col gap-4 w-full items-end">
              <label className="flex flex-col text-sm font-medium text-foreground w-full">
                <span>Start Date</span>
                {i === 0 && skipFirstStart ? (
                  <span className="mt-1 px-2 py-1 rounded bg-secondary/10 text-primary w-full">Start from day 1</span>
                ) : (
                  <input
                    type="date"
                    className="mt-1 px-2 py-1 rounded border border-secondary/40 bg-white text-primary focus:outline-none w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    value={q.start}
                    onChange={e => handleDateChange(i, "start", e.target.value)}
                    {...(i !== 0 && !(i === 0 && skipFirstStart) ? { required: true } : {})}
                    disabled={i === 0 && skipFirstStart}
                  />
                )}
              </label>
              <label className="flex flex-col text-sm font-medium text-foreground w-full">
                <span>End Date</span>
                {i === quarters.length - 1 && quarters.length > 1 && skipLastEnd ? (
                  <span className="mt-1 px-2 py-1 rounded bg-secondary/10 text-primary w-full">Till last day</span>
                ) : (
                  <input
                    type="date"
                    className="mt-1 px-2 py-1 rounded border border-secondary/40 bg-white text-primary focus:outline-none w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    value={q.end}
                    min={q.start || undefined}
                    onChange={e => handleDateChange(i, "end", e.target.value)}
                    {...(i !== quarters.length - 1 && !(i === quarters.length - 1 && skipLastEnd) ? { required: true } : {})}
                    disabled={i === quarters.length - 1 && quarters.length > 1 && skipLastEnd}
                  />
                )}
              </label>
            </div>
            {/* Checkbox for skipping first quarter start date */}
            {i === 0 && (
              <div className="flex items-center gap-2 mt-1 text-sm">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={skipFirstStart}
                  id={`skipFirstStart-${i}`}
                  onChange={e => setSkipFirstStart(e.target.checked)}
                />
                <span>Skip first quarter start date</span>
              </div>
            )}
            {/* Checkbox for skipping last quarter end date */}
            {i === quarters.length - 1 && quarters.length > 1 && (
              <div className="flex items-center gap-2 mt-1 text-sm">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={skipLastEnd}
                  id={`skipLastEnd-${i}`}
                  onChange={e => setSkipLastEnd(e.target.checked)}
                />
                <span>Skip last quarter end date</span>
              </div>
            )}
            <hr className="border-t border-secondary/20 mt-4" />
          </div>
        ))}
      </div>
      {saved && <div className="text-green-800 bg-green-200 rounded p-1 text-sm font-medium mt-2 text-center">Quarters saved!</div>}
      {error && <div className="text-red-800 bg-red-200 rounded p-1 text-sm font-medium mt-2 text-center">{error}</div>}
      <button
        type="button"
        onClick={handleAddQuarter}
        className="group px-2 py-1 flex flex-row justify-center items-center gap-1 rounded bg-white text-primary border-2 hover:text-white border-secondary font-semibold hover:bg-secondary transition-colors self-center"
      >
        <PlusCircleIcon className="w-5 h-5 fill-secondary group-hover:fill-white transition-colors" /> Quarter
      </button>
      <button
        type="submit"
        className="mt-4 px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-secondary transition-colors self-center"
      >
        Save
      </button>
    </form>
  );
}

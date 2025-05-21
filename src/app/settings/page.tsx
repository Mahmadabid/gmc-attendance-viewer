'use client';

import { useIsOnline } from "@/components/lib/context/IsOnlineContext";
import SettingsForm from "@/components/settings/SettingsForm";
import { ArrowUturnLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/16/solid";

export default function SettingsPage() {

  const isOnline = useIsOnline();

  return (
    <div className="flex flex-col items-center px-2 mt-5 min-h-[30vh]">
      {!isOnline && (
        <div className="flex justify-center items-center mx-2 text-green-700 bg-green-100 border border-green-300 rounded p-2 mb-6 font-semibold">
          <ExclamationTriangleIcon className="min-w-6 min-h-6 text-green-700 mr-2" />
          You're offline. Settings will still work in Offline Mode.
        </div>
      )}
      {/* Go back button */}
      <div className="flex items-center mb-4">
        <button
          className="px-4 flex flex-row justify-center items-center gap-1 py-2 rounded bg-accent text-white font-semibold transition-colors hover:bg-secondary/80"
          onClick={() => window.history.back()}
        >
          <ArrowUturnLeftIcon className="w-5 h-5" /> Back
        </button>
      </div>
      <h1 className="text-2xl text-secondary font-bold mb-4">Settings</h1>
      <>
        <p className="text-foreground mb-4">Define the start and end dates for each quarter:</p>
        <SettingsForm />
      </>
    </div>
  );
}

'use client';

import SettingsForm from "@/components/settings/SettingsForm";

export default function SettingsPage() {

  return (
    <div className="flex flex-col items-center px-2 justify-center mt-10 min-h-[30vh]">
      {/* Go back button */}
      <div className="flex items-center mb-4">
        <button
          className="px-4 py-2 rounded bg-secondary text-white font-semibold transition-colors hover:bg-secondary/80"
          onClick={() => window.history.back()}
        >
          Go Back
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

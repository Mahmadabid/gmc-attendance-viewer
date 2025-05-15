import SettingsForm from "@/components/settings/SettingsForm";

export default function SettingsPage() {

  return (
    <div className="flex flex-col items-center px-2 justify-center mt-10 min-h-[30vh]">
      <h1 className="text-2xl text-secondary font-bold mb-4">Settings</h1>
      <>
        <p className="text-foreground mb-4">Define the start and end dates for each quarter:</p>
        <SettingsForm />
      </>
    </div>
  );
}

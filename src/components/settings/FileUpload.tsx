// FileUpload.tsx
import React from "react";

export default function FileUpload() {
  return (
    <div className="flex flex-col items-center mt-4">
      <label htmlFor="file-upload" className="mb-2 text-sm font-medium text-foreground">Upload CSV or XLSX file</label>
      <input
        id="file-upload"
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        className="block w-full text-sm text-gray-900 border border-secondary/40 rounded cursor-pointer bg-white focus:outline-none"
        onChange={e => {
          // Placeholder for file handling logic
          const file = e.target.files?.[0];
          if (file) {
            alert(`Selected file: ${file.name}`);
          }
        }}
      />
    </div>
  );
}

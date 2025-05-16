// SubjectFilterButtons.tsx
import React from 'react';

interface SubjectFilterButtonsProps {
  subjects: string[];
  subjectPercentages: Record<string, string>;
  selectedSubject: string | null;
  setSelectedSubject: (subject: string | null) => void;
}

const SubjectFilterButtons: React.FC<SubjectFilterButtonsProps> = ({ subjects, subjectPercentages, selectedSubject, setSelectedSubject }) => (
  <div className="flex flex-wrap justify-center gap-2 mb-6">
    <button
      className={`px-4 py-2 rounded font-semibold border transition-colors ${selectedSubject === null ? 'bg-secondary text-white border-secondary' : 'bg-white text-secondary border-secondary/50 hover:bg-secondary/10'}`}
      onClick={() => setSelectedSubject(null)}
    >
      Total Attendance
    </button>
    {subjects.map(subject => {
      const percent = parseFloat(subjectPercentages[subject]);
      const isLow = percent < 85;
      return (
        <button
          key={subject}
          className={`px-4 py-2 rounded font-semibold border transition-colors ${selectedSubject === subject
            ? `${isLow ? 'bg-red-700 text-white border-red-900': 'bg-secondary text-white border-secondary'}`
            : isLow
              ? 'bg-red-200 text-white border-red-500 hover:bg-red-400'
              : 'bg-white text-secondary border-secondary/50 hover:bg-secondary/10'}`}
          onClick={() => setSelectedSubject(subject)}
        >
          {subject} <span className={`ml-2 text-xs ${selectedSubject === subject ? 'text-white' : isLow ? 'text-white' : 'text-secondary'}`}>({subjectPercentages[subject]}%)</span>
        </button>
      );
    })}
  </div>
);

export default SubjectFilterButtons;

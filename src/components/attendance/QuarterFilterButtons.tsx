import React from 'react';

interface Quarter {
  start: string;
  end: string;
}

interface QuarterFilterButtonsProps {
  quarters: Quarter[];
  selectedQuarterIdx: number;
  setSelectedQuarterIdx: (idx: number) => void;
}

const QuarterFilterButtons: React.FC<QuarterFilterButtonsProps & { quarterPercentages?: Record<number, string> }> = ({ quarters, selectedQuarterIdx, setSelectedQuarterIdx, quarterPercentages }) => {
  return (
    <div className="flex flex-wrap gap-2 border-b border-b-accent pb-8 mt-8 justify-center mb-8">
      <button
        className={`px-4 py-2 rounded font-medium transition-colors ${selectedQuarterIdx === -1 ? 'bg-blue-700 text-white' : 'border border-blue-300 text-blue-700 hover:bg-blue-100'}`}
        onClick={() => setSelectedQuarterIdx(-1)}
      >
        Whole Year
      </button>
      {quarters.map((_, idx) => {
        const percentage = quarterPercentages ? parseFloat(quarterPercentages[idx] || '0') : null;
        const isLow = percentage !== null && percentage < 85;

        let buttonClass = 'px-4 py-2 rounded font-medium transition-colors ';
        if (selectedQuarterIdx === idx) {
          buttonClass += `${isLow ? 'bg-orange-300' : 'bg-blue-700'} text-white`;
        } else if (isLow) {
          buttonClass += 'border border-orange-400 text-orange-700 bg-orange-50 hover:bg-orange-100';
        } else {
          buttonClass += 'border border-blue-300 text-blue-700 hover:bg-blue-100';
        }

        return (
          <button
            key={idx}
            className={buttonClass}
            onClick={() => setSelectedQuarterIdx(idx)}
          >
            {`Quarter ${idx + 1}`}
          </button>
        );
      })}
    </div>
  );
};

export default QuarterFilterButtons;

import React from 'react';
import { motion } from 'framer-motion';

interface Quarter {
  start?: string;
  end?: string;
}

interface QuarterFilterButtonsProps {
  quarters: Quarter[];
  selectedQuarterIdx: number;
  setSelectedQuarterIdx: (idx: number) => void;
  quarterPercentages?: Record<number, string>;
}

const QuarterFilterButtons: React.FC<QuarterFilterButtonsProps> = ({ 
  quarters, 
  selectedQuarterIdx, 
  setSelectedQuarterIdx, 
  quarterPercentages 
}) => {
  if (!quarters || quarters.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 border-b border-b-accent pb-8 mt-8 justify-center mb-8"
    >
      <button
        className={`px-4 py-2 rounded font-medium transition-colors shadow-sm ${
          selectedQuarterIdx === -1 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'border border-blue-300 text-blue-600 hover:bg-blue-50'
        }`}
        onClick={() => setSelectedQuarterIdx(-1)}
      >
        Whole Year
      </button>
      
      {quarters.map((_, idx) => {
        const percentage = quarterPercentages ? parseFloat(quarterPercentages[idx] || '0') : null;
        const isLow = percentage !== null && percentage < 85;
        const displayName = `Quarter ${idx + 1}`;

        let buttonClass = 'px-4 py-2 rounded font-medium transition-colors shadow-sm ';
        if (selectedQuarterIdx === idx) {
          buttonClass += `${isLow ? 'bg-orange-500' : 'bg-blue-600'} text-white shadow-md`;
        } else if (isLow) {
          buttonClass += 'border border-orange-400 text-orange-700 bg-orange-50 hover:bg-orange-100';
        } else {
          buttonClass += 'border border-blue-300 text-blue-600 hover:bg-blue-50';
        }

        return (
          <motion.button
            key={idx}
            className={buttonClass}
            onClick={() => setSelectedQuarterIdx(idx)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {displayName}
            {percentage !== null && (
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                isLow 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {percentage}%
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default QuarterFilterButtons;

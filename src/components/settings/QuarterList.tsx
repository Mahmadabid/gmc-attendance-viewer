import React from "react";
import { motion } from "framer-motion";
import QuarterRow from "./QuarterRow";

interface QuarterListProps {
  quarters: { start: string; end: string }[];
  skipFirstStart: boolean;
  skipLastEnd: boolean;
  onDateChange: (idx: number, field: "start" | "end", value: string) => void;
  onRemove: (idx: number) => void;
  setSkipFirstStart: (val: boolean) => void;
  setSkipLastEnd: (val: boolean) => void;
}

const QuarterList: React.FC<QuarterListProps> = ({
  quarters,
  skipFirstStart,
  skipLastEnd,
  onDateChange,
  onRemove,
  setSkipFirstStart,
  setSkipLastEnd,
}) => {
  return (
    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
      {quarters.map((q, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <QuarterRow
            index={i}
            quarter={q}
            total={quarters.length}
            skipFirstStart={skipFirstStart}
            skipLastEnd={skipLastEnd}
            onDateChange={onDateChange}
            onRemove={onRemove}
            setSkipFirstStart={setSkipFirstStart}
            setSkipLastEnd={setSkipLastEnd}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default QuarterList;

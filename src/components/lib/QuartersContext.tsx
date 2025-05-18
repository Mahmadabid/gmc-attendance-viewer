import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Quarter {
  start: string;
  end: string;
}

interface QuartersContextType {
  quarters: Quarter[];
  setQuarters: React.Dispatch<React.SetStateAction<Quarter[]>>;
  reloadQuarters: () => void;
}

const QuartersContext = createContext<QuartersContextType | undefined>(undefined);

export const QuartersProvider = ({ children }: { children: ReactNode }) => {
  const [quarters, setQuarters] = useState<Quarter[]>([]);

  const reloadQuarters = () => {
    const stored = localStorage.getItem('quarters');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setQuarters([...parsed]);
        }
      } catch {}
    } else {
      setQuarters([]);
    }
  };

  useEffect(() => {
    reloadQuarters();
    const handler = () => reloadQuarters();
    window.addEventListener('quarters-changed', handler);
    return () => window.removeEventListener('quarters-changed', handler);
  }, []);

  return (
    <QuartersContext.Provider value={{ quarters, setQuarters, reloadQuarters }}>
      {children}
    </QuartersContext.Provider>
  );
};

export const useQuarters = () => {
  const context = useContext(QuartersContext);
  if (!context) throw new Error('useQuarters must be used within a QuartersProvider');
  return context;
};

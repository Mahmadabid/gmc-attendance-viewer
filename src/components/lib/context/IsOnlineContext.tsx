import React, { createContext, useContext, useEffect, useState } from 'react';

// Context type
type IsOnlineContextType = boolean;

const IsOnlineContext = createContext<IsOnlineContextType>(true);

export const useIsOnline = () => useContext(IsOnlineContext);

export const IsOnlineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    updateOnline();
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  return (
    <IsOnlineContext.Provider value={isOnline}>
      {children}
    </IsOnlineContext.Provider>
  );
};

export default IsOnlineContext;

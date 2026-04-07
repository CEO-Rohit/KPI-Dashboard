import { createContext, useContext, useState } from "react";

const TimeRangeContext = createContext();

export function TimeRangeProvider({ children }) {
  const [timeRange, setTimeRange] = useState("today");

  return (
    <TimeRangeContext.Provider value={{ timeRange, setTimeRange }}>
      {children}
    </TimeRangeContext.Provider>
  );
}

export const useTimeRange = () => useContext(TimeRangeContext);

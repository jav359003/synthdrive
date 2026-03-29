"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface DashboardContextType {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const DashboardContext = createContext<DashboardContextType>({
  selectedModel: "yolov8n",
  setSelectedModel: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}

export default function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModel] = useState("yolov8n");
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <DashboardContext.Provider value={{ selectedModel, setSelectedModel, refreshKey, triggerRefresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

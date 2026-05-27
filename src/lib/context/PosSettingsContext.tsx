"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type PosSettings = {
  customerDisplayEnabled: boolean;
  lowStockNotificationsEnabled?: boolean;
  negativeStockAlertsEnabled?: boolean;
};

type PosSettingsContextType = {
  posSettings: PosSettings;
  setPosSettings: (settings: Partial<PosSettings>) => void;
};

const STORAGE_KEY = "pos_settings";

const DEFAULTS: PosSettings = {
  customerDisplayEnabled: false,
  lowStockNotificationsEnabled: false,
  negativeStockAlertsEnabled: false,
};

function loadFromStorage(): PosSettings {
  if (typeof window === "undefined") return DEFAULTS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;

    return {
      ...DEFAULTS,           
      ...JSON.parse(raw),   
    };
  } catch {
    return DEFAULTS;
  }
}

const PosSettingsContext = createContext<PosSettingsContextType>({
  posSettings: DEFAULTS,
  setPosSettings: () => {},
});

export function PosSettingsProvider({ children }: { children: ReactNode }) {
  const [posSettings, setPosSettingsState] = useState<PosSettings>(DEFAULTS);

  useEffect(() => {
    setPosSettingsState(loadFromStorage());
  }, []);

  const setPosSettings = (settings: Partial<PosSettings>) => {
    setPosSettingsState((prev) => {
      const next = { ...prev, ...settings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <PosSettingsContext.Provider value={{ posSettings, setPosSettings }}>
      {children}
    </PosSettingsContext.Provider>
  );
}

export function usePosSettings() {
  return useContext(PosSettingsContext);
}

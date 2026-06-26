"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
  useCents: boolean;
  setUseCents: (value: boolean) => void;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "AUD",
  setCurrency: () => {},
  useCents: false,
  setUseCents: () => {},
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState("AUD");
  const [useCents, setUseCentsState] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    const savedCents = localStorage.getItem("app_useCents");

    if (savedCurrency) setCurrencyState(savedCurrency);
    if (savedCents) setUseCentsState(savedCents === "true");
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("app_currency", newCurrency);
  };

  const setUseCents = (value: boolean) => {
    setUseCentsState(value);
    localStorage.setItem("app_useCents", value.toString());
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, useCents, setUseCents }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);

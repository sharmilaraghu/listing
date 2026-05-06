"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Listing } from "@/lib/types";

interface CompareContextValue {
  selected: Listing[];
  isComparing: boolean;
  toggle: (listing: Listing) => void;
  canCompare: boolean;
  startCompare: () => void;
  stopCompare: () => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Listing[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const toggle = useCallback((listing: Listing) => {
    setSelected((prev) => {
      const already = prev.find((l) => l.id === listing.id);
      if (already) return prev.filter((l) => l.id !== listing.id);
      if (prev.length >= 2) return [prev[1], listing];
      return [...prev, listing];
    });
  }, []);

  const startCompare = useCallback(() => {
    if (selected.length === 2) setIsComparing(true);
  }, [selected.length]);

  const stopCompare = useCallback(() => setIsComparing(false), []);
  const clear = useCallback(() => { setSelected([]); setIsComparing(false); }, []);

  return (
    <CompareContext.Provider value={{
      selected, isComparing, toggle,
      canCompare: selected.length === 2,
      startCompare, stopCompare, clear,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompareContext() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompareContext must be used inside CompareProvider");
  return ctx;
}

"use client";

import { useState, useCallback } from "react";
import type { Listing } from "@/lib/types";

interface CompareState {
  selected: Listing[];
  isComparing: boolean;
}

interface UseCompareReturn {
  selected: Listing[];
  isComparing: boolean;
  toggle: (listing: Listing) => void;
  canCompare: boolean;
  startCompare: () => void;
  stopCompare: () => void;
  clear: () => void;
}

export function useCompare(): UseCompareReturn {
  const [state, setState] = useState<CompareState>({ selected: [], isComparing: false });

  const toggle = useCallback((listing: Listing) => {
    setState((prev) => {
      const already = prev.selected.find((l) => l.id === listing.id);
      if (already) {
        return { ...prev, selected: prev.selected.filter((l) => l.id !== listing.id) };
      }
      if (prev.selected.length >= 2) {
        // Replace the oldest selection when 2 are already selected
        return { ...prev, selected: [prev.selected[1], listing] };
      }
      return { ...prev, selected: [...prev.selected, listing] };
    });
  }, []);

  const startCompare = useCallback(() => {
    if (state.selected.length === 2) {
      setState((prev) => ({ ...prev, isComparing: true }));
    }
  }, [state.selected.length]);

  const stopCompare = useCallback(() => {
    setState((prev) => ({ ...prev, isComparing: false }));
  }, []);

  const clear = useCallback(() => {
    setState({ selected: [], isComparing: false });
  }, []);

  return {
    selected: state.selected,
    isComparing: state.isComparing,
    toggle,
    canCompare: state.selected.length === 2,
    startCompare,
    stopCompare,
    clear,
  };
}

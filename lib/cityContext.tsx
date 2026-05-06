"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface City {
  id: string;       // CL subdomain slug
  label: string;    // Human name
  state: string;    // State/province abbreviation
}

export const CITIES: City[] = [
  { id: "sfbay",         label: "San Francisco", state: "CA" },
  { id: "newyork",       label: "New York",       state: "NY" },
  { id: "chicago",       label: "Chicago",        state: "IL" },
  { id: "losangeles",    label: "Los Angeles",    state: "CA" },
  { id: "seattle",       label: "Seattle",        state: "WA" },
  { id: "austin",        label: "Austin",         state: "TX" },
  { id: "boston",        label: "Boston",         state: "MA" },
  { id: "denver",        label: "Denver",         state: "CO" },
  { id: "miami",         label: "Miami",          state: "FL" },
  { id: "portland",      label: "Portland",       state: "OR" },
  { id: "atlanta",       label: "Atlanta",        state: "GA" },
  { id: "dallas",        label: "Dallas",         state: "TX" },
  { id: "phoenix",       label: "Phoenix",        state: "AZ" },
  { id: "minneapolis",   label: "Minneapolis",    state: "MN" },
  { id: "sandiego",      label: "San Diego",      state: "CA" },
  { id: "detroit",       label: "Detroit",        state: "MI" },
  { id: "philadelphia",  label: "Philadelphia",   state: "PA" },
  { id: "washingtondc",  label: "Washington DC",  state: "DC" },
  { id: "nashville",     label: "Nashville",      state: "TN" },
  { id: "lasvegas",      label: "Las Vegas",      state: "NV" },
  { id: "saltlakecity",  label: "Salt Lake City", state: "UT" },
  { id: "sacramento",    label: "Sacramento",     state: "CA" },
  { id: "raleigh",       label: "Raleigh",        state: "NC" },
  { id: "columbus",      label: "Columbus",       state: "OH" },
  { id: "indianapolis",  label: "Indianapolis",   state: "IN" },
  { id: "charlotte",     label: "Charlotte",      state: "NC" },
  { id: "pittsburgh",    label: "Pittsburgh",     state: "PA" },
  { id: "richmond",      label: "Richmond",       state: "VA" },
  { id: "toronto",       label: "Toronto",        state: "ON" },
  { id: "vancouver",     label: "Vancouver",      state: "BC" },
];

interface CityContextValue {
  city: City;
  setCity: (city: City) => void;
}

const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState<City>(CITIES[0]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("listing-city");
      if (saved) {
        const found = CITIES.find((c) => c.id === saved);
        if (found) setCityState(found);
      }
    } catch {}
  }, []);

  const setCity = (c: City) => {
    setCityState(c);
    try { localStorage.setItem("listing-city", c.id); } catch {}
  };

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCityContext must be used inside CityProvider");
  return ctx;
}

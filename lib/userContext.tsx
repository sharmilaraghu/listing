"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, SavedType } from "./types";
import { MOCK_USER } from "./data";

interface SavedItem {
  id: string;
  type: SavedType;
  itemId: string;
}

interface UserContextValue {
  user: User | null;
  saved: SavedItem[];
  signIn: (memberId: string) => void;
  signOut: () => void;
  isSaved: (type: SavedType, itemId: string) => boolean;
  toggleSaved: (type: SavedType, itemId: string) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [saved, setSaved] = useState<SavedItem[]>([]);

  useEffect(() => {
    try {
      // Always auto-sign-in as the mock user
      const u = localStorage.getItem("listing-user");
      if (u) {
        setUser(JSON.parse(u));
      } else {
        // First visit — sign in automatically
        localStorage.setItem("listing-user", JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
      }
      const s = localStorage.getItem("listing-saved");
      if (s) setSaved(JSON.parse(s));
    } catch {}
  }, []);

  const signIn = (memberId: string) => {
    const u: User = { ...MOCK_USER, memberId };
    setUser(u);
    try { localStorage.setItem("listing-user", JSON.stringify(u)); } catch {}
  };

  const signOut = () => {
    setUser(null);
    try { localStorage.removeItem("listing-user"); } catch {}
  };

  const isSaved = (type: SavedType, itemId: string) =>
    saved.some((s) => s.type === type && s.itemId === itemId);

  const toggleSaved = (type: SavedType, itemId: string) => {
    setSaved((prev) => {
      const exists = prev.some((s) => s.type === type && s.itemId === itemId);
      const next = exists
        ? prev.filter((s) => !(s.type === type && s.itemId === itemId))
        : [...prev, { id: `${type}-${itemId}`, type, itemId }];
      try { localStorage.setItem("listing-saved", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <UserContext.Provider value={{ user, saved, signIn, signOut, isSaved, toggleSaved }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used inside UserProvider");
  return ctx;
}

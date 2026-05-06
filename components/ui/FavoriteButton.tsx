"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useUserContext } from "@/lib/userContext";
import type { SavedType } from "@/lib/types";

interface FavoriteButtonProps {
  type: SavedType;
  itemId: string;
  size?: number;
}

export default function FavoriteButton({ type, itemId, size = 14 }: FavoriteButtonProps) {
  const { isSaved, toggleSaved } = useUserContext();
  const saved = isSaved(type, itemId);
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(type, itemId);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 200);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove from saved" : "Save"}
      className={`flex items-center justify-center transition-all duration-150 ${
        animating ? "scale-125" : "scale-100"
      }`}
      style={{ width: size + 8, height: size + 8 }}
    >
      <Icon
        name="heart"
        size={size}
        className={saved ? "text-terracotta fill-terracotta" : "text-dust hover:text-terracotta"}
      />
    </button>
  );
}

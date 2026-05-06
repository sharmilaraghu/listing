"use client";

import Link from "next/link";
import Icon from "./Icon";
import type { Category } from "@/lib/types";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/feed?cat=${category.id}`}
      className="group relative flex flex-col p-5 bg-paper border border-rule card-lift hover:border-ink"
    >
      <div
        className="mb-3 w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: category.color + "20",
          color: category.color,
        }}
      >
        <Icon name={category.icon} size={18} />
      </div>
      <div className="font-display font-black text-lg text-ink leading-tight mb-1">
        {category.label}
      </div>
      <div className="font-data text-[10px] tracking-[0.2em] text-dust">
        {category.count.toLocaleString()} listings
      </div>
      {/* Count bar */}
      <div className="mt-3 h-1 bg-rule overflow-hidden">
        <div
          className="h-full transition-all duration-500 group-hover:w-full"
          style={{
            width: `${Math.min(100, (category.count / 10000) * 100)}%`,
            backgroundColor: category.color,
          }}
        />
      </div>
      <div
        className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
        style={{ backgroundColor: category.color }}
      />
    </Link>
  );
}

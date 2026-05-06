"use client";

import { useRouter } from "next/navigation";
import { useCompareContext } from "./CompareContext";
import Icon from "@/components/ui/Icon";

export default function CompareBar() {
  const router = useRouter();
  const { selected, canCompare, clear } = useCompareContext();

  if (selected.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-ink shadow-[0_-6px_32px_rgba(28,16,7,0.14)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
        {/* Selected listings preview */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selected.map((l) => (
            <div key={l.id} className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-sm bg-dust/20 flex items-center justify-center">
                <span className="font-data text-[8px] text-dust">{l.id}</span>
              </div>
              <span className="font-display text-sm text-ink truncate hidden sm:inline">{l.title}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={clear}
            className="px-3 py-2 font-data text-[10px] tracking-[0.2em] uppercase text-dust border border-rule hover:border-ink transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => router.push("/compare")}
            disabled={!canCompare}
            className={`flex items-center gap-2 px-5 py-2.5 font-data text-[11px] tracking-[0.2em] uppercase transition-colors ${
              canCompare
                ? "bg-terracotta text-cream btn-shine hover:bg-[#CC4A1E]"
                : "bg-dust/30 text-dust cursor-not-allowed"
            }`}
          >
            <Icon name="grid" size={13} />
            Compare ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useCompareContext } from "./CompareContext";
import Icon from "@/components/ui/Icon";

export default function CompareBar() {
  const router = useRouter();
  const { selected, canCompare, clear } = useCompareContext();

  if (selected.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-40"
      style={{
        animation: "slideInCorner 0.2s ease-out",
      }}
    >
      <style>{`
        @keyframes slideInCorner {
          from { opacity: 0; transform: translateY(12px) translateX(8px); }
          to   { opacity: 1; transform: translateY(0) translateX(0); }
        }
      `}</style>

      <div
        className="bg-ink border border-terracotta/60 shadow-[0_0_20px_rgba(232,87,42,0.15)]"
        style={{ minWidth: 200, maxWidth: 260 }}
      >
        {/* Top strip — scan-line accent */}
        <div className="h-px bg-gradient-to-r from-terracotta/80 via-terracotta to-terracotta/20" />

        <div className="px-4 py-3 flex flex-col gap-3">
          {/* Label + count */}
          <div className="flex items-center justify-between">
            <span className="font-data text-[9px] tracking-[0.25em] uppercase text-terracotta">
              Compare
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`font-data text-[9px] tracking-[0.15em] px-1.5 py-0.5 border ${
                  canCompare
                    ? "border-terracotta text-terracotta"
                    : "border-dust/40 text-dust"
                }`}
              >
                {selected.length}/2
              </span>
              <button
                onClick={clear}
                className="w-5 h-5 flex items-center justify-center text-dust hover:text-cream transition-colors"
                title="Clear"
              >
                <Icon name="close" size={10} />
              </button>
            </div>
          </div>

          {/* Selected items */}
          <div className="flex flex-col gap-1.5">
            {[0, 1].map((i) => {
              const item = selected[i];
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-2 py-1.5 border ${
                    item
                      ? "border-dust/20 bg-cream/5"
                      : "border-dashed border-dust/20"
                  }`}
                >
                  {item ? (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0" />
                      <span className="font-data text-[9px] tracking-[0.1em] text-cream/80 truncate">
                        {item.title}
                      </span>
                    </>
                  ) : (
                    <span className="font-data text-[9px] tracking-[0.15em] text-dust/40 uppercase">
                      Select item {i + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Compare button */}
          <button
            onClick={() => canCompare && router.push("/compare")}
            disabled={!canCompare}
            className={`w-full py-2 font-data text-[10px] tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 ${
              canCompare
                ? "bg-terracotta text-cream hover:bg-[#CC4A1E] btn-shine"
                : "bg-dust/10 text-dust/40 cursor-not-allowed"
            }`}
          >
            <Icon name="grid" size={11} />
            Run Comparison
          </button>
        </div>
      </div>
    </div>
  );
}

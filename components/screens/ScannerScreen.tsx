"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScannerScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/feed?map=true");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-dust border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="font-data text-[10px] tracking-[0.2em] uppercase text-dust">
          Loading map...
        </span>
      </div>
    </div>
  );
}

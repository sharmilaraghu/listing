"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useUserContext } from "@/lib/userContext";

export default function SignInModal({ onClose }: { onClose: () => void }) {
  const { signIn } = useUserContext();
  const [memberId, setMemberId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId.trim()) return;
    setLoading(true);
    setTimeout(() => {
      signIn(memberId.trim());
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-paper border-2 border-ink w-full max-w-sm p-8 shadow-[8px_8px_0px_rgba(28,16,7,0.2)]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dust hover:text-ink transition-colors"
        >
          <Icon name="close" size={16} />
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            <span className="font-data text-[9px] tracking-[0.3em] uppercase text-dust">
              Member Access
            </span>
          </div>
          <h2 className="font-display font-black text-4xl text-ink leading-none">
            ACCESS<br />ACCOUNT
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-data text-[10px] tracking-[0.2em] uppercase text-dust mb-2">
              Member ID
            </label>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="e.g. ATLAS01"
              autoFocus
              className="w-full px-4 py-3 bg-cream border-2 border-ink font-body text-ink placeholder:text-dust/60 outline-none focus:border-terracotta transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!memberId.trim() || loading}
            className="mt-2 w-full px-6 py-3.5 bg-terracotta text-cream font-data text-[11px] tracking-[0.2em] uppercase btn-shine hover:bg-[#CC4A1E] disabled:bg-dust/30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Access Account
                <Icon name="arrow" size={12} />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 font-data text-[9px] tracking-[0.15em] text-dust text-center">
          No password needed — your Member ID is your key.
        </p>
      </div>
    </div>
  );
}

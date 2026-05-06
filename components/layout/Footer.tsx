import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-rule bg-paper mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 font-data text-[11px] tracking-[0.2em]">
        <div>
          <div className="font-display font-bold text-xl text-ink mb-3">LISTING</div>
          <p className="text-dust leading-relaxed uppercase tracking-widest text-[9px]">
            A live marketplace for San Francisco. Signal over noise. Humans over bots.
          </p>
        </div>

        <div>
          <div className="text-mahogany uppercase mb-3 text-[10px]">Sections</div>
          {["For Wheels", "For Rent", "For Sale", "For Hire", "Free Picks", "Sound Kit"].map((s) => (
            <Link key={s} href="/feed" className="block text-dust hover:text-terracotta py-0.5 transition-colors">
              {s}
            </Link>
          ))}
        </div>

        <div>
          <div className="text-mahogany uppercase mb-3 text-[10px]">Info</div>
          {["About", "Safety Tips", "Terms", "Privacy", "Contact"].map((s) => (
            <span key={s} className="block text-dust py-0.5">{s}</span>
          ))}
        </div>

        <div>
          <div className="text-mahogany uppercase mb-3 text-[10px]">Status</div>
          <div className="flex items-center gap-2 text-sage text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
            All systems nominal
          </div>
          <div className="text-dust mt-2 text-[9px]">v1.0.0 · SF Node</div>
          <div className="mt-3 text-[9px] text-dust">
            Voice by ElevenLabs AI
          </div>
        </div>
      </div>

      <div className="border-t border-rule py-3 px-8 text-center font-data text-[9px] tracking-[0.3em] text-dust uppercase">
        © 2026 Listing · Not affiliated with Craigslist · Original design
      </div>
    </footer>
  );
}

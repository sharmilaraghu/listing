"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import SignalDot from "@/components/ui/SignalDot";

const NAV = [
  { href: "/",        label: "Home",    short: "01" },
  { href: "/feed",    label: "Browse",  short: "02" },
  { href: "/scanner", label: "Map",     short: "03" },
  { href: "/post",    label: "Post",    short: "04" },
];

export default function Header() {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-rule">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-6">

        {/* Masthead wordmark */}
        <Link href="/" className="group flex items-baseline gap-2 shrink-0">
          <span className="font-display font-black text-2xl tracking-tight text-ink leading-none group-hover:text-terracotta transition-colors">
            LISTING
          </span>
          <span className="font-data text-[9px] tracking-[0.3em] text-dust hidden sm:inline">
            SF
          </span>
        </Link>

        {/* Thin rule */}
        <div className="hidden md:block h-5 w-px bg-rule-strong" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 font-data text-[11px] tracking-[0.2em] uppercase
                  transition-colors duration-150
                  ${active
                    ? "text-terracotta border-b border-terracotta"
                    : "text-mahogany hover:text-ink"
                  }
                `}
              >
                <span className="text-dust">{item.short}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {/* Live clock */}
          <div className="hidden lg:flex items-center gap-2 font-data text-[10px] tracking-[0.25em] text-dust">
            <SignalDot color="#5B7F5E" size={6} />
            <span>{time}</span>
          </div>

          {/* Post CTA */}
          <Link
            href="/post"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-terracotta text-cream font-data text-[11px] tracking-[0.2em] uppercase btn-shine hover:bg-[#CC4A1E] transition-colors"
          >
            <Icon name="plus" size={12} />
            Post
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 text-ink"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <Icon name={menuOpen ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      {/* Section bar — editorial feel */}
      <div className="border-t border-rule bg-paper/50 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center h-8 gap-6">
          {[
            "FOR WHEELS", "FOR RENT", "FOR SALE", "FOR HIRE",
            "FREE PICKS", "SOUND KIT", "CONNECT", "ODDITIES",
          ].map((section, i) => {
            const hrefs = ["/feed?cat=transit", "/feed?cat=shelter", "/feed?cat=gear", "/feed?cat=labor", "/feed?cat=free", "/feed?cat=audio", "/feed?cat=people", "/feed?cat=misc"];
            return (
              <Link
                key={section}
                href={hrefs[i]}
                className="font-data text-[9px] tracking-[0.25em] text-dust hover:text-terracotta whitespace-nowrap transition-colors shrink-0"
              >
                {section}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-paper border-t border-rule">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-6 py-3.5 font-data text-[12px] tracking-[0.2em] uppercase text-ink border-b border-rule hover:bg-cream transition-colors"
            >
              <span className="text-dust text-[10px]">{item.short}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

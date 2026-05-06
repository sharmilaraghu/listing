"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import SignalDot from "@/components/ui/SignalDot";
import { TICKER_ITEMS } from "@/lib/data";
import { useUserContext } from "@/lib/userContext";

const NAV = [
  { href: "/",        label: "Home",     short: "01" },
  { href: "/feed",    label: "Browse",   short: "02" },
  { href: "/events",  label: "Discover", short: "03" },
  { href: "/post",    label: "Post",     short: "04" },
];

export default function Header() {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUserContext();

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const initials = user?.name.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-6">

          {/* Masthead wordmark */}
          <Link href="/" className="group flex items-baseline gap-2 shrink-0">
            <span className="font-display font-black text-2xl tracking-tight text-ink leading-none group-hover:text-terracotta transition-colors">
              LISTING
            </span>
            <span className="font-data text-[9px] tracking-[0.3em] text-mahogany hidden sm:inline">
              US
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
            {/* Saved — always visible */}
            <Link
              href="/saved"
              className={`
                flex items-center gap-1.5 px-3 py-1.5 font-data text-[11px] tracking-[0.2em] uppercase
                transition-colors duration-150
                ${pathname === "/saved"
                  ? "text-terracotta border-b border-terracotta"
                  : "text-mahogany hover:text-ink"
                }
              `}
            >
              <span className="text-dust">05</span>
              Saved
            </Link>
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {/* Live clock */}
            <div className="hidden lg:flex items-center gap-2 font-data text-[10px] tracking-[0.25em] text-dust">
              <SignalDot color="#5B7F5E" size={6} />
              <span>{time}</span>
            </div>

            {/* Always signed in — avatar + name */}
            <Link href="/saved" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0">
                <span className="font-data text-[10px] text-cream font-bold">{initials}</span>
              </div>
              <span className="hidden xl:inline font-data text-[10px] tracking-[0.15em] text-ink group-hover:text-terracotta transition-colors uppercase">
                {user?.name}
              </span>
            </Link>

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

        {/* Live ticker sub-bar */}
        <div className="border-t border-rule overflow-hidden h-8 flex items-center bg-paper/30">
          <div className="shrink-0 flex items-center gap-0 border-r border-rule pr-3 pl-4 h-full">
            <div className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse mr-2" />
            <span className="font-data text-[8px] tracking-[0.35em] uppercase text-mahogany whitespace-nowrap">Live</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="ticker-track flex items-center gap-10 whitespace-nowrap px-6">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="flex items-center gap-2.5 font-data text-[9px] tracking-[0.18em] text-mahogany shrink-0">
                  <span className="w-1 h-1 rounded-full bg-terracotta/60 shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-paper border-t border-rule">
            {[...NAV, { href: "/saved", label: "Saved", short: "05" }].map((item) => (
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
    </>
  );
}

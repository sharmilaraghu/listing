"use client";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 18, className = "" }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
    className,
  };

  switch (name) {
    case "search":  return <svg {...props}><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg>;
    case "mic":     return <svg {...props}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>;
    case "pin":     return <svg {...props}><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case "home":    return <svg {...props}><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>;
    case "bike":    return <svg {...props}><circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-7h6l2 7"/><path d="M10 10l-2-4h-2"/></svg>;
    case "cube":    return <svg {...props}><path d="M12 3l9 5v8l-9 5-9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v9"/></svg>;
    case "wrench":  return <svg {...props}><path d="M14.7 6.3a4 4 0 0 0 5 5L21 15l-6 6-3.7-1.3a4 4 0 0 0-5-5L3 9l6-6z"/></svg>;
    case "gift":    return <svg {...props}><rect x="3" y="8" width="18" height="5"/><rect x="5" y="13" width="14" height="8"/><path d="M12 8v13"/><path d="M8 8a3 3 0 1 1 4-3 3 3 0 1 1 4 3"/></svg>;
    case "wave":    return <svg {...props}><path d="M3 12h2l2-6 3 12 3-9 3 6 2-3h3"/></svg>;
    case "users":   return <svg {...props}><circle cx="9" cy="9" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><circle cx="17" cy="7" r="2.5"/><path d="M22 17a5 5 0 0 0-7-3"/></svg>;
    case "star":    return <svg {...props}><path d="M12 3l2.6 6 6.4.6-4.8 4.4 1.4 6.4L12 17l-5.6 3.4 1.4-6.4L3 9.6 9.4 9z"/></svg>;
    case "plus":    return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "arrow":   return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "back":    return <svg {...props}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>;
    case "play":    return <svg {...props} fill="currentColor" stroke="none"><path d="M6 4l14 8-14 8z"/></svg>;
    case "pause":   return <svg {...props} fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
    case "check":   return <svg {...props}><path d="M4 12l5 5L20 6"/></svg>;
    case "close":   return <svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "upload":  return <svg {...props}><path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/></svg>;
    case "flame":   return <svg {...props}><path d="M12 3c2 4-2 5-2 9a4 4 0 0 0 8 0c0-2-1-3-2-4 1 4-2 5-2 2 0-3-2-5-2-7z"/></svg>;
    case "gem":     return <svg {...props}><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l-3 6 6 12M15 3l3 6-6 12"/></svg>;
    case "warn":    return <svg {...props}><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/></svg>;
    case "speak":   return <svg {...props}><path d="M3 10v4h4l5 5V5L7 10z"/><path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14"/></svg>;
    case "map":     return <svg {...props}><path d="M9 3l-6 3v15l6-3 6 3 6-3V3l-6 3z"/><path d="M9 3v15M15 6v15"/></svg>;
    case "grid":    return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case "bolt":    return <svg {...props}><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>;
    case "cam":     return <svg {...props}><path d="M3 7h4l2-2h6l2 2h4v12H3z"/><circle cx="12" cy="13" r="4"/></svg>;
    case "eye":     return <svg {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "menu":    return <svg {...props}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case "sat":     return <svg {...props}><circle cx="12" cy="12" r="2"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6 6l1.5 1.5M16.5 16.5L18 18M6 18l1.5-1.5M16.5 7.5L18 6"/></svg>;
    case "key":     return <svg {...props}><circle cx="8" cy="12" r="4"/><path d="M12 12h8M18 12v3"/></svg>;
    case "mail":    return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case "bookmark": return <svg {...props}><path d="M5 3h14v16l-7-5-7 5z"/></svg>;
    case "list":    return <svg {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case "heart":   return <svg {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case "calendar": return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>;
    case "star-half": return <svg {...props}><path d="M12 3l2.6 6 6.4.6-4.8 4.4 1.4 6.4L12 17V3z"/><path d="M12 3v14"/></svg>;
    default:        return null;
  }
}

"use client";

interface SignalDotProps {
  color?: string; // tailwind bg color class OR hex
  size?: number;
}

export default function SignalDot({ color = "#5B7F5E", size = 8 }: SignalDotProps) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full animate-pulse-ring"
        style={{ background: color, opacity: 0.6 }}
      />
      <span
        className="relative rounded-full"
        style={{ width: size, height: size, background: color }}
      />
    </span>
  );
}

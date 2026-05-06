"use client";

import { useEffect, useState } from "react";

export default function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY });
      const t = e.target as HTMLElement;
      const isHoverable =
        t.tagName === "BUTTON" ||
        t.tagName === "A" ||
        t.tagName === "INPUT" ||
        t.tagName === "SELECT" ||
        t.tagName === "TEXTAREA" ||
        !!t.closest("button") ||
        !!t.closest("a");
      setHovering(isHoverable);
    }
    function onDown() { setClicking(true); }
    function onUp() { setClicking(false); }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const scale = clicking ? 0.6 : hovering ? 1.4 : 1;
  const color = hovering ? "#E8572A" : "#1C1007";
  const size = 20;

  return (
    <div
      aria-hidden="true"
      className="fixed pointer-events-none z-[9999]"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transition: "transform 0.12s ease",
          position: "relative",
          width: size,
          height: size,
        }}
      >
        {/* Outer square rotated 45° */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 16,
            height: 16,
            transform: "translate(-50%, -50%) rotate(45deg)",
            border: `1.5px solid ${color}`,
            transition: "border-color 0.15s",
          }}
        />
        {/* Center dot */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 4,
            height: 4,
            transform: "translate(-50%, -50%) rotate(45deg)",
            background: color,
            transition: "background 0.15s",
          }}
        />
        {/* Crosshair lines */}
        {[
          { style: { top: "50%", left: 0, width: 6, height: 1, transform: "translateY(-50%)" } },
          { style: { top: "50%", right: 0, width: 6, height: 1, transform: "translateY(-50%)" } },
          { style: { left: "50%", top: 0, height: 6, width: 1, transform: "translateX(-50%)" } },
          { style: { left: "50%", bottom: 0, height: 6, width: 1, transform: "translateX(-50%)" } },
        ].map((line, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              background: color,
              opacity: 0.5,
              transition: "background 0.15s",
              ...line.style,
            }}
          />
        ))}
      </div>
    </div>
  );
}

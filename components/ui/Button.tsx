"use client";

import { ButtonHTMLAttributes } from "react";
import Icon from "./Icon";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconRight?: string;
  shine?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-terracotta text-cream border border-terracotta hover:bg-[#CC4A1E] active:bg-[#B03F18]",
  outline: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-cream",
  ghost:   "bg-transparent text-mahogany border border-transparent hover:border-rule hover:bg-paper",
  danger:  "bg-mahogany text-paper border border-mahogany hover:bg-ink",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[11px] gap-1.5",
  md: "px-4 py-2.5 text-[12px] gap-2",
  lg: "px-6 py-3.5 text-[13px] gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  shine = true,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const iconSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;

  return (
    <button
      className={`
        inline-flex items-center justify-center font-data tracking-[0.15em] uppercase
        transition-all duration-150
        disabled:opacity-40 disabled:pointer-events-none
        ${shine && variant === "primary" ? "btn-shine" : ""}
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
      {...props}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-forest text-cream hover:bg-forest-deep disabled:opacity-50",
  terracotta:
    "bg-terracotta text-cream hover:opacity-90 disabled:opacity-50",
  ghost:
    "border border-forest/15 bg-transparent text-forest hover:border-forest/40 disabled:opacity-50",
  danger:
    "border border-terracotta/40 text-terracotta hover:bg-terracotta/10 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm tracking-[0.12em] uppercase transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

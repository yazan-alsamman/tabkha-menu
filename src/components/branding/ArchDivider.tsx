export function ArchDivider({ className = "text-terracotta" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 18"
      className={`mx-auto h-4 w-40 ${className}`}
      fill="none"
      aria-hidden
    >
      <path d="M4 9 H78" stroke="currentColor" strokeWidth="0.7" />
      <path d="M122 9 H196" stroke="currentColor" strokeWidth="0.7" />
      <path d="M88 9 C94 2, 106 2, 112 9 C106 16, 94 16, 88 9 Z" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  );
}

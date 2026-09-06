import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[0.7rem] tracking-[0.22em] uppercase text-sage">{label}</span>
      {hint ? <span className="mt-1 block text-sm text-forest/50">{hint}</span> : null}
      <div className="mt-2">{children}</div>
      {error ? <span className="mt-1 block text-sm text-terracotta">{error}</span> : null}
    </label>
  );
}

const control =
  "min-h-11 w-full border border-forest/15 bg-cream px-3 text-forest outline-none focus:border-terracotta";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${control} min-h-28 py-2 ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${control} ${props.className ?? ""}`} />;
}

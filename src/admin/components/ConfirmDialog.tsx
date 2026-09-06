import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./Button";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger,
  busy,
  children,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  busy?: boolean;
  children?: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-forest/50" aria-label={cancelLabel} onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        tabIndex={-1}
        className="relative w-full max-w-md bg-cream p-6 text-forest shadow-sheet outline-none"
      >
        <h2 id="confirm-title" className="font-[family-name:var(--font-latin)] text-xl font-light tracking-[0.08em] uppercase">
          {title}
        </h2>
        <p className="font-copy mt-3 text-forest/70">{body}</p>
        {children}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

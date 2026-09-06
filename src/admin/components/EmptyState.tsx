import { Link } from "react-router-dom";
import { Button } from "./Button";

export function EmptyState({
  title,
  action,
  to,
}: {
  title: string;
  action?: string;
  to?: string;
}) {
  return (
    <div className="border border-dashed border-forest/20 px-6 py-16 text-center">
      <p className="font-copy text-forest/60">{title}</p>
      {action && to ? (
        <Link to={to} className="mt-6 inline-block">
          <Button variant="terracotta">{action}</Button>
        </Link>
      ) : null}
    </div>
  );
}

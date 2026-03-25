import { cn } from "@/lib/cn";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      <div className="w-16 h-16 rounded-2xl bg-electric/10 flex items-center justify-center mb-4 text-electric">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-navy dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-navy-500 dark:text-white/50 max-w-sm mb-6">{description}</p>
      {actionLabel && (
        actionHref ? (
          <a href={actionHref}>
            <Button size="md">{actionLabel}</Button>
          </a>
        ) : (
          <Button size="md" onClick={onAction}>{actionLabel}</Button>
        )
      )}
    </div>
  );
}

import { Sprout } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4">
        <Sprout className="h-8 w-8 text-muted" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted text-sm mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

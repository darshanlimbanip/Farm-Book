import { cn } from "@/lib/utils";

interface BigNumberStatProps {
  label: string;
  value: string;
  variant?: "default" | "accent" | "danger" | "success";
  className?: string;
}

export function BigNumberStat({
  label,
  value,
  variant = "default",
  className,
}: BigNumberStatProps) {
  const valueColors = {
    default: "text-foreground",
    accent: "text-secondary",
    danger: "text-danger",
    success: "text-success",
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-sm text-muted font-medium">{label}</span>
      <span
        className={cn(
          "text-3xl font-bold tracking-tight",
          valueColors[variant]
        )}
      >
        {value}
      </span>
    </div>
  );
}

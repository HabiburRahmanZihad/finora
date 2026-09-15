import { cn } from "@/lib/utils";

const toneClass = {
  NORMAL: "bg-primary",
  WARNING: "bg-warning",
  EXCEEDED: "bg-danger",
} as const;

export function Progress({
  value,
  tone = "NORMAL",
  className,
}: {
  value: number;
  tone?: keyof typeof toneClass;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all", toneClass[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

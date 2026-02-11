import { CONDITIONS, type ConditionRating } from "@/lib/conditions";

interface ConditionBadgeProps {
  rating: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ConditionBadge({ rating, showLabel = false, size = "sm" }: ConditionBadgeProps) {
  const condition = CONDITIONS[rating as ConditionRating];
  if (!condition) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-sm border border-gold/20 bg-surface-elevated px-2 ${size === "md" ? "py-1.5" : "py-0.5"}`}>
      <span className={`font-sans text-xs font-semibold tracking-wider ${condition.color}`}>
        {rating}
      </span>
      {showLabel && (
        <span className="font-sans text-xs text-muted-foreground">
          {condition.label}
        </span>
      )}
    </div>
  );
}

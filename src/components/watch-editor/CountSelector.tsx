import { cn } from "@/lib/utils";

const OPTIONS = [1, 2, 3];

interface Props {
  value: number;
  onChange: (n: number) => void;
}

export function CountSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mr-1">
        Count
      </span>
      {OPTIONS.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={cn(
            "w-7 h-7 rounded text-xs font-medium transition-all",
            value === n
              ? "bg-gold/20 text-gold border border-gold/40"
              : "bg-surface-elevated text-muted-foreground border border-gold/10 hover:border-gold/30"
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

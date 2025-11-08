import { Badge } from "@/components/ui/badge";

interface XPBarProps {
  currentXP: number;
  totalXP: number;
  level: number;
}

export default function XPBar({ currentXP, totalXP, level }: XPBarProps) {
  const percentage = (currentXP / totalXP) * 100;

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="text-sm font-bold font-['Outfit'] min-w-[60px] justify-center bg-card/50 backdrop-blur-sm border-2"
        >
          Nível {level}
        </Badge>
        <div className="flex-1 h-3 bg-muted/20 backdrop-blur-sm rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              background: "linear-gradient(90deg, hsl(var(--chart-1)), hsl(var(--chart-2)))",
              boxShadow: "0 0 12px hsl(var(--chart-1) / 0.5)",
            }}
          />
        </div>
        <div className="text-sm text-muted-foreground tabular-nums min-w-[80px] text-right">
          {currentXP}/{totalXP} XP
        </div>
      </div>
    </div>
  );
}

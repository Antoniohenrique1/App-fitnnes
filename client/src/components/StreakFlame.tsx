import { Flame, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StreakFlameProps {
  streak: number;
  freezeAvailable?: boolean;
}

export default function StreakFlame({ streak, freezeAvailable }: StreakFlameProps) {
  return (
    <div className="relative">
      <Badge
        variant="outline"
        className="gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm border-2 hover-elevate active-elevate-2"
        data-testid="badge-streak"
      >
        <Flame
          className="w-5 h-5 text-chart-4"
          style={{
            animation: streak > 0 ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none",
          }}
        />
        <span className="text-2xl font-bold font-['Outfit'] tabular-nums">{streak}</span>
        <span className="text-sm text-muted-foreground">dias</span>
      </Badge>
      {freezeAvailable && (
        <Shield className="absolute -top-1 -right-1 w-4 h-4 text-chart-2" />
      )}
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface PRDataPoint {
  week: number;
  value: number;
}

interface PRSparklineProps {
  exerciseName: string;
  data: PRDataPoint[];
  unit?: string;
}

export default function PRSparkline({ exerciseName, data, unit = "kg" }: PRSparklineProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;
  const currentPR = data[data.length - 1]?.value || 0;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <Card className="p-4 hover-elevate">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-sm">{exerciseName}</h4>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-['Outfit'] tabular-nums">{currentPR}</span>
              <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
          </div>
          <TrendingUp className="w-4 h-4 text-chart-1" />
        </div>
        <svg viewBox="0 0 100 40" className="w-full h-12" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" />
              <stop offset="100%" stopColor="hsl(var(--chart-2))" />
            </linearGradient>
          </defs>
          {data.map((d, i) => {
            if (d.value === maxValue) {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - ((d.value - minValue) / range) * 100;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="hsl(var(--chart-1))"
                  stroke="hsl(var(--background))"
                  strokeWidth="1"
                />
              );
            }
            return null;
          })}
        </svg>
      </div>
    </Card>
  );
}

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapDay {
  date: string;
  count: number;
}

interface HeatmapProps {
  data: HeatmapDay[];
}

export default function Heatmap({ data }: HeatmapProps) {
  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/20";
    if (count === 1) return "bg-chart-1/30";
    if (count === 2) return "bg-chart-1/60";
    return "bg-chart-1";
  };

  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-1">
          {week.map((day, dayIndex) => (
            <Tooltip key={`${weekIndex}-${dayIndex}`}>
              <TooltipTrigger asChild>
                <div
                  className={`w-3 h-3 rounded-sm ${getColor(day.count)} hover-elevate cursor-pointer transition-all`}
                  data-testid={`heatmap-cell-${day.date}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {day.date}: {day.count > 0 ? "Treino completo" : "Sem treino"}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      ))}
    </div>
  );
}

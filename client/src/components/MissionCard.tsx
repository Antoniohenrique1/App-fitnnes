import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MissionCardProps {
  title: string;
  description: string;
  progress?: number;
  total?: number;
  completed?: boolean;
  icon: React.ReactNode;
}

export default function MissionCard({
  title,
  description,
  progress,
  total,
  completed = false,
  icon,
}: MissionCardProps) {
  const percentage = progress && total ? (progress / total) * 100 : 0;

  return (
    <Card
      className="p-4 hover-elevate active-elevate-2 transition-all duration-200"
      data-testid={`card-mission-${title.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {completed ? (
            <CheckCircle2 className="w-5 h-5 text-chart-1" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">{icon}</div>
            <h3 className="font-semibold text-sm">{title}</h3>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
          {progress !== undefined && total !== undefined && (
            <div className="space-y-1">
              <Progress value={percentage} className="h-2" />
              <div className="text-xs text-muted-foreground tabular-nums text-right">
                {progress}/{total}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

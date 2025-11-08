import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw } from "lucide-react";

interface WorkoutExerciseCardProps {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  notes?: string;
  onSwap?: () => void;
}

export default function WorkoutExerciseCard({
  name,
  sets,
  reps,
  rest,
  notes,
  onSwap,
}: WorkoutExerciseCardProps) {
  const [completedSets, setCompletedSets] = useState<boolean[]>(new Array(sets).fill(false));
  const [loads, setLoads] = useState<string[]>(new Array(sets).fill(""));
  const [rpes, setRpes] = useState<number[]>(new Array(sets).fill(0));

  const toggleSet = (index: number) => {
    const newCompleted = [...completedSets];
    newCompleted[index] = !newCompleted[index];
    setCompletedSets(newCompleted);
    console.log(`Set ${index + 1} ${newCompleted[index] ? "completed" : "uncompleted"}`);
  };

  return (
    <Card className="p-4 backdrop-blur-md bg-card/50">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{name}</h3>
            <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
              <span>{sets}x {reps}</span>
              <span>•</span>
              <span>{rest}s descanso</span>
            </div>
            {notes && (
              <p className="mt-2 text-xs text-muted-foreground">{notes}</p>
            )}
          </div>
          {onSwap && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onSwap}
              data-testid="button-swap-exercise"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {Array.from({ length: sets }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Button
                size="icon"
                variant={completedSets[index] ? "default" : "outline"}
                onClick={() => toggleSet(index)}
                data-testid={`button-set-${index + 1}`}
                className="shrink-0"
              >
                {completedSets[index] ? <Check className="w-4 h-4" /> : index + 1}
              </Button>
              <Input
                placeholder="Carga (kg)"
                value={loads[index]}
                onChange={(e) => {
                  const newLoads = [...loads];
                  newLoads[index] = e.target.value;
                  setLoads(newLoads);
                }}
                data-testid={`input-load-${index + 1}`}
                className="flex-1"
              />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rpe) => (
                  <Badge
                    key={rpe}
                    variant={rpes[index] === rpe ? "default" : "outline"}
                    className="cursor-pointer min-w-[32px] justify-center"
                    onClick={() => {
                      const newRpes = [...rpes];
                      newRpes[index] = rpe;
                      setRpes(newRpes);
                      console.log(`Set ${index + 1} RPE: ${rpe}`);
                    }}
                    data-testid={`badge-rpe-${index + 1}-${rpe}`}
                  >
                    {rpe}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

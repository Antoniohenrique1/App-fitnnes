import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ExerciseLog } from "@shared/schema";

interface WorkoutExerciseCardProps {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  notes?: string;
  logs?: ExerciseLog[];
  onSwap?: () => void;
  onLogUpdated?: () => void;
}

export default function WorkoutExerciseCard({
  id,
  name,
  sets,
  reps,
  rest,
  notes,
  logs = [],
  onSwap,
  onLogUpdated,
}: WorkoutExerciseCardProps) {
  const [completedSets, setCompletedSets] = useState<boolean[]>(new Array(sets).fill(false));
  const [loads, setLoads] = useState<string[]>(new Array(sets).fill(""));
  const [actualReps, setActualReps] = useState<string[]>(new Array(sets).fill(""));
  const [rpes, setRpes] = useState<number[]>(new Array(sets).fill(0));

  useEffect(() => {
    if (logs.length > 0) {
      const newCompleted = new Array(sets).fill(false);
      const newLoads = new Array(sets).fill("");
      const newActualReps = new Array(sets).fill("");
      const newRpes = new Array(sets).fill(0);

      logs.forEach((log) => {
        const index = log.setNumber - 1;
        if (index >= 0 && index < sets) {
          newCompleted[index] = log.completed;
          newLoads[index] = log.load ? String(log.load) : "";
          newActualReps[index] = log.reps ? String(log.reps) : "";
          newRpes[index] = log.rpe || 0;
        }
      });

      setCompletedSets(newCompleted);
      setLoads(newLoads);
      setActualReps(newActualReps);
      setRpes(newRpes);
    }
  }, [logs, sets]);

  const logSetMutation = useMutation({
    mutationFn: async (data: {
      setNumber: number;
      load?: number;
      reps?: number;
      rpe?: number;
      completed: boolean;
    }) => {
      return await apiRequest("POST", "/api/workouts/log-set", {
        method: "POST",
        body: JSON.stringify({
          workoutExerciseId: id,
          ...data,
        }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      onLogUpdated?.();
    },
  });

  const toggleSet = (index: number) => {
    const newCompleted = [...completedSets];
    newCompleted[index] = !newCompleted[index];
    setCompletedSets(newCompleted);

    logSetMutation.mutate({
      setNumber: index + 1,
      load: loads[index] ? parseFloat(loads[index]) : undefined,
      reps: actualReps[index] ? parseInt(actualReps[index]) : undefined,
      rpe: rpes[index] || undefined,
      completed: newCompleted[index],
    });
  };

  const handleLoadChange = (index: number, value: string) => {
    const newLoads = [...loads];
    newLoads[index] = value;
    setLoads(newLoads);

    if (value && completedSets[index]) {
      logSetMutation.mutate({
        setNumber: index + 1,
        load: parseFloat(value),
        reps: actualReps[index] ? parseInt(actualReps[index]) : undefined,
        rpe: rpes[index] || undefined,
        completed: completedSets[index],
      });
    }
  };

  const handleRepsChange = (index: number, value: string) => {
    const newActualReps = [...actualReps];
    newActualReps[index] = value;
    setActualReps(newActualReps);

    if (value && completedSets[index]) {
      logSetMutation.mutate({
        setNumber: index + 1,
        load: loads[index] ? parseFloat(loads[index]) : undefined,
        reps: parseInt(value),
        rpe: rpes[index] || undefined,
        completed: completedSets[index],
      });
    }
  };

  const handleRpeChange = (index: number, rpe: number) => {
    const newRpes = [...rpes];
    newRpes[index] = rpe;
    setRpes(newRpes);

    if (completedSets[index]) {
      logSetMutation.mutate({
        setNumber: index + 1,
        load: loads[index] ? parseFloat(loads[index]) : undefined,
        reps: actualReps[index] ? parseInt(actualReps[index]) : undefined,
        rpe,
        completed: completedSets[index],
      });
    }
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
                type="number"
                value={loads[index]}
                onChange={(e) => handleLoadChange(index, e.target.value)}
                data-testid={`input-load-${index + 1}`}
                className="flex-1"
              />
              <Input
                placeholder="Reps"
                type="number"
                value={actualReps[index]}
                onChange={(e) => handleRepsChange(index, e.target.value)}
                data-testid={`input-reps-${index + 1}`}
                className="w-20"
              />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rpe) => (
                  <Badge
                    key={rpe}
                    variant={rpes[index] === rpe ? "default" : "outline"}
                    className="cursor-pointer min-w-[32px] justify-center"
                    onClick={() => handleRpeChange(index, rpe)}
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

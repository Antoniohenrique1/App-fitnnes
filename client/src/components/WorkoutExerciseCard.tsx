
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw, History, ChevronRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ExerciseLog } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';

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
  onRestStart?: (duration: number) => void;
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
  onRestStart
}: WorkoutExerciseCardProps) {
  const [completedSets, setCompletedSets] = useState<boolean[]>(new Array(sets).fill(false));
  const [loads, setLoads] = useState<string[]>(new Array(sets).fill(""));
  const [actualReps, setActualReps] = useState<string[]>(new Array(sets).fill(""));
  const [rpes, setRpes] = useState<number[]>(new Array(sets).fill(0));
  const [expandedSet, setExpandedSet] = useState<number | null>(0); // Start with first set expanded

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

      const firstIncomplete = newCompleted.findIndex(c => !c);
      if (firstIncomplete !== -1) setExpandedSet(firstIncomplete);
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
    const isCompleting = !completedSets[index];
    const newCompleted = [...completedSets];
    newCompleted[index] = isCompleting;
    setCompletedSets(newCompleted);

    if (isCompleting) {
      if (navigator.vibrate) navigator.vibrate(50);

      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#ADFF2F', '#ffffff'],
        disableForReducedMotion: true,
        startVelocity: 20
      });

      onRestStart?.(rest);

      if (index < sets - 1) {
        setTimeout(() => setExpandedSet(index + 1), 500);
      }
    }

    logSetMutation.mutate({
      setNumber: index + 1,
      load: loads[index] ? parseFloat(loads[index]) : undefined,
      reps: actualReps[index] ? parseInt(actualReps[index]) : undefined,
      rpe: rpes[index] || undefined,
      completed: newCompleted[index],
    });
  };

  const updateSetData = (index: number, field: 'load' | 'reps', value: string) => {
    if (field === 'load') {
      const newLoads = [...loads];
      newLoads[index] = value;
      setLoads(newLoads);
    } else {
      const newReps = [...actualReps];
      newReps[index] = value;
      setActualReps(newReps);
    }

    if (completedSets[index]) {
      const loadVal = field === 'load' ? value : loads[index];
      const repsVal = field === 'reps' ? value : actualReps[index];

      const timeoutId = setTimeout(() => {
        logSetMutation.mutate({
          setNumber: index + 1,
          load: loadVal ? parseFloat(loadVal) : undefined,
          reps: repsVal ? parseInt(repsVal) : undefined,
          rpe: rpes[index] || undefined,
          completed: true,
        });
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <Card className="overflow-hidden border-white/5 bg-card/40 backdrop-blur-md relative">
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-1000 ease-out"
        style={{ width: `${(completedSets.filter(Boolean).length / sets) * 100}%` }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <h3 className="font-bold text-xl font-['Outfit'] text-white tracking-tight">{name}</h3>
            <div className="flex gap-3 mt-2 text-sm text-muted-foreground/80">
              <Badge variant="outline" className="border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10">
                {sets} Séries
              </Badge>
              <Badge variant="outline" className="border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10">
                {reps} Reps
              </Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                {rest}s Descanso
              </Badge>
            </div>
            {notes && (
              <p className="mt-3 text-xs text-muted-foreground/60 border-l-2 border-primary/30 pl-3 italic">
                "{notes}"
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white">
              <History className="w-4 h-4" />
            </Button>
            {onSwap && (
              <Button size="icon" variant="ghost" onClick={onSwap} className="h-8 w-8 text-muted-foreground hover:text-white">
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: sets }).map((_, index) => {
            const isDone = completedSets[index];
            const isCurrent = expandedSet === index;

            return (
              <motion.div
                key={index}
                layout
                initial={false}
                animate={{ backgroundColor: isDone ? "rgba(34, 197, 94, 0.05)" : "transparent" }}
                className={`rounded-xl border transition-all duration-300 ${isCurrent ? 'border-primary/50 shadow-[0_0_15px_-5px_rgba(173,255,47,0.1)] bg-white/[0.02]' : 'border-white/5'}`}
              >
                <div
                  className="flex items-center gap-4 p-3 cursor-pointer"
                  onClick={() => setExpandedSet(isCurrent ? null : index)}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border
                    ${isDone ? 'bg-primary text-black border-primary' : 'bg-transparent text-muted-foreground border-white/10'}
                  `}>
                    {isDone ? <Check className="w-4 h-4" /> : index + 1}
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-8 text-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Carga</span>
                      <span className={`font-mono font-medium ${isDone ? 'text-white' : 'text-muted-foreground'}`}>
                        {loads[index] || '-'} <span className="text-xs opacity-50">kg</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Reps</span>
                      <span className={`font-mono font-medium ${isDone ? 'text-white' : 'text-muted-foreground'}`}>
                        {actualReps[index] || '-'}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isCurrent ? 'rotate-90' : ''}`} />
                </div>

                <AnimatePresence>
                  {isCurrent && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 pt-0 grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground font-medium ml-1">Carga (kg)</label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline" size="icon" className="h-10 w-10 shrink-0 border-white/10"
                              onClick={() => updateSetData(index, 'load', String(Math.max(0, (parseFloat(loads[index] || '0') - 1))))}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              value={loads[index]}
                              onChange={(e) => updateSetData(index, 'load', e.target.value)}
                              className="h-10 text-center font-mono text-lg bg-black/20 border-white/10"
                              placeholder="0"
                            />
                            <Button
                              variant="outline" size="icon" className="h-10 w-10 shrink-0 border-white/10"
                              onClick={() => updateSetData(index, 'load', String((parseFloat(loads[index] || '0') + 1)))}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground font-medium ml-1">Repetições</label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline" size="icon" className="h-10 w-10 shrink-0 border-white/10"
                              onClick={() => updateSetData(index, 'reps', String(Math.max(0, (parseInt(actualReps[index] || '0') - 1))))}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              value={actualReps[index]}
                              onChange={(e) => updateSetData(index, 'reps', e.target.value)}
                              className="h-10 text-center font-mono text-lg bg-black/20 border-white/10"
                              placeholder="0"
                            />
                            <Button
                              variant="outline" size="icon" className="h-10 w-10 shrink-0 border-white/10"
                              onClick={() => updateSetData(index, 'reps', String((parseInt(actualReps[index] || '0') + 1)))}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <Button
                          className={`col-span-2 h-12 mt-2 font-bold tracking-wide transition-all ${isDone ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(173,255,47,0.3)]'}`}
                          onClick={() => toggleSet(index)}
                        >
                          {isDone ? "DESMARCAR SÉRIE" : "CONCLUIR SÉRIE"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function Minus({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /></svg>
}

function Plus({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
}

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import WorkoutExerciseCard from "@/components/WorkoutExerciseCard";
import { TimerIsland } from "@/components/ui/timer-island";
import { ArrowLeft, Clock, Target, Rocket, Dumbbell, Zap, Trophy, Play } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Workout, WorkoutExercise, ExerciseLog } from "@shared/schema";
import { AnimatePresence, motion } from "framer-motion";

type WorkoutExerciseWithLogs = WorkoutExercise & { logs: ExerciseLog[] };

export default function WorkoutDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Timer State
  const [timerDuration, setTimerDuration] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const { data, isLoading, refetch, error } = useQuery<{
    workout: Workout;
    exercises: WorkoutExerciseWithLogs[];
  }>({
    queryKey: ["/api", "workouts", id],
    enabled: !!id,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar treino",
        description: "Não foi possível carregar os detalhes do treino.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleRestStart = (duration: number) => {
    setTimerDuration(duration);
    setIsTimerActive(true);
  };

  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/workouts/${id}/complete`);
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api", "user", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api", "workouts", "today"] });
      queryClient.invalidateQueries({ queryKey: ["/api", "missions", "today"] });

      toast({
        title: "SESSÃO FINALIZADA! 🏆",
        description: `+${data.xpGain || 50} XP Adicionados ao seu legado.`,
        className: "bg-primary/20 border-primary text-white backdrop-blur-md",
      });

      setTimeout(() => {
        setLocation("/dashboard");
      }, 1500);
    },
    onError: () => {
      toast({
        title: "Erro ao finalizar treino",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary fill-current animate-pulse" />
          </div>
        </div>
        <p className="text-muted-foreground font-mono text-sm animate-pulse">CARREGANDO PROTOCOLO...</p>
      </div>
    );
  }

  const { workout, exercises } = data;

  return (
    <div className="min-h-screen bg-transparent flex flex-col pb-24 relative">
      {/* AMBIENT BACKGROUND */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <AnimatePresence>
        {isTimerActive && (
          <TimerIsland
            key={timerDuration}
            seconds={timerDuration}
            isActive={isTimerActive}
            onComplete={() => setIsTimerActive(false)}
          />
        )}
      </AnimatePresence>

      <nav className="sticky top-0 bg-background/80 backdrop-blur-xl z-40 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-white/10 text-muted-foreground hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Abandonar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-red-500 tracking-widest uppercase">Gravando</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full space-y-8 relative z-10">

        {/* HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="outline" className="mb-2 border-primary/30 text-primary bg-primary/10 tracking-widest text-[10px] uppercase">
                Hipertrofia
              </Badge>
              <h1 className="text-3xl md:text-4xl font-black font-['Outfit'] italic tracking-tighter text-white uppercase leading-none">
                {workout.focus}
              </h1>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-bold font-mono text-white">{exercises.length}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Exercícios</span>
            </div>
          </div>

          {/* KEY STATS GLASS PANEL */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center">
              <Clock className="w-5 h-5 text-accent mb-1" />
              <span className="text-lg font-bold text-white">{workout.duration}</span>
              <span className="text-[10px] text-muted-foreground uppercase">Minutos</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary mb-1" />
              <span className="text-lg font-bold text-white">{exercises.reduce((acc, ex) => acc + ex.sets, 0)}</span>
              <span className="text-[10px] text-muted-foreground uppercase">Séries</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-400 mb-1" />
              <span className="text-lg font-bold text-white">Alta</span>
              <span className="text-[10px] text-muted-foreground uppercase">Intensidade</span>
            </div>
          </div>
        </motion.div>

        {/* WORKOUT LIST */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Protocolo de Execução</h2>
            <span className="text-xs text-primary">{Math.round((exercises.filter((e: any) => e.logs?.some((l: any) => l.completed)).length / exercises.length) * 100)}% Concluído</span>
          </div>

          <div className="space-y-4">
            {exercises.map((exercise: WorkoutExerciseWithLogs, index: number) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <WorkoutExerciseCard
                  id={exercise.id.toString()}
                  name={exercise.exerciseName}
                  sets={exercise.sets}
                  reps={exercise.reps}
                  rest={exercise.rest}
                  notes={exercise.notes || undefined}
                  logs={exercise.logs}
                  onLogUpdated={() => refetch()}
                  onSwap={() => console.log(`Swap exercise: ${exercise.exerciseName}`)}
                  onRestStart={handleRestStart}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* FINISH BUTTON - FIXED BOTTOM MOBILE */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background/95 to-transparent z-30">
          <div className="max-w-4xl mx-auto">
            <Button
              className="w-full h-16 text-lg font-bold tracking-widest uppercase bg-primary text-black hover:bg-white hover:scale-[1.02] transition-all duration-300 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)] rounded-2xl group relative overflow-hidden"
              size="lg"
              data-testid="button-finish-workout"
              onClick={() => completeWorkoutMutation.mutate()}
              disabled={completeWorkoutMutation.isPending}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {completeWorkoutMutation.isPending ? "PROCESSANDO DADOS..." : "FINALIZAR SESSÃO"}
                {!completeWorkoutMutation.isPending && <Trophy className="w-6 h-6 fill-black" />}
              </span>

              {/* Sweep Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

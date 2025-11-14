import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import WorkoutExerciseCard from "@/components/WorkoutExerciseCard";
import { ArrowLeft, Clock, Target } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Workout, WorkoutExercise, ExerciseLog } from "@shared/schema";

type WorkoutExerciseWithLogs = WorkoutExercise & { logs: ExerciseLog[] };

export default function WorkoutDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
        title: "Treino concluído! 🎉",
        description: `Você ganhou ${data.xpGain || 50} XP!`,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </nav>
        <div className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full space-y-8">
          <Skeleton className="w-full h-20" />
          <Skeleton className="w-full h-32" />
          <Skeleton className="w-full h-64" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </nav>
        <div className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Treino não encontrado</p>
          </Card>
        </div>
      </div>
    );
  }

  const { workout, exercises } = data;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <Badge variant="outline" className="gap-2">
            <Clock className="w-3 h-3" />
            {workout.duration} min
          </Badge>
        </div>
      </nav>

      <div className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Treino de Hoje</span>
          </div>
          <h1 className="text-3xl font-bold font-['Outfit']">{workout.focus}</h1>
        </div>

        <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold font-['Outfit'] tabular-nums">{exercises.length}</div>
              <div className="text-xs text-muted-foreground">exercícios</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-['Outfit'] tabular-nums">
                {exercises.reduce((acc: number, ex: WorkoutExerciseWithLogs) => acc + ex.sets, 0)}
              </div>
              <div className="text-xs text-muted-foreground">séries totais</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-['Outfit'] tabular-nums">{workout.duration}</div>
              <div className="text-xs text-muted-foreground">minutos</div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold font-['Outfit']">Exercícios</h2>
          {exercises.map((exercise: WorkoutExerciseWithLogs) => (
            <WorkoutExerciseCard
              key={exercise.id}
              id={exercise.id}
              name={exercise.exerciseName}
              sets={exercise.sets}
              reps={exercise.reps}
              rest={exercise.rest}
              notes={exercise.notes || undefined}
              logs={exercise.logs}
              onLogUpdated={() => refetch()}
              onSwap={() => console.log(`Swap exercise: ${exercise.exerciseName}`)}
            />
          ))}
        </div>

        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            <strong>Dica:</strong> Se sentir dor maior que 6/10 em qualquer exercício, clique em trocar para receber uma alternativa segura.
          </p>
        </Card>

        <Button 
          className="w-full" 
          size="lg" 
          data-testid="button-finish-workout"
          onClick={() => completeWorkoutMutation.mutate()}
          disabled={completeWorkoutMutation.isPending}
        >
          {completeWorkoutMutation.isPending ? "Finalizando..." : "Finalizar Treino"}
        </Button>
      </div>
    </div>
  );
}

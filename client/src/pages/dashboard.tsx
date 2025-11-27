import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import ActivityRing from "@/components/ActivityRing";
import XPBar from "@/components/XPBar";
import StreakFlame from "@/components/StreakFlame";
import MissionCard from "@/components/MissionCard";
import CheckinSlider from "@/components/CheckinSlider";
import { Play, Zap, RefreshCw, Menu, Trophy, TrendingUp, Users, User as UserIcon, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UserStats, Workout, Mission } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [mood, setMood] = useState(7);
  const [sleep, setSleep] = useState(7);
  const [pain, setPain] = useState(2);
  const [fatigue, setFatigue] = useState(3);
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<UserStats>({
    queryKey: ["/api", "user", "stats"],
  });

  const { data: todayWorkoutData, isLoading: workoutLoading, error: workoutError } = useQuery<{
    workout: Workout | null;
    exercises: Array<{
      id: number;
      name: string;
      sets: number;
      repsMin: number;
      repsMax: number;
      restSeconds: number;
    }>;
  }>({
    queryKey: ["/api", "workouts", "today"],
  });

  const { data: missions = [], isLoading: missionsLoading, error: missionsError } = useQuery<Mission[]>({
    queryKey: ["/api", "missions", "today"],
  });

  useEffect(() => {
    if (statsError) {
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Não foi possível carregar suas estatísticas.",
        variant: "destructive",
      });
    }
  }, [statsError, toast]);

  useEffect(() => {
    if (workoutError) {
      toast({
        title: "Erro ao carregar treino",
        description: "Não foi possível carregar o treino de hoje.",
        variant: "destructive",
      });
    }
  }, [workoutError, toast]);

  useEffect(() => {
    if (missionsError) {
      toast({
        title: "Erro ao carregar missões",
        description: "Não foi possível carregar as missões de hoje.",
        variant: "destructive",
      });
    }
  }, [missionsError, toast]);

  const checkinMutation = useMutation({
    mutationFn: async (data: { mood: number; sleep: number; pain: number; fatigue: number }) => {
      const response = await apiRequest("POST", "/api/checkin", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "user", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api", "workouts", "today"] });
      queryClient.invalidateQueries({ queryKey: ["/api", "missions", "today"] });
      setCheckinOpen(false);
      toast({
        title: "Check-in realizado!",
        description: "Seu treino foi adaptado com base nas suas condições.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao fazer check-in",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCheckin = () => {
    checkinMutation.mutate({ mood, sleep, pain, fatigue });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Play className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold font-['Outfit']">FitCoach AI</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/evolution" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Evolução</Link>
              <Link href="/leagues" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Ligas</Link>
              <Link href="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Profissionais</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {statsLoading ? (
              <Skeleton className="w-20 h-8" />
            ) : (
              <StreakFlame 
                streak={stats?.streak || 0} 
                freezeAvailable={(stats?.streakFreezes || 0) > 0} 
              />
            )}
            <Link href="/account">
              <Button size="icon" variant="ghost" data-testid="button-account">
                <UserIcon className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="icon" variant="ghost" className="md:hidden" data-testid="button-menu">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold font-['Outfit']">Bom dia! 👋</h1>
          {statsLoading ? (
            <Skeleton className="w-full h-10" />
          ) : (
            <XPBar 
              currentXP={stats?.xp || 0} 
              totalXP={1200} 
              level={stats?.level || 1} 
            />
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-8">
              <div className="flex justify-center mb-8">
                <div className="relative w-[140px] h-[140px]">
                  <ActivityRing 
                    percentage={85} 
                    color="hsl(var(--chart-1))" 
                    size={140} 
                    strokeWidth={14}
                    showLabel={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ActivityRing 
                      percentage={72} 
                      color="hsl(var(--chart-2))" 
                      size={98} 
                      strokeWidth={14}
                      showLabel={false}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ActivityRing 
                      percentage={90} 
                      color="hsl(var(--chart-3))" 
                      size={56} 
                      strokeWidth={14}
                      showLabel={false}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold font-['Outfit'] tabular-nums text-chart-1">34</div>
                  <div className="text-xs text-muted-foreground">minutos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-['Outfit'] tabular-nums text-chart-2">18/25</div>
                  <div className="text-xs text-muted-foreground">séries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-['Outfit'] tabular-nums text-chart-3">90%</div>
                  <div className="text-xs text-muted-foreground">recuperação</div>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Dialog open={checkinOpen} onOpenChange={setCheckinOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2 h-12" size="lg" data-testid="button-start-workout">
                    <Play className="w-5 h-5" />
                    Iniciar Treino
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Check-in Diário</DialogTitle>
                    <DialogDescription>
                      Como você está hoje? Vou adaptar o treino pra você.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <CheckinSlider
                      label="Como você está se sentindo?"
                      value={mood}
                      onChange={setMood}
                      emoji={["😫", "😕", "😐", "🙂", "😊"]}
                    />
                    <CheckinSlider
                      label="Horas de sono"
                      value={sleep}
                      onChange={setSleep}
                      min={0}
                      max={12}
                    />
                    <CheckinSlider
                      label="Nível de dor"
                      value={pain}
                      onChange={setPain}
                      emoji={["😌", "😌", "😐", "😣", "😖"]}
                    />
                    <CheckinSlider
                      label="Nível de fadiga"
                      value={fatigue}
                      onChange={setFatigue}
                      emoji={["🔋", "🔋", "⚡", "🪫", "💤"]}
                    />
                    <Button onClick={handleCheckin} className="w-full" data-testid="button-confirm-checkin">
                      Confirmar e adaptar treino
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="gap-2" data-testid="button-express-workout">
                  <Zap className="w-4 h-4" />
                  Versão Express
                </Button>
                <Button variant="outline" className="gap-2" data-testid="button-swap-exercise">
                  <RefreshCw className="w-4 h-4" />
                  Trocar Exercício
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Missões de Hoje</h3>
              {missionsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="w-full h-20" />
                  <Skeleton className="w-full h-20" />
                  <Skeleton className="w-full h-20" />
                </div>
              ) : missions.length > 0 ? (
                <div className="space-y-3">
                  {missions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      title={mission.title}
                      description={mission.description}
                      progress={mission.progress}
                      total={mission.target}
                      completed={mission.completed}
                      icon={
                        mission.type === "workout" ? <Play className="w-4 h-4" /> :
                        mission.type === "volume" ? <Trophy className="w-4 h-4" /> :
                        <TrendingUp className="w-4 h-4" />
                      }
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Nenhuma missão disponível hoje
                  </p>
                </Card>
              )}
            </div>

            {workoutLoading ? (
              <Skeleton className="w-full h-48" />
            ) : todayWorkoutData?.workout ? (
              <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Treino de Hoje</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Foco</span>
                      <span className="font-medium">{todayWorkoutData.workout.focus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duração</span>
                      <span className="font-medium">{todayWorkoutData.workout.duration} minutos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Exercícios</span>
                      <span className="font-medium">{todayWorkoutData.exercises.length} exercícios</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setLocation(`/workout/${todayWorkoutData.workout?.id}`)}
                    data-testid="button-view-workout"
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Treino de Hoje</h3>
                  <p className="text-sm text-muted-foreground">
                    Nenhum treino programado para hoje
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

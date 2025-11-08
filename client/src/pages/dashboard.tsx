import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ActivityRing from "@/components/ActivityRing";
import XPBar from "@/components/XPBar";
import StreakFlame from "@/components/StreakFlame";
import MissionCard from "@/components/MissionCard";
import CheckinSlider from "@/components/CheckinSlider";
import { Play, Zap, RefreshCw, Menu, Trophy, TrendingUp, Users, User as UserIcon, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [mood, setMood] = useState(7);
  const [sleep, setSleep] = useState(7);
  const [pain, setPain] = useState(2);
  const [fatigue, setFatigue] = useState(3);

  const handleCheckin = () => {
    console.log("Check-in completed", { mood, sleep, pain, fatigue });
    setCheckinOpen(false);
    console.log("Workout adjusted based on check-in");
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
              <Link href="/dashboard">
                <a className="text-sm font-medium hover:text-primary transition-colors">Dashboard</a>
              </Link>
              <Link href="/evolution">
                <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Evolução</a>
              </Link>
              <Link href="/leagues">
                <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Ligas</a>
              </Link>
              <Link href="/marketplace">
                <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Profissionais</a>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StreakFlame streak={12} freezeAvailable />
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
          <XPBar currentXP={850} totalXP={1200} level={12} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-8">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <ActivityRing percentage={85} color="hsl(var(--chart-1))" size={140} strokeWidth={14} label="Treino" value="34min" />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "scale(0.7)" }}>
                    <ActivityRing percentage={72} color="hsl(var(--chart-2))" size={140} strokeWidth={14} label="Volume" value="18/25" />
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "scale(0.7)" }}>
                      <ActivityRing percentage={90} color="hsl(var(--chart-3))" size={140} strokeWidth={14} label="Recuperação" value="90%" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold font-['Outfit'] tabular-nums">34</div>
                  <div className="text-xs text-muted-foreground">minutos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-['Outfit'] tabular-nums">18/25</div>
                  <div className="text-xs text-muted-foreground">séries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-['Outfit'] tabular-nums">90%</div>
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
              <div className="space-y-3">
                <MissionCard
                  title="Fechar 2 anéis"
                  description="Complete os anéis de Treino e Volume"
                  progress={1}
                  total={2}
                  icon={<Play className="w-4 h-4" />}
                />
                <MissionCard
                  title="Treino completo"
                  description="Complete todas as séries planejadas"
                  completed
                  icon={<Trophy className="w-4 h-4" />}
                />
                <MissionCard
                  title="Aumentar carga"
                  description="Progresso no supino reto"
                  progress={82.5}
                  total={85}
                  icon={<TrendingUp className="w-4 h-4" />}
                />
              </div>
            </div>

            <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Treino de Hoje</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Foco</span>
                    <span className="font-medium">Peito e Tríceps</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duração</span>
                    <span className="font-medium">45 minutos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Exercícios</span>
                    <span className="font-medium">6 exercícios</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setLocation("/workout/today")}
                  data-testid="button-view-workout"
                >
                  Ver Detalhes
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

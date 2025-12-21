
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
import { PanicPanel } from "@/components/dashboard/panic-panel";
import { MatrixLoader } from "@/components/ui/matrix-loader";
import { LevelUpOverlay } from "@/components/ui/level-up-overlay";
import { Play, Zap, RefreshCw, Menu, Trophy, TrendingUp, Users, User as UserIcon, LogOut, Sparkles, Dumbbell, Calendar, Target } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UserStats, Workout, Mission } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [mood, setMood] = useState(7);
  const [sleep, setSleep] = useState(7);
  const [pain, setPain] = useState(2);
  const [fatigue, setFatigue] = useState(3);
  const { toast } = useToast();

  const [isMatrixLoading, setIsMatrixLoading] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

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
    if (statsError) toast({ title: "Erro de Conexão", description: "Verifique sua internet.", variant: "destructive" });
  }, [statsError, toast]);

  const checkinMutation = useMutation({
    mutationFn: async (data: { mood: number; sleep: number; pain: number; fatigue: number }) => {
      const response = await apiRequest("POST", "/api/checkin", data);
      return await response.json();
    },
    onSuccess: () => {
      setCheckinOpen(false);
      setIsMatrixLoading(true);
    },
  });

  const handleCheckin = () => {
    checkinMutation.mutate({ mood, sleep, pain, fatigue });
  };

  const onMatrixComplete = () => {
    setIsMatrixLoading(false);
    queryClient.invalidateQueries({ queryKey: ["/api", "user", "stats"] });
    toast({
      title: "BOOST ATIVADO 🚀",
      description: "Séries calibradas para hipertrofia máxima.",
      className: "border-primary text-primary-foreground bg-primary/20 backdrop-blur-md",
    });
  };

  const triggerFakeMatrix = () => setIsMatrixLoading(true);
  const triggerFakeLevelUp = () => setShowLevelUp(true);

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden pb-20">

      {/* Dynamic Background Blurs */}
      <div className="fixed top-[-10%] left-[-20%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" />
      <div className="fixed bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <AnimatePresence>
        {isMatrixLoading && <MatrixLoader onComplete={onMatrixComplete} />}
      </AnimatePresence>

      <LevelUpOverlay
        isOpen={showLevelUp}
        level={stats?.level ? stats.level + 1 : 2}
        newBadges={["Hipertrofia I", "Consistency King"]}
        onClose={() => setShowLevelUp(false)}
      />

      {/* HEADER */}
      <nav className="sticky top-0 z-40 px-4 py-4 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary/30 transition-colors">
                <Zap className="w-5 h-5 text-primary fill-current" />
              </div>
              <span className="text-2xl font-black font-['Outfit'] tracking-tighter italic uppercase text-white">
                Agreste<span className="text-primary">.AI</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 border border-white/5">
              <StreakFlame streak={stats?.streak || 0} freezeAvailable={(stats?.streakFreezes || 0) > 0} />
            </div>
            <Link href="/account">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto px-4 w-full space-y-6 pt-6 z-10">

        {/* WELCOME SECTION */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold font-['Outfit'] text-white">
              Bom dia, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Lenda</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Foco de hoje: <span className="text-white">Costas & Bíceps</span></p>
          </div>
          <StreakFlame streak={stats?.streak || 0} freezeAvailable={false} className="md:hidden" />
        </motion.div>

        {/* PANIC PANEL - Now simpler and cleaner */}
        <PanicPanel />

        {/* XP BAR CARD */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-1 rounded-2xl bg-gradient-to-r from-white/5 to-transparent border-0 ring-1 ring-white/10">
            <div className="bg-card/50 backdrop-blur-md rounded-xl p-4">
              <XPBar currentXP={stats?.xp || 0} totalXP={1200} level={stats?.level || 1} />
            </div>
          </Card>
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* WORKOUT ACTION CARD - THE HERO */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <Card className="relative overflow-hidden border-0 bg-card/60 backdrop-blur-xl ring-1 ring-white/10 rounded-3xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative p-6 z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                      <Target className="w-3 h-3" /> Hipertrofia
                    </span>
                    <h2 className="text-3xl font-black font-['Outfit'] text-white uppercase tracking-tight leading-none mt-2">
                      Protocolo<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">Alpha</span>
                    </h2>
                  </div>

                  {/* MINI RINGS */}
                  <div className="relative w-16 h-16">
                    <ActivityRing percentage={stats?.streak ? 80 : 0} size={64} strokeWidth={6} color="hsl(var(--primary))" showLabel={false} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/5 flex flex-col items-center justify-center gap-1">
                    <Dumbbell className="w-5 h-5 text-accent mb-1" />
                    <span className="text-lg font-bold text-white">6</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Exercícios</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/5 flex flex-col items-center justify-center gap-1">
                    <Calendar className="w-5 h-5 text-secondary mb-1" />
                    <span className="text-lg font-bold text-white">45m</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Duração</span>
                  </div>
                </div>

                {todayWorkoutData?.workout ? (
                  <Link href={`/workout/${todayWorkoutData.workout.id}`}>
                    <Button className="w-full h-14 bg-primary text-black hover:bg-primary/90 font-bold text-base rounded-xl shadow-neon hover:scale-[1.02] transition-all duration-300">
                      <Play className="w-5 h-5 mr-2 fill-black" /> INICIAR SESSÃO
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <Button
                      className="w-full h-14 bg-white/10 text-white hover:bg-white/20 font-bold text-base rounded-xl border border-white/10"
                      onClick={() => setCheckinOpen(true)}
                    >
                      <RefreshCw className="w-5 h-5 mr-2" /> CALIBRAR AGORA
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={triggerFakeMatrix} className="flex-1 text-xs text-muted-foreground">Tech Demo</Button>
                      <Button variant="ghost" size="sm" onClick={triggerFakeLevelUp} className="flex-1 text-xs text-muted-foreground">Lvl Demo</Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* CHECKIN DIALOG */}
            <Dialog open={checkinOpen} onOpenChange={setCheckinOpen}>
              <DialogContent className="border-0 bg-zinc-950/90 backdrop-blur-2xl sm:max-w-[425px] gap-6 rounded-3xl ring-1 ring-white/10">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold font-['Outfit'] text-center">Calibração</DialogTitle>
                  <DialogDescription className="text-center text-white/60">Ajuste fino da IA para hoje</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-2">
                  <CheckinSlider label="⚡ Energia" value={fatigue} onChange={setFatigue} emoji={["💀", "🪫", "🔋", "⚡", "☢️"]} />
                  <CheckinSlider label="🧠 Foco" value={mood} onChange={setMood} emoji={["🌫️", "☁️", "🌤️", "☀️", "🔥"]} />
                  <Button onClick={handleCheckin} className="w-full h-12 bg-primary text-black font-bold shadow-neon text-lg rounded-xl">
                    APLICAR
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* MISSIONS & STATS */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-4">

            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /> Missões</h3>
              <span className="text-xs font-medium text-muted-foreground bg-white/5 px-2 py-1 rounded-lg">Reset em 4h</span>
            </div>

            <div className="grid gap-3">
              {missionsLoading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/5" />)
              ) : missions.length > 0 ? (
                missions.map(m => (
                  <MissionCard key={m.id} title={m.title} description={m.description} progress={m.progress} total={m.target} completed={m.completed}
                    icon={m.type === 'workout' ? <Dumbbell className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  />
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">Tudo feito por hoje!</p>
                </div>
              )}
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button variant="outline" className="h-12 border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 hover:text-primary transition-all rounded-xl">
                <Users className="w-4 h-4 mr-2" /> Comunidade
              </Button>
              <Button variant="outline" className="h-12 border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent/50 hover:text-accent transition-all rounded-xl">
                <TrendingUp className="w-4 h-4 mr-2" /> Ranking
              </Button>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}

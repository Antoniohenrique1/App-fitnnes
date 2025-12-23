import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Heatmap from "@/components/Heatmap";
import PRSparkline from "@/components/PRSparkline";
import BadgeGrid from "@/components/BadgeGrid";
import { Play, Menu, User as UserIcon, Calendar, TrendingUp, Award } from "lucide-react";
import { Link } from "wouter";
import StreakFlame from "@/components/StreakFlame";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { UserStats, PersonalRecord, UserBadge } from "@shared/schema";

const BADGE_DEFINITIONS = {
  streak_7: { id: "streak_7", title: "Sequência de Fogo", description: "Mantenha 7 dias seguidos", icon: "flame" as const, rarity: "epic" as const },
  workouts_30: { id: "workouts_30", title: "Mês Épico", description: "Complete 30 dias de treino", icon: "award" as const, rarity: "legendary" as const },
  first_pr: { id: "first_pr", title: "PR Conquistado", description: "Estabeleça um novo recorde pessoal", icon: "zap" as const, rarity: "epic" as const },
  novice: { id: "novice", title: "Novato", description: "Complete 3 dias de treino", icon: "star" as const, rarity: "common" as const },
  week_warrior: { id: "week_warrior", title: "1ª Semana", description: "Complete uma semana completa", icon: "trophy" as const, rarity: "rare" as const },
  dedicated: { id: "dedicated", title: "Dedicação Total", description: "Complete 100 treinos", icon: "heart" as const, rarity: "legendary" as const },
};

import { Navbar } from "@/components/Navbar";

export default function Evolution() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<UserStats>({
    queryKey: ["/api", "user", "stats"],
  });

  const { data: personalRecords = [], isLoading: prsLoading, error: prsError } = useQuery<PersonalRecord[]>({
    queryKey: ["/api", "personal-records"],
  });

  const { data: userBadges = [], isLoading: badgesLoading, error: badgesError } = useQuery<UserBadge[]>({
    queryKey: ["/api", "badges"],
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
    if (prsError) {
      toast({
        title: "Erro ao carregar recordes",
        description: "Não foi possível carregar seus recordes pessoais.",
        variant: "destructive",
      });
    }
  }, [prsError, toast]);

  useEffect(() => {
    if (badgesError) {
      toast({
        title: "Erro ao carregar badges",
        description: "Não foi possível carregar suas conquistas.",
        variant: "destructive",
      });
    }
  }, [badgesError, toast]);

  const heatmapData = Array.from({ length: 84 }, (_, i) => ({
    date: new Date(Date.now() - (83 - i) * 86400000).toISOString().split("T")[0],
    count: Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0,
  }));

  const rpeData = [
    { rpe: "1-2", count: 12 },
    { rpe: "3-4", count: 45 },
    { rpe: "5-6", count: 78 },
    { rpe: "7-8", count: 52 },
    { rpe: "9-10", count: 8 },
  ];

  const sleepPerformanceData = Array.from({ length: 30 }, (_, i) => ({
    sleep: 5 + Math.random() * 4,
    performance: 60 + Math.random() * 40,
  }));

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
  const badges = Object.values(BADGE_DEFINITIONS).map(badge => ({
    ...badge,
    earned: earnedBadgeIds.has(badge.id),
  }));

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col relative overflow-hidden pb-24">
      {/* Dynamic Background Blurs */}
      <div className="fixed top-[-10%] left-[-20%] w-[70%] h-[70%] bg-primary-main/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-8 z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">SUA <span className="text-primary-main">EVOLUÇÃO</span></h1>
          <p className="text-sm text-muted-foreground font-bold mt-2 uppercase tracking-widest">Acompanhe cada gota de suor transformada em resultado</p>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Calendar className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="prs" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Recordes
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2">
              <Award className="w-4 h-4" />
              Conquistas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Aderência aos Treinos</h3>
              <p className="text-sm text-muted-foreground mb-4">Últimas 12 semanas</p>
              <Heatmap data={heatmapData} />
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Distribuição de RPE</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={rpeData}>
                    <defs>
                      <linearGradient id="colorRpe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="rpe" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Area type="monotone" dataKey="count" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorRpe)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Sono × Performance</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      dataKey="sleep"
                      name="Sono"
                      unit="h"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      type="number"
                      dataKey="performance"
                      name="Performance"
                      unit="%"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <RechartsTooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Scatter
                      name="Treinos"
                      data={sleepPerformanceData}
                      fill="hsl(var(--chart-2))"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="prs" className="space-y-6">
            {prsLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="w-full h-32" />
                <Skeleton className="w-full h-32" />
              </div>
            ) : personalRecords.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {Array.from(new Set(personalRecords.map(pr => pr.exerciseName))).map(exerciseName => {
                  const exercisePRs = personalRecords
                    .filter(pr => pr.exerciseName === exerciseName)
                    .sort((a, b) => new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime())
                    .slice(-8);

                  const sparklineData = exercisePRs.map((pr, index) => ({
                    week: index + 1,
                    value: pr.load,
                  }));

                  return (
                    <PRSparkline
                      key={exerciseName}
                      exerciseName={exerciseName}
                      data={sparklineData}
                      unit="kg"
                    />
                  );
                })}
              </div>
            ) : (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  Nenhum recorde pessoal registrado ainda. Complete alguns treinos para estabelecer seus PRs!
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Suas Conquistas</h3>
              {badgesLoading ? (
                <Skeleton className="w-full h-64" />
              ) : (
                <BadgeGrid badges={badges} />
              )}
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                {badgesLoading ? (
                  <Skeleton className="w-full h-16" />
                ) : (
                  <>
                    <div className="text-4xl font-bold font-['Outfit'] text-chart-1">
                      {userBadges.length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Badges Conquistados</div>
                  </>
                )}
              </Card>
              <Card className="p-6 text-center">
                {statsLoading ? (
                  <Skeleton className="w-full h-16" />
                ) : (
                  <>
                    <div className="text-4xl font-bold font-['Outfit'] text-chart-2">
                      {stats?.xp || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">XP Total</div>
                  </>
                )}
              </Card>
              <Card className="p-6 text-center">
                {statsLoading ? (
                  <Skeleton className="w-full h-16" />
                ) : (
                  <>
                    <div className="text-4xl font-bold font-['Outfit'] text-chart-3">
                      {stats?.streak || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Dia de Sequência</div>
                  </>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

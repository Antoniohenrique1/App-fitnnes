import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Heatmap from "@/components/Heatmap";
import PRSparkline from "@/components/PRSparkline";
import BadgeGrid from "@/components/BadgeGrid";
import { Play, Menu, User as UserIcon, Calendar, TrendingUp, Award } from "lucide-react";
import { Link } from "wouter";
import StreakFlame from "@/components/StreakFlame";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ScatterChart, Scatter } from "recharts";

export default function Evolution() {
  //todo: remove mock functionality
  const heatmapData = Array.from({ length: 84 }, (_, i) => ({
    date: new Date(Date.now() - (83 - i) * 86400000).toISOString().split("T")[0],
    count: Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0,
  }));

  const prData = [
    { week: 1, value: 80 },
    { week: 2, value: 82.5 },
    { week: 3, value: 82.5 },
    { week: 4, value: 85 },
    { week: 5, value: 87.5 },
    { week: 6, value: 87.5 },
    { week: 7, value: 90 },
    { week: 8, value: 92.5 },
  ];

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

  const badges = [
    { id: "1", title: "Novato", description: "Complete 3 dias de treino", icon: "star" as const, rarity: "common" as const, earned: true },
    { id: "2", title: "1ª Semana", description: "Complete uma semana completa", icon: "trophy" as const, rarity: "rare" as const, earned: true },
    { id: "3", title: "PR Conquistado", description: "Estabeleça um novo recorde pessoal", icon: "zap" as const, rarity: "epic" as const, earned: true },
    { id: "4", title: "Sequência de Fogo", description: "Mantenha 7 dias seguidos", icon: "flame" as const, rarity: "epic" as const, earned: false },
    { id: "5", title: "Mês Épico", description: "Complete 30 dias de treino", icon: "award" as const, rarity: "legendary" as const, earned: false },
    { id: "6", title: "Dedicação Total", description: "Complete 100 treinos", icon: "heart" as const, rarity: "legendary" as const, earned: false },
  ];

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
                <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dashboard</a>
              </Link>
              <Link href="/evolution">
                <a className="text-sm font-medium hover:text-primary transition-colors">Evolução</a>
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
        <div>
          <h1 className="text-3xl font-bold font-['Outfit']">Sua Evolução</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seu progresso e conquistas</p>
        </div>

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
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
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
            <div className="grid md:grid-cols-2 gap-6">
              <PRSparkline exerciseName="Supino Reto" data={prData} unit="kg" />
              <PRSparkline
                exerciseName="Agachamento"
                data={[
                  { week: 1, value: 100 },
                  { week: 2, value: 105 },
                  { week: 3, value: 105 },
                  { week: 4, value: 110 },
                  { week: 5, value: 115 },
                  { week: 6, value: 115 },
                  { week: 7, value: 120 },
                  { week: 8, value: 125 },
                ]}
                unit="kg"
              />
              <PRSparkline
                exerciseName="Desenvolvimento"
                data={[
                  { week: 1, value: 50 },
                  { week: 2, value: 52.5 },
                  { week: 3, value: 52.5 },
                  { week: 4, value: 55 },
                  { week: 5, value: 57.5 },
                  { week: 6, value: 57.5 },
                  { week: 7, value: 60 },
                  { week: 8, value: 62.5 },
                ]}
                unit="kg"
              />
              <PRSparkline
                exerciseName="Terra"
                data={[
                  { week: 1, value: 120 },
                  { week: 2, value: 125 },
                  { week: 3, value: 125 },
                  { week: 4, value: 130 },
                  { week: 5, value: 135 },
                  { week: 6, value: 140 },
                  { week: 7, value: 140 },
                  { week: 8, value: 145 },
                ]}
                unit="kg"
              />
            </div>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Suas Conquistas</h3>
              <BadgeGrid badges={badges} />
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold font-['Outfit'] text-chart-1">3</div>
                <div className="text-sm text-muted-foreground mt-1">Badges Conquistados</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold font-['Outfit'] text-chart-2">850</div>
                <div className="text-sm text-muted-foreground mt-1">XP Total</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold font-['Outfit'] text-chart-3">12</div>
                <div className="text-sm text-muted-foreground mt-1">Dia de Sequência</div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LeagueCard from "@/components/LeagueCard";
import { Play, Menu, User as UserIcon, Trophy } from "lucide-react";
import { Link } from "wouter";
import StreakFlame from "@/components/StreakFlame";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { UserStats } from "@shared/schema";

interface LeagueMember {
  userId: string;
  name: string;
  weeklyXP: number;
  rank: number;
}

export default function Leagues() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<UserStats>({
    queryKey: ["/api", "user", "stats"],
  });

  const { data: leagueMembers = [], isLoading: membersLoading, error: membersError } = useQuery<LeagueMember[]>({
    queryKey: ["/api", "leagues", stats?.leagueTier || "Bronze"],
    enabled: !!stats?.leagueTier,
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
    if (membersError) {
      toast({
        title: "Erro ao carregar liga",
        description: "Não foi possível carregar os membros da liga.",
        variant: "destructive",
      });
    }
  }, [membersError, toast]);

  const userRank = leagueMembers.findIndex(m => m.userId === user?.id) + 1;
  const xpToThirdPlace = userRank > 3 && leagueMembers[2] 
    ? leagueMembers[2].weeklyXP - (stats?.weeklyXP || 0)
    : 0;

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
                <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Evolução</a>
              </Link>
              <Link href="/leagues">
                <a className="text-sm font-medium hover:text-primary transition-colors">Ligas</a>
              </Link>
              <Link href="/marketplace">
                <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Profissionais</a>
              </Link>
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
        <div>
          <h1 className="text-3xl font-bold font-['Outfit']">Ligas Semanais</h1>
          <p className="text-muted-foreground mt-1">Compete com outros atletas e suba de divisão</p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-['Outfit']">
                {statsLoading ? <Skeleton className="w-32 h-7" /> : `Liga ${stats?.leagueTier || "Bronze"}`}
              </h2>
              <p className="text-sm text-muted-foreground">
                Termine entre os 3 primeiros para subir de divisão
              </p>
            </div>
            <Trophy className="w-8 h-8 text-chart-1" />
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {membersLoading ? (
            <Skeleton className="w-full h-96" />
          ) : (
            <LeagueCard 
              tier={(stats?.leagueTier || "Bronze") as "Bronze" | "Prata" | "Ouro" | "Diamante"} 
              members={leagueMembers.map(m => ({
                id: m.userId,
                name: m.name,
                xp: m.weeklyXP,
                rank: m.rank,
              }))} 
              currentUserId={user?.id || ""} 
            />
          )}
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Como Funcionam as Ligas</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Ganhe XP completando treinos, missões e fechando anéis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>As ligas reiniciam toda segunda-feira</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Top 3 sobem de divisão, últimos 3 caem</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Divisões: Bronze → Prata → Ouro → Diamante</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sua Semana</h3>
              {statsLoading ? (
                <Skeleton className="w-full h-32" />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">XP esta semana</span>
                    <span className="font-bold tabular-nums">{stats?.weeklyXP || 0} XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Posição atual</span>
                    <span className="font-bold">{userRank > 0 ? `${userRank}º lugar` : "—"}</span>
                  </div>
                  {userRank > 3 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">XP até o 3º</span>
                      <span className="font-bold text-chart-1 tabular-nums">{xpToThirdPlace} XP</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tempo restante</span>
                    <span className="font-bold">3 dias</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

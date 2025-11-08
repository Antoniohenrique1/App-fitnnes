import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LeagueCard from "@/components/LeagueCard";
import { Play, Menu, User as UserIcon, Trophy } from "lucide-react";
import { Link } from "wouter";
import StreakFlame from "@/components/StreakFlame";

export default function Leagues() {
  //todo: remove mock functionality
  const mockMembers = [
    { id: "1", name: "Ana Silva", xp: 2450, rank: 1 },
    { id: "2", name: "Carlos Santos", xp: 2340, rank: 2 },
    { id: "3", name: "Maria Oliveira", xp: 2180, rank: 3 },
    { id: "current", name: "Você", xp: 1950, rank: 4 },
    { id: "5", name: "João Costa", xp: 1820, rank: 5 },
    { id: "6", name: "Paula Ferreira", xp: 1680, rank: 6 },
    { id: "7", name: "Lucas Almeida", xp: 1520, rank: 7 },
    { id: "8", name: "Fernanda Lima", xp: 1380, rank: 8 },
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
          <h1 className="text-3xl font-bold font-['Outfit']">Ligas Semanais</h1>
          <p className="text-muted-foreground mt-1">Compete com outros atletas e suba de divisão</p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-['Outfit']">Sua Liga Atual</h2>
              <p className="text-sm text-muted-foreground">
                Termine entre os 3 primeiros para subir de divisão
              </p>
            </div>
            <Trophy className="w-8 h-8 text-chart-1" />
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <LeagueCard tier="Ouro" members={mockMembers} currentUserId="current" />
          
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">XP esta semana</span>
                  <span className="font-bold tabular-nums">320 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Posição atual</span>
                  <span className="font-bold">4º lugar</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">XP até o 3º</span>
                  <span className="font-bold text-chart-1 tabular-nums">230 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tempo restante</span>
                  <span className="font-bold">3 dias</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

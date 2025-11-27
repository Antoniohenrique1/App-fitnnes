import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Menu, User as UserIcon, Download, Trash2, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import StreakFlame from "@/components/StreakFlame";
import type { UserStats } from "@shared/schema";

export default function Account() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api", "user", "stats"],
  });

  const handleDownloadData = () => {
    console.log("Downloading user data (LGPD compliance)");
  };

  const handleDeleteAccount = () => {
    const confirmed = confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.");
    if (confirmed) {
      console.log("Deleting account and all data (LGPD compliance)");
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
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
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/evolution" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Evolução</Link>
              <Link href="/leagues" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Ligas</Link>
              <Link href="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Profissionais</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {statsLoading ? (
              <Skeleton className="w-20 h-8" />
            ) : (
              <StreakFlame streak={stats?.streak || 0} freezeAvailable={(stats?.streakFreezes || 0) > 0} />
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

      <div className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit']">Conta e Configurações</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu perfil e preferências</p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {authLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl">{user?.name ? getInitials(user.name) : "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{user?.name || "Usuário"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
                </div>
                <Button variant="outline" data-testid="button-edit-profile">Editar Perfil</Button>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Pessoais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input defaultValue={user?.name || ""} data-testid="input-name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" defaultValue={user?.email || ""} data-testid="input-email" />
                </div>
                <div className="space-y-2">
                  <Label>Idade</Label>
                  <Input type="number" defaultValue={user?.age?.toString() || ""} data-testid="input-age" />
                </div>
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input type="number" defaultValue={user?.weight?.toString() || ""} data-testid="input-weight" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Plano Atual</h3>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <div className="font-semibold">Grátis</div>
                  <div className="text-sm text-muted-foreground">Recursos básicos incluídos</div>
                </div>
                <Button data-testid="button-upgrade">Fazer Upgrade</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Privacidade e Dados (LGPD)</h3>
              <p className="text-sm text-muted-foreground">
                De acordo com a Lei Geral de Proteção de Dados, você tem direito a acessar e gerenciar seus dados pessoais.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={handleDownloadData}
                  data-testid="button-download-data"
                >
                  <Download className="w-4 h-4" />
                  Baixar meus dados
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={handleDeleteAccount}
                  data-testid="button-delete-account"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir conta e dados
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
          <div className="space-y-2">
            <Link href="/legal/privacy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/legal/terms" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
              Termos de Uso
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

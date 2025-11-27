import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnerCard from "@/components/PartnerCard";
import { Play, Menu, User as UserIcon, Search } from "lucide-react";
import { Link } from "wouter";
import StreakFlame from "@/components/StreakFlame";

export default function Marketplace() {
  //todo: remove mock functionality
  const partners = {
    personal: [
      {
        name: "Carlos Mendes",
        kind: "Personal" as const,
        city: "São Paulo, SP",
        registration: "CREF 123456-G/SP",
        bio: "Personal trainer especializado em hipertrofia e reabilitação funcional. 8 anos de experiência.",
        services: ["Treino Personalizado", "Avaliação Física", "Consultoria Online"],
      },
      {
        name: "Roberta Lima",
        kind: "Personal" as const,
        city: "Rio de Janeiro, RJ",
        registration: "CREF 654321-G/RJ",
        bio: "Especialista em treinamento funcional e emagrecimento. Atendimento presencial e online.",
        services: ["Treino Funcional", "Treinamento Online", "Acompanhamento Mensal"],
      },
    ],
    nutri: [
      {
        name: "Ana Paula Silva",
        kind: "Nutricionista" as const,
        city: "São Paulo, SP",
        registration: "CRN 98765/SP",
        bio: "Nutricionista esportiva com foco em performance e composição corporal.",
        services: ["Plano Alimentar", "Acompanhamento Mensal", "Suplementação"],
      },
    ],
    fisio: [
      {
        name: "Dr. Pedro Santos",
        kind: "Fisioterapeuta" as const,
        city: "Belo Horizonte, MG",
        registration: "CREFITO 45678/MG",
        bio: "Fisioterapeuta especializado em reabilitação de lesões esportivas e prevenção.",
        services: ["Reabilitação", "Avaliação Postural", "Liberação Miofascial"],
      },
    ],
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
              <Link href="/marketplace" className="text-sm font-medium hover:text-primary transition-colors">Profissionais</Link>
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
          <h1 className="text-3xl font-bold font-['Outfit']">Profissionais Parceiros</h1>
          <p className="text-muted-foreground mt-1">Encontre personal trainers, nutricionistas e fisioterapeutas</p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-chart-2/10 to-chart-3/10 border-chart-2/20">
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-['Outfit']">Premium: Acesso Total</h2>
            <p className="text-sm text-muted-foreground">
              Assinantes premium têm acesso direto a todos os profissionais parceiros para consultas e acompanhamento personalizado.
            </p>
            <Button data-testid="button-upgrade-premium">Assinar Premium</Button>
          </div>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, cidade ou especialidade..."
            className="pl-10"
            data-testid="input-search-professionals"
          />
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList>
            <TabsTrigger value="personal">Personal Trainers</TabsTrigger>
            <TabsTrigger value="nutri">Nutricionistas</TabsTrigger>
            <TabsTrigger value="fisio">Fisioterapeutas</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {partners.personal.map((partner, index) => (
                <PartnerCard
                  key={index}
                  {...partner}
                  onContact={() => console.log(`Contact ${partner.name}`)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nutri" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {partners.nutri.map((partner, index) => (
                <PartnerCard
                  key={index}
                  {...partner}
                  onContact={() => console.log(`Contact ${partner.name}`)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fisio" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {partners.fisio.map((partner, index) => (
                <PartnerCard
                  key={index}
                  {...partner}
                  onContact={() => console.log(`Contact ${partner.name}`)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

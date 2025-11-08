import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Target, Zap, Trophy, Sparkles, Check } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold font-['Outfit']">FitCoach AI</span>
          </div>
          <Link href="/onboarding">
            <Button data-testid="button-start">Começar Grátis</Button>
          </Link>
        </div>
      </nav>

      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Treinos gerados por IA</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-['Outfit'] leading-tight">
                Seu personal trainer de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--chart-1))] to-[hsl(var(--chart-2))]">
                  bolso
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Treinos personalizados que se adaptam ao seu dia. IA que entende suas necessidades e progride com você.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/onboarding">
                  <Button size="lg" className="gap-2" data-testid="button-cta-hero">
                    <Zap className="w-5 h-5" />
                    Começar Agora
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2" data-testid="button-learn-more">
                  <Target className="w-5 h-5" />
                  Como Funciona
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-chart-1/20 via-chart-2/20 to-chart-3/20 backdrop-blur-sm border border-border p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🏋️</div>
                  <p className="text-muted-foreground">Treinos adaptados para você</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-['Outfit'] mb-4">Como Funciona</h2>
            <p className="text-muted-foreground">Três passos simples para transformar seus treinos</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "1. Configure seu perfil",
                description: "Conte sobre seus objetivos, equipamentos e disponibilidade",
              },
              {
                icon: Zap,
                title: "2. Receba seu plano",
                description: "IA cria um programa personalizado de 4 semanas",
              },
              {
                icon: Trophy,
                title: "3. Treine e evolua",
                description: "Check-in diário adapta o treino ao seu estado atual",
              },
            ].map((step, index) => (
              <Card key={index} className="p-6 hover-elevate">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-['Outfit'] mb-4">Escolha seu plano</h2>
            <p className="text-muted-foreground">Comece grátis, evolua quando quiser</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 hover-elevate">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold font-['Outfit']">Grátis</h3>
                  <p className="text-4xl font-bold font-['Outfit'] mt-2">R$ 0</p>
                </div>
                <ul className="space-y-3">
                  {[
                    "1 plano IA básico (renovável)",
                    "HUD gamificado com anéis",
                    "Registro de treinos",
                    "Badges e missões básicas",
                    "Resumo semanal",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-chart-1 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding">
                  <Button variant="outline" className="w-full" data-testid="button-plan-free">
                    Começar Grátis
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-8 border-primary hover-elevate">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold font-['Outfit']">Premium</h3>
                    <p className="text-4xl font-bold font-['Outfit'] mt-2">R$ 29,90<span className="text-lg text-muted-foreground">/mês</span></p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    POPULAR
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    "Tudo do plano Grátis",
                    "Planos adaptativos semanais",
                    "Cofre com cosméticos raros",
                    "Ligas e desafios especiais",
                    "Evolução completa (todos gráficos)",
                    "Acesso a profissionais parceiros",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" data-testid="button-plan-premium">
                  Assinar Premium
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary" />
                <span className="font-bold font-['Outfit']">FitCoach AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Seu personal trainer de bolso, powered by AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Como funciona</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Parceiros</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/legal/privacy"><a className="hover:text-foreground transition-colors">Privacidade</a></Link></li>
                <li><Link href="/legal/terms"><a className="hover:text-foreground transition-colors">Termos</a></Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 FitCoach AI. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

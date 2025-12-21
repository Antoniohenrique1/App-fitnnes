import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Dumbbell, Target, Zap, Trophy, Sparkles, Check, LogIn, ChevronRight, Activity } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, login, isLoading } = useAuth();
  const { toast } = useToast();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData.username, loginData.password);
      setLoginOpen(false);
      setLocation("/dashboard");
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary-foreground">

      {/* Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <nav className="border-b border-white/5 sticky top-0 bg-background/60 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary/30 transition-colors">
              <Zap className="w-5 h-5 text-primary fill-current" />
            </div>
            <span className="text-2xl font-black font-['Outfit'] tracking-tighter italic text-white uppercase">
              Agreste<span className="text-secondary">.Sup</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild data-testid="button-dashboard" className="bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl font-bold">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="hover:bg-white/5 rounded-xl text-muted-foreground hover:text-white transition-colors" data-testid="button-login">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-0 bg-zinc-950/80 backdrop-blur-2xl ring-1 ring-white/10 rounded-3xl" data-testid="dialog-login">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black font-['Outfit'] italic">Acessar HQ</DialogTitle>
                      <DialogDescription className="text-white/60">
                        Bem-vindo de volta, atleta.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Codinome</Label>
                        <Input
                          id="login-username"
                          className="bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 h-11"
                          placeholder="seu_usuario"
                          value={loginData.username}
                          onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                          data-testid="input-login-username"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Senha</Label>
                          <button
                            type="button"
                            onClick={() => {
                              toast({
                                title: "Recuperação de Acesso",
                                description: "Contate seu treinador superior para resetar.",
                              });
                            }}
                            className="text-[10px] text-primary hover:text-primary/80 uppercase font-bold tracking-wider"
                            data-testid="link-forgot-password"
                          >
                            Esqueceu?
                          </button>
                        </div>
                        <Input
                          id="login-password"
                          type="password"
                          className="bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 h-11"
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          data-testid="input-login-password"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full h-12 bg-primary text-black font-black text-lg rounded-xl shadow-neon hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all" disabled={isLoading} data-testid="button-submit-login">
                        {isLoading ? "Autenticando..." : "INICIAR SESSÃO"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button asChild className="hidden sm:flex bg-primary text-black hover:bg-white font-bold rounded-xl shadow-neon transition-all hover:scale-105" data-testid="button-start">
                  <Link href="/onboarding">Começar Agora</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative py-24 md:py-32 overflow-hidden items-center flex justify-center">
        {/* Glow effect center */}
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[600px] h-[600px] bg-primary/20 blur-[130px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:border-primary/40 transition-all cursor-default shadow-[0_0_20px_-5px_bg-primary/20]">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_bg-primary]" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">IA de Hipertrofia Ativa v2.0</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black font-['Outfit'] leading-[0.85] tracking-tighter text-white uppercase italic drop-shadow-2xl">
                Treine <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/50 to-white/20">
                  Sem
                </span> <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-lime-200 to-primary bg-[length:200%_auto] animate-shimmer">
                  Limites
                </span>
              </h1>

              <p className="text-xl text-muted-foreground font-medium max-w-lg leading-relaxed border-l-2 border-primary/30 pl-6">
                Deixe a IA calcular cada repetição, carga e descanso. <br />
                <span className="text-white">Você só precisa executar.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="h-16 px-10 text-xl bg-primary text-black hover:bg-white font-black uppercase tracking-wider rounded-xl shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_50px_-5px_hsl(var(--primary)/0.7)] hover:scale-[1.02] transition-all duration-300 group">
                  <Link href="/onboarding">
                    Gerar Protocolo <ChevronRight className="w-6 h-6 ml-2 stroke-[3px] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 font-bold uppercase tracking-wide rounded-xl backdrop-blur-sm"
                  onClick={() => scrollToSection("planos")}
                >
                  Ver Planos
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative hidden md:block perspective-1000">
              {/* Floating Card Visual */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/20 blur-[80px] rounded-full" />
              <Card className="relative bg-zinc-950/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl ring-1 ring-white/10 rotate-y-[-10deg] hover:rotate-0 transition-transform duration-700 w-full max-w-md ml-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-black text-white text-2xl italic uppercase transform -skew-x-6">Push Day A</h3>
                    <p className="text-xs text-primary font-mono uppercase tracking-widest mt-1">Hipertrofia Miofibrilar</p>
                  </div>
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Activity className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { name: "Supino Inclinado", reps: "8-10", set: 1 },
                    { name: "Crucifixo Polia", reps: "12-15", set: 2 },
                    { name: "Tríceps Testa", reps: "10-12", set: 3 }
                  ].map((ex, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center font-black text-white/50 group-hover:text-primary transition-colors text-lg border border-white/5">{ex.set}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white mb-1">{ex.name}</div>
                        <div className="flex gap-1">
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-secondary w-[80%]" />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono font-bold text-sm bg-white/10 px-2 py-1 rounded-md">{ex.reps}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-mono text-green-400 font-bold tracking-wider">IA ONLINE</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">CONFIDENCE: 99.8%</span>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="como-funciona" className="py-24 bg-zinc-950 relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="absolute left-0 top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black font-['Outfit'] text-white uppercase italic transform -skew-x-2">Sistema <span className="text-primary">Operacional</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Três módulos integrados para maximizar seus resultados biológicos.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Scan Inicial",
                description: "Mapeamento completo do seu perfil, limitações e objetivos.",
                color: "text-accent",
                gradient: "from-accent/20 to-transparent"
              },
              {
                icon: Zap,
                title: "Processamento IA",
                description: "Algoritmo gera o treino ideal para o seu estado atual, todo dia.",
                color: "text-primary",
                gradient: "from-primary/20 to-transparent"
              },
              {
                icon: Trophy,
                title: "Evolução Constante",
                description: "O sistema aprende com seu feedback e aumenta a dificuldade.",
                color: "text-secondary",
                gradient: "from-secondary/20 to-transparent"
              },
            ].map((step, index) => (
              <Card key={index} className="relative overflow-hidden p-8 bg-black/40 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group rounded-[2rem]">
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${step.gradient} blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10 shadow-lg">
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 uppercase italic">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION (NEW) */}
      <section id="planos" className="py-24 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black font-['Outfit'] text-white uppercase italic transform -skew-x-2">Escolha seu <span className="text-primary">Nível</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">Do iniciante ao atleta de elite. Cancele quando quiser.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* PLANO GRATUITO */}
            <Card className="p-8 bg-zinc-900/60 backdrop-blur-md border border-white/5 rounded-3xl hover:border-white/20 transition-all relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-500 to-zinc-700 opacity-50" />
              <h3 className="text-2xl font-black text-white italic uppercase mb-2">Iniciante</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">R$ 0</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8 min-h-[40px]">Para quem está começando e quer organizar a rotina.</p>

              <ul className="space-y-4 mb-8">
                {[
                  "Registro manual de treinos",
                  "Acesso à comunidade",
                  "Histórico de 7 dias",
                  "Suporte via e-mail"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                    <Check className="w-4 h-4 text-zinc-500" />
                    {feature}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-sm text-muted-foreground/60 decoration-white/20 decoration-2 line-through font-medium">
                  IA Geradora de Treinos
                </li>
              </ul>
              <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 h-12 rounded-xl font-bold uppercase transition-all" onClick={() => setLoginOpen(true)}>
                Começar Grátis
              </Button>
            </Card>

            {/* PLANO PRO (DESTACADO) */}
            <Card className="p-8 bg-black/60 backdrop-blur-xl border border-primary/50 rounded-3xl relative scale-105 shadow-[0_0_50px_-20px_bg-primary/20] z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                Mais Popular
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

              <h3 className="text-3xl font-black text-white italic uppercase mb-2 text-primary">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-bold text-white">R$ 29</span>
                <span className="text-lg text-muted-foreground">,90/mês</span>
              </div>
              <p className="text-sm text-white/80 mb-8 min-h-[40px]">IA completa para evoluir cargas e quebrar platôs.</p>

              <ul className="space-y-4 mb-8">
                {[
                  "IA Geradora de Treinos (Ilimitado)",
                  "Ajuste automático de carga (RIR)",
                  "Histórico completo",
                  "Análise de gráficos básica",
                  "Acesso antecipado a features"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-white">
                    <Check className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-primary text-black hover:bg-white h-14 rounded-xl font-black text-lg uppercase shadow-neon hover:scale-[1.02] transition-all" onClick={() => setLoginOpen(true)}>
                Assinar Pro
              </Button>
            </Card>

            {/* PLANO ELITE */}
            <Card className="p-8 bg-zinc-900/60 backdrop-blur-md border border-secondary/30 rounded-3xl hover:border-secondary/50 transition-all relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-purple-500 opacity-50" />
              <h3 className="text-2xl font-black text-white italic uppercase mb-2">Elite</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">R$ 49</span>
                <span className="text-muted-foreground">,90/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8 min-h-[40px]">Para atletas que buscam otimização biológica máxima.</p>

              <ul className="space-y-4 mb-8">
                {[
                  "Tudo do plano Pro",
                  "Consultoria IA Prioritária",
                  "Análise Biométrica Avançada",
                  "Dashboards Exclusivos",
                  "Badge de Atleta Elite"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                    <Check className="w-4 h-4 text-secondary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full border-secondary/20 hover:border-secondary/50 text-secondary hover:text-secondary hover:bg-secondary/10 h-12 rounded-xl font-bold uppercase transition-all" onClick={() => setLoginOpen(true)}>
                Ser Elite
              </Button>
            </Card>

          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justifyContent-center gap-2 mb-4 opacity-50 hover:opacity-100 transition-opacity justify-center">
            <Zap className="w-5 h-5 text-primary fill-current" />
            <span className="font-bold font-['Outfit'] text-lg uppercase">Agreste Suplementos</span>
          </div>
          <p className="text-sm text-muted-foreground">Potência Pura & Inteligência Artificial © 2024</p>
        </div>
      </footer>
    </div>
  );
}

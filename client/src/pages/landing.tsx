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
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:border-primary/30 transition-colors cursor-default">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">IA de Hipertrofia Ativa</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black font-['Outfit'] leading-[0.9] tracking-tighter text-white uppercase italic">
                Treine Como <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary bg-[length:200%_auto] animate-shimmer">
                  Uma Máquina
                </span>
              </h1>

              <p className="text-xl text-muted-foreground font-medium max-w-lg leading-relaxed">
                Deixe a IA calcular cada repetição, carga e descanso. Você só precisa executar.
                Otimização hormonal e metabólica em tempo real.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="h-14 px-8 text-lg bg-primary text-black hover:bg-white font-black uppercase tracking-wide rounded-xl shadow-neon hover:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.6)] hover:scale-[1.02] transition-all duration-300" data-testid="button-cta-hero">
                  <Link href="/onboarding">
                    Gerar Protocolo <ChevronRight className="w-5 h-5 ml-1 stroke-[3px]" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-white/10 bg-transparent hover:bg-white/5 hover:border-white/20 font-bold uppercase tracking-wide rounded-xl backdrop-blur-sm"
                  onClick={() => scrollToSection("como-funciona")}
                  data-testid="button-learn-more"
                >
                  Ver Sistema
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative hidden md:block">
              {/* Floating Card Visual */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 blur-[60px] rounded-full" />
              <Card className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl ring-1 ring-white/5 rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-white text-lg">Protocolo Push A</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Foco: Peitoral Superior</p>
                  </div>
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-bold text-muted-foreground text-sm">{i}</div>
                      <div className="flex-1">
                        <div className="h-2 w-24 bg-white/10 rounded-full mb-2" />
                        <div className="h-2 w-16 bg-white/10 rounded-full" />
                      </div>
                      <div className="text-right">
                        <div className="text-primary font-mono font-bold">12 REPS</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs font-mono text-muted-foreground">AI CONFIDENCE: 98%</span>
                  {/* <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">READY</Badge> */}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-24 bg-black/20 backdrop-blur-sm relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black font-['Outfit'] text-white uppercase italic">Sistema Operacional</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Três módulos integrados para maximizar seus resultados biológicos.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Scan Inicial",
                description: "Mapeamento completo do seu perfil, limitações e objetivos.",
                color: "text-accent"
              },
              {
                icon: Zap,
                title: "Processamento IA",
                description: "Algoritmo gera o treino ideal para o seu estado atual, todo dia.",
                color: "text-primary"
              },
              {
                icon: Trophy,
                title: "Evolução Constante",
                description: "O sistema aprende com seu feedback e aumenta a dificuldade.",
                color: "text-secondary"
              },
            ].map((step, index) => (
              <Card key={index} className="p-8 bg-zinc-900/50 backdrop-blur-md border border-white/5 hover:border-primary/30 transition-all hover:-translate-y-2 group rounded-3xl">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10">
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justifyContent-center gap-2 mb-4 opacity-50 hover:opacity-100 transition-opacity justify-center">
            <Zap className="w-5 h-5" />
            <span className="font-bold font-['Outfit'] text-lg uppercase">Agreste Suplementos</span>
          </div>
          <p className="text-sm text-muted-foreground">Potência Pura & Inteligência Artificial © 2024</p>
        </div>
      </footer>
    </div>
  );
}

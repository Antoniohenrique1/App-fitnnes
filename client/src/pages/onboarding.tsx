import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, ArrowLeft, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PERSONAS, PersonaCard } from "@/components/onboarding/PersonaCard";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { register, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    age: "",
    sex: "male",
    height: "",
    weight: "",
    experience: "beginner",
    goal: "hypertrophy",
    daysPerWeek: "3",
    sessionMinutes: "45",
    location: "both",
    equipment: [] as string[],
    injuries: "",
    persona: "mentor" as any,
  });

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        const parseSafeInt = (val: string) => {
          const parsed = parseInt(val);
          return isNaN(parsed) ? null : parsed;
        };

        const parseSafeFloat = (val: string) => {
          const parsed = parseFloat(val);
          return isNaN(parsed) ? null : parsed;
        };

        const userData = {
          username: formData.username.trim(),
          password: formData.password,
          email: formData.email.trim(),
          name: formData.name.trim(),
          age: parseSafeInt(formData.age),
          sex: formData.sex,
          height: parseSafeInt(formData.height),
          weight: parseSafeFloat(formData.weight),
          experience: formData.experience,
          goal: formData.goal,
          daysPerWeek: parseSafeInt(formData.daysPerWeek),
          sessionMinutes: parseSafeInt(formData.sessionMinutes),
          location: formData.location,
          equipment: formData.equipment,
          injuries: formData.injuries,
          persona: formData.persona,
        };

        const errors: string[] = [];

        if (!userData.username) errors.push("Nome de usuário");
        if (!userData.password) errors.push("Senha");
        if (!userData.email) errors.push("Email");
        if (!userData.name) errors.push("Nome");
        if (userData.age === null) errors.push("Idade");
        if (userData.height === null) errors.push("Altura");
        if (userData.weight === null) errors.push("Peso");
        if (userData.daysPerWeek === null) errors.push("Dias de treino por semana");
        if (userData.sessionMinutes === null) errors.push("Minutos por sessão");

        if (errors.length > 0) {
          throw new Error(`Por favor, preencha ou corrija os seguintes campos: ${errors.join(", ")}.`);
        }

        await register(userData);

        toast({
          title: "Gerando seu plano de treino...",
          description: "Aguarde enquanto a IA cria um programa personalizado para você",
        });

        await apiRequest("POST", "/api/workouts/generate-plan", {});

        toast({
          title: "Plano criado com sucesso!",
          description: "Seu treino personalizado está pronto",
        });

        setLocation("/dashboard");
      } catch (error: any) {
        toast({
          title: "Erro ao completar cadastro",
          description: error.message || "Tente novamente",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold font-['Outfit']">FitCoach AI</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Passo {step} de {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-['Outfit'] mb-2">Vamos começar!</h2>
                  <p className="text-muted-foreground">Conte um pouco sobre você</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input
                      id="username"
                      placeholder="seu_usuario"
                      value={formData.username}
                      onChange={(e) => updateFormData("username", e.target.value)}
                      data-testid="input-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      data-testid="input-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      data-testid="input-name"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Idade</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={(e) => updateFormData("age", e.target.value)}
                        data-testid="input-age"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="175"
                        value={formData.height}
                        onChange={(e) => updateFormData("height", e.target.value)}
                        data-testid="input-height"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="75"
                        value={formData.weight}
                        onChange={(e) => updateFormData("weight", e.target.value)}
                        data-testid="input-weight"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sexo</Label>
                    <RadioGroup
                      value={formData.sex}
                      onValueChange={(value) => updateFormData("sex", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" data-testid="radio-male" />
                        <Label htmlFor="male" className="font-normal cursor-pointer">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" data-testid="radio-female" />
                        <Label htmlFor="female" className="font-normal cursor-pointer">Feminino</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-['Outfit'] mb-2">Seu objetivo</h2>
                  <p className="text-muted-foreground">O que você quer alcançar?</p>
                </div>
                <RadioGroup
                  value={formData.goal}
                  onValueChange={(value) => updateFormData("goal", value)}
                  className="space-y-3"
                >
                  {[
                    { value: "fat_loss", label: "Perda de gordura", description: "Definição e emagrecimento" },
                    { value: "hypertrophy", label: "Ganho de massa muscular", description: "Hipertrofia e crescimento" },
                    { value: "strength", label: "Força", description: "Aumentar carga e performance" },
                    { value: "conditioning", label: "Condicionamento", description: "Resistência e saúde geral" },
                  ].map((option) => (
                    <Card
                      key={option.value}
                      className={`p-4 cursor-pointer hover-elevate ${formData.goal === option.value ? "border-primary" : ""
                        }`}
                      onClick={() => updateFormData("goal", option.value)}
                      data-testid={`card-goal-${option.value}`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <div>
                          <Label htmlFor={option.value} className="text-base font-semibold cursor-pointer">
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </RadioGroup>
                <div className="space-y-2">
                  <Label>Experiência com treino</Label>
                  <RadioGroup
                    value={formData.experience}
                    onValueChange={(value) => updateFormData("experience", value)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" data-testid="radio-beginner" />
                      <Label htmlFor="beginner" className="font-normal cursor-pointer">Iniciante (menos de 6 meses)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" data-testid="radio-intermediate" />
                      <Label htmlFor="intermediate" className="font-normal cursor-pointer">Intermediário (6 meses a 2 anos)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" data-testid="radio-advanced" />
                      <Label htmlFor="advanced" className="font-normal cursor-pointer">Avançado (mais de 2 anos)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-['Outfit'] mb-2">Disponibilidade</h2>
                  <p className="text-muted-foreground">Quanto tempo você tem?</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Dias por semana</Label>
                    <RadioGroup
                      value={formData.daysPerWeek}
                      onValueChange={(value) => updateFormData("daysPerWeek", value)}
                      className="grid grid-cols-3 gap-4"
                    >
                      {["3", "4", "5"].map((days) => (
                        <Card
                          key={days}
                          className={`p-4 cursor-pointer hover-elevate text-center ${formData.daysPerWeek === days ? "border-primary" : ""
                            }`}
                          onClick={() => updateFormData("daysPerWeek", days)}
                          data-testid={`card-days-${days}`}
                        >
                          <RadioGroupItem value={days} id={`days-${days}`} className="sr-only" />
                          <Label htmlFor={`days-${days}`} className="text-2xl font-bold font-['Outfit'] cursor-pointer block">
                            {days}
                          </Label>
                          <p className="text-xs text-muted-foreground">dias</p>
                        </Card>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Duração da sessão</Label>
                    <RadioGroup
                      value={formData.sessionMinutes}
                      onValueChange={(value) => updateFormData("sessionMinutes", value)}
                      className="grid grid-cols-3 gap-4"
                    >
                      {[
                        { value: "30", label: "30-35min", desc: "Express" },
                        { value: "45", label: "45-50min", desc: "Padrão" },
                        { value: "60", label: "60min+", desc: "Completo" },
                      ].map((option) => (
                        <Card
                          key={option.value}
                          className={`p-4 cursor-pointer hover-elevate text-center ${formData.sessionMinutes === option.value ? "border-primary" : ""
                            }`}
                          onClick={() => updateFormData("sessionMinutes", option.value)}
                          data-testid={`card-duration-${option.value}`}
                        >
                          <RadioGroupItem value={option.value} id={`duration-${option.value}`} className="sr-only" />
                          <Label htmlFor={`duration-${option.value}`} className="font-semibold cursor-pointer block">
                            {option.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">{option.desc}</p>
                        </Card>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-['Outfit'] mb-2">Local e equipamentos</h2>
                  <p className="text-muted-foreground">Onde você vai treinar?</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Local de treino</Label>
                    <RadioGroup
                      value={formData.location}
                      onValueChange={(value) => updateFormData("location", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="home" id="home" data-testid="radio-home" />
                        <Label htmlFor="home" className="font-normal cursor-pointer">Em casa</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gym" id="gym" data-testid="radio-gym" />
                        <Label htmlFor="gym" className="font-normal cursor-pointer">Academia</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" data-testid="radio-both" />
                        <Label htmlFor="both" className="font-normal cursor-pointer">Ambos (misto)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Equipamentos disponíveis</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "barbell", label: "Barra" },
                        { id: "dumbbells", label: "Halteres" },
                        { id: "kettlebell", label: "Kettlebell" },
                        { id: "bands", label: "Elásticos" },
                        { id: "trx", label: "TRX" },
                        { id: "bench", label: "Banco" },
                      ].map((equipment) => (
                        <div key={equipment.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={equipment.id}
                            checked={formData.equipment.includes(equipment.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFormData("equipment", [...formData.equipment, equipment.id]);
                              } else {
                                updateFormData("equipment", formData.equipment.filter((e: string) => e !== equipment.id));
                              }
                            }}
                            data-testid={`checkbox-${equipment.id}`}
                          />
                          <Label htmlFor={equipment.id} className="font-normal cursor-pointer">
                            {equipment.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-['Outfit'] mb-2">Quase lá!</h2>
                  <p className="text-muted-foreground">Informações finais para sua segurança</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="injuries">Lesões ou limitações</Label>
                    <Input
                      id="injuries"
                      placeholder="Ex: dor no ombro direito, problema no joelho..."
                      value={formData.injuries}
                      onChange={(e) => updateFormData("injuries", e.target.value)}
                      data-testid="input-injuries"
                    />
                    <p className="text-xs text-muted-foreground">
                      A IA irá evitar exercícios que possam agravar essas áreas
                    </p>
                  </div>
                  <Card className="p-4 bg-muted/30">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Resumo do seu perfil</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• {formData.goal === "fat_loss" ? "Perda de gordura" : formData.goal === "hypertrophy" ? "Hipertrofia" : formData.goal === "strength" ? "Força" : "Condicionamento"}</p>
                        <p>• {formData.daysPerWeek} dias por semana, {formData.sessionMinutes} minutos</p>
                        <p>• {formData.equipment.length > 0 ? formData.equipment.join(", ") : "Sem equipamentos"}</p>
                      </div>
                    </div>
                  </Card>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" data-testid="checkbox-terms" />
                    <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                      Aceito os{" "}
                      <a href="/legal/terms" className="text-primary hover:underline">
                        Termos de Uso
                      </a>{" "}
                      e{" "}
                      <a href="/legal/privacy" className="text-primary hover:underline">
                        Política de Privacidade
                      </a>
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">ESCOLHA SEU <span className="text-primary-main">COACH AI</span></h2>
                  <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">A personalidade que guiará sua jornada</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PERSONAS.map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      selected={formData.persona === persona.id}
                      onSelect={(id) => setFormData({ ...formData, persona: id })}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting || authLoading}
              data-testid="button-next"
            >
              {isSubmitting || authLoading ? (
                "Processando..."
              ) : step < totalSteps ? (
                <>
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                "Gerar meu plano"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

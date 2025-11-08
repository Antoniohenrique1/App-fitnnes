import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WorkoutExerciseCard from "@/components/WorkoutExerciseCard";
import { ArrowLeft, Clock, Target } from "lucide-react";
import { Link } from "wouter";

export default function WorkoutDetail() {
  //todo: remove mock functionality
  const workout = {
    focus: "Peito e Tríceps",
    duration: 45,
    exercises: [
      {
        name: "Supino Reto com Barra",
        sets: 4,
        reps: "8-10",
        rest: 90,
        notes: "Manter escápulas retraídas, descer controlado até tocar o peito",
      },
      {
        name: "Supino Inclinado com Halteres",
        sets: 3,
        reps: "10-12",
        rest: 75,
        notes: "Banco a 30-45 graus, amplitude completa",
      },
      {
        name: "Crossover",
        sets: 3,
        reps: "12-15",
        rest: 60,
        notes: "Foco na contração do peitoral, movimento controlado",
      },
      {
        name: "Tríceps Testa",
        sets: 3,
        reps: "10-12",
        rest: 60,
        notes: "Cotovelos fixos, apenas antebraço se move",
      },
      {
        name: "Tríceps Corda",
        sets: 3,
        reps: "12-15",
        rest: 60,
        notes: "Abrir a corda ao final do movimento",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <Badge variant="outline" className="gap-2">
            <Clock className="w-3 h-3" />
            {workout.duration} min
          </Badge>
        </div>
      </nav>

      <div className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Treino de Hoje</span>
          </div>
          <h1 className="text-3xl font-bold font-['Outfit']">{workout.focus}</h1>
        </div>

        <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold font-['Outfit'] tabular-nums">{workout.exercises.length}</div>
              <div className="text-xs text-muted-foreground">exercícios</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-['Outfit'] tabular-nums">
                {workout.exercises.reduce((acc, ex) => acc + ex.sets, 0)}
              </div>
              <div className="text-xs text-muted-foreground">séries totais</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-['Outfit'] tabular-nums">{workout.duration}</div>
              <div className="text-xs text-muted-foreground">minutos</div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold font-['Outfit']">Exercícios</h2>
          {workout.exercises.map((exercise, index) => (
            <WorkoutExerciseCard
              key={index}
              {...exercise}
              onSwap={() => console.log(`Swap exercise: ${exercise.name}`)}
            />
          ))}
        </div>

        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            <strong>Dica:</strong> Se sentir dor maior que 6/10 em qualquer exercício, clique em trocar para receber uma alternativa segura.
          </p>
        </Card>

        <Button className="w-full" size="lg" data-testid="button-finish-workout">
          Finalizar Treino
        </Button>
      </div>
    </div>
  );
}

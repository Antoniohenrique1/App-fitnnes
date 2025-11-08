import MissionCard from "../MissionCard";
import { Dumbbell, Target, Flame } from "lucide-react";

export default function MissionCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-8 bg-background">
      <MissionCard
        title="Fechar 2 anéis"
        description="Complete os anéis de Treino e Volume hoje"
        progress={1}
        total={2}
        icon={<Target className="w-4 h-4" />}
      />
      <MissionCard
        title="Treino completo"
        description="Complete todas as séries planejadas"
        completed
        icon={<Dumbbell className="w-4 h-4" />}
      />
      <MissionCard
        title="Sequência de 7 dias"
        description="Mantenha sua sequência ativa"
        progress={5}
        total={7}
        icon={<Flame className="w-4 h-4" />}
      />
    </div>
  );
}

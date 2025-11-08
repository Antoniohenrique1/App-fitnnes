import BadgeGrid from "../BadgeGrid";

export default function BadgeGridExample() {
  const mockBadges = [
    { id: "1", title: "Novato", description: "Complete 3 dias de treino", icon: "star" as const, rarity: "common" as const, earned: true },
    { id: "2", title: "1ª Semana", description: "Complete uma semana completa", icon: "trophy" as const, rarity: "rare" as const, earned: true },
    { id: "3", title: "PR Conquistado", description: "Estabeleça um novo recorde pessoal", icon: "zap" as const, rarity: "epic" as const, earned: true },
    { id: "4", title: "Sequência de Fogo", description: "Mantenha 7 dias seguidos", icon: "flame" as const, rarity: "epic" as const, earned: false },
    { id: "5", title: "Mês Épico", description: "Complete 30 dias de treino", icon: "award" as const, rarity: "legendary" as const, earned: false },
    { id: "6", title: "Dedicação Total", description: "Complete 100 treinos", icon: "heart" as const, rarity: "legendary" as const, earned: false },
  ];

  return (
    <div className="p-8 bg-background">
      <h3 className="text-lg font-semibold mb-4">Conquistas</h3>
      <BadgeGrid badges={mockBadges} />
    </div>
  );
}

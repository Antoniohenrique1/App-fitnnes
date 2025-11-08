import LeagueCard from "../LeagueCard";

export default function LeagueCardExample() {
  const mockMembers = [
    { id: "1", name: "Ana Silva", xp: 2450, rank: 1 },
    { id: "2", name: "Carlos Santos", xp: 2340, rank: 2 },
    { id: "3", name: "Maria Oliveira", xp: 2180, rank: 3 },
    { id: "current", name: "Você", xp: 1950, rank: 4 },
    { id: "5", name: "João Costa", xp: 1820, rank: 5 },
  ];

  return (
    <div className="p-8 bg-background max-w-md">
      <LeagueCard tier="Ouro" members={mockMembers} currentUserId="current" />
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";

interface LeagueMember {
  id: string;
  name: string;
  xp: number;
  rank: number;
}

interface LeagueCardProps {
  tier: "Bronze" | "Prata" | "Ouro" | "Diamante";
  members: LeagueMember[];
  currentUserId?: string;
}

const tierColors = {
  Bronze: "text-amber-700",
  Prata: "text-slate-400",
  Ouro: "text-yellow-400",
  Diamante: "text-cyan-400",
};

export default function LeagueCard({ tier, members, currentUserId }: LeagueCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className={`w-5 h-5 ${tierColors[tier]}`} />
          <h3 className="text-lg font-semibold">Liga {tier}</h3>
        </div>
        
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                member.id === currentUserId ? "bg-accent/20" : ""
              } hover-elevate`}
              data-testid={`league-member-${member.id}`}
            >
              <div className="flex items-center gap-2 flex-1">
                {member.rank <= 3 && (
                  <Medal className={`w-4 h-4 ${
                    member.rank === 1 ? "text-yellow-400" :
                    member.rank === 2 ? "text-slate-400" :
                    "text-amber-700"
                  }`} />
                )}
                {member.rank > 3 && (
                  <span className="text-sm text-muted-foreground w-4 text-center">{member.rank}</span>
                )}
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{member.name}</span>
              </div>
              <Badge variant="outline" className="tabular-nums">
                {member.xp} XP
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

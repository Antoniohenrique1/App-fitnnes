import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Target, Flame, Star, Award, Zap, Heart, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: "trophy" | "target" | "flame" | "star" | "award" | "zap" | "heart";
  rarity: "common" | "rare" | "epic" | "legendary";
  earned: boolean;
}

interface BadgeGridProps {
  badges: BadgeItem[];
}

const iconMap = {
  trophy: Trophy,
  target: Target,
  flame: Flame,
  star: Star,
  award: Award,
  zap: Zap,
  heart: Heart,
};

const rarityColors = {
  common: "text-muted-foreground",
  rare: "text-chart-2",
  epic: "text-chart-1",
  legendary: "text-chart-4",
};

export default function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      {badges.map((badge) => {
        const Icon = iconMap[badge.icon];
        return (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <Card
                className={`aspect-square flex items-center justify-center hover-elevate active-elevate-2 ${
                  badge.earned ? "" : "opacity-40"
                }`}
                data-testid={`badge-${badge.id}`}
              >
                <div className="relative">
                  <Icon className={`w-8 h-8 ${badge.earned ? rarityColors[badge.rarity] : "text-muted-foreground"}`} />
                  {!badge.earned && (
                    <Lock className="w-3 h-3 absolute -bottom-1 -right-1 text-muted-foreground" />
                  )}
                </div>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold text-sm">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                <p className={`text-xs ${rarityColors[badge.rarity]}`}>{badge.rarity.toUpperCase()}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

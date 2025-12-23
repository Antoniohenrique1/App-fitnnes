import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Target, Flame, Star, Award, Zap, Heart, Lock } from "lucide-react";
import { GlassCard } from "@/components/premium/GlassCard";
import { colors } from "@/lib/design-system";
import { cn } from "@/lib/utils";

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
  common: colors.text.secondary,
  rare: colors.success.main,
  epic: colors.primary.main,
  legendary: colors.legendary.main,
};

const ALL_AVAILABLE_BADGES: Omit<BadgeItem, "earned">[] = [
  { id: "streak_7", title: "Guerreiro Semanal", description: "Manteve uma ofensiva de 7 dias.", icon: "flame", rarity: "common" },
  { id: "workouts_30", title: "Veterano", description: "Completou 30 treinos no total.", icon: "award", rarity: "rare" },
  { id: "prs_5", title: "Superação", description: "Quebrou 5 recordes pessoais.", icon: "zap", rarity: "epic" },
  { id: "social_star", title: "Influenciador", description: "Recebeu 50 curtidas em seus posts.", icon: "star", rarity: "epic" },
  { id: "legendary_start", title: "Início Lendário", description: "Completou o primeiro treino com perfeição.", icon: "trophy", rarity: "legendary" },
  { id: "king_of_gym", title: "Rei da Academia", description: "Treinou 5 dias seguidos na mesma localização.", icon: "heart", rarity: "rare" },
];

export function BadgeGrid({ userBadges = [] }: { userBadges?: any[] }) {
  const badges = ALL_AVAILABLE_BADGES.map(badge => ({
    ...badge,
    earned: userBadges.some(ub => ub.badgeId === badge.id)
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {badges.map((badge, index) => {
        const Icon = iconMap[badge.icon as keyof typeof iconMap];
        const color = rarityColors[badge.rarity as keyof typeof rarityColors];

        return (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  variant={badge.earned ? "medium" : "light"}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center relative p-0 group overflow-hidden",
                    !badge.earned && "grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                  )}
                  glow={badge.earned && badge.rarity !== "common"}
                >
                  <div className="relative z-10">
                    <Icon
                      className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
                      style={{ color: badge.earned ? color : undefined }}
                    />
                    {!badge.earned && (
                      <div className="absolute -bottom-1 -right-1 bg-black/60 rounded-full p-0.5">
                        <Lock className="w-3 h-3 text-white/40" />
                      </div>
                    )}
                  </div>

                  {badge.earned && (
                    <motion.div
                      className="absolute bottom-2 h-1 w-8 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </GlassCard>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent className="bg-dark-bg/95 border-white/10 backdrop-blur-xl p-4 min-w-[200px]">
              <div className="space-y-2 text-center">
                <div
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color }}
                >
                  {badge.rarity} Badge
                </div>
                <h4 className="font-black text-white text-base leading-none uppercase italic tracking-tighter">
                  {badge.title}
                </h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {badge.description}
                </p>
                <div className="pt-2 border-t border-white/5 text-[10px] font-bold uppercase tracking-tight">
                  {badge.earned ? (
                    <span className="text-primary-main">Desbloqueado</span>
                  ) : (
                    <span className="text-muted-foreground">Bloqueado</span>
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

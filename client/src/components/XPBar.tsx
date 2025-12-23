import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { getLevelProgress } from "@shared/gamification.js";

interface XPBarProps {
  currentXP: number;
  totalXP: number;
  level: number;
}

export default function XPBar({ currentXP, level }: Omit<XPBarProps, 'totalXP'>) {
  const { xpInCurrentLevel, xpNeededForNextLevel, progress } = getLevelProgress(currentXP);
  const percentage = progress;

  return (
    <div className="relative w-full group cursor-default">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-md rounded-lg" />
          <Badge
            variant="outline"
            className="relative text-sm font-bold font-['Outfit'] h-10 px-4 justify-center bg-black border-primary/30 text-primary tracking-widest uppercase"
          >
            LVL <span className="text-white ml-2 text-lg">{level}</span>
          </Badge>
        </div>

        <div className="flex-1 relative">
          <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
              className="h-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>
          {/* Particles/Sparks */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-12 bg-primary/50 blur-xl pointer-events-none transition-all duration-300"
            style={{ left: `${percentage}%`, opacity: percentage > 0 ? 1 : 0 }}
          />
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Experience</div>
          <div className="text-sm font-mono font-medium text-white tabular-nums">
            <span className="text-primary">{xpInCurrentLevel}</span> / {xpNeededForNextLevel} XP
          </div>
        </div>
      </div>
    </div>
  );
}

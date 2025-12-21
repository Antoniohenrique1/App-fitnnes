import { CheckCircle2, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MissionCardProps {
  title: string;
  description: string;
  progress?: number;
  total?: number;
  completed?: boolean;
  icon: React.ReactNode;
}

export default function MissionCard({
  title,
  description,
  progress,
  total,
  completed = false,
  icon,
}: MissionCardProps) {
  const percentage = progress && total ? Math.min((progress / total) * 100, 100) : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300 overflow-hidden group cursor-pointer",
        completed
          ? "bg-primary/5 border-primary/20"
          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
      )}
    >
      {/* Background fill for progress (optional alternative style) or simple glass */}
      {completed && <div className="absolute inset-0 bg-primary/5" />}

      <div className="flex items-start gap-4 relative z-10">
        <div className={`
            mt-0.5 p-2 rounded-lg 
            ${completed ? 'bg-primary/20 text-primary shadow-neon' : 'bg-white/5 text-muted-foreground'}
        `}>
          {completed ? <CheckCircle2 className="w-5 h-5" /> : icon}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={cn("font-bold text-sm font-['Outfit']", completed ? "text-primary text-glow" : "text-white")}>{title}</h3>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">{description}</p>
            </div>
            {completed && <span className="text-[10px] font-bold uppercase bg-primary text-black px-2 py-0.5 rounded-sm">Done</span>}
          </div>

          {!completed && progress !== undefined && total !== undefined && (
            <div className="space-y-1.5 pt-1">
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_hsl(var(--primary))]"
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <span>Progresso</span>
                <span className="text-white">{progress} / {total}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

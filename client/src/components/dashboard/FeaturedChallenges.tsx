import { motion } from "framer-motion";
import { GlassCard } from "@/components/premium/GlassCard";
import { Trophy, Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CHALLENGES = [
    {
        id: "global_1",
        title: "Desafio 100k",
        description: "Toda a comunidade unida para queimar 100.000 kcal esta semana.",
        progress: 72,
        reward: "Badges Exclusivas + 500 Coins",
        timeLeft: "3 dias",
        participants: 1240,
        color: "from-primary-main to-purple-600"
    },
    {
        id: "global_2",
        title: "Mestre da Madrugada",
        description: "Complete 3 treinos entre 05:00 e 07:00 da manhã.",
        progress: 33,
        reward: "Título: Early Bird + 200 Coins",
        timeLeft: "5 dias",
        participants: 450,
        color: "from-orange-500 to-red-600"
    }
];

export function FeaturedChallenges() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary-main" /> Desafios Globais
                </h3>
                <span className="text-[10px] uppercase font-black text-primary-main tracking-widest bg-primary-main/10 px-2 py-1 rounded-lg">
                    Tempo Limitado
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {CHALLENGES.map((challenge, index) => (
                    <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GlassCard className="p-0 overflow-hidden group border-white/5 hover:border-primary-main/30 transition-all duration-500">
                            <div className="flex flex-col md:flex-row">
                                {/* Visual Accent */}
                                <div className={`w-full md:w-2 h-2 md:h-auto bg-gradient-to-b ${challenge.color}`} />

                                <div className="p-5 flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h4 className="font-black italic uppercase tracking-tight text-white group-hover:text-primary-main transition-colors">
                                                {challenge.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                                                {challenge.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400 uppercase">
                                                <Clock size={10} /> {challenge.timeLeft}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                                                <Users size={10} /> {challenge.participants}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-white">Progresso</span>
                                            <span className="text-primary-main">{challenge.progress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${challenge.progress}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-full rounded-full bg-gradient-to-r ${challenge.color}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Prêmio: <span className="text-white">{challenge.reward}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 group/btn text-[10px] font-black uppercase tracking-widest hover:text-primary-main hover:bg-primary-main/10 rounded-lg">
                                            Participar <ArrowRight size={12} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

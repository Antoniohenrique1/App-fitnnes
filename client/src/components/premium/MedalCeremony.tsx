import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Award, Sparkles, X } from "lucide-react";
import { GlassCard } from "@/components/premium/GlassCard";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface MedalCeremonyProps {
    isOpen: boolean;
    onClose: () => void;
    medal: {
        title: string;
        description: string;
        rarity: "common" | "rare" | "epic" | "legendary";
        icon: string;
    };
}

const rarityColors = {
    common: "from-gray-400 to-gray-600",
    rare: "from-emerald-400 to-emerald-600",
    epic: "from-blue-500 to-purple-600",
    legendary: "from-yellow-400 via-orange-500 to-red-600",
};

const rarityGlow = {
    common: "shadow-[0_0_30px_rgba(156,163,175,0.3)]",
    rare: "shadow-[0_0_30px_rgba(52,211,153,0.3)]",
    epic: "shadow-[0_0_40px_rgba(59,130,246,0.4)]",
    legendary: "shadow-[0_0_60px_rgba(245,158,11,0.5)]",
};

export function MedalCeremony({ isOpen, onClose, medal }: MedalCeremonyProps) {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setShowContent(true), 500);

            // Professional confetti blast
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => {
                clearTimeout(timer);
                clearInterval(interval);
            };
        } else {
            setShowContent(false);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Overlay Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />

                    {/* Epic Ray Effects */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        className={`absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 bg-gradient-to-r ${rarityColors[medal.rarity]}`}
                    />

                    {/* Content Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="relative w-full max-w-lg z-10"
                    >
                        <GlassCard className={`p-12 overflow-hidden border-white/10 ${rarityGlow[medal.rarity]}`}>
                            <div className="absolute top-4 right-4">
                                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-white/50">
                                    <X size={20} />
                                </Button>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-8">
                                {/* Visual Header */}
                                <div className="space-y-2">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-main"
                                    >
                                        Nova Conquista Desbloqueada
                                    </motion.div>
                                    <h2 className={`text-5xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${rarityColors[medal.rarity]}`}>
                                        {medal.rarity}
                                    </h2>
                                </div>

                                {/* Animated Badge */}
                                <motion.div
                                    initial={{ rotateY: 180, scale: 0 }}
                                    animate={{ rotateY: 0, scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring", damping: 12 }}
                                    className="relative"
                                >
                                    <div className={`w-40 h-40 rounded-full p-1 bg-gradient-to-br ${rarityColors[medal.rarity]} shadow-2xl relative z-10`}>
                                        <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
                                            <Trophy size={64} className="text-white" />
                                        </div>
                                    </div>

                                    {/* Floating Particles Around Badge */}
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute top-1/2 left-1/2 text-primary-main text-xl"
                                            initial={{ x: 0, y: 0, opacity: 0 }}
                                            animate={{
                                                x: Math.cos(i * 60 * Math.PI / 180) * 100,
                                                y: Math.sin(i * 60 * Math.PI / 180) * 100,
                                                opacity: [0, 1, 0],
                                                scale: [0.5, 1, 0.5]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: i * 0.4,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <Sparkles size={20} />
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Medal Info */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-1">
                                        <h3 className="text-3xl font-black uppercase italic tracking-tight text-white">{medal.title}</h3>
                                        <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">
                                            {medal.description}
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            onClick={onClose}
                                            className={`h-14 px-12 rounded-2xl font-black uppercase italic tracking-widest text-lg shadow-neon group bg-gradient-to-r ${rarityColors[medal.rarity]} text-white border-0 hover:scale-105 transition-transform`}
                                        >
                                            COLETAR RECOMPENSA
                                        </Button>
                                    </div>

                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
                                        +500 XP & Ranking Global Atualizado
                                    </p>
                                </motion.div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

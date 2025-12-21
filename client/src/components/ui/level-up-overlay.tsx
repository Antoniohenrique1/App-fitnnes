
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Crown, X } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LevelUpOverlayProps {
    level: number;
    newBadges?: string[];
    onClose: () => void;
    isOpen: boolean;
}

export function LevelUpOverlay({ level, newBadges = [], onClose, isOpen }: LevelUpOverlayProps) {

    useEffect(() => {
        if (isOpen) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: NodeJS.Timeout = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                    <Trophy className="w-32 h-32 text-[#ADFF2F] drop-shadow-[0_0_15px_rgba(173,255,47,0.5)] mx-auto mb-6 relative z-10" />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="relative z-10"
                    >
                        <h2 className="text-white text-lg font-['Outfit'] uppercase tracking-[0.2em] mb-2">Level Up!</h2>
                        <div className="text-8xl font-black font-['Outfit'] text-white leading-none tracking-tighter title-stroke">
                            {level}
                        </div>
                        <div className="text-xl text-primary font-bold mt-2 uppercase tracking-wide">
                            Mestre da Hipertrofia
                        </div>
                    </motion.div>
                </motion.div>

                {newBadges.length > 0 && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12 w-full max-w-sm"
                    >
                        <p className="text-muted-foreground uppercase text-xs tracking-widest mb-4">Conquistas Desbloqueadas</p>
                        <div className="flex justify-center gap-4">
                            {newBadges.map((badge, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                                        <Crown className="w-8 h-8 text-black" />
                                    </div>
                                    <span className="text-xs font-bold">{badge}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-16 w-full max-w-xs"
                >
                    <Button
                        onClick={onClose}
                        className="w-full h-14 text-lg font-bold shadow-neon bg-white text-black hover:bg-white/90"
                    >
                        CONTINUAR TREINO
                    </Button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

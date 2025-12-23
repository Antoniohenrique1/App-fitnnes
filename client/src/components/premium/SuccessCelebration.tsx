import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles, TrendingUp } from "lucide-react";
import { NeonButton } from "@/components/premium/NeonButton";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface SuccessCelebrationProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle: string;
    xpGain: number;
}

export function SuccessCelebration({ isOpen, onClose, title, subtitle, xpGain }: SuccessCelebrationProps) {
    useEffect(() => {
        if (isOpen) {
            // Premium confetti blast
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

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

            // Mobile Haptic Feedback
            if ("vibrate" in navigator) {
                navigator.vibrate([100, 50, 200]);
            }
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-dark-bg/90 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        className="relative bg-gradient-to-b from-primary-main/20 via-white/5 to-transparent border border-white/10 rounded-[40px] p-8 max-w-sm w-full text-center overflow-hidden"
                    >
                        {/* Background elements */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-main/20 blur-[80px] -z-10" />

                        <motion.div
                            initial={{ rotate: -20, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-24 h-24 bg-primary-main rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(0,217,255,0.4)]"
                        >
                            <Trophy size={48} className="text-black fill-current" />
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-black italic tracking-tighter uppercase mb-2"
                        >
                            {title}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-8"
                        >
                            {subtitle}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 flex items-center justify-between"
                        >
                            <div className="text-left">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-main">RECOMPENSA</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <TrendingUp size={20} className="text-primary-main" />
                                    <span className="text-3xl font-black italic">+{xpGain} XP</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full border-2 border-primary-main/30 flex items-center justify-center">
                                <Star size={24} className="text-primary-main fill-current" />
                            </div>
                        </motion.div>

                        <div className="space-y-3">
                            <NeonButton onClick={onClose} className="w-full h-14 text-lg">
                                PROSSEGUIR <Sparkles size={20} className="ml-2" />
                            </NeonButton>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

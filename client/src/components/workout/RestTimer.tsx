import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Play, SkipForward } from "lucide-react";
import { NeonButton } from "@/components/premium/NeonButton";
import { colors } from "@/lib/design-system";

interface RestTimerProps {
    duration: number;
    onComplete: () => void;
}

export function RestTimer({ duration, onComplete }: RestTimerProps) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        let timer: any;
        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            onComplete();
        }
        return () => clearInterval(timer);
    }, [isActive, timeLeft, onComplete]);

    const progress = (timeLeft / duration) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-dark-bg flex flex-col items-center justify-center p-6"
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.1),transparent_70%)] animate-pulse" />
            </div>

            <div className="relative z-10 text-center space-y-8">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary-main">Tempo de Descanso</h2>

                <div className="relative w-64 h-64 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            fill="none"
                            stroke="white"
                            strokeWidth="4"
                            className="opacity-5"
                        />
                        <motion.circle
                            cx="128"
                            cy="128"
                            r="120"
                            fill="none"
                            stroke={colors.primary.main}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray="754"
                            animate={{ strokeDashoffset: 754 - (754 * progress) / 100 }}
                            transition={{ duration: 1, ease: "linear" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            key={timeLeft}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-7xl font-black italic tracking-tighter"
                        >
                            {timeLeft}
                        </motion.span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">segundos</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <NeonButton
                        variant="secondary"
                        size="lg"
                        onClick={() => setIsActive(!isActive)}
                        className="w-32"
                    >
                        {isActive ? "Pausar" : "Retomar"}
                    </NeonButton>
                    <NeonButton
                        size="lg"
                        onClick={onComplete}
                        className="w-32"
                    >
                        Pular <SkipForward size={18} className="ml-2" />
                    </NeonButton>
                </div>
            </div>
        </motion.div>
    );
}

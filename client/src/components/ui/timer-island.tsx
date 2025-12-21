
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Play, Pause, RotateCcw } from "lucide-react";

export function TimerIsland({ seconds, onComplete, isActive = false }: { seconds: number, onComplete?: () => void, isActive?: boolean }) {
    const [timeLeft, setTimeLeft] = useState(seconds);
    const [isRunning, setIsRunning] = useState(isActive);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            onComplete?.();
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft, onComplete]);

    const toggleTimer = () => setIsRunning(!isRunning);
    const resetTimer = () => setTimeLeft(seconds);
    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = time % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Progress percentage for ring
    const progress = ((seconds - timeLeft) / seconds) * 100;

    return (
        <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden cursor-pointer ${isExpanded ? 'rounded-[2rem] w-[90%] max-w-sm p-6' : 'rounded-full px-4 py-2 h-12 flex items-center gap-3'}`}
        >
            <AnimatePresence mode="wait">
                {!isExpanded ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 w-full justify-between"
                    >
                        <div className="relative w-5 h-5 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/20" />
                                <circle cx="10" cy="10" r="8" stroke="#ADFF2F" strokeWidth="2" fill="transparent" strokeDasharray={50} strokeDashoffset={50 - (progress / 100) * 50} />
                            </svg>
                        </div>
                        <span className="font-mono font-bold text-[#ADFF2F]">{formatTime(timeLeft)}</span>
                        <span className="text-xs text-white/50 uppercase tracking-widest">Descanso</span>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-6 w-full"
                    >
                        <div className="text-center">
                            <h3 className="text-white/50 text-sm uppercase tracking-[0.2em] mb-2">Descanso</h3>
                            <div className="font-['Outfit'] text-6xl font-bold text-white tabular-nums tracking-tighter">
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 w-full justify-center">
                            <button
                                onClick={(e) => { e.stopPropagation(); setTimeLeft(Math.max(0, timeLeft - 10)); }}
                                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-90 transition-transform"
                            >
                                <Minus className="w-5 h-5" />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
                                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all ${isRunning ? 'bg-red-500/20 text-red-500' : 'bg-[#ADFF2F] text-black'}`}
                            >
                                {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); setTimeLeft(timeLeft + 10); }}
                                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-90 transition-transform"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); resetTimer(); }}
                            className="text-xs text-white/40 flex items-center gap-2 hover:text-white transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" /> Reiniciar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Glow */}
            <div className={`absolute top-0 left-0 w-full h-[2px] bg-[#ADFF2F] transition-all duration-1000 ${isRunning ? 'opacity-100' : 'opacity-0'}`} style={{ width: `${(timeLeft / seconds) * 100}%` }} />
        </motion.div>
    );
}

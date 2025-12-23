import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, Brain, Shield, Target, Beaker, Zap } from "lucide-react";
import { colors } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/premium/GlassCard";
import { useState, useEffect } from "react";

interface AIBubbleProps {
    message: string;
    persona: "sergeant" | "mentor" | "scientist" | "zen";
    personaName: string;
}

export function AIBubble({ message, persona, personaName }: AIBubbleProps) {
    const [visible, setVisible] = useState(false);
    const [displayText, setDisplayText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(true);
            setIsTyping(true);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isTyping && visible) {
            let i = 0;
            const interval = setInterval(() => {
                setDisplayText(message.slice(0, i));
                i++;
                if (i > message.length) {
                    clearInterval(interval);
                    setIsTyping(false);
                }
            }, 30);
            return () => clearInterval(interval);
        }
    }, [isTyping, visible, message]);

    const personaConfig = {
        sergeant: { icon: Shield, color: colors.error.main, accent: "text-red-500" },
        mentor: { icon: Target, color: colors.primary.main, accent: "text-primary-main" },
        scientist: { icon: Beaker, color: colors.secondary.main, accent: "text-secondary-main" },
        zen: { icon: Zap, color: colors.success.main, accent: "text-success-main" },
    };

    const { icon: PersonaIcon, color, accent } = personaConfig[persona] || personaConfig.mentor;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="relative"
                >
                    <div className="flex items-start gap-5 mb-8">
                        {/* Avatar Column */}
                        <div className="flex flex-col items-center gap-2">
                            <motion.div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative group"
                                style={{
                                    background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                                    border: `1px solid ${color}44`
                                }}
                                animate={{
                                    boxShadow: isTyping
                                        ? [`0 0 0px ${color}22`, `0 0 20px ${color}66`, `0 0 0px ${color}22`]
                                        : `0 0 10px ${color}22`,
                                    scale: isTyping ? [1, 1.05, 1] : 1
                                }}
                                transition={{
                                    duration: isTyping ? 0.8 : 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <PersonaIcon size={28} style={{ color }} className="relative z-10" />

                                {/* Animated Rings during typing */}
                                {isTyping && (
                                    <motion.div
                                        className="absolute inset-0 rounded-2xl border border-primary-main/50"
                                        initial={{ scale: 1, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                )}

                                <div className="absolute -top-1 -right-1">
                                    <Sparkles size={14} className={cn("animate-pulse", accent)} />
                                </div>
                            </motion.div>

                            {isTyping && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse"
                                >
                                    Digitando...
                                </motion.span>
                            )}
                        </div>

                        <div className="flex-1 pt-1">
                            <div className="flex items-center gap-3 mb-2">
                                <motion.span
                                    className="text-[10px] font-black uppercase tracking-[0.3em]"
                                    style={{ color }}
                                    animate={isTyping ? { opacity: [1, 0.5, 1] } : {}}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    {personaName} <span className="text-white/40 font-medium">| Analista de Performance</span>
                                </motion.span>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                            </div>

                            <div className="relative group">
                                <GlassCard className="p-5 border-white/5 bg-white/[0.03] group-hover:bg-white/[0.05] transition-colors duration-500">
                                    <p className="text-[15px] font-medium text-white/95 leading-relaxed italic tracking-tight">
                                        "{displayText}"
                                        {isTyping && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="inline-block w-1 h-4 bg-primary-main ml-1 align-middle" />}
                                    </p>

                                    {!isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex justify-end mt-3"
                                        >
                                            <div className="flex gap-1.5 items-center">
                                                <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest mr-2">Estatísticas Atualizadas</div>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3].map(i => (
                                                        <motion.div
                                                            key={i}
                                                            className="w-1 h-1 rounded-full bg-primary-main/40"
                                                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                                                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </GlassCard>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

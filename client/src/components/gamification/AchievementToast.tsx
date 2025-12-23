import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { colors } from "@/lib/design-system";

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    rarity: string;
}

interface AchievementToastProps {
    achievement: Achievement | null;
    onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (achievement) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onClose, 300);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    if (!achievement) return null;

    const rarityColors: Record<string, string> = {
        common: colors.text.secondary,
        uncommon: colors.success.main,
        rare: colors.primary.main,
        epic: colors.warning.main,
        legendary: colors.legendary.main,
    };

    const rarityColor = rarityColors[achievement.rarity] || colors.primary.main;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed top-4 right-4 z-[9999] max-w-md"
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                    <div
                        className="relative backdrop-blur-lg rounded-xl p-6 border-2"
                        style={{
                            background: `rgba(26, 31, 53, 0.95)`,
                            borderColor: rarityColor,
                            boxShadow: `0 0 30px ${rarityColor}66`,
                        }}
                    >
                        <button
                            onClick={() => {
                                setShow(false);
                                setTimeout(onClose, 300);
                            }}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10"
                        >
                            <X size={16} className="text-white/60" />
                        </button>

                        <div className="relative flex items-start gap-4">
                            <motion.div
                                className="text-5xl"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", delay: 0.2 }}
                            >
                                {achievement.icon}
                            </motion.div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Trophy size={18} style={{ color: rarityColor }} />
                                    <span className="text-xs font-bold uppercase" style={{ color: rarityColor }}>
                                        Conquista!
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-1">
                                    {achievement.name}
                                </h3>

                                <p className="text-sm text-white/70 mb-3">
                                    {achievement.description}
                                </p>

                                {achievement.xpReward > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={16} className="text-yellow-400" />
                                        <span className="text-sm font-bold text-yellow-400">
                                            +{achievement.xpReward} XP
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

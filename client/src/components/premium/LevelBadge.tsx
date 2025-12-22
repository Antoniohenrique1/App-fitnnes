import { motion } from "framer-motion";
import { colors } from "@/lib/design-system";

interface LevelBadgeProps {
    level: number;
    rank?: string;
    size?: 'sm' | 'md' | 'lg';
    glow?: boolean;
}

export function LevelBadge({
    level,
    rank = 'Bronze',
    size = 'md',
    glow = true
}: LevelBadgeProps) {
    const sizeClasses = {
        sm: { container: 'w-12 h-12', text: 'text-sm', rank: 'text-[8px]' },
        md: { container: 'w-16 h-16', text: 'text-lg', rank: 'text-[10px]' },
        lg: { container: 'w-24 h-24', text: 'text-2xl', rank: 'text-xs' },
    };

    const rankColors: Record<string, string> = {
        Bronze: colors.rarity.common,
        Silver: '#C0C0C0',
        Gold: '#FFB800',
        Platinum: '#00D9FF',
        Diamond: '#BB00FF',
        Master: '#FF3366',
        Legend: 'linear-gradient(135deg, #FFB800, #FF3366, #BB00FF)',
    };

    const currentSize = sizeClasses[size];
    const rankColor = rankColors[rank] || colors.primary.main;

    return (
        <motion.div
            className={`relative ${currentSize.container} flex items-center justify-center`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
            {/* Glow effect */}
            {glow && (
                <motion.div
                    className="absolute inset-0 rounded-full opacity-60"
                    style={{
                        background: rankColor.startsWith('linear')
                            ? rankColor
                            : rankColor,
                        filter: 'blur(12px)',
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            )}

            {/* Badge container */}
            <div
                className="relative w-full h-full rounded-full flex flex-col items-center justify-center border-2 backdrop-blur-sm"
                style={{
                    background: rank === 'Legend'
                        ? 'linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,51,102,0.2), rgba(187,0,255,0.2))'
                        : `${rankColor}22`,
                    borderColor: rankColor.startsWith('linear') ? '#BB00FF' : rankColor,
                }}
            >
                {/* Level number */}
                <motion.span
                    className={`font-bold ${currentSize.text}`}
                    style={{
                        background: rank === 'Legend' ? rankColor : 'transparent',
                        backgroundClip: rank === 'Legend' ? 'text' : 'unset',
                        WebkitBackgroundClip: rank === 'Legend' ? 'text' : 'unset',
                        WebkitTextFillColor: rank === 'Legend' ? 'transparent' : rankColor,
                        color: rank === 'Legend' ? 'transparent' : rankColor,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {level}
                </motion.span>

                {/* Rank text */}
                <motion.span
                    className={`font-semibold uppercase tracking-wider ${currentSize.rank}`}
                    style={{
                        color: rankColor.startsWith('linear') ? '#BB00FF' : rankColor,
                    }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {rank}
                </motion.span>
            </div>
        </motion.div>
    );
}

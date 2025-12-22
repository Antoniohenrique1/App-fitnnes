import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { colors } from "@/lib/design-system";

interface StreakFlameProps {
    streak: number;
    size?: 'sm' | 'md' | 'lg';
    showNumber?: boolean;
    animate?: boolean;
}

export function StreakFlame({
    streak,
    size = 'md',
    showNumber = true,
    animate = true
}: StreakFlameProps) {
    const sizeConfig = {
        sm: { icon: 16, text: 'text-sm', container: 'gap-1' },
        md: { icon: 24, text: 'text-lg', container: 'gap-2' },
        lg: { icon: 32, text: 'text-2xl', container: 'gap-3' },
    };

    const config = sizeConfig[size];

    // Color based on streak length
    const getFlameColor = () => {
        if (streak >= 365) return colors.legendary.main; // 1 year
        if (streak >= 100) return colors.warning.main;   // 100 days
        if (streak >= 30) return '#FF6B35';              // 1 month
        if (streak >= 7) return '#FF8C42';               // 1 week
        return '#FFA500';                                 // Less than week
    };

    const flameColor = getFlameColor();

    return (
        <div className={`flex items-center ${config.container}`}>
            <motion.div
                className="relative"
                animate={animate ? {
                    scale: [1, 1.1, 1],
                } : undefined}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                {/* Glow effect */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(circle, ${flameColor}66 0%, transparent 70%)`,
                        filter: 'blur(8px)',
                    }}
                    animate={animate ? {
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0.9, 0.6],
                    } : undefined}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Flame icon */}
                <motion.div
                    animate={animate ? {
                        rotate: [-2, 2, -2],
                    } : undefined}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <Flame
                        size={config.icon}
                        fill={flameColor}
                        color={flameColor}
                        style={{
                            filter: `drop-shadow(0 0 8px ${flameColor}88)`,
                        }}
                    />
                </motion.div>
            </motion.div>

            {showNumber && (
                <motion.span
                    className={`font-bold ${config.text}`}
                    style={{ color: flameColor }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {streak}
                </motion.span>
            )}
        </div>
    );
}

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { glass } from "@/lib/design-system";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'light' | 'medium' | 'heavy';
    hover?: boolean;
    glow?: boolean;
    onClick?: () => void;
}

export function GlassCard({
    children,
    className,
    variant = 'medium',
    hover = false,
    glow = false,
    onClick
}: GlassCardProps) {
    const glassStyle = glass[variant];

    return (
        <motion.div
            className={cn(
                "rounded-xl p-6 transition-all duration-300",
                hover && "cursor-pointer hover:scale-[1.02]",
                glow && "shadow-[0_0_30px_rgba(0,217,255,0.3)]",
                className
            )}
            style={{
                background: glassStyle.background,
                backdropFilter: glassStyle.backdropFilter,
                border: glassStyle.border,
            }}
            whileHover={hover ? { scale: 1.02 } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}

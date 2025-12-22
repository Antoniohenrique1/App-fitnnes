import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/design-system";

interface NeonButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'success' | 'legendary';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
    loading?: boolean;
}

export function NeonButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className,
    loading = false,
}: NeonButtonProps) {
    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const variantColors = {
        primary: colors.primary.main,
        success: colors.success.main,
        legendary: colors.legendary.main,
    };

    const glowColor = variantColors[variant];

    return (
        <motion.button
            className={cn(
                "relative rounded-lg font-bold overflow-hidden transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                sizeClasses[size],
                className
            )}
            style={{
                background: `linear-gradient(135deg, ${glowColor}22 0%, ${glowColor}44 100%)`,
                border: `2px solid ${glowColor}`,
                color: glowColor,
                boxShadow: `0 0 20px ${glowColor}33`,
            }}
            whileHover={!disabled ? {
                scale: 1.05,
                boxShadow: `0 0 30px ${glowColor}66`,
            } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {/* Glow effect */}
            <motion.div
                className="absolute inset-0 opacity-0"
                style={{
                    background: `radial-gradient(circle at center, ${glowColor}44 0%, transparent 70%)`,
                }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />

            {/* Content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading && (
                    <motion.div
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                )}
                {children}
            </span>
        </motion.button>
    );
}

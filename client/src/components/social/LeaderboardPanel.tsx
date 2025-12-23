import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/premium/GlassCard";
import { LevelBadge } from "@/components/premium/LevelBadge";
import { colors } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
    user: {
        id: string;
        name: string;
        username: string;
    };
    stats: {
        level: number;
        rank: string;
        weeklyXP: number;
        totalXpEarned: number;
    };
}

interface LeaderboardPanelProps {
    entries: LeaderboardEntry[];
    type: "global" | "friends";
    period: "weekly" | "all_time";
    onTypeChange: (type: "global" | "friends") => void;
    onPeriodChange: (period: "weekly" | "all_time") => void;
    isLoading?: boolean;
}

export function LeaderboardPanel({
    entries,
    type,
    period,
    onTypeChange,
    onPeriodChange,
    isLoading = false
}: LeaderboardPanelProps) {

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="text-yellow-400" size={20} />;
            case 1: return <Medal className="text-slate-300" size={20} />;
            case 2: return <Medal className="text-amber-600" size={20} />;
            default: return <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>;
        }
    };

    return (
        <GlassCard variant="heavy" className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Trophy className="text-primary-main" size={24} />
                    <h3 className="text-xl font-bold text-white tracking-tight">Ranking</h3>
                </div>
                <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
                    <button
                        onClick={() => onTypeChange("global")}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold transition-all",
                            type === "global" ? "bg-primary-main text-black" : "text-white/60 hover:text-white"
                        )}
                    >
                        Global
                    </button>
                    <button
                        onClick={() => onTypeChange("friends")}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold transition-all",
                            type === "friends" ? "bg-primary-main text-black" : "text-white/60 hover:text-white"
                        )}
                    >
                        Amigos
                    </button>
                </div>
            </div>

            {/* Period Selector */}
            <div className="flex gap-4 mb-6 border-b border-white/5 pb-2">
                <button
                    onClick={() => onPeriodChange("weekly")}
                    className={cn(
                        "text-sm font-bold pb-2 transition-all relative",
                        period === "weekly" ? "text-primary-main" : "text-white/40 hover:text-white"
                    )}
                >
                    Semanal
                    {period === "weekly" && (
                        <motion.div
                            layoutId="period-underline"
                            className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary-main"
                        />
                    )}
                </button>
                <button
                    onClick={() => onPeriodChange("all_time")}
                    className={cn(
                        "text-sm font-bold pb-2 transition-all relative",
                        period === "all_time" ? "text-primary-main" : "text-white/40 hover:text-white"
                    )}
                >
                    Sempre
                    {period === "all_time" && (
                        <motion.div
                            layoutId="period-underline"
                            className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary-main"
                        />
                    )}
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {entries.length > 0 ? entries.map((entry, index) => (
                            <motion.div
                                key={entry.user.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl transition-all border border-transparent",
                                    index < 3 ? "bg-white/10 border-white/10" : "hover:bg-white/5"
                                )}
                            >
                                <div className="w-8 flex justify-center">
                                    {getRankIcon(index)}
                                </div>
                                <div className="scale-75 origin-left">
                                    <LevelBadge level={entry.stats.level} rank={entry.stats.rank} glow={index === 0} size="sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-white truncate">{entry.user.name}</h4>
                                    <p className="text-[10px] text-muted-foreground truncate">@{entry.user.username}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end text-primary-main">
                                        <TrendingUp size={12} />
                                        <span className="text-xs font-black tracking-tighter">
                                            {(period === "weekly" ? entry.stats.weeklyXP : entry.stats.totalXpEarned).toLocaleString()}
                                        </span>
                                    </div>
                                    <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">XP</span>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="text-center py-10">
                                <p className="text-sm text-muted-foreground">Nenhum dado encontrado</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}

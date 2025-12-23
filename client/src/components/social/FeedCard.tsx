import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Trophy, Flame, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GlassCard } from "@/components/premium/GlassCard";
import { LevelBadge } from "@/components/premium/LevelBadge";
import { colors } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FeedCardProps {
    post: {
        id: string;
        type: "workout" | "achievement" | "milestone" | "challenge";
        content?: string;
        media?: string[];
        likes: number;
        comments: number;
        createdAt: Date;
    };
    user: {
        name: string;
        username: string;
    };
    stats: {
        level: number;
        rank: string;
    };
    onLike?: () => void;
    onComment?: () => void;
    isLiked?: boolean;
}

export function FeedCard({ post, user, stats, onLike, onComment, isLiked = false }: FeedCardProps) {
    const [liked, setLiked] = useState(isLiked);
    const [likesCount, setLikesCount] = useState(post.likes);

    const handleLike = () => {
        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);
        onLike?.();
    };

    const getTypeIcon = () => {
        switch (post.type) {
            case "workout": return <Flame className="text-orange-500" size={18} />;
            case "achievement": return <Trophy className="text-yellow-500" size={18} />;
            case "challenge": return <Target className="text-primary-main" size={18} />;
            default: return <Sparkles className="text-purple-500" size={18} />;
        }
    };

    return (
        <GlassCard className="mb-4 overflow-hidden" variant="medium">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <LevelBadge level={stats.level} rank={stats.rank} size="sm" glow={false} />
                    <div>
                        <h4 className="font-bold text-white text-sm">{user.name}</h4>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getTypeIcon()}
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })}
                    </span>
                </div>
            </div>

            {/* Content */}
            {post.content && (
                <p className="text-sm text-white/90 mb-4 leading-relaxed">
                    {post.content}
                </p>
            )}

            {/* Media (if any) */}
            {post.media && post.media.length > 0 && (
                <div className="rounded-lg overflow-hidden mb-4 border border-white/10">
                    <img
                        src={post.media[0]}
                        alt="Post content"
                        className="w-full object-cover max-h-80"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-2 border-t border-white/5">
                <button
                    onClick={handleLike}
                    className={cn(
                        "flex items-center gap-2 transition-colors",
                        liked ? "text-red-500" : "text-muted-foreground hover:text-white"
                    )}
                >
                    <motion.div whileTap={{ scale: 1.5 }}>
                        <Heart size={18} fill={liked ? "currentColor" : "none"} />
                    </motion.div>
                    <span className="text-xs font-medium">{likesCount}</span>
                </button>

                <button
                    onClick={onComment}
                    className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                >
                    <MessageCircle size={18} />
                    <span className="text-xs font-medium">{post.comments}</span>
                </button>

                <button className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors ml-auto">
                    <Share2 size={18} />
                </button>
            </div>
        </GlassCard>
    );
}

function Sparkles({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" /><path d="M3 5h4" /><path d="M21 17v4" /><path d="M19 19h4" />
        </svg>
    );
}

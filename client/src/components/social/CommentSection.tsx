import { motion, AnimatePresence } from "framer-motion";
import { Send, X, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NeonButton } from "@/components/premium/NeonButton";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Comment {
    id: string;
    userId: string;
    content: string;
    createdAt: Date;
    user: {
        name: string;
        username: string;
    };
}

interface CommentSectionProps {
    comments: Comment[];
    postId: string;
    onAddComment: (content: string) => void;
    onClose: () => void;
}

export function CommentSection({ comments, postId, onAddComment, onClose }: CommentSectionProps) {
    const [newComment, setNewComment] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment);
            setNewComment("");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-dark-elevated rounded-b-xl border-t border-white/5 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Comentários <span className="text-muted-foreground font-normal">({comments.length})</span>
                </h4>
                <button onClick={onClose} className="text-muted-foreground hover:text-white">
                    <X size={16} />
                </button>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                {comments.length > 0 ? (
                    <AnimatePresence>
                        {comments.map((comment, index) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex gap-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                                    <User size={14} className="text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-xs font-bold text-white">{comment.user.name}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/80 leading-relaxed">
                                        {comment.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-xs text-muted-foreground italic">Nenhum comentário por enquanto. Seja o primeiro!</p>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="flex-1 bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary-main transition-colors"
                />
                <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className={cn(
                        "p-2 rounded-lg transition-all",
                        newComment.trim() ? "bg-primary-main text-black" : "bg-white/5 text-muted-foreground cursor-not-allowed"
                    )}
                >
                    <Send size={16} />
                </button>
            </form>
        </motion.div>
    );
}

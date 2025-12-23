import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Home, Users, Trophy, Store, User as UserIcon, Plus } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { GlassCard } from "@/components/premium/GlassCard";
import { FeedCard } from "@/components/social/FeedCard";
import { LeaderboardPanel } from "@/components/social/LeaderboardPanel";
import { NeonButton } from "@/components/premium/NeonButton";
import { LevelBadge } from "@/components/premium/LevelBadge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Community() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [lbType, setLbType] = useState<"global" | "friends">("global");
    const [lbPeriod, setLbPeriod] = useState<"weekly" | "all_time">("weekly");

    // Queries
    const { data: feed = [], isLoading: feedLoading } = useQuery<any[]>({
        queryKey: ["/api/social/feed"],
    });

    const { data: leaderboard = [], isLoading: lbLoading } = useQuery<any[]>({
        queryKey: ["/api/social/leaderboard", { type: lbType, period: lbPeriod }],
    });

    const { data: stats } = useQuery<any>({
        queryKey: ["/api/user/stats"],
    });

    // Mutations
    const likeMutation = useMutation({
        mutationFn: async (postId: string) => {
            return apiRequest("POST", `/api/social/posts/${postId}/like`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
        }
    });

    const followMutation = useMutation({
        mutationFn: async (followingId: string) => {
            return apiRequest("POST", `/api/social/follow/${followingId}`);
        },
        onSuccess: (data: any) => {
            toast({
                title: data.followed ? "Seguindo!" : "Deixou de seguir",
                description: data.followed ? "Você agora verá as atualizações deste usuário." : "Você não verá mais as atualizações deste usuário.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
            queryClient.invalidateQueries({ queryKey: ["/api/social/leaderboard"] });
        }
    });

    return (
        <div className="min-h-screen bg-dark-bg text-white flex flex-col font-['Inter']">
            {/* Navigation */}
            <nav className="border-b border-white/5 sticky top-0 bg-dark-bg/80 backdrop-blur-xl z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <div className="p-2 bg-primary-main rounded-lg group-hover:shadow-[0_0_15px_rgba(0,217,255,0.5)] transition-all">
                                <Play className="w-5 h-5 text-black fill-current" />
                            </div>
                            <span className="text-xl font-black tracking-tighter">FITCOACH AI</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors">
                                <Home size={18} /> Início
                            </Link>
                            <Link href="/community" className="flex items-center gap-2 text-sm font-bold text-primary-main">
                                <Users size={18} /> Comunidade
                            </Link>
                            <Link href="/evolution" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors">
                                <Trophy size={18} /> Evolução
                            </Link>
                            <Link href="/marketplace" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors">
                                <Store size={18} /> Mercado
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {stats && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <span className="text-xs font-bold text-primary-main">{stats.streak}d</span>
                                <div className="w-px h-3 bg-white/10" />
                                <span className="text-xs font-bold text-yellow-400">{stats.xp.toLocaleString()} XP</span>
                            </div>
                        )}
                        <Link href="/account">
                            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <UserIcon className="w-6 h-6 text-muted-foreground" />
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar - User Info */}
                <div className="lg:col-span-3 space-y-6 hidden lg:block">
                    <GlassCard variant="heavy" className="text-center">
                        <div className="flex justify-center mb-4">
                            <LevelBadge level={stats?.level || 1} rank={stats?.rank || "Bronze"} size="lg" />
                        </div>
                        <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
                        <p className="text-xs text-muted-foreground mb-6">@{user?.username}</p>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Posts</p>
                                <p className="text-lg font-black">{stats?.postsCreated || 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Social</p>
                                <p className="text-lg font-black">{stats?.socialScore || 0}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard variant="medium" className="p-4">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Plus size={14} className="text-primary-main" /> Postagem rápida
                        </h4>
                        <div className="space-y-3">
                            <button
                                onClick={() => toast({ title: "Em breve", description: "O criador de posts será finalizado no próximo sprint." })}
                                className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors border border-white/5"
                            >
                                Compartilhar conquistas
                            </button>
                            <button
                                onClick={() => toast({ title: "Em breve", description: "O criador de posts será finalizado no próximo sprint." })}
                                className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors border border-white/5"
                            >
                                Postar progresso
                            </button>
                        </div>
                    </GlassCard>
                </div>

                {/* Center - Feed */}
                <div className="lg:col-span-6 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black italic tracking-tighter">FEED DA COMUNIDADE</h2>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5">
                                <Users size={18} className="text-primary-main" />
                            </button>
                        </div>
                    </div>

                    {feedLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-64 rounded-xl bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : feed.length > 0 ? (
                        feed.map((item) => (
                            <FeedCard
                                key={item.post.id}
                                post={item.post}
                                user={item.user}
                                stats={item.stats}
                                onLike={() => likeMutation.mutate(item.post.id)}
                                isLiked={false} // Would need like check from backend
                            />
                        ))
                    ) : (
                        <GlassCard className="text-center py-20">
                            <Users size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-lg font-bold mb-2">Nada por aqui ainda</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                Siga outros atletas ou poste seu primeiro treino para ver o feed ganhar vida!
                            </p>
                            <NeonButton size="sm" className="mt-8" onClick={() => setLbType("global")}>
                                Descobrir Atletas
                            </NeonButton>
                        </GlassCard>
                    )}
                </div>

                {/* Right Sidebar - Leaderboard */}
                <div className="lg:col-span-3 space-y-6">
                    <LeaderboardPanel
                        entries={leaderboard}
                        type={lbType}
                        period={lbPeriod}
                        onTypeChange={setLbType}
                        onPeriodChange={setLbPeriod}
                        isLoading={lbLoading}
                    />

                    <GlassCard variant="light" className="p-4 bg-gradient-to-br from-primary-main/10 to-transparent border-primary-main/20">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Trophy size={14} className="text-primary-main" /> Desafio Semanal
                        </h4>
                        <p className="text-[10px] text-white/60 mb-3 leading-relaxed">
                            Os top 3 desta semana ganharão **2x XP** e badge exclusivo de **Elite Atleta**.
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-primary-main">Faltam 3 dias</span>
                            <span className="text-muted-foreground">Termina em 25/12</span>
                        </div>
                    </GlassCard>
                </div>

            </main>

            {/* Mobile Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-dark-bg/90 backdrop-blur-xl border-t border-white/5 z-50">
                <div className="flex items-center justify-around">
                    <Link href="/dashboard" className="p-2 text-muted-foreground">
                        <Home size={24} />
                    </Link>
                    <Link href="/community" className="p-2 text-primary-main">
                        <Users size={24} />
                    </Link>
                    <Link href="/evolution" className="p-2 text-muted-foreground">
                        <Trophy size={24} />
                    </Link>
                    <Link href="/marketplace" className="p-2 text-muted-foreground">
                        <Store size={24} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

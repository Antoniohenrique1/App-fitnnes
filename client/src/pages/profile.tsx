import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { BadgeGrid } from "@/components/BadgeGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import {
    User as UserIcon,
    MapPin,
    Calendar,
    Edit2,
    Settings,
    TrendingUp,
    Trophy,
    MessageSquare,
    Users,
    Camera,
    Check
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Profile() {
    const { user: authUser } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [editedBio, setEditedBio] = useState("");

    const { data: profileData, isLoading } = useQuery<any>({
        queryKey: ["/api/users", authUser?.id, "profile"],
        enabled: !!authUser,
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data: { bio: string; avatarUrl?: string }) => {
            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Perfil atualizado!" });
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ["/api/users", authUser?.id, "profile"] });
        }
    });

    if (isLoading) return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-primary-main">Carregando Arsenal...</div>;

    const { user, stats, followersCount, followingCount, posts, badges } = profileData;

    const startEditing = () => {
        setEditedBio(user.bio || "");
        setIsEditing(true);
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white pb-24">
            <Navbar />

            {/* Hero Header */}
            <div className="relative h-64 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-main/20 via-primary-main/5 to-dark-bg" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
            </div>

            <main className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Sidebar: Profile Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={isEditing ? () => updateProfileMutation.mutate({ bio: editedBio }) : startEditing}
                                    className="rounded-xl border border-white/10 hover:bg-white/10"
                                >
                                    {isEditing ? <Check className="text-primary-main" /> : <Edit2 size={18} />}
                                </Button>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary-main to-purple-600 p-1">
                                        <div className="w-full h-full rounded-[20px] bg-dark-bg flex items-center justify-center overflow-hidden">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-12 h-12 text-primary-main" />
                                            )}
                                        </div>
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-primary-main text-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={14} />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">{user.name}</h2>
                                    <p className="text-primary-main font-bold text-sm tracking-widest uppercase">@ {user.username}</p>
                                </div>

                                {isEditing ? (
                                    <Textarea
                                        value={editedBio}
                                        onChange={(e) => setEditedBio(e.target.value)}
                                        placeholder="Conte sua história de treino..."
                                        className="bg-white/5 border-white/10 focus:border-primary-main rounded-xl text-center resize-none text-sm min-h-[100px]"
                                    />
                                ) : (
                                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                                        {user.bio || "Este atleta ainda não escreveu sua lenda."}
                                    </p>
                                )}

                                <div className="flex items-center gap-6 pt-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-black italic text-white">{followersCount}</div>
                                        <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Seguidores</div>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="text-center">
                                        <div className="text-2xl font-black italic text-white">{followingCount}</div>
                                        <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Seguindo</div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-white/5 border-white/10 rounded-[2rem] p-6 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Informações</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin size={16} className="text-primary-main" />
                                    <span>Base de Operações: Academia Central</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar size={16} className="text-primary-main" />
                                    <span>Membro desde: {format(new Date(user.createdAt), "MMMM yyyy", { locale: ptBR })}</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content: Stats and Achievements */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Level", value: stats.level, icon: TrendingUp, color: "text-primary-main" },
                                { label: "Streak", value: `${stats.streak}D`, icon: Zap, color: "text-orange-500" },
                                { label: "Coins", value: stats.coins, icon: Trophy, color: "text-yellow-500" },
                                { label: "Total XP", value: stats.totalXpEarned, icon: Sparkles, color: "text-purple-500" },
                            ].map((stat, i) => (
                                <Card key={i} className="bg-white/5 border-white/10 p-6 rounded-[2rem] flex flex-col items-center justify-center space-y-1">
                                    <stat.icon size={20} className={stat.color} />
                                    <div className="text-2xl font-black italic">{stat.value}</div>
                                    <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{stat.label}</div>
                                </Card>
                            ))}
                        </div>

                        {/* Showcase Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black italic uppercase italic tracking-tight">Vitrine de Conquistas</h3>
                                <Button variant="link" className="text-primary-main text-xs uppercase font-black tracking-widest">Ver Todas</Button>
                            </div>
                            <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8">
                                <BadgeGrid userBadges={badges} />
                            </Card>
                        </div>

                        {/* Social Activity Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black italic uppercase italic tracking-tight">Atividades Recentes</h3>
                                <MessageSquare size={20} className="text-muted-foreground" />
                            </div>

                            <div className="space-y-4">
                                {posts && posts.length > 0 ? (
                                    posts.map((post: any) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <Card className="bg-white/5 border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all border-l-4 border-l-primary-main">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black uppercase text-primary-main tracking-widest bg-primary-main/10 px-2 py-0.5 rounded">
                                                            {post.type}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                                            {format(new Date(post.createdAt), "dd MMM HH:mm", { locale: ptBR })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium leading-relaxed">
                                                        {post.content}
                                                    </p>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground italic">
                                        Nenhuma atividade registrada ainda. Hora de treinar!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

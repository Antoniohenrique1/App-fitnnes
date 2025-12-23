import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    Store,
    Zap,
    Snowflake,
    Crown,
    Sparkles,
    UserCircle,
    ArrowRight,
    ShoppingBag,
    Info
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
    Snowflake,
    Zap,
    Crown,
    UserCircle,
    Sparkles
};

const RARITY_COLORS: Record<string, string> = {
    common: "text-slate-400 border-slate-500/20 bg-slate-500/5",
    uncommon: "text-green-400 border-green-500/20 bg-green-500/5",
    rare: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    epic: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    legendary: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.2)]",
};

export default function Shop() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<string>("all");

    const { data: stats } = useQuery<any>({
        queryKey: ["/api", "user", "stats"],
    });

    const { data: items, isLoading } = useQuery<any[]>({
        queryKey: ["/api/shop/items"],
    });

    const purchaseMutation = useMutation({
        mutationFn: async ({ itemId, currency }: { itemId: string; currency: 'coins' | 'gems' }) => {
            const res = await fetch("/api/shop/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId, currency }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Falha na compra");
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Sucesso!",
                description: data.message,
            });
            queryClient.invalidateQueries({ queryKey: ["/api", "user", "stats"] });
            queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
        },
        onError: (error: any) => {
            toast({
                title: "Erro na Compra",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const filteredItems = items?.filter(item => filter === "all" || item.type === filter);

    const categories = [
        { id: "all", label: "Todos", icon: ShoppingBag },
        { id: "streak_freeze", label: "Vantagens", icon: Snowflake },
        { id: "booster", label: "Boosters", icon: Zap },
        { id: "skin", label: "Cosméticos", icon: Sparkles },
        { id: "title", label: "Títulos", icon: Crown },
    ];

    return (
        <div className="min-h-screen bg-dark-bg text-white pb-24">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-primary-main mb-2">
                            <Store className="w-6 h-6" />
                            <span className="text-sm font-black uppercase tracking-widest">The Armory</span>
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase">
                            Mercado de <span className="text-primary-main">Elite</span>
                        </h1>
                        <p className="text-muted-foreground max-w-lg">
                            Equipe-se com os melhores recursos para acelerar sua evolução. Use suas Agreste Coins ganhas com suor.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                            <span className="text-[10px] uppercase font-black text-muted-foreground block mb-1">Seu Saldo</span>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-black text-black shadow-[0_0_10px_rgba(234,179,8,0.4)]">$</div>
                                    <span className="text-xl font-black">{stats?.coins || 0}</span>
                                </div>
                                <div className="w-px h-6 bg-white/10" />
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary-main" />
                                    <span className="text-xl font-black">{stats?.gems || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap items-center gap-2 mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={cn(
                                "px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border",
                                filter === cat.id
                                    ? "bg-primary-main text-black border-primary-main shadow-[0_0_20px_rgba(0,217,255,0.3)]"
                                    : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <cat.icon size={18} />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
                            ))
                        ) : filteredItems?.map((item) => {
                            const Icon = ICON_MAP[item.icon] || Info;
                            const isAffordable = stats && stats.coins >= item.priceCoins && stats.gems >= item.priceGems;

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="group relative h-full bg-white/5 border-white/10 overflow-hidden hover:border-primary-main/50 transition-all duration-300">
                                        {/* Rarity Header */}
                                        <div className={cn(
                                            "absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase rounded-bl-xl border-b border-l",
                                            RARITY_COLORS[item.rarity]
                                        )}>
                                            {item.rarity}
                                        </div>

                                        <div className="p-6 space-y-4">
                                            {/* Icon */}
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Icon className={cn("w-8 h-8", RARITY_COLORS[item.rarity].split(' ')[0])} />
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black italic uppercase tracking-tight group-hover:text-primary-main transition-colors">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>

                                            <div className="pt-4 flex items-center justify-between border-t border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-black text-muted-foreground mb-1">Preço</span>
                                                    <div className="flex items-center gap-1.5">
                                                        {item.priceCoins > 0 ? (
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] font-black text-black">$</div>
                                                                <span className="font-black text-white">{item.priceCoins}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1">
                                                                <Sparkles className="w-3.5 h-3.5 text-primary-main" />
                                                                <span className="font-black text-white">{item.priceGems}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => purchaseMutation.mutate({ itemId: item.id, currency: item.priceCoins > 0 ? 'coins' : 'gems' })}
                                                    disabled={!isAffordable || purchaseMutation.isPending}
                                                    className={cn(
                                                        "rounded-xl px-4 py-2 font-black italic uppercase text-xs transition-all",
                                                        isAffordable
                                                            ? "bg-primary-main text-black hover:scale-105 active:scale-95"
                                                            : "bg-white/10 text-white/30 cursor-not-allowed"
                                                    )}
                                                >
                                                    {purchaseMutation.isPending ? "Processando..." : "Comprar"}
                                                    {!purchaseMutation.isPending && <ArrowRight className="w-3 h-3 ml-2" />}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Background Shine */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Custom Order Section */}
                <div className="mt-24 p-8 rounded-[2rem] bg-gradient-to-br from-primary-main/20 via-transparent to-transparent border border-primary-main/20 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-black italic uppercase mb-2">Quer algo <span className="text-primary-main">Personalizado?</span></h2>
                            <p className="text-muted-foreground">
                                Títulos exclusivos, insígnias de clã ou boosters customizados estão disponíveis apenas para atletas de Rank Diamante ou superior.
                            </p>
                        </div>
                        <Button className="bg-white text-black font-black uppercase italic rounded-2xl px-10 py-8 text-lg hover:bg-primary-main transition-all group">
                            Consultar Oráculo
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-main/10 rounded-full blur-[100px]" />
                </div>
            </main>
        </div>
    );
}

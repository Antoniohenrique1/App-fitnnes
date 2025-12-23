import { Link, useLocation } from "wouter";
import { Play, Home, Users, Trophy, Store, User as UserIcon, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export function Navbar() {
    const [location] = useLocation();
    const { user } = useAuth();

    const { data: stats } = useQuery<any>({
        queryKey: ["/api", "user", "stats"],
        enabled: !!user,
    });

    const navItems = [
        { href: "/dashboard", label: "Início", icon: Home },
        { href: "/community", label: "Comunidade", icon: Users },
        { href: "/evolution", label: "Evolução", icon: Trophy },
        { href: "/shop", label: "Armaria", icon: Store },
    ];

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-dark-bg/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <div className="p-2 bg-primary-main rounded-xl group-hover:shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-all duration-300">
                                <Zap className="w-5 h-5 text-black fill-current" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter italic uppercase text-white">
                                FITCOACH<span className="text-primary-main">.AI</span>
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <button
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2",
                                            location === item.href
                                                ? "text-primary-main bg-primary-main/10"
                                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {stats && (
                            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 ring-1 ring-white/5 shadow-inner">
                                <div className="flex items-center gap-1.5 group cursor-help transition-all">
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-t from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.4)] flex items-center justify-center text-[10px] font-black text-black">
                                        $
                                    </div>
                                    <span className="text-xs font-black text-white group-hover:text-yellow-400 transition-colors uppercase tracking-tight">{stats.coins}</span>
                                </div>
                                <div className="w-px h-3 bg-white/10" />
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-black text-orange-500 uppercase tracking-tight">{stats.streak}D</span>
                                </div>
                                <div className="w-px h-3 bg-white/10" />
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-black text-primary-main uppercase tracking-tight">{stats.level} LVL</span>
                                </div>
                            </div>
                        )}

                        <Link href="/profile">
                            <button className={cn(
                                "w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all",
                                location === "/profile" && "border-primary-main ring-1 ring-primary-main/20 shadow-[0_0_15px_rgba(0,217,255,0.2)]"
                            )}>
                                <UserIcon size={20} className={cn(location === "/profile" ? "text-primary-main" : "text-white")} />
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mobile Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-dark-bg/90 backdrop-blur-xl border-t border-white/5 z-50">
                <div className="flex items-center justify-around">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <button
                                className={cn(
                                    "p-2 rounded-xl transition-all duration-200",
                                    location === item.href
                                        ? "text-primary-main bg-primary-main/10"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon size={24} />
                            </button>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}

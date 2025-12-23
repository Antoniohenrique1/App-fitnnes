import { motion } from "framer-motion";
import { Shield, Target, Beaker, Zap } from "lucide-react";
import { GlassCard } from "@/components/premium/GlassCard";
import { colors } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export type PersonaType = "sergeant" | "mentor" | "scientist" | "zen";

interface Persona {
    id: PersonaType;
    name: string;
    tagline: string;
    description: string;
    icon: any;
    color: string;
    traits: string[];
}

export const PERSONAS: Persona[] = [
    {
        id: "sergeant",
        name: "O SARGENTO",
        tagline: "Disciplina acima de tudo.",
        description: "Direto, rigoroso e inspirador pelo exemplo. Não aceita desculpas, apenas resultados.",
        icon: Shield,
        color: colors.error.main,
        traits: ["Rigoroso", "Disciplinado", "Energético"],
    },
    {
        id: "mentor",
        name: "O MENTOR",
        tagline: "Sua jornada é minha missão.",
        description: "Empático, equilibrado e encorajador. Foca na evolução constante e saúde mental.",
        icon: Target,
        color: colors.primary.main,
        traits: ["Empático", "Sábio", "Consistente"],
    },
    {
        id: "scientist",
        name: "O CIENTISTA",
        tagline: "Dados vencem dúvidas.",
        description: "Focado em bio-otimização, métricas e eficiência máxima. Cada repetição é um dado.",
        icon: Beaker,
        color: colors.secondary.main,
        traits: ["Analítico", "Preciso", "Otimizador"],
    },
    {
        id: "zen",
        name: "O ZEN",
        tagline: "Conecte corpo e mente.",
        description: "Harmonia, controle e consciência corporal. O treino como forma de meditação.",
        icon: Zap,
        color: colors.success.main,
        traits: ["Calmo", "Consciente", "Fluido"],
    }
];

interface PersonaCardProps {
    persona: Persona;
    selected: boolean;
    onSelect: (id: PersonaType) => void;
}

export function PersonaCard({ persona, selected, onSelect }: PersonaCardProps) {
    const Icon = persona.icon;

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer h-full"
            onClick={() => onSelect(persona.id)}
        >
            <GlassCard
                variant={selected ? "heavy" : "medium"}
                className={cn(
                    "h-full flex flex-col p-6 transition-all duration-500 border-2",
                    selected ? "border-primary-main shadow-[0_0_30px_rgba(0,217,255,0.2)]" : "border-transparent opacity-80 hover:opacity-100"
                )}
                glow={selected}
            >
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${persona.color}22`, border: `1px solid ${persona.color}44` }}
                >
                    <Icon size={32} style={{ color: persona.color }} />
                </div>

                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1">{persona.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: persona.color }}>
                    {persona.tagline}
                </p>

                <p className="text-xs text-muted-foreground leading-relaxed mb-6 flex-1">
                    {persona.description}
                </p>

                <div className="flex flex-wrap gap-2">
                    {persona.traits.map(trait => (
                        <span
                            key={trait}
                            className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-bold uppercase tracking-wider border border-white/5"
                        >
                            {trait}
                        </span>
                    ))}
                </div>

                {selected && (
                    <motion.div
                        layoutId="selection-glow"
                        className="absolute -inset-0.5 rounded-3xl bg-primary-main/20 blur-md -z-10"
                    />
                )}
            </GlassCard>
        </motion.div>
    );
}

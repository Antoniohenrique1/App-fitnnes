import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import confetti from 'canvas-confetti';
import { useToast } from '@/hooks/use-toast';

export function useGamification() {
    const { events } = useGameStore();
    const processedEvents = useRef<Set<string>>(new Set());
    const { toast } = useToast();

    useEffect(() => {
        if (!events || events.length === 0) return;

        // Process only new events
        const newEvents = events.filter(e => !processedEvents.current.has(e.id));

        newEvents.forEach(event => {
            processedEvents.current.add(event.id);

            // Trigger visual feedback based on type
            if (event.type === 'WORKOUT_COMPLETE') {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#00ff00', '#ffffff', '#000000']
                });
                toast({
                    title: "Workout Finalizado! 💪",
                    description: `Você ganhou ${event.xpEarned} XP!`,
                    variant: "default",
                });
            }

            if (event.type === 'LEVEL_UP') {
                confetti({
                    particleCount: 200,
                    spread: 160,
                    origin: { y: 0.3 },
                    colors: ['#ffd700', '#ffffff']
                });
                toast({
                    title: "LEVEL UP! 🚀",
                    description: "Seu nível aumentou! Confira suas novas recompensas.",
                    variant: "default",
                });
            }

            if (event.type === 'PERSONAL_RECORD') {
                toast({
                    title: "NOVO RECORDE! 🔥",
                    description: "Você superou seus limites! XP Extra creditado.",
                });
            }
        });
    }, [events, toast]);
}

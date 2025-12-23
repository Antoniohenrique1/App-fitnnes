import { create } from 'zustand';
import { type GamificationEvent } from '../../../shared/schema.js';

interface GameState {
    events: GamificationEvent[];
    recentEvents: GamificationEvent[];
    totalXP: number;
    addEvent: (event: GamificationEvent) => void;
    setEvents: (events: GamificationEvent[]) => void;
    fetchEvents: () => Promise<void>;
}

export const useGameStore = create<GameState>((set) => ({
    events: [],
    recentEvents: [],
    totalXP: 0,

    addEvent: (event) => set((state) => {
        const newEvents = [event, ...state.events];
        return {
            events: newEvents,
            recentEvents: [event, ...state.recentEvents].slice(0, 5),
            totalXP: state.totalXP + (event.xpEarned || 0)
        };
    }),

    setEvents: (events) => set({ events }),

    fetchEvents: async () => {
        try {
            const res = await fetch('/api/gamification/events?limit=50');
            if (res.ok) {
                const data = await res.json();
                set({ events: data });
            }
        } catch (error) {
            console.error("Failed to fetch gamification events:", error);
        }
    }
}));

import { create } from 'zustand';
import { type WorkoutSession, type InsertWorkoutSession } from '../../../shared/schema.js';

interface WorkoutState {
    activeSession: WorkoutSession | null;
    isPaused: boolean;
    elapsedSeconds: number;

    startSession: (session: WorkoutSession) => void;
    pauseSession: () => void;
    resumeSession: () => void;
    endSession: () => void;
    tick: () => void; // Call every second
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
    activeSession: null,
    isPaused: false,
    elapsedSeconds: 0,

    startSession: (session) => set({ activeSession: session, isPaused: false, elapsedSeconds: 0 }),
    pauseSession: () => set({ isPaused: true }),
    resumeSession: () => set({ isPaused: false }),
    endSession: () => set({ activeSession: null, isPaused: false, elapsedSeconds: 0 }),

    tick: () => set((state) => {
        if (state.activeSession && !state.isPaused) {
            return { elapsedSeconds: state.elapsedSeconds + 1 };
        }
        return {};
    }),
}));

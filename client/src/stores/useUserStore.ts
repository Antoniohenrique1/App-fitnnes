import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type UserSettings } from '../../../shared/schema.js';

interface UserState {
    settings: Partial<UserSettings>;
    setSettings: (settings: Partial<UserSettings>) => void;
    updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
    fetchSettings: () => Promise<void>;
    saveSettings: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            settings: {
                theme: 'system',
                audioEnabled: true,
                hapticsEnabled: true,
                privacyMode: 'public',
                notifications: { push: true, email: false },
            },
            setSettings: (newSettings) =>
                set((state) => ({ settings: { ...state.settings, ...newSettings } })),

            updateSetting: (key, value) => {
                set((state) => ({ settings: { ...state.settings, [key]: value } }));
                // Debounce save?
            },

            fetchSettings: async () => {
                try {
                    const res = await fetch('/api/settings');
                    if (res.ok) {
                        const data = await res.json();
                        if (Object.keys(data).length > 0) {
                            set({ settings: data });
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch settings:", error);
                }
            },

            saveSettings: async () => {
                const { settings } = get();
                try {
                    await fetch('/api/settings', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(settings),
                    });
                } catch (error) {
                    console.error("Failed to save settings:", error);
                }
            }
        }),
        {
            name: 'user-storage',
        }
    )
);

import { useGamification } from '@/hooks/use-gamification.js';

export default function GamificationLayer() {
    useGamification();
    return null; // This component doesn't render anything, it just runs the hook
}

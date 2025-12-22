import { db } from "./db.js";
import { eq, and, gte, lte } from "drizzle-orm";
import { challenges, userChallenges } from "../shared/schema.js";

// Challenge templates for daily challenges
const DAILY_CHALLENGE_TEMPLATES = [
    {
        title: "🔥 Beast Mode",
        description: "Complete um treino com intensidade máxima",
        icon: "💪",
        difficulty: "medium",
        rarity: "common",
        xpReward: 150,
        coinsReward: 50,
        requirements: { type: "workouts", count: 1, intensity: "high" },
    },
    {
        title: "⚡ Speed Demon",
        description: "Finalize seu treino em menos de 45 minutos",
        icon: "⚡",
        difficulty: "medium",
        rarity: "uncommon",
        xpReward: 200,
        coinsReward: 75,
        requirements: { type: "workouts", count: 1, maxDuration: 45 },
    },
    {
        title: "💎 Perfect Form",
        description: "Execute todos os exercícios com técnica perfeita (100% completo)",
        icon: "💎",
        difficulty: "hard",
        rarity: "rare",
        xpReward: 300,
        coinsReward: 100,
        requirements: { type: "perfect_workout", count: 1 },
    },
    {
        title: "🏋️ Iron Will",
        description: "Complete 3 treinos hoje",
        icon: "🏋️",
        difficulty: "hard",
        rarity: "rare",
        xpReward: 400,
        coinsReward: 150,
        requirements: { type: "workouts", count: 3 },
    },
    {
        title: "🎯 Consistency King",
        description: "Mantenha sua streak de 7 dias",
        icon: "🎯",
        difficulty: "medium",
        rarity: "uncommon",
        xpReward: 250,
        coinsReward: 80,
        requirements: { type: "streak", value: 7 },
    },
    {
        title: "💪 PR Hunter",
        description: "Bata um recorde pessoal em qualquer exercício",
        icon: "🏆",
        difficulty: "hard",
        rarity: "rare",
        xpReward: 350,
        coinsReward: 120,
        requirements: { type: "personal_record", count: 1 },
    },
    {
        title: "🤝 Community Hero",
        description: "Ajude 3 outros usuários hoje",
        icon: "🤝",
        difficulty: "medium",
        rarity: "uncommon",
        xpReward: 180,
        coinsReward: 60,
        requirements: { type: "help_users", count: 3 },
    },
];

/**
 * Generate daily challenges for a user
 * Returns 3 random challenges per day
 */
export async function generateDailyChallenges(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if user already has challenges for today
    const existingChallenges = await db
        .select()
        .from(userChallenges)
        .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
        .where(
            and(
                eq(userChallenges.userId, userId),
                gte(challenges.startDate, today),
                lte(challenges.startDate, tomorrow)
            )
        );

    if (existingChallenges.length >= 3) {
        return existingChallenges.map((ec) => ec.challenges);
    }

    // Generate 3 random challenges
    const shuffled = [...DAILY_CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
    const selectedTemplates = shuffled.slice(0, 3);

    const newChallenges = [];

    for (const template of selectedTemplates) {
        // Create challenge
        const [challenge] = await db
            .insert(challenges)
            .values({
                type: "daily",
                title: template.title,
                description: template.description,
                icon: template.icon,
                difficulty: template.difficulty,
                rarity: template.rarity,
                xpReward: template.xpReward,
                coinsReward: template.coinsReward,
                startDate: today,
                endDate: tomorrow,
                requirements: template.requirements,
            })
            .returning();

        // Assign to user
        await db.insert(userChallenges).values({
            userId,
            challengeId: challenge.id,
            status: "active",
            progress: 0,
        });

        newChallenges.push(challenge);
    }

    return newChallenges;
}

/**
 * Get active challenges for a user
 */
export async function getUserChallenges(userId: string) {
    const activeChallenges = await db
        .select({
            challenge: challenges,
            userChallenge: userChallenges,
        })
        .from(userChallenges)
        .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
        .where(
            and(
                eq(userChallenges.userId, userId),
                eq(userChallenges.status, "active"),
                gte(challenges.endDate, new Date())
            )
        );

    return activeChallenges;
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(
    userId: string,
    action: string,
    metadata?: any
) {
    const activeChallenges = await getUserChallenges(userId);

    const updated = [];

    for (const { challenge, userChallenge } of activeChallenges) {
        const requirements = challenge.requirements as any;
        let newProgress = userChallenge.progress;
        let completed = false;

        // Check if action matches challenge requirement
        if (requirements.type === action) {
            newProgress += 1;

            if (requirements.count && newProgress >= requirements.count) {
                completed = true;
            } else if (requirements.value && newProgress >= requirements.value) {
                completed = true;
            }

            // Update progress
            await db
                .update(userChallenges)
                .set({
                    progress: newProgress,
                    status: completed ? "completed" : "active",
                    completedAt: completed ? new Date() : undefined,
                })
                .where(eq(userChallenges.id, userChallenge.id));

            if (completed) {
                updated.push({ challenge, completed: true });
            }
        }
    }

    return updated;
}

/**
 * Claim challenge rewards
 */
export async function claimChallengeRewards(userId: string, challengeId: string) {
    const [userChallenge] = await db
        .select()
        .from(userChallenges)
        .where(
            and(
                eq(userChallenges.userId, userId),
                eq(userChallenges.challengeId, challengeId),
                eq(userChallenges.status, "completed")
            )
        )
        .limit(1);

    if (!userChallenge) {
        throw new Error("Challenge not completed or already claimed");
    }

    // Mark as claimed
    await db
        .update(userChallenges)
        .set({ status: "claimed" })
        .where(eq(userChallenges.id, userChallenge.id));

    // Get challenge details for rewards
    const [challenge] = await db
        .select()
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

    return {
        xpReward: challenge.xpReward,
        coinsReward: challenge.coinsReward,
    };
}

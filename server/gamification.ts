import { db } from "./db.js";
import { eq } from "drizzle-orm";
import { userStats, userAchievements, achievements } from "../shared/schema.js";

// XP Actions and their base values
export const XP_ACTIONS = {
    WORKOUT_COMPLETE: 100,
    WORKOUT_PERFECT: 200, // 100% completion
    EXERCISE_SET_COMPLETE: 5,
    PERSONAL_RECORD: 150,
    DAILY_LOGIN: 10,
    STREAK_INCREMENT: 50,
    CHALLENGE_COMPLETE: 300,
    CHALLENGE_HARD: 500,
    CHALLENGE_EXTREME: 1000,
    ACHIEVEMENT_UNLOCK: 0, // Defined by achievement
    HELP_USER: 25,
    POST_CREATED: 15,
    POST_LIKED: 2,
} as const;

// Level thresholds (XP needed for each level)
export const LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    850,    // Level 5
    1300,   // Level 6
    1900,   // Level 7
    2600,   // Level 8
    3400,   // Level 9
    4300,   // Level 10
    5400,   // Level 11
    6700,   // Level 12
    8200,   // Level 13
    10000,  // Level 14
    12100,  // Level 15
    14500,  // Level 16
    17200,  // Level 17
    20300,  // Level 18
    23800,  // Level 19
    27800,  // Level 20
    // Continues exponentially...
];

// Rank thresholds (level needed for each rank)
export const RANK_THRESHOLDS = {
    Bronze: 1,
    Silver: 10,
    Gold: 25,
    Platinum: 50,
    Diamond: 75,
    Master: 100,
    Legend: 150,
} as const;

export type Rank = keyof typeof RANK_THRESHOLDS;

/**
 * Calculate XP needed for a specific level
 */
export function getXpForLevel(level: number): number {
    if (level <= LEVEL_THRESHOLDS.length) {
        return LEVEL_THRESHOLDS[level - 1];
    }
    // Exponential formula for higher levels
    const baseXp = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const extraLevels = level - LEVEL_THRESHOLDS.length;
    return Math.floor(baseXp * Math.pow(1.15, extraLevels));
}

/**
 * Calculate level from total XP
 */
export function getLevelFromXp(xp: number): number {
    let level = 1;
    while (getXpForLevel(level + 1) <= xp) {
        level++;
    }
    return level;
}

/**
 * Get rank based on level
 */
export function getRankFromLevel(level: number): Rank {
    if (level >= RANK_THRESHOLDS.Legend) return 'Legend';
    if (level >= RANK_THRESHOLDS.Master) return 'Master';
    if (level >= RANK_THRESHOLDS.Diamond) return 'Diamond';
    if (level >= RANK_THRESHOLDS.Platinum) return 'Platinum';
    if (level >= RANK_THRESHOLDS.Gold) return 'Gold';
    if (level >= RANK_THRESHOLDS.Silver) return 'Silver';
    return 'Bronze';
}

/**
 * Award XP to a user
 * Returns: { leveledUp: boolean, newLevel: number, newRank: Rank, xpGained: number }
 */
export async function awardXp(
    userId: string,
    action: keyof typeof XP_ACTIONS,
    multiplier: number = 1.0
) {
    const xpGained = Math.floor(XP_ACTIONS[action] * multiplier);

    // Get current stats
    const [stats] = await db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1);

    if (!stats) {
        throw new Error("User stats not found");
    }

    const newXp = stats.xp + xpGained;
    const newTotalXp = stats.totalXpEarned + xpGained;
    const oldLevel = stats.level;
    const newLevel = getLevelFromXp(newXp);
    const leveledUp = newLevel > oldLevel;

    const oldRank = stats.rank as Rank;
    const newRank = getRankFromLevel(newLevel);
    const rankedUp = newRank !== oldRank;

    // Update stats
    await db
        .update(userStats)
        .set({
            xp: newXp,
            totalXpEarned: newTotalXp,
            level: newLevel,
            rank: newRank,
            weeklyXP: stats.weeklyXP + xpGained,
            updatedAt: new Date(),
        })
        .where(eq(userStats.userId, userId));

    return {
        leveledUp,
        rankedUp,
        oldLevel,
        newLevel,
        oldRank,
        newRank,
        xpGained,
        totalXp: newTotalXp,
    };
}

/**
 * Check and unlock achievements for a user
 */
export async function checkAchievements(userId: string) {
    const stats = await db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1);

    if (!stats.length) return [];

    const userStat = stats[0];

    // Get all achievements
    const allAchievements = await db.select().from(achievements);

    // Get user's unlocked achievements
    const unlockedAchievements = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

    const unlockedIds = new Set(unlockedAchievements.map((a) => a.achievementId));

    const newlyUnlocked = [];

    // Check each achievement
    for (const achievement of allAchievements) {
        if (unlockedIds.has(achievement.id)) continue;

        const requirement = achievement.requirement as any;
        let unlocked = false;

        // Check based on requirement type
        switch (requirement.type) {
            case "level":
                unlocked = userStat.level >= requirement.value;
                break;
            case "streak":
                unlocked = userStat.streak >= requirement.value;
                break;
            case "workouts":
                unlocked = userStat.totalWorkouts >= requirement.value;
                break;
            case "perfect_workouts":
                unlocked = userStat.perfectWorkouts >= requirement.value;
                break;
            case "challenges":
                unlocked = userStat.challengesCompleted >= requirement.value;
                break;
            case "social_score":
                unlocked = userStat.socialScore >= requirement.value;
                break;
        }

        if (unlocked) {
            // Unlock achievement
            await db.insert(userAchievements).values({
                userId,
                achievementId: achievement.id,
                progress: 100,
            });

            // Award XP bonus
            if (achievement.xpReward > 0) {
                await awardXp(userId, "ACHIEVEMENT_UNLOCK");
                await db
                    .update(userStats)
                    .set({
                        xp: userStat.xp + achievement.xpReward,
                        totalXpEarned: userStat.totalXpEarned + achievement.xpReward,
                    })
                    .where(eq(userStats.userId, userId));
            }

            // Increment achievement counter
            await db
                .update(userStats)
                .set({
                    achievementsUnlocked: userStat.achievementsUnlocked + 1,
                })
                .where(eq(userStats.userId, userId));

            newlyUnlocked.push(achievement);
        }
    }

    return newlyUnlocked;
}

/**
 * Get progress towards next level
 */
export async function getLevelProgress(userId: string) {
    const [stats] = await db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1);

    if (!stats) {
        throw new Error("User stats not found");
    }

    const currentLevelXp = getXpForLevel(stats.level);
    const nextLevelXp = getXpForLevel(stats.level + 1);
    const xpInCurrentLevel = stats.xp - currentLevelXp;
    const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
    const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

    return {
        currentLevel: stats.level,
        currentRank: stats.rank,
        currentXp: stats.xp,
        xpInCurrentLevel,
        xpNeededForNextLevel,
        nextLevelXp,
        progress: Math.min(100, Math.max(0, progress)),
    };
}

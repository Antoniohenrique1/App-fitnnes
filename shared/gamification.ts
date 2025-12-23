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
];

/**
 * Calculate XP needed for a specific level
 */
export function getXpForLevel(level: number): number {
    if (level <= LEVEL_THRESHOLDS.length) {
        return LEVEL_THRESHOLDS[level - 1];
    }
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
 * Get progress details for a given XP amount
 */
export function getLevelProgress(xp: number) {
    const level = getLevelFromXp(xp);
    const currentLevelXp = getXpForLevel(level);
    const nextLevelXp = getXpForLevel(level + 1);
    const xpInCurrentLevel = xp - currentLevelXp;
    const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
    const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

    return {
        level,
        currentLevelXp,
        nextLevelXp,
        xpInCurrentLevel,
        xpNeededForNextLevel,
        progress: Math.min(100, Math.max(0, progress)),
    };
}

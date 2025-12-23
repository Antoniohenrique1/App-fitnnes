import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, real, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Profiles table (formerly users, extended for Supabase Auth style)
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`), // In production, this links to auth.users.id
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Legacy/Local auth. In Supabase, this is handled by Auth.
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  age: integer("age"),
  sex: text("sex"),
  height: integer("height"),
  weight: real("weight"),
  experience: text("experience"),
  goal: text("goal"),
  daysPerWeek: integer("days_per_week"),
  sessionMinutes: integer("session_minutes"),
  location: text("location"),
  equipment: text("equipment").array(),
  injuries: text("injuries"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  persona: text("persona").default("mentor").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  currentPlan: text("current_plan").default("free").notNull(), // free, pro, legend
});

// Alias for backward compatibility during refactor
export const users = profiles;

// User Settings (Granular preferences)
export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  theme: text("theme").default("system").notNull(),
  audioEnabled: boolean("audio_enabled").default(true).notNull(),
  hapticsEnabled: boolean("haptics_enabled").default(true).notNull(),
  privacyMode: text("privacy_mode").default("public").notNull(), // public, friends, private
  notifications: jsonb("notifications").default({ push: true, email: false }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workout Sessions (Detailed tracking)
export const workoutSessions = pgTable("workout_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  workoutId: varchar("workout_id"), // Can be null if free workout
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  status: text("status").default("in_progress").notNull(), // in_progress, completed, abandoned
  caloriesBurned: integer("calories_burned"),
  accuracyScore: integer("accuracy_score"), // From AI
  feedback: text("feedback"), // AI Feedback
  rawStats: jsonb("raw_stats"), // Detailed logs
});

// Gamification Events (Event Sourcing)
export const gamificationEvents = pgTable("gamification_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // workout_complete, level_up, badge_earned, streak_milestone
  xpEarned: integer("xp_earned").default(0).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User stats (XP, level, streaks, gamification)
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),

  // XP and Leveling
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  totalXpEarned: integer("total_xp_earned").default(0).notNull(),

  // Rank System (Bronze, Silver, Gold, Platinum, Diamond, Master, Legend)
  rank: text("rank").default("Bronze").notNull(),
  prestigeLevel: integer("prestige_level").default(0).notNull(),

  // Economy
  coins: integer("coins").default(0).notNull(),
  gems: integer("gems").default(0).notNull(),

  // Streaks
  streak: integer("streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  streakFreezes: integer("streak_freezes").default(1).notNull(),
  lastWorkoutDate: date("last_workout_date"),

  // Workout Stats
  totalWorkouts: integer("total_workouts").default(0).notNull(),
  perfectWorkouts: integer("perfect_workouts").default(0).notNull(), // 100% completed
  personalRecordsBroken: integer("prs_broken").default(0).notNull(),

  // Challenges & Achievements  
  challengesCompleted: integer("challenges_completed").default(0).notNull(),
  achievementsUnlocked: integer("achievements_unlocked").default(0).notNull(),

  // Social & Community
  socialScore: integer("social_score").default(0).notNull(),
  helpedUsers: integer("helped_users").default(0).notNull(),
  postsCreated: integer("posts_created").default(0).notNull(),

  // Legacy fields (keeping for compatibility)
  leagueTier: text("league_tier").default("Bronze").notNull(),
  weeklyXP: integer("weekly_xp").default(0).notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workout plans (generated by AI)
export const workoutPlans = pgTable("workout_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  weekCount: integer("week_count").default(4).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Individual workouts within a plan
export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").notNull().references(() => workoutPlans.id, { onDelete: "cascade" }),
  weekNumber: integer("week_number").notNull(),
  dayNumber: integer("day_number").notNull(),
  focus: text("focus").notNull(),
  duration: integer("duration").notNull(),
  scheduledDate: date("scheduled_date"),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  isAiGenerated: boolean("is_ai_generated").default(false),
  aiPrompt: text("ai_prompt"),
});

// Exercises in each workout
export const workoutExercises = pgTable("workout_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").notNull().references(() => workouts.id, { onDelete: "cascade" }),
  exerciseName: text("exercise_name").notNull(),
  sets: integer("sets").notNull(),
  reps: text("reps").notNull(),
  rest: integer("rest").notNull(),
  notes: text("notes"),
  orderIndex: integer("order_index").notNull(),
});

// Logged exercise sets (user performance)
export const exerciseLogs = pgTable("exercise_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutExerciseId: varchar("workout_exercise_id").notNull().references(() => workoutExercises.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(),
  load: real("load"),
  reps: integer("reps"),
  rpe: integer("rpe"),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily check-ins
export const checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  mood: integer("mood").notNull(),
  sleep: integer("sleep").notNull(),
  pain: integer("pain").notNull(),
  fatigue: integer("fatigue").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Personal records
export const personalRecords = pgTable("personal_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  exerciseName: text("exercise_name").notNull(),
  load: real("load").notNull(),
  reps: integer("reps"),
  achievedAt: timestamp("achieved_at").defaultNow().notNull(),
});

// Badges/achievements
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: text("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Missions
export const missions = pgTable("missions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  target: integer("target").notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  date: date("date").notNull(),
  xpReward: integer("xp_reward").notNull(),
});

// Achievements System
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").notNull(),
  rarity: text("rarity").notNull(), // common, uncommon, rare, epic, legendary
  category: text("category").notNull(), // workout, streak, social, challenge, legend
  requirement: jsonb("requirement").notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  progress: integer("progress").default(0).notNull(),
});

// Challenges System
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // daily, weekly, special, community
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").notNull(),
  coinsReward: integer("coins_reward").default(0).notNull(),
  difficulty: text("difficulty").notNull(), // easy, medium, hard, extreme
  rarity: text("rarity").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  requirements: jsonb("requirements").notNull(),
  participantCount: integer("participant_count").default(0).notNull(),
});

export const userChallenges = pgTable("user_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  status: text("status").notNull(), // active, completed, failed, claimed
  progress: integer("progress").default(0).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Social Features
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // workout, achievement, milestone, challenge
  content: text("content"),
  media: text("media").array(),
  likes: integer("likes").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  workoutId: varchar("workout_id"),
  achievementId: varchar("achievement_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  visibility: text("visibility").default("public").notNull(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaderboards = pgTable("leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // global, friends, challenge
  period: text("period").notNull(), // daily, weekly, monthly, all_time
  userId: varchar("user_id").notNull().references(() => users.id),
  rank: integer("rank").notNull(),
  score: integer("score").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shop System
export const shopItems = pgTable("shop_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  priceCoins: integer("price_coins").default(0).notNull(),
  priceGems: integer("price_gems").default(0).notNull(),
  type: text("type").notNull(), // skin, booster, streak_freeze, badge, title
  rarity: text("rarity").default("common").notNull(),
  icon: text("icon").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
});

export const userInventory = pgTable("user_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemId: varchar("item_id").notNull().references(() => shopItems.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1).notNull(),
  equipped: boolean("equipped").default(false).notNull(),
  acquiredAt: timestamp("acquired_at").defaultNow().notNull(),
});

export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// Zod schemas with improved validation
export const insertUserSchema = createInsertSchema(users, {
  // Required fields with validation
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(100),

  // Optional numeric fields with coercion and validation
  age: z.coerce.number().int().min(10, "Age must be at least 10").max(120, "Age must be less than 120").nullable().optional(),
  height: z.coerce.number().int().min(100, "Height must be at least 100cm").max(250, "Height must be less than 250cm").nullable().optional(),
  weight: z.coerce.number().min(30, "Weight must be at least 30kg").max(300, "Weight must be less than 300kg").nullable().optional(),
  daysPerWeek: z.coerce.number().int().min(1).max(7).nullable().optional(),
  sessionMinutes: z.coerce.number().int().min(15).max(180).nullable().optional(),

  // Optional text fields
  sex: z.enum(["male", "female"]).nullable().optional(),
  experience: z.enum(["beginner", "intermediate", "advanced"]).nullable().optional(),
  goal: z.enum(["fat_loss", "hypertrophy", "strength", "conditioning"]).nullable().optional(),
  location: z.enum(["home", "gym", "both"]).nullable().optional(),

  // Array fields
  equipment: z.array(z.string()).nullable().optional().default([]),
  injuries: z.string().nullable().optional(),
  persona: z.enum(["sergeant", "mentor", "scientist", "zen"]).default("mentor"),
  bio: z.string().max(300, "Bio must be less than 300 characters").nullable().optional(),
  avatarUrl: z.string().url("Invalid avatar URL").nullable().optional(),
}).omit({ id: true, createdAt: true });

export const insertUserStatsSchema = createInsertSchema(userStats).omit({ id: true, updatedAt: true });
export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({ id: true, createdAt: true });
export const insertWorkoutSchema = createInsertSchema(workouts).omit({ id: true });
export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({ id: true });
export const insertExerciseLogSchema = createInsertSchema(exerciseLogs).omit({ id: true, createdAt: true });
export const insertCheckInSchema = createInsertSchema(checkIns).omit({ id: true, createdAt: true });
export const insertPersonalRecordSchema = createInsertSchema(personalRecords).omit({ id: true, achievedAt: true });
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, earnedAt: true });
export const insertMissionSchema = createInsertSchema(missions).omit({ id: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true });
export const insertFollowSchema = createInsertSchema(follows).omit({ id: true, createdAt: true });
export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({ id: true, updatedAt: true });
export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ id: true, createdAt: true });
export const insertPostCommentSchema = createInsertSchema(postComments).omit({ id: true, createdAt: true });
export const insertShopItemSchema = createInsertSchema(shopItems).omit({ id: true });
export const insertUserInventorySchema = createInsertSchema(userInventory).omit({ id: true, acquiredAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type CheckIn = typeof checkIns.$inferSelect;
export type PersonalRecord = typeof personalRecords.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type Mission = typeof missions.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Leaderboard = typeof leaderboards.$inferSelect;
export type PostLike = typeof postLikes.$inferSelect;
export type PostComment = typeof postComments.$inferSelect;
// Shop & Inventory
export type ShopItem = typeof shopItems.$inferSelect;
export type UserInventory = typeof userInventory.$inferSelect;

// New Architecture Types
export type UserSettings = typeof userSettings.$inferSelect;
export type GamificationEvent = typeof gamificationEvents.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;

// New Zod Schemas
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ id: true, updatedAt: true });
export const insertGamificationEventSchema = createInsertSchema(gamificationEvents).omit({ id: true, createdAt: true });
export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({ id: true, startedAt: true });

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type InsertGamificationEvent = z.infer<typeof insertGamificationEventSchema>;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;


// Alias User to Profile types explicitly if needed, but 'type User' above is sufficient.
export type Profile = typeof profiles.$inferSelect;

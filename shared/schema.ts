import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, real, jsonb, date, pgSchema, decimal, smallint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schemas
export const gameSchema = pgSchema("game");
export const workoutSchema = pgSchema("workout");
export const socialSchema = pgSchema("social");
export const shopSchema = pgSchema("shop");

// Profiles table (public schema)
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`), // In production, this links to auth.users.id
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  dateOfBirth: date("date_of_birth"),
  sex: text("sex"),
  height: integer("height_cm"),
  weight: real("weight_kg"),
  bodyFat: real("body_fat_percentage"),
  experience: text("experience_level"),
  primaryGoal: text("primary_goal"),
  secondaryGoal: text("secondary_goal"),
  trainingDays: integer("training_days_per_week"),
  sessionMinutes: integer("session_duration_minutes"),
  preferredLocation: text("preferred_location"),
  availableEquipment: text("available_equipment").array(),
  injuries: text("injuries_notes"),
  persona: text("ai_persona").default("mentor").notNull(),
  aiLanguage: text("ai_language").default("pt-BR").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  subscriptionTier: text("subscription_tier").default("free").notNull(),
  subscriptionStartedAt: timestamp("subscription_started_at"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  stripeCustomerId: text("stripe_customer_id"),
  theme: text("theme").default("dark").notNull(),
  audioEnabled: boolean("audio_enabled").default(true).notNull(),
  hapticsEnabled: boolean("haptics_enabled").default(true).notNull(),
  notificationsPush: boolean("notifications_push").default(true).notNull(),
  notificationsEmail: boolean("notifications_email").default(false).notNull(),
  privacyMode: text("privacy_mode").default("public").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
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
export const workoutSessions = workoutSchema.table("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  workoutId: varchar("workout_id"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  status: text("status").default("active").notNull(), // active, completed, abandoned
  caloriesBurned: integer("calories_burned"),
  accuracyScore: integer("accuracy_score"),
  feedback: text("feedback"),
  rawStats: jsonb("raw_stats"),
});

// Gamification Events
export const gamificationEvents = gameSchema.table("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  xpEarned: integer("xp_earned").default(0).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User stats (XP, level, streaks, gamification)
export const userStats = gameSchema.table("user_stats", {
  userId: varchar("user_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  totalXp: integer("total_xp").default(0).notNull(),
  currentLevel: integer("current_level").default(1).notNull(),
  xpToNextLevel: integer("xp_to_next_level").default(100).notNull(),
  rank: text("rank").default("Bronze").notNull(),
  prestigeLevel: integer("prestige_level").default(0).notNull(),
  coins: integer("coins").default(0).notNull(),
  gems: integer("gems").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  streakFreezes: integer("streak_freezes_available").default(1).notNull(),
  totalWorkouts: integer("total_workouts").default(0).notNull(),
  perfectWorkouts: integer("perfect_workouts").default(0).notNull(),
  prsBroken: integer("personal_records_broken").default(0).notNull(),
  achievementsUnlocked: integer("achievements_unlocked").default(0).notNull(),
  challengesCompleted: integer("challenges_completed").default(0).notNull(),
  followersCount: integer("followers_count").default(0).notNull(),
  followingCount: integer("following_count").default(0).notNull(),
  postsCount: integer("posts_count").default(0).notNull(),
  weeklyXp: integer("weekly_xp").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workout plans
export const workoutPlans = workoutSchema.table("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Individual workouts
export const workouts = workoutSchema.table("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").notNull().references(() => workoutPlans.id, { onDelete: "cascade" }),
  weekNumber: integer("week_number").notNull().default(1),
  dayNumber: integer("day_number").notNull(),
  focus: text("focus").notNull(),
  status: text("status").default("pending").notNull(),
  completedAt: timestamp("completed_at"),
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

// Achievements System
export const achievements = gameSchema.table("achievements", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  rarity: text("rarity").notNull(),
  xpReward: integer("xp_reward").notNull(),
  coinsReward: integer("coins_reward").default(0).notNull(),
});

export const userAchievements = gameSchema.table("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

// Challenges System
export const challenges = gameSchema.table("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  xpReward: integer("xp_reward").notNull(),
  coinsReward: integer("coins_reward").default(0).notNull(),
  difficulty: text("difficulty").notNull(),
  rarity: text("rarity").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  requirements: jsonb("requirements"),
});

export const userChallenges = gameSchema.table("user_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  status: text("status").notNull(),
  progress: integer("progress").default(0).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  claimedAt: timestamp("claimed_at"),
});

// Social Features
export const posts = socialSchema.table("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  content: text("content"),
  likesCount: integer("likes_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  visibility: text("visibility").default("public").notNull(),
});

export const follows = socialSchema.table("follows", {
  followerId: varchar("follower_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  followingId: varchar("following_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaderboards = socialSchema.table("leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  period: text("period").notNull(),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  rankPosition: integer("rank_position").notNull(),
  score: integer("score").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shop System
export const shopItems = shopSchema.table("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  priceCoins: integer("price_coins").default(0).notNull(),
  priceGems: integer("price_gems").default(0).notNull(),
  category: text("category").notNull(),
  rarity: text("rarity").notNull(),
  icon: text("icon").notNull(),
});

export const userInventory = shopSchema.table("user_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  itemId: varchar("item_id").notNull().references(() => shopItems.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1).notNull(),
  isEquipped: boolean("is_equipped").default(false).notNull(),
  acquiredAt: timestamp("acquired_at").defaultNow().notNull(),
});

export const postLikes = socialSchema.table("post_likes", {
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postComments = socialSchema.table("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// Zod schemas with improved validation
export const insertUserSchema = createInsertSchema(profiles, {
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  passwordHash: z.string(),
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(100),
  dateOfBirth: z.string().nullable().optional(), // Expected as ISO string or YYYY-MM-DD
  height: z.coerce.number().int().min(100).max(250).nullable().optional(),
  weight: z.coerce.number().min(30).max(300).nullable().optional(),
  trainingDays: z.coerce.number().int().min(1).max(7).nullable().optional(),
  sessionMinutes: z.coerce.number().int().min(15).max(180).nullable().optional(),
  persona: z.enum(["sergeant", "mentor", "scientist", "zen", "legend"]).default("mentor"),
  bio: z.string().max(500).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true, lastSeenAt: true });

export const registerUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email(),
  name: z.string().min(1),
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({ updatedAt: true });
export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({ id: true, createdAt: true });
export const insertWorkoutSchema = createInsertSchema(workouts).omit({ id: true });
export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({ id: true });
export const insertExerciseLogSchema = createInsertSchema(exerciseLogs).omit({ id: true, createdAt: true });
export const insertCheckInSchema = createInsertSchema(checkIns).omit({ id: true, createdAt: true });
export const insertPersonalRecordSchema = createInsertSchema(personalRecords).omit({ id: true, achievedAt: true });
export const insertAchievementSchema = createInsertSchema(achievements);
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true, unlockedAt: true });
export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true });
export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({ id: true, joinedAt: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true });
export const insertFollowSchema = createInsertSchema(follows).omit({ createdAt: true });
export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({ id: true, updatedAt: true });
export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ createdAt: true });
export const insertPostCommentSchema = createInsertSchema(postComments).omit({ id: true, createdAt: true });
export const insertShopItemSchema = createInsertSchema(shopItems).omit({ id: true });
export const insertUserInventorySchema = createInsertSchema(userInventory).omit({ id: true, acquiredAt: true });

// Types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertUserSchema>;
export type User = Profile; // Backward compatibility

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;

export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;

export type GamificationEvent = typeof gamificationEvents.$inferSelect;
export type InsertGamificationEvent = z.infer<typeof insertGamificationEventSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type ShopItem = typeof shopItems.$inferSelect;
export type UserInventory = typeof userInventory.$inferSelect;

// Alias for unified settings/profile access
export type UserSettings = Profile;
export const insertUserSettingsSchema = insertUserSchema;

import { db } from "./db.js";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  type User,
  type InsertUser,
  type UserStats,
  type WorkoutPlan,
  type Workout,
  type WorkoutExercise,
  type ExerciseLog,
  type CheckIn,
  type PersonalRecord,
  type UserBadge,
  type Mission,
  users,
  userStats,
  workoutPlans,
  workouts,
  workoutExercises,
  exerciseLogs,
  checkIns,
  personalRecords,
  userBadges,
  missions,
  shopItems,
  userInventory,
} from "../shared/schema.js";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  // User stats operations
  getUserStats(userId: string): Promise<UserStats | undefined>;
  createUserStats(userId: string): Promise<UserStats>;
  updateUserStats(userId: string, data: Partial<UserStats>): Promise<UserStats | undefined>;

  // Workout plan operations
  createWorkoutPlan(plan: { userId: string; name: string; description?: string; weekCount?: number }): Promise<WorkoutPlan>;
  getActiveWorkoutPlan(userId: string): Promise<WorkoutPlan | undefined>;
  getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]>;

  // Workout operations
  createWorkout(workout: { planId: string; weekNumber: number; dayNumber: number; focus: string; duration: number; scheduledDate?: string }): Promise<Workout>;
  getWorkout(id: string): Promise<Workout | undefined>;
  getWorkoutsByPlan(planId: string): Promise<Workout[]>;
  getTodayWorkout(userId: string): Promise<Workout | undefined>;
  completeWorkout(workoutId: string): Promise<Workout | undefined>;

  // Workout exercise operations
  createWorkoutExercise(exercise: { workoutId: string; exerciseName: string; sets: number; reps: string; rest: number; notes?: string; orderIndex: number }): Promise<WorkoutExercise>;
  getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]>;

  // Exercise log operations
  logExerciseSet(log: { workoutExerciseId: string; setNumber: number; load?: number; reps?: number; rpe?: number; completed: boolean }): Promise<ExerciseLog>;
  getExerciseLogs(workoutExerciseId: string): Promise<ExerciseLog[]>;

  // Check-in operations
  createCheckIn(checkIn: { userId: string; date: string; mood: number; sleep: number; pain: number; fatigue: number }): Promise<CheckIn>;
  getTodayCheckIn(userId: string): Promise<CheckIn | undefined>;
  getUserCheckIns(userId: string, limit?: number): Promise<CheckIn[]>;

  // Personal record operations
  createPersonalRecord(pr: { userId: string; exerciseName: string; load: number; reps?: number }): Promise<PersonalRecord>;
  getPersonalRecords(userId: string): Promise<PersonalRecord[]>;
  getExercisePRHistory(userId: string, exerciseName: string): Promise<PersonalRecord[]>;

  // Badge operations
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  getUserBadges(userId: string): Promise<UserBadge[]>;

  // Mission operations
  createMission(mission: { userId: string; type: string; title: string; description: string; target: number; date: string; xpReward: number }): Promise<Mission>;
  updateMissionProgress(missionId: string, progress: number): Promise<Mission | undefined>;
  completeMission(missionId: string): Promise<Mission | undefined>;
  getTodayMissions(userId: string): Promise<Mission[]>;
  getUserMissions(userId: string): Promise<Mission[]>;

  // League operations
  getLeagueMembers(tier: string, limit?: number): Promise<Array<{ userId: string; username: string; name: string; weeklyXP: number; rank: number }>>;

  // Shop & Inventory operations
  getShopItems(): Promise<ShopItem[]>;
  getShopItem(id: string): Promise<ShopItem | undefined>;
  getUserInventory(userId: string): Promise<Array<UserInventory & { item: ShopItem }>>;
  purchaseItem(userId: string, itemId: string, currency: 'coins' | 'gems'): Promise<{ success: boolean; message: string }>;
  equipItem(userId: string, inventoryItemId: string): Promise<UserInventory | undefined>;
  createShopItem(item: any): Promise<ShopItem>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  // User stats operations
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats;
  }

  async createUserStats(userId: string): Promise<UserStats> {
    const [stats] = await db.insert(userStats).values({ userId }).returning();
    return stats;
  }

  async updateUserStats(userId: string, data: Partial<UserStats>): Promise<UserStats | undefined> {
    const [stats] = await db.update(userStats).set({ ...data, updatedAt: new Date() }).where(eq(userStats.userId, userId)).returning();
    return stats;
  }

  // Workout plan operations
  async createWorkoutPlan(plan: { userId: string; name: string; description?: string; weekCount?: number }): Promise<WorkoutPlan> {
    await db.update(workoutPlans).set({ active: false }).where(eq(workoutPlans.userId, plan.userId));
    const [workoutPlan] = await db.insert(workoutPlans).values(plan).returning();
    return workoutPlan;
  }

  async getActiveWorkoutPlan(userId: string): Promise<WorkoutPlan | undefined> {
    const [plan] = await db.select().from(workoutPlans).where(and(eq(workoutPlans.userId, userId), eq(workoutPlans.active, true)));
    return plan;
  }

  async getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return db.select().from(workoutPlans).where(eq(workoutPlans.userId, userId)).orderBy(desc(workoutPlans.createdAt));
  }

  // Workout operations
  async createWorkout(workout: { planId: string; weekNumber: number; dayNumber: number; focus: string; duration: number; scheduledDate?: string }): Promise<Workout> {
    const [w] = await db.insert(workouts).values(workout).returning();
    return w;
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout;
  }

  async getWorkoutsByPlan(planId: string): Promise<Workout[]> {
    return db.select().from(workouts).where(eq(workouts.planId, planId)).orderBy(workouts.weekNumber, workouts.dayNumber);
  }

  async getTodayWorkout(userId: string): Promise<Workout | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const plan = await this.getActiveWorkoutPlan(userId);
    if (!plan) return undefined;

    const [workout] = await db.select().from(workouts).where(and(eq(workouts.planId, plan.id), eq(workouts.scheduledDate, today)));
    return workout;
  }

  async completeWorkout(workoutId: string): Promise<Workout | undefined> {
    const [workout] = await db.update(workouts).set({ completed: true, completedAt: new Date() }).where(eq(workouts.id, workoutId)).returning();
    return workout;
  }

  // Workout exercise operations
  async createWorkoutExercise(exercise: { workoutId: string; exerciseName: string; sets: number; reps: string; rest: number; notes?: string; orderIndex: number }): Promise<WorkoutExercise> {
    const [ex] = await db.insert(workoutExercises).values(exercise).returning();
    return ex;
  }

  async getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
    return db.select().from(workoutExercises).where(eq(workoutExercises.workoutId, workoutId)).orderBy(workoutExercises.orderIndex);
  }

  // Exercise log operations
  async logExerciseSet(log: { workoutExerciseId: string; setNumber: number; load?: number; reps?: number; rpe?: number; completed: boolean }): Promise<ExerciseLog> {
    const [exerciseLog] = await db.insert(exerciseLogs).values(log).returning();
    return exerciseLog;
  }

  async getExerciseLogs(workoutExerciseId: string): Promise<ExerciseLog[]> {
    return db.select().from(exerciseLogs).where(eq(exerciseLogs.workoutExerciseId, workoutExerciseId)).orderBy(exerciseLogs.setNumber);
  }

  // Check-in operations
  async createCheckIn(checkIn: { userId: string; date: string; mood: number; sleep: number; pain: number; fatigue: number }): Promise<CheckIn> {
    const [ci] = await db.insert(checkIns).values(checkIn).returning();
    return ci;
  }

  async getTodayCheckIn(userId: string): Promise<CheckIn | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [checkIn] = await db.select().from(checkIns).where(and(eq(checkIns.userId, userId), eq(checkIns.date, today)));
    return checkIn;
  }

  async getUserCheckIns(userId: string, limit: number = 30): Promise<CheckIn[]> {
    return db.select().from(checkIns).where(eq(checkIns.userId, userId)).orderBy(desc(checkIns.date)).limit(limit);
  }

  // Personal record operations
  async createPersonalRecord(pr: { userId: string; exerciseName: string; load: number; reps?: number }): Promise<PersonalRecord> {
    const [record] = await db.insert(personalRecords).values(pr).returning();
    return record;
  }

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    return db.select().from(personalRecords).where(eq(personalRecords.userId, userId)).orderBy(desc(personalRecords.achievedAt));
  }

  async getExercisePRHistory(userId: string, exerciseName: string): Promise<PersonalRecord[]> {
    return db.select().from(personalRecords)
      .where(and(eq(personalRecords.userId, userId), eq(personalRecords.exerciseName, exerciseName)))
      .orderBy(personalRecords.achievedAt);
  }

  // Badge operations
  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const [badge] = await db.insert(userBadges).values({ userId, badgeId }).returning();
    return badge;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return db.select().from(userBadges).where(eq(userBadges.userId, userId));
  }

  // Mission operations
  async createMission(mission: { userId: string; type: string; title: string; description: string; target: number; date: string; xpReward: number }): Promise<Mission> {
    const [m] = await db.insert(missions).values(mission).returning();
    return m;
  }

  async updateMissionProgress(missionId: string, progress: number): Promise<Mission | undefined> {
    const [mission] = await db.update(missions).set({ progress }).where(eq(missions.id, missionId)).returning();
    return mission;
  }

  async completeMission(missionId: string): Promise<Mission | undefined> {
    const [mission] = await db.update(missions).set({ completed: true }).where(eq(missions.id, missionId)).returning();
    return mission;
  }

  async getTodayMissions(userId: string): Promise<Mission[]> {
    const today = new Date().toISOString().split('T')[0];
    return db.select().from(missions).where(and(eq(missions.userId, userId), eq(missions.date, today)));
  }

  async getUserMissions(userId: string): Promise<Mission[]> {
    return db.select().from(missions).where(eq(missions.userId, userId)).orderBy(desc(missions.date));
  }

  // League operations
  async getLeagueMembers(tier: string, limit: number = 10): Promise<Array<{ userId: string; username: string; name: string; weeklyXP: number; rank: number }>> {
    const members = await db
      .select({
        userId: userStats.userId,
        username: users.username,
        name: users.name,
        weeklyXP: userStats.weeklyXP,
      })
      .from(userStats)
      .innerJoin(users, eq(userStats.userId, users.id))
      .where(eq(userStats.leagueTier, tier))
      .orderBy(desc(userStats.weeklyXP))
      .limit(limit);

    return members.map((member: any, index: number) => ({
      ...member,
      rank: index + 1,
    }));
  }

  // Shop & Inventory operations
  async getShopItems(): Promise<ShopItem[]> {
    return db.select().from(shopItems);
  }

  async getShopItem(id: string): Promise<ShopItem | undefined> {
    const [item] = await db.select().from(shopItems).where(eq(shopItems.id, id));
    return item;
  }

  async getUserInventory(userId: string): Promise<Array<UserInventory & { item: ShopItem }>> {
    const results = await db
      .select({
        inventory: userInventory,
        item: shopItems,
      })
      .from(userInventory)
      .innerJoin(shopItems, eq(userInventory.itemId, shopItems.id))
      .where(eq(userInventory.userId, userId));

    return results.map(r => ({ ...r.inventory, item: r.item }));
  }

  async purchaseItem(userId: string, itemId: string, currency: 'coins' | 'gems'): Promise<{ success: boolean; message: string }> {
    const item = await this.getShopItem(itemId);
    if (!item) return { success: false, message: "Item not found" };

    const stats = await this.getUserStats(userId);
    if (!stats) return { success: false, message: "User stats not found" };

    const price = currency === 'coins' ? item.priceCoins : item.priceGems;
    const balance = currency === 'coins' ? stats.coins : stats.gems;

    if (balance < price) {
      return { success: false, message: `Insufficient ${currency}` };
    }

    // Deduct currency
    await this.updateUserStats(userId, {
      [currency]: balance - price,
    });

    // Add to inventory
    const [existing] = await db.select().from(userInventory).where(and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId)));
    if (existing) {
      await db.update(userInventory).set({ quantity: existing.quantity + 1 }).where(eq(userInventory.id, existing.id));
    } else {
      await db.insert(userInventory).values({ userId, itemId, quantity: 1 });
    }

    return { success: true, message: "Purchase successful" };
  }

  async equipItem(userId: string, inventoryItemId: string): Promise<UserInventory | undefined> {
    const [item] = await db.select().from(userInventory).where(and(eq(userInventory.id, inventoryItemId), eq(userInventory.userId, userId)));
    if (!item) return undefined;

    // Get item type to unequip others of same type
    const shopItem = await this.getShopItem(item.itemId);
    if (shopItem) {
      const userItems = await this.getUserInventory(userId);
      const sameTypeItems = userItems.filter(ui => ui.item.type === shopItem.type && ui.id !== inventoryItemId);
      for (const st of sameTypeItems) {
        await db.update(userInventory).set({ equipped: false }).where(eq(userInventory.id, st.id));
      }
    }

    const [updated] = await db.update(userInventory).set({ equipped: !item.equipped }).where(eq(userInventory.id, inventoryItemId)).returning();
    return updated;
  }

  async createShopItem(item: any): Promise<ShopItem> {
    const [newItem] = await db.insert(shopItems).values(item).returning();
    return newItem;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userStats: Map<string, UserStats>;
  private workoutPlans: Map<string, WorkoutPlan>;
  private workouts: Map<string, Workout>;
  private workoutExercises: Map<string, WorkoutExercise>;
  private exerciseLogs: Map<string, ExerciseLog>;
  private checkIns: Map<string, CheckIn>;
  private personalRecords: Map<string, PersonalRecord>;
  private userBadges: Map<string, UserBadge>;
  private missions: Map<string, Mission>;
  private shopItems: Map<string, ShopItem>;
  private userInventory: Map<string, UserInventory>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.userStats = new Map();
    this.workoutPlans = new Map();
    this.workouts = new Map();
    this.workoutExercises = new Map();
    this.exerciseLogs = new Map();
    this.checkIns = new Map();
    this.personalRecords = new Map();
    this.userBadges = new Map();
    this.missions = new Map();
    this.shopItems = new Map();
    this.userInventory = new Map();
    this.currentId = 1;
  }

  private nextId(): string {
    return (this.currentId++).toString();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextId();
    const user = { ...insertUser, id, createdAt: new Date() } as User;
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data } as User;
    this.users.set(id, updated);
    return updated;
  }

  // User stats operations
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    return Array.from(this.userStats.values()).find(s => s.userId === userId);
  }

  async createUserStats(userId: string): Promise<UserStats> {
    const id = this.nextId();
    const stats: UserStats = {
      id,
      userId,
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      streakFreezes: 1,
      lastWorkoutDate: null,
      totalWorkouts: 0,
      leagueTier: "Bronze",
      weeklyXP: 0,
      coins: 0,
      gems: 0,
      updatedAt: new Date()
    };
    this.userStats.set(id, stats);
    return stats;
  }

  async updateUserStats(userId: string, data: Partial<UserStats>): Promise<UserStats | undefined> {
    const stats = await this.getUserStats(userId);
    if (!stats) return undefined;
    const updated = { ...stats, ...data, updatedAt: new Date() } as UserStats;
    this.userStats.set(stats.id, updated);
    return updated;
  }

  // Workout plan operations
  async createWorkoutPlan(plan: { userId: string; name: string; description?: string; weekCount?: number }): Promise<WorkoutPlan> {
    for (const p of this.workoutPlans.values()) {
      if (p.userId === plan.userId) p.active = false;
    }
    const id = this.nextId();
    const workoutPlan: WorkoutPlan = {
      id,
      userId: plan.userId,
      name: plan.name,
      description: plan.description || null,
      weekCount: plan.weekCount || 4,
      active: true,
      createdAt: new Date()
    };
    this.workoutPlans.set(id, workoutPlan);
    return workoutPlan;
  }

  async getActiveWorkoutPlan(userId: string): Promise<WorkoutPlan | undefined> {
    return Array.from(this.workoutPlans.values()).find(p => p.userId === userId && p.active);
  }

  async getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return Array.from(this.workoutPlans.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Workout operations
  async createWorkout(workout: { planId: string; weekNumber: number; dayNumber: number; focus: string; duration: number; scheduledDate?: string }): Promise<Workout> {
    const id = this.nextId();
    const w: Workout = {
      id,
      planId: workout.planId,
      weekNumber: workout.weekNumber,
      dayNumber: workout.dayNumber,
      focus: workout.focus,
      duration: workout.duration,
      scheduledDate: workout.scheduledDate || null,
      completed: false,
      completedAt: null
    };
    this.workouts.set(id, w);
    return w;
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async getWorkoutsByPlan(planId: string): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(w => w.planId === planId)
      .sort((a, b) => (a.weekNumber - b.weekNumber) || (a.dayNumber - b.dayNumber));
  }

  async getTodayWorkout(userId: string): Promise<Workout | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const plan = await this.getActiveWorkoutPlan(userId);
    if (!plan) return undefined;
    return Array.from(this.workouts.values()).find(w => w.planId === plan.id && w.scheduledDate === today);
  }

  async completeWorkout(workoutId: string): Promise<Workout | undefined> {
    const workout = this.workouts.get(workoutId);
    if (!workout) return undefined;
    const updated = { ...workout, completed: true, completedAt: new Date() };
    this.workouts.set(workoutId, updated);
    return updated;
  }

  // Workout exercise operations
  async createWorkoutExercise(exercise: { workoutId: string; exerciseName: string; sets: number; reps: string; rest: number; notes?: string; orderIndex: number }): Promise<WorkoutExercise> {
    const id = this.nextId();
    const ex: WorkoutExercise = { id, ...exercise, notes: exercise.notes || null };
    this.workoutExercises.set(id, ex);
    return ex;
  }

  async getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
    return Array.from(this.workoutExercises.values())
      .filter(ex => ex.workoutId === workoutId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  // Exercise log operations
  async logExerciseSet(log: { workoutExerciseId: string; setNumber: number; load?: number; reps?: number; rpe?: number; completed: boolean }): Promise<ExerciseLog> {
    const id = this.nextId();
    const exerciseLog: ExerciseLog = {
      id,
      workoutExerciseId: log.workoutExerciseId,
      setNumber: log.setNumber,
      load: log.load ?? null,
      reps: log.reps ?? null,
      rpe: log.rpe ?? null,
      completed: log.completed,
      createdAt: new Date()
    };
    this.exerciseLogs.set(id, exerciseLog);
    return exerciseLog;
  }

  async getExerciseLogs(workoutExerciseId: string): Promise<ExerciseLog[]> {
    return Array.from(this.exerciseLogs.values())
      .filter(log => log.workoutExerciseId === workoutExerciseId)
      .sort((a, b) => a.setNumber - b.setNumber);
  }

  // Check-in operations
  async createCheckIn(checkIn: { userId: string; date: string; mood: number; sleep: number; pain: number; fatigue: number }): Promise<CheckIn> {
    const id = this.nextId();
    const ci: CheckIn = { id, ...checkIn, createdAt: new Date() };
    this.checkIns.set(id, ci);
    return ci;
  }

  async getTodayCheckIn(userId: string): Promise<CheckIn | undefined> {
    const today = new Date().toISOString().split('T')[0];
    return Array.from(this.checkIns.values()).find(ci => ci.userId === userId && ci.date === today);
  }

  async getUserCheckIns(userId: string, limit: number = 30): Promise<CheckIn[]> {
    return Array.from(this.checkIns.values())
      .filter(ci => ci.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }

  // Personal record operations
  async createPersonalRecord(pr: { userId: string; exerciseName: string; load: number; reps?: number }): Promise<PersonalRecord> {
    const id = this.nextId();
    const record: PersonalRecord = { id, ...pr, reps: pr.reps ?? null, achievedAt: new Date() };
    this.personalRecords.set(id, record);
    return record;
  }

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    return Array.from(this.personalRecords.values())
      .filter(pr => pr.userId === userId)
      .sort((a, b) => b.achievedAt.getTime() - a.achievedAt.getTime());
  }

  async getExercisePRHistory(userId: string, exerciseName: string): Promise<PersonalRecord[]> {
    return Array.from(this.personalRecords.values())
      .filter(pr => pr.userId === userId && pr.exerciseName === exerciseName)
      .sort((a, b) => a.achievedAt.getTime() - b.achievedAt.getTime());
  }

  // Badge operations
  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const id = this.nextId();
    const badge: UserBadge = { id, userId, badgeId, earnedAt: new Date() };
    this.userBadges.set(id, badge);
    return badge;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values()).filter(b => b.userId === userId);
  }

  // Mission operations
  async createMission(mission: { userId: string; type: string; title: string; description: string; target: number; date: string; xpReward: number }): Promise<Mission> {
    const id = this.nextId();
    const m: Mission = { id, ...mission, progress: 0, completed: false };
    this.missions.set(id, m);
    return m;
  }

  async updateMissionProgress(missionId: string, progress: number): Promise<Mission | undefined> {
    const mission = this.missions.get(missionId);
    if (!mission) return undefined;
    const updated = { ...mission, progress };
    this.missions.set(missionId, updated);
    return updated;
  }

  async completeMission(missionId: string): Promise<Mission | undefined> {
    const mission = this.missions.get(missionId);
    if (!mission) return undefined;
    const updated = { ...mission, completed: true };
    this.missions.set(missionId, updated);
    return updated;
  }

  async getTodayMissions(userId: string): Promise<Mission[]> {
    const today = new Date().toISOString().split('T')[0];
    return Array.from(this.missions.values()).filter(m => m.userId === userId && m.date === today);
  }

  async getUserMissions(userId: string): Promise<Mission[]> {
    return Array.from(this.missions.values())
      .filter(m => m.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  // League operations
  async getLeagueMembers(tier: string, limit: number = 10): Promise<Array<{ userId: string; username: string; name: string; weeklyXP: number; rank: number }>> {
    const members = Array.from(this.userStats.values())
      .filter(s => s.leagueTier === tier)
      .map(s => {
        const user = this.users.get(s.userId);
        return {
          userId: s.userId,
          username: user?.username || "unknown",
          name: user?.name || "Unknown",
          weeklyXP: s.weeklyXP,
        };
      })
      .sort((a, b) => b.weeklyXP - a.weeklyXP)
      .slice(0, limit);

    return members.map((m, i) => ({ ...m, rank: i + 1 }));
  }

  // Shop & Inventory operations
  async getShopItems(): Promise<ShopItem[]> {
    return Array.from(this.shopItems.values());
  }

  async getShopItem(id: string): Promise<ShopItem | undefined> {
    return this.shopItems.get(id);
  }

  async getUserInventory(userId: string): Promise<Array<UserInventory & { item: ShopItem }>> {
    return Array.from(this.userInventory.values())
      .filter(i => i.userId === userId)
      .map(i => ({ ...i, item: this.shopItems.get(i.itemId)! }));
  }

  async purchaseItem(userId: string, itemId: string, currency: 'coins' | 'gems'): Promise<{ success: boolean; message: string }> {
    const item = this.shopItems.get(itemId);
    if (!item) return { success: false, message: "Item not found" };

    const stats = await this.getUserStats(userId);
    if (!stats) return { success: false, message: "User stats not found" };

    const price = currency === 'coins' ? item.priceCoins : item.priceGems;
    const balance = currency === 'coins' ? stats.coins : stats.gems;

    if (balance < price) return { success: false, message: `Insufficient ${currency}` };

    await this.updateUserStats(userId, { [currency]: balance - price });

    const existing = Array.from(this.userInventory.values()).find(i => i.userId === userId && i.itemId === itemId);
    if (existing) {
      existing.quantity += 1;
    } else {
      const id = this.nextId();
      this.userInventory.set(id, { id, userId, itemId, quantity: 1, equipped: false, acquiredAt: new Date() });
    }

    return { success: true, message: "Purchase successful" };
  }

  async equipItem(userId: string, inventoryItemId: string): Promise<UserInventory | undefined> {
    const item = this.userInventory.get(inventoryItemId);
    if (!item || item.userId !== userId) return undefined;

    const shopItem = this.shopItems.get(item.itemId);
    if (shopItem) {
      Array.from(this.userInventory.values())
        .filter(ui => ui.userId === userId && ui.id !== inventoryItemId)
        .forEach(ui => {
          const si = this.shopItems.get(ui.itemId);
          if (si && si.type === shopItem.type) ui.equipped = false;
        });
    }

    item.equipped = !item.equipped;
    return item;
  }

  async createShopItem(item: any): Promise<ShopItem> {
    const id = this.nextId();
    const newItem = { id, metadata: {}, ...item } as ShopItem;
    this.shopItems.set(id, newItem);
    return newItem;
  }
}

export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
